'use client';

import { useReducer, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { WEALTH_QUESTIONS, WEALTH_INDICATOR_QUESTIONS } from '@/lib/data/wealth-questions';
import { computeBehaviourPct, computeIndicatorPct, computeCombinedPct } from '@/lib/scoring/shared';
import Button from '@/components/ui/Button';
import OptionCard from '@/components/ui/OptionCard';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './wealth.module.css';

/* ── Types ── */
type Screen = 'intro' | 'question' | 'computing';

interface State {
  screen: Screen;
  qIndex: number;
  answers: (number | null)[];
}

type Action =
  | { type: 'START' }
  | { type: 'SET_ANSWER'; index: number; score: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GO_COMPUTING' };

const TOTAL_QS = 16;

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
      if (state.qIndex < TOTAL_QS - 1) {
        return { ...state, qIndex: state.qIndex + 1 };
      }
      return { ...state, screen: 'computing' };

    case 'PREV':
      if (state.qIndex > 0) {
        return { ...state, qIndex: state.qIndex - 1 };
      }
      return state;

    case 'GO_COMPUTING':
      return { ...state, screen: 'computing' };

    default:
      return state;
  }
}

/* ── DB column keys (16 total) — file's wealth behaviour set ── */
const B_COLS = [
  'b_active_income', 'b_passive_income', 'b_expenses', 'b_discretionary',
  'b_savings', 'b_debt_repayment', 'b_retirement', 'b_investment',
] as const;

const IS_COLS = [
  'is_net_income', 'is_discretionary_spend', 'is_emergency_fund', 'is_debt_level',
  'is_net_worth', 'is_pension_fund', 'is_passive_income', 'is_fi_ratio',
] as const;

/** Get the 1st of the current month (YYYY-MM-DD) */
function getMonthStart(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d.toISOString().split('T')[0];
}

function getMonthEnd(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return d.toISOString().split('T')[0];
}

export default function WealthCheckinPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ageGroup, setAgeGroup] = useState<string>('30-44');
  const [currency, setCurrency] = useState<string>('£');
  const [profileLoaded, setProfileLoaded] = useState(false);

  /* Load user profile on mount */
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
        .select('age_group, currency')
        .eq('id', user.id)
        .single();

      if (data) {
        setAgeGroup(data.age_group || '30-44');
        setCurrency(data.currency || '£');
      }
      setProfileLoaded(true);
    }
    loadProfile();
  }, [router]);

  /* Compute and save */
  const computeAndSave = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const bScores = state.answers.slice(0, 8).map(s => s ?? 0);
    const iScores = state.answers.slice(8, 16).map(s => s ?? 0);
    const behaviourPct = computeBehaviourPct(bScores);
    const indicatorPct = computeIndicatorPct(iScores);
    const octagonPct = computeCombinedPct(behaviourPct, indicatorPct);

    const row: Record<string, unknown> = {
      user_id: user.id,
      age_group_snapshot: ageGroup,
      currency_snapshot: currency,
      behaviour_score_pct: behaviourPct,
      indicator_score_pct: indicatorPct,
      octagon_score_pct: octagonPct,
    };

    B_COLS.forEach((col, i) => { row[col] = bScores[i]; });
    IS_COLS.forEach((col, i) => { row[col] = iScores[i]; });

    /* Replace any existing check-in from this same month */
    const monthStart = getMonthStart();
    const monthEnd = getMonthEnd();

    await supabase
      .from('wealth_assessments')
      .delete()
      .eq('user_id', user.id)
      .gte('completed_at', monthStart)
      .lt('completed_at', monthEnd);

    const { data, error } = await supabase
      .from('wealth_assessments')
      .insert(row)
      .select('id')
      .single();

    if (error || !data) {
      console.error('Failed to save wealth check-in:', error);
      return;
    }

    router.push(`/results/wealth/${data.id}`);
  }, [state.answers, ageGroup, currency, router]);

  useEffect(() => {
    if (state.screen === 'computing') {
      const timer = setTimeout(() => {
        computeAndSave();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.screen, computeAndSave]);

  const completed = state.answers.filter(a => a !== null).length;
  const progressPct = Math.round((completed / TOTAL_QS) * 100);

  if (!profileLoaded) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  /* ──────────── INTRO ──────────── */
  if (state.screen === 'intro') {
    return (
      <div className={`${styles.container} ${styles.screen}`}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}>Wealth Check-in</div>
          <h1 className={styles.heading}>
            How was your<br /><em>month?</em>
          </h1>
          <p className={styles.body}>
            16 quick questions {'\u2014'} 8 habits, then 8 indicators.
            Takes 2 minutes. Your octagon updates with the new scores.
          </p>
          <Button onClick={() => dispatch({ type: 'START' })}>
            Start &rarr;
          </Button>
        </div>
      </div>
    );
  }

  /* ──────────── QUESTION SCREEN ──────────── */
  if (state.screen === 'question') {
    const isBehaviour = state.qIndex < 8;
    const q = isBehaviour
      ? WEALTH_QUESTIONS[state.qIndex]
      : WEALTH_INDICATOR_QUESTIONS[state.qIndex - 8];
    const phase = isBehaviour ? 'Wealth \u00B7 Behaviour' : 'Wealth \u00B7 Indicator';
    const selected = state.answers[state.qIndex];

    return (
      <div className={`${styles.container} ${styles.screen}`} key={`q-${state.qIndex}`}>
        <div className={styles.progressWrap}>
          <ProgressBar
            label={phase}
            count={`${state.qIndex + 1}/${TOTAL_QS}`}
            percent={progressPct}
          />
        </div>

        <div className={styles.questionNum}>Question {state.qIndex + 1} of {TOTAL_QS}</div>
        <h2 className={styles.questionTitle}>{q.name}</h2>
        <p className={styles.hook}>{q.hook}</p>

        <div className={styles.options}>
          {q.options.map((opt, i) => (
            <OptionCard
              key={i}
              score={opt.score}
              text={opt.text}
              selected={selected === opt.score}
              onClick={() => dispatch({ type: 'SET_ANSWER', index: state.qIndex, score: opt.score })}
            />
          ))}
        </div>

        <div className={styles.actions}>
          {state.qIndex > 0 && (
            <Button variant="ghost" onClick={() => dispatch({ type: 'PREV' })}>
              &larr; Back
            </Button>
          )}
          <Button
            disabled={selected === null}
            onClick={() => dispatch({ type: 'NEXT' })}
          >
            {state.qIndex < TOTAL_QS - 1 ? 'Next \u2192' : 'Finish \u2192'}
          </Button>
        </div>
      </div>
    );
  }

  /* ──────────── COMPUTING ──────────── */
  if (state.screen === 'computing') {
    return (
      <div className={`${styles.container} ${styles.screen}`}>
        <div className={styles.computing}>
          <div className={styles.spinner} />
          <h2 className={styles.computingTitle}>
            Updating your octagon...
          </h2>
          <p className={styles.computingSub}>
            Scoring your habits and indicators.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
