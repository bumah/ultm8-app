'use client';

import { useReducer, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { WEALTH_QUESTIONS } from '@/lib/data/wealth-questions';
import { computeBehaviourPct } from '@/lib/scoring/shared';
import Button from '@/components/ui/Button';
import OptionCard from '@/components/ui/OptionCard';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './wealth.module.css';

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
  'b_active_income', 'b_passive_income', 'b_expenses', 'b_discretionary',
  'b_savings', 'b_debt_repayment', 'b_retirement', 'b_investment',
] as const;

/** Get the 1st day of the current month (YYYY-MM-DD) */
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

    const bScoresAll = state.bAnswers.map(s => s ?? 1);
    const behaviourPct = computeBehaviourPct(bScoresAll);

    const row: Record<string, unknown> = {
      user_id: user.id,
      age_group_snapshot: ageGroup,
      currency_snapshot: currency,
      behaviour_score_pct: behaviourPct,
      octagon_score_pct: behaviourPct,
    };

    B_COLS.forEach((col, i) => {
      row[col] = state.bAnswers[i];
    });

    /* Delete any check-in from this same month before inserting new */
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
  }, [state.bAnswers, ageGroup, currency, router]);

  useEffect(() => {
    if (state.screen === 'computing') {
      const timer = setTimeout(() => {
        computeAndSave();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.screen, computeAndSave]);

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
          <div className={styles.eyebrow}>Monthly Wealth Check-in</div>
          <h1 className={styles.heading}>
            How was your<br /><em>month?</em>
          </h1>
          <p className={styles.body}>
            Rate your 8 wealth habits for the last 30 days. Takes 1 minute.
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
    const q = WEALTH_QUESTIONS[state.bIndex];
    const selected = state.bAnswers[state.bIndex];

    return (
      <div className={`${styles.container} ${styles.screen}`} key={`b-${state.bIndex}`}>
        <div className={styles.progressWrap}>
          <ProgressBar
            label="Monthly Wealth Check-in"
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
