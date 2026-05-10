'use client';

/**
 * Unified 32-question check-in.
 *
 * Runs Health (16 = 8 behaviour + 8 indicator) followed by Wealth (16 = same)
 * in a single flow. On submit we upsert into both `health_assessments` and
 * `wealth_assessments` in parallel, replacing any row from the relevant
 * period (ISO week for health, calendar month for wealth) so the existing
 * cadence semantics are preserved.
 *
 * The two per-domain pages at /assess/health and /assess/wealth still exist
 * for deep links, but primary CTAs (dashboard, plan) point here.
 */

import { useReducer, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HEALTH_QUESTIONS, HEALTH_INDICATOR_QUESTIONS } from '@/lib/data/health-questions';
import { WEALTH_QUESTIONS, WEALTH_INDICATOR_QUESTIONS } from '@/lib/data/wealth-questions';
import { computeBehaviourPct, computeIndicatorPct, computeCombinedPct } from '@/lib/scoring/shared';
import Button from '@/components/ui/Button';
import OptionCard from '@/components/ui/OptionCard';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './health/health.module.css';

/* ── Types ── */
type Screen = 'intro' | 'question' | 'computing';

interface State {
  screen: Screen;
  qIndex: number;             // 0..31
  answers: (number | null)[]; // 32 slots
}

type Action =
  | { type: 'START' }
  | { type: 'SET_ANSWER'; index: number; score: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GO_COMPUTING' };

const TOTAL_QS = 32;

const initialState: State = {
  screen: 'intro',
  qIndex: 0,
  answers: Array(TOTAL_QS).fill(null),
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...state, screen: 'question', qIndex: 0 };
    case 'SET_ANSWER': {
      const answers = [...state.answers];
      answers[action.index] = action.score;
      return { ...state, answers };
    }
    case 'NEXT':
      if (state.qIndex < TOTAL_QS - 1) return { ...state, qIndex: state.qIndex + 1 };
      return { ...state, screen: 'computing' };
    case 'PREV':
      if (state.qIndex > 0) return { ...state, qIndex: state.qIndex - 1 };
      return state;
    case 'GO_COMPUTING':
      return { ...state, screen: 'computing' };
    default:
      return state;
  }
}

/* ── DB column maps ── */
const HEALTH_B_COLS = [
  'b_sleep', 'b_smoking', 'b_strength', 'b_sweat',
  'b_sugar', 'b_salt', 'b_spirits', 'b_stress',
] as const;
const HEALTH_IS_COLS = [
  'is_blood_pressure', 'is_weight', 'is_pushups', 'is_resting_hr',
  'is_body_fat', 'is_sleep_quality', 'is_blood_sugar', 'is_wellbeing',
] as const;
const WEALTH_B_COLS = [
  'b_active_income', 'b_passive_income', 'b_expenses', 'b_discretionary',
  'b_savings', 'b_debt_repayment', 'b_retirement', 'b_investment',
] as const;
const WEALTH_IS_COLS = [
  'is_net_income', 'is_discretionary_spend', 'is_emergency_fund', 'is_debt_level',
  'is_net_worth', 'is_pension_fund', 'is_passive_income', 'is_fi_ratio',
] as const;

function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function getMonthStart(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d.toISOString().split('T')[0];
}
function getMonthEnd(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return d.toISOString().split('T')[0];
}

export default function AssessPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [gender, setGender] = useState<string>('male');
  const [ageGroup, setAgeGroup] = useState<string>('30-44');
  const [currency, setCurrency] = useState<string>('\u00A3');
  const [profileLoaded, setProfileLoaded] = useState(false);

  /* Load user profile snapshot fields */
  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('gender, age_group, currency')
        .eq('id', user.id)
        .single();

      if (data) {
        setGender(data.gender || 'male');
        setAgeGroup(data.age_group || '30-44');
        setCurrency(data.currency || '\u00A3');
      }
      setProfileLoaded(true);
    }
    loadProfile();
  }, [router]);

  const computeAndSave = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const healthB = state.answers.slice(0, 8).map(s => s ?? 0);
    const healthI = state.answers.slice(8, 16).map(s => s ?? 0);
    const wealthB = state.answers.slice(16, 24).map(s => s ?? 0);
    const wealthI = state.answers.slice(24, 32).map(s => s ?? 0);

    const healthBPct = computeBehaviourPct(healthB);
    const healthIPct = computeIndicatorPct(healthI);
    const healthOct  = computeCombinedPct(healthBPct, healthIPct);

    const wealthBPct = computeBehaviourPct(wealthB);
    const wealthIPct = computeIndicatorPct(wealthI);
    const wealthOct  = computeCombinedPct(wealthBPct, wealthIPct);

    /* Health row */
    const healthRow: Record<string, unknown> = {
      user_id: user.id,
      gender_snapshot: gender,
      age_group_snapshot: ageGroup,
      behaviour_score_pct: healthBPct,
      indicator_score_pct: healthIPct,
      octagon_score_pct: healthOct,
    };
    HEALTH_B_COLS.forEach((c, i) => { healthRow[c] = healthB[i]; });
    HEALTH_IS_COLS.forEach((c, i) => { healthRow[c] = healthI[i]; });

    /* Wealth row */
    const wealthRow: Record<string, unknown> = {
      user_id: user.id,
      age_group_snapshot: ageGroup,
      currency_snapshot: currency,
      behaviour_score_pct: wealthBPct,
      indicator_score_pct: wealthIPct,
      octagon_score_pct: wealthOct,
    };
    WEALTH_B_COLS.forEach((c, i) => { wealthRow[c] = wealthB[i]; });
    WEALTH_IS_COLS.forEach((c, i) => { wealthRow[c] = wealthI[i]; });

    /* Period windows */
    const weekStart = getWeekStart();
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    const weekEnd = weekEndDate.toISOString().split('T')[0];
    const monthStart = getMonthStart();
    const monthEnd = getMonthEnd();

    /* Replace any existing check-ins for the relevant periods, then insert */
    await Promise.all([
      supabase
        .from('health_assessments')
        .delete()
        .eq('user_id', user.id)
        .gte('completed_at', weekStart)
        .lt('completed_at', weekEnd),
      supabase
        .from('wealth_assessments')
        .delete()
        .eq('user_id', user.id)
        .gte('completed_at', monthStart)
        .lt('completed_at', monthEnd),
    ]);

    const [healthRes, wealthRes] = await Promise.all([
      supabase.from('health_assessments').insert(healthRow).select('id').single(),
      supabase.from('wealth_assessments').insert(wealthRow).select('id').single(),
    ]);

    if (healthRes.error || wealthRes.error) {
      console.error('Failed to save check-in:', healthRes.error || wealthRes.error);
      return;
    }

    router.push('/plan');
  }, [state.answers, gender, ageGroup, currency, router]);

  useEffect(() => {
    if (state.screen === 'computing') {
      const timer = setTimeout(() => { computeAndSave(); }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.screen, computeAndSave]);

  /* Progress */
  const completed = state.answers.filter(a => a !== null).length;
  const progressPct = Math.round((completed / TOTAL_QS) * 100);

  if (!profileLoaded) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  /* Intro */
  if (state.screen === 'intro') {
    return (
      <div className={`${styles.container} ${styles.screen}`}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}>Check-in</div>
          <h1 className={styles.heading}>
            Health and<br /><em>wealth.</em>
          </h1>
          <p className={styles.body}>
            32 quick questions {'\u2014'} 16 health, then 16 wealth.
            Takes about 4 minutes. Your octagons update with the new scores.
          </p>
          <Button onClick={() => dispatch({ type: 'START' })}>
            Start &rarr;
          </Button>
        </div>
      </div>
    );
  }

  /* Question */
  if (state.screen === 'question') {
    const i = state.qIndex;
    let q;
    let phase = '';
    if (i < 8) {
      q = HEALTH_QUESTIONS[i];
      phase = 'Health \u00B7 Behaviour';
    } else if (i < 16) {
      q = HEALTH_INDICATOR_QUESTIONS[i - 8];
      phase = 'Health \u00B7 Indicator';
    } else if (i < 24) {
      q = WEALTH_QUESTIONS[i - 16];
      phase = 'Wealth \u00B7 Behaviour';
    } else {
      q = WEALTH_INDICATOR_QUESTIONS[i - 24];
      phase = 'Wealth \u00B7 Indicator';
    }
    const selected = state.answers[i];

    return (
      <div className={`${styles.container} ${styles.screen}`} key={`q-${i}`}>
        <div className={styles.progressWrap}>
          <ProgressBar
            label={phase}
            count={`${i + 1}/${TOTAL_QS}`}
            percent={progressPct}
          />
        </div>

        <div className={styles.questionNum}>Question {i + 1} of {TOTAL_QS}</div>
        <h2 className={styles.questionTitle}>{q.name}</h2>
        <p className={styles.hook}>{q.hook}</p>

        <div className={styles.options}>
          {q.options.map((opt, k) => (
            <OptionCard
              key={k}
              score={opt.score}
              text={opt.text}
              selected={selected === opt.score}
              onClick={() => dispatch({ type: 'SET_ANSWER', index: i, score: opt.score })}
            />
          ))}
        </div>

        <div className={styles.actions}>
          {i > 0 && (
            <Button variant="ghost" onClick={() => dispatch({ type: 'PREV' })}>
              &larr; Back
            </Button>
          )}
          <Button
            disabled={selected === null}
            onClick={() => dispatch({ type: 'NEXT' })}
          >
            {i < TOTAL_QS - 1 ? 'Next \u2192' : 'Finish \u2192'}
          </Button>
        </div>
      </div>
    );
  }

  /* Computing */
  if (state.screen === 'computing') {
    return (
      <div className={`${styles.container} ${styles.screen}`}>
        <div className={styles.computing}>
          <div className={styles.spinner} />
          <h2 className={styles.computingTitle}>
            Updating your octagons{'\u2026'}
          </h2>
          <p className={styles.computingSub}>
            Scoring health, then wealth.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
