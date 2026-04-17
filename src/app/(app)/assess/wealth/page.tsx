'use client';

import { useReducer, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { WEALTH_QUESTIONS } from '@/lib/data/wealth-questions';
import { FINANCIAL_SCREENS, CREDIT_SCORE_OPTIONS } from '@/lib/data/wealth-indicators';
import { computeWealthScores, WHWEIGHTS } from '@/lib/scoring/wealth-scoring';
import { computeWeightedScore, computeBehaviourPct } from '@/lib/scoring/shared';
import Button from '@/components/ui/Button';
import OptionCard from '@/components/ui/OptionCard';
import SelectCard from '@/components/ui/SelectCard';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './wealth.module.css';

/* ── Types ── */
type Screen = 'intro' | 'behaviour' | 'bridge' | 'financial' | 'credit' | 'computing';

interface FinancialValues {
  income: string;
  passive: string;
  expenses: string;
  discretionary: string;
  savings: string;
  savingsTotal: string;
  pension: string;
  debt: string;
}

interface State {
  screen: Screen;
  bIndex: number;
  fdIndex: number;
  bAnswers: (number | null)[];
  fdValues: FinancialValues;
  creditScore: number | null;
}

type Action =
  | { type: 'START' }
  | { type: 'SET_B_ANSWER'; index: number; score: number }
  | { type: 'NEXT_B' }
  | { type: 'PREV_B' }
  | { type: 'GO_BRIDGE' }
  | { type: 'START_FINANCIAL' }
  | { type: 'SET_FD_VALUE'; field: string; value: string }
  | { type: 'NEXT_FD' }
  | { type: 'PREV_FD' }
  | { type: 'GO_CREDIT' }
  | { type: 'SET_CREDIT'; score: number }
  | { type: 'PREV_CREDIT' }
  | { type: 'GO_COMPUTING' };

const initialState: State = {
  screen: 'intro',
  bIndex: 0,
  fdIndex: 0,
  bAnswers: Array(8).fill(null),
  fdValues: {
    income: '',
    passive: '',
    expenses: '',
    discretionary: '',
    savings: '',
    savingsTotal: '',
    pension: '',
    debt: '',
  },
  creditScore: null,
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
      return { ...state, screen: 'bridge' };

    case 'PREV_B':
      if (state.bIndex > 0) {
        return { ...state, bIndex: state.bIndex - 1 };
      }
      return state;

    case 'GO_BRIDGE':
      return { ...state, screen: 'bridge' };

    case 'START_FINANCIAL':
      return { ...state, screen: 'financial', fdIndex: 0 };

    case 'SET_FD_VALUE':
      return {
        ...state,
        fdValues: { ...state.fdValues, [action.field]: action.value },
      };

    case 'NEXT_FD':
      if (state.fdIndex < FINANCIAL_SCREENS.length - 1) {
        return { ...state, fdIndex: state.fdIndex + 1 };
      }
      return { ...state, screen: 'credit' };

    case 'PREV_FD':
      if (state.fdIndex > 0) {
        return { ...state, fdIndex: state.fdIndex - 1 };
      }
      return { ...state, screen: 'bridge' };

    case 'GO_CREDIT':
      return { ...state, screen: 'credit' };

    case 'SET_CREDIT':
      return { ...state, creditScore: action.score };

    case 'PREV_CREDIT':
      return { ...state, screen: 'financial', fdIndex: FINANCIAL_SCREENS.length - 1 };

    case 'GO_COMPUTING':
      return { ...state, screen: 'computing' };

    default:
      return state;
  }
}

/* ── Behaviour column keys matching the database ── */
const B_COLS = [
  'b_active_income', 'b_passive_income', 'b_expenses', 'b_discretionary',
  'b_savings', 'b_debt_repayment', 'b_retirement', 'b_investment',
] as const;

/* ── Financial data column keys ── */
const FD_COLS = [
  'fd_income', 'fd_passive', 'fd_expenses', 'fd_discretionary',
  'fd_savings', 'fd_savings_total', 'fd_pension', 'fd_debt',
] as const;

/* ── Financial data field keys matching FinancialValues ── */
const FD_FIELDS = [
  'income', 'passive', 'expenses', 'discretionary',
  'savings', 'savingsTotal', 'pension', 'debt',
] as const;

/* ── Indicator score column keys ── */
const IS_COLS = [
  'is_net_worth', 'is_debt_level', 'is_savings_capacity', 'is_emergency_fund',
  'is_retirement_pot', 'is_fi_ratio', 'is_lifestyle_creep', 'is_credit_score',
] as const;

/* ── Currency symbols ── */
const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '\u00A3',
  USD: '$',
  EUR: '\u20AC',
};

/* ── Component ── */
export default function WealthAssessPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ageGroup, setAgeGroup] = useState<string>('30-44');
  const [currency, setCurrency] = useState<string>('GBP');
  const [profileLoaded, setProfileLoaded] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '';

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
        setCurrency(data.currency || 'GBP');
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

    /* Build financial data object */
    const fd = {
      income: parseFloat(state.fdValues.income) || 0,
      passive: parseFloat(state.fdValues.passive) || 0,
      expenses: parseFloat(state.fdValues.expenses) || 0,
      discretionary: parseFloat(state.fdValues.discretionary) || 0,
      savings: parseFloat(state.fdValues.savings) || 0,
      savingsTotal: parseFloat(state.fdValues.savingsTotal) || 0,
      pension: parseFloat(state.fdValues.pension) || 0,
      debt: parseFloat(state.fdValues.debt) || 0,
      creditScore: state.creditScore || 1,
    };

    /* Calculate indicator scores */
    const result = computeWealthScores(fd, ageGroup);
    const { scores, computed } = result;

    /* Compute aggregate scores */
    const validWeights = [...WHWEIGHTS];
    const weightSum = validWeights.reduce((a, b) => a + b, 0);
    const normWeights = weightSum > 0
      ? validWeights.map(w => w / weightSum)
      : validWeights;

    const octagonPct = computeWeightedScore(scores, normWeights);

    const bScoresAll = state.bAnswers.map(s => s ?? 1);
    const behaviourPct = computeBehaviourPct(bScoresAll);

    /* Build the row */
    const row: Record<string, unknown> = {
      user_id: user.id,
      age_group_snapshot: ageGroup,
      currency_snapshot: currency,
      behaviour_score_pct: behaviourPct,
      octagon_score_pct: octagonPct,
      computed_net_worth: computed.netWorth,
      computed_savings_rate: computed.savingsRate,
      computed_emergency_months: computed.emergencyMonths,
      computed_fi_ratio: computed.fiRatio,
      computed_disc_pct: computed.discPct,
    };

    B_COLS.forEach((col, i) => {
      row[col] = state.bAnswers[i];
    });

    FD_COLS.forEach((col, i) => {
      const val = parseFloat(state.fdValues[FD_FIELDS[i]]);
      row[col] = isNaN(val) ? 0 : val;
    });

    row['fd_credit_score'] = state.creditScore || 1;

    IS_COLS.forEach((col, i) => {
      row[col] = scores[i];
    });

    // Always create a new assessment (delete recent one if within 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const { data: recentAssessment } = await supabase
      .from('wealth_assessments')
      .select('id')
      .eq('user_id', user.id)
      .gte('completed_at', eightWeeksAgo.toISOString())
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    // If within 8 weeks, delete the old one first
    if (recentAssessment) {
      await supabase.from('wealth_assessments').delete().eq('id', recentAssessment.id);
    }

    // Always insert fresh
    let assessmentId: string;
    {
      const { data, error } = await supabase
        .from('wealth_assessments')
        .insert(row)
        .select('id')
        .single();

      if (error || !data) {
        console.error('Failed to save wealth assessment:', error);
        return;
      }
      assessmentId = data.id;
    }

    // Plan generation removed — assessments now just store scores.
    // Recommendations are derived from scores on the Plan page.

    router.push(`/results/wealth/${assessmentId}`);
  }, [state.bAnswers, state.fdValues, state.creditScore, ageGroup, currency, router]);

  /* Trigger computation when entering computing screen */
  useEffect(() => {
    if (state.screen === 'computing') {
      const timer = setTimeout(() => {
        computeAndSave();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state.screen, computeAndSave]);

  /* ── Progress calculation ── */
  // 8 behaviours + 3 financial screens + 1 credit screen = 12 steps
  const completedBehaviours = state.bAnswers.filter(a => a !== null).length;
  const completedFDScreens = (() => {
    let count = 0;
    for (const screen of FINANCIAL_SCREENS) {
      const allFilled = screen.inputs.every(inp => {
        const val = state.fdValues[inp.id as keyof FinancialValues];
        return val !== '' && !isNaN(Number(val));
      });
      if (allFilled) count++;
    }
    return count;
  })();
  const completedCredit = state.creditScore !== null ? 1 : 0;
  const totalCompleted = completedBehaviours + completedFDScreens + completedCredit;
  const progressPct = Math.round((totalCompleted / 12) * 100);

  const progressLabel = state.screen === 'behaviour'
    ? 'Part 1 \u2014 Behaviours'
    : (state.screen === 'financial' || state.screen === 'credit')
      ? 'Part 2 \u2014 Financial Data'
      : 'Wealth Assessment';

  const progressCount = state.screen === 'behaviour'
    ? `${completedBehaviours}/8`
    : (state.screen === 'financial' || state.screen === 'credit')
      ? `${completedBehaviours + completedFDScreens + completedCredit}/12`
      : undefined;

  if (!profileLoaded) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'var(--text-dim)' }}>Loading...</p>
      </div>
    );
  }

  /* ──────────── INTRO SCREEN ──────────── */
  if (state.screen === 'intro') {
    return (
      <div className={`${styles.container} ${styles.screen}`}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}>Wealth Assessment</div>
          <h1 className={styles.heading}>
            Know your<br /><em>Wealth Octagon.</em>
          </h1>
          <p className={styles.body}>
            This assessment maps your wealth across 8 behaviours and 8
            indicators to build your personalised Wealth Octagon. It takes
            about 5 minutes. Answer honestly &mdash; this is your baseline.
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
            label={progressLabel}
            count={progressCount}
            percent={progressPct}
          />
        </div>

        <div className={styles.partLabel}>Part 1 of 2 &mdash; Behaviours</div>
        <div className={styles.questionNum}>Behaviour {state.bIndex + 1} of 8</div>
        <h2 className={styles.questionTitle}>{q.name}</h2>
        <p className={styles.hook}>{q.hook}</p>
        <div className={styles.drives}>
          <span>Drives</span>
          <span className={styles.drivesArrow}>&rarr;</span>
          <span className={styles.drivesValue}>{q.drives}</span>
        </div>

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
            {state.bIndex < 7 ? 'Next \u2192' : 'Continue \u2192'}
          </Button>
        </div>
      </div>
    );
  }

  /* ──────────── BRIDGE SCREEN ──────────── */
  if (state.screen === 'bridge') {
    return (
      <div className={`${styles.container} ${styles.screen}`}>
        <div className={styles.progressWrap}>
          <ProgressBar
            label={progressLabel}
            count={progressCount}
            percent={progressPct}
          />
        </div>

        <div className={styles.bridge}>
          <div className={styles.eyebrow}>Part 2 of 2</div>
          <h1 className={styles.heading}>
            Your financial<br /><em>Data.</em>
          </h1>
          <p className={styles.body}>
            Now enter your financial data &mdash; income, expenses, savings,
            debt and pension. Your wealth octagon is computed automatically
            from these numbers. Be as accurate as you can.
          </p>
          <Button onClick={() => dispatch({ type: 'START_FINANCIAL' })}>
            Enter My Data &rarr;
          </Button>
        </div>
      </div>
    );
  }

  /* ──────────── FINANCIAL DATA SCREENS ──────────── */
  if (state.screen === 'financial') {
    const fdScreen = FINANCIAL_SCREENS[state.fdIndex];
    const screenInputsValid = fdScreen.inputs.every(inp => {
      const val = state.fdValues[inp.id as keyof FinancialValues];
      return val !== '' && !isNaN(Number(val));
    });

    return (
      <div className={`${styles.container} ${styles.screen}`} key={`fd-${state.fdIndex}`}>
        <div className={styles.progressWrap}>
          <ProgressBar
            label={progressLabel}
            count={progressCount}
            percent={progressPct}
          />
        </div>

        <div className={styles.partLabel}>Part 2 of 2 &mdash; Financial Data</div>
        <div className={styles.questionNum}>Screen {state.fdIndex + 1} of 4</div>
        <h2 className={styles.fdScreenTitle}>
          {fdScreen.title.split(' ')[0]}{' '}
          <em>{fdScreen.title.split(' ').slice(1).join(' ')}.</em>
        </h2>
        <p className={styles.fdScreenSub}>{fdScreen.subtitle}</p>

        {fdScreen.inputs.map(inp => (
          <div className={styles.fdInputGroup} key={inp.id}>
            <div className={styles.fdInputLabel}>{inp.label}</div>
            <div className={styles.fdInputWrap}>
              {currencySymbol && (
                <span className={styles.fdCurrency}>{currencySymbol}</span>
              )}
              <input
                type="number"
                className={styles.fdInput}
                placeholder={inp.placeholder}
                value={state.fdValues[inp.id as keyof FinancialValues]}
                onChange={(e) => dispatch({
                  type: 'SET_FD_VALUE',
                  field: inp.id,
                  value: e.target.value,
                })}
                min={0}
                autoFocus={inp === fdScreen.inputs[0]}
              />
            </div>
            {inp.hint && <div className={styles.fdHint}>{inp.hint}</div>}
          </div>
        ))}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_FD' })}>
            &larr; Back
          </Button>
          <Button
            disabled={!screenInputsValid}
            onClick={() => dispatch({ type: 'NEXT_FD' })}
          >
            {state.fdIndex < FINANCIAL_SCREENS.length - 1 ? 'Next \u2192' : 'Continue \u2192'}
          </Button>
        </div>
      </div>
    );
  }

  /* ──────────── CREDIT SCORE SCREEN ──────────── */
  if (state.screen === 'credit') {
    return (
      <div className={`${styles.container} ${styles.screen}`}>
        <div className={styles.progressWrap}>
          <ProgressBar
            label={progressLabel}
            count={progressCount}
            percent={progressPct}
          />
        </div>

        <div className={styles.partLabel}>Part 2 of 2 &mdash; Financial Data</div>
        <div className={styles.questionNum}>Screen 4 of 4</div>
        <h2 className={styles.fdScreenTitle}>
          Credit <em>Score.</em>
        </h2>
        <p className={styles.fdScreenSub}>
          How would you rate your credit score? Select the closest option.
        </p>

        <div className={styles.creditGrid}>
          {CREDIT_SCORE_OPTIONS.map(opt => (
            <SelectCard
              key={opt.score}
              label={`${opt.score}`}
              sub={opt.label}
              selected={state.creditScore === opt.score}
              onClick={() => dispatch({ type: 'SET_CREDIT', score: opt.score })}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_CREDIT' })}>
            &larr; Back
          </Button>
          <Button
            disabled={state.creditScore === null}
            onClick={() => dispatch({ type: 'GO_COMPUTING' })}
          >
            See My Wealth Octagon &rarr;
          </Button>
        </div>
      </div>
    );
  }

  /* ──────────── COMPUTING SCREEN ──────────── */
  if (state.screen === 'computing') {
    return (
      <div className={`${styles.container} ${styles.screen}`}>
        <div className={styles.computing}>
          <div className={styles.spinner} />
          <h2 className={styles.computingTitle}>
            Computing your octagon...
          </h2>
          <p className={styles.computingSub}>
            Scoring your behaviours and financial data.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
