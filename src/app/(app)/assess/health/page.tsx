'use client';

import { useReducer, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HEALTH_QUESTIONS } from '@/lib/data/health-questions';
import { computeBehaviourPct } from '@/lib/scoring/shared';
import Button from '@/components/ui/Button';
import OptionCard from '@/components/ui/OptionCard';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './health.module.css';

/* ── Types ── */
type Screen = 'intro' | 'behaviour' | 'computing';

interface State {
  screen: Screen;
  bIndex: number;
  bAnswers: (number | null)[];
}

type Action =
  | { type: 'START' }
  | { type: 'SET_B_ANSWER'; index: number; score: number }
  | { type: 'NEXT_B' }
  | { type: 'PREV_B' }
  | { type: 'GO_COMPUTING' };

const initialState: State = {
  screen: 'intro',
  bIndex: 0,
  bAnswers: Array(8).fill(null),
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...state, screen: 'behaviour', bIndex: 0 };

    case 'SET_B_ANSWER': {
      const bAnswers = [...state.bAnswers];
      bAnswers[action.index] = action.score;
      return { ...state, bAnswers };
    }

    case 'NEXT_B':
      if (state.bIndex < 7) {
        return { ...state, bIndex: state.bIndex + 1 };
      }
      return { ...state, screen: 'computing' };

    case 'PREV_B':
      if (state.bIndex > 0) {
        return { ...state, bIndex: state.bIndex - 1 };
      }
      return state;

    case 'GO_COMPUTING':
      return { ...state, screen: 'computing' };

    default:
      return state;
  }
}

/* ── DB column keys ── */
const B_COLS = [
  'b_sleep', 'b_smoking', 'b_strength', 'b_sweat',
  'b_sugar', 'b_salt', 'b_spirits', 'b_stress',
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

/** Component */
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

    const bScoresAll = state.bAnswers.map(s => s ?? 1);
    const behaviourPct = computeBehaviourPct(bScoresAll);

    /* Build the row */
    const row: Record<string, unknown> = {
      user_id: user.id,
      gender_snapshot: gender,
      age_group_snapshot: ageGroup,
      behaviour_score_pct: behaviourPct,
      octagon_score_pct: behaviourPct, // use behaviour pct as octagon pct
    };

    B_COLS.forEach((col, i) => {
      row[col] = state.bAnswers[i];
    });

    /* Delete any check-in from this same week before inserting new one */
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

    /* Insert fresh */
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
  }, [state.bAnswers, gender, ageGroup, router]);

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
  const completedBehaviours = state.bAnswers.filter(a => a !== null).length;
  const progressPct = Math.round((completedBehaviours / 8) * 100);

  if (!profileLoaded) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'var(--text-dim)' }}>Loading...</p>
      </div>
    );
  }

  /* ──────────── INTRO ──────────── */
  if (state.screen === 'intro') {
    return (
      <div className={`${styles.container} ${styles.screen}`}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}>Weekly Health Check-in</div>
          <h1 className={styles.heading}>
            How was your<br /><em>week?</em>
          </h1>
          <p className={styles.body}>
            Rate your 8 health habits for the last 7 days. Takes 1 minute.
            Your octagon will update with your new score.
          </p>
          <Button onClick={() => dispatch({ type: 'START' })}>
            Start &rarr;
          </Button>
        </div>
      </div>
    );
  }

  /* ──────────── BEHAVIOUR SCREEN ──────────── */
  if (state.screen === 'behaviour') {
    const q = HEALTH_QUESTIONS[state.bIndex];
    const selected = state.bAnswers[state.bIndex];

    return (
      <div className={`${styles.container} ${styles.screen}`} key={`b-${state.bIndex}`}>
        <div className={styles.progressWrap}>
          <ProgressBar
            label="Weekly Health Check-in"
            count={`${completedBehaviours}/8`}
            percent={progressPct}
          />
        </div>

        <div className={styles.questionNum}>Habit {state.bIndex + 1} of 8</div>
        <h2 className={styles.questionTitle}>{q.name}</h2>
        <p className={styles.hook}>{q.hook}</p>

        <div className={styles.options}>
          {q.options.map(opt => (
            <OptionCard
              key={opt.score}
              score={opt.score}
              text={opt.text}
              selected={selected === opt.score}
              onClick={() => dispatch({ type: 'SET_B_ANSWER', index: state.bIndex, score: opt.score })}
            />
          ))}
        </div>

        <div className={styles.actions}>
          {state.bIndex > 0 && (
            <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_B' })}>
              &larr; Back
            </Button>
          )}
          <Button
            disabled={selected === null}
            onClick={() => dispatch({ type: 'NEXT_B' })}
          >
            {state.bIndex < 7 ? 'Next \u2192' : 'Finish \u2192'}
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
            Scoring your habits.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
