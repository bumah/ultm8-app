'use client';

import { useReducer, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HEALTH_QUESTIONS, HEALTH_INDICATOR_QUESTIONS } from '@/lib/data/health-questions';
import { computeBehaviourPct, computeIndicatorPct, computeCombinedPct } from '@/lib/scoring/shared';
import Button from '@/components/ui/Button';
import OptionCard from '@/components/ui/OptionCard';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './health.module.css';

/* ── Types ── */
type Screen = 'intro' | 'question' | 'computing';

interface State {
  screen: Screen;
  qIndex: number;             // 0..15 (8 behaviours then 8 indicators)
  answers: (number | null)[]; // 16 slots
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

/* ── DB column keys (16 total) ── */
const B_COLS = [
  'b_sleep', 'b_smoking', 'b_strength', 'b_sweat',
  'b_sugar', 'b_salt', 'b_spirits', 'b_stress',
] as const;

const IS_COLS = [
  'is_blood_pressure', 'is_weight', 'is_pushups', 'is_resting_hr',
  'is_body_fat', 'is_sleep_quality', 'is_blood_sugar', 'is_wellbeing',
] as const;

/** Get the Monday of the current ISO week (YYYY-MM-DD) */
function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export default function HealthCheckinPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [gender, setGender] = useState<string>('male');
  const [ageGroup, setAgeGroup] = useState<string>('30-44');
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
        .select('gender, age_group')
        .eq('id', user.id)
        .single();

      if (data) {
        setGender(data.gender || 'male');
        setAgeGroup(data.age_group || '30-44');
      }
      setProfileLoaded(true);
    }
    loadProfile();
  }, [router]);

  /* Compute and save to Supabase */
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
      gender_snapshot: gender,
      age_group_snapshot: ageGroup,
      behaviour_score_pct: behaviourPct,
      indicator_score_pct: indicatorPct,
      octagon_score_pct: octagonPct,
    };

    B_COLS.forEach((col, i) => { row[col] = bScores[i]; });
    IS_COLS.forEach((col, i) => { row[col] = iScores[i]; });

    /* Replace any existing check-in from this same week */
    const weekStart = getWeekStart();
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    const weekEnd = weekEndDate.toISOString().split('T')[0];

    await supabase
      .from('health_assessments')
      .delete()
      .eq('user_id', user.id)
      .gte('completed_at', weekStart)
      .lt('completed_at', weekEnd);

    const { data, error } = await supabase
      .from('health_assessments')
      .insert(row)
      .select('id')
      .single();

    if (error || !data) {
      console.error('Failed to save health check-in:', error);
      return;
    }

    router.push(`/results/health/${data.id}`);
  }, [state.answers, gender, ageGroup, router]);

  /* Trigger computation when entering computing screen */
  useEffect(() => {
    if (state.screen === 'computing') {
      const timer = setTimeout(() => {
        computeAndSave();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.screen, computeAndSave]);

  /* ── Progress ── */
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
          <div className={styles.eyebrow}>Health Check-in</div>
          <h1 className={styles.heading}>
            How was your<br /><em>week?</em>
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
      ? HEALTH_QUESTIONS[state.qIndex]
      : HEALTH_INDICATOR_QUESTIONS[state.qIndex - 8];
    const phase = isBehaviour ? 'Health \u00B7 Behaviour' : 'Health \u00B7 Indicator';
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
