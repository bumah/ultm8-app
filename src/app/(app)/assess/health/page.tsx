'use client';

import { useReducer, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HEALTH_QUESTIONS } from '@/lib/data/health-questions';
import { HEALTH_INDICATORS } from '@/lib/data/health-indicators';
import { calcH, HWEIGHTS } from '@/lib/scoring/health-scoring';
import { computeWeightedScore, computeBehaviourPct, HSTATUS, getTierColor } from '@/lib/scoring/shared';
import { generatePlan } from '@/lib/utils/plan-generator';
import Button from '@/components/ui/Button';
import OptionCard from '@/components/ui/OptionCard';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './health.module.css';

/* ── Types ── */
type Screen = 'intro' | 'behaviour' | 'bridge' | 'indicator' | 'computing';

interface State {
  screen: Screen;
  bIndex: number;
  hIndex: number;
  bAnswers: (number | null)[];
  hValues: (number | null)[];
}

type Action =
  | { type: 'START' }
  | { type: 'SET_B_ANSWER'; index: number; score: number }
  | { type: 'NEXT_B' }
  | { type: 'PREV_B' }
  | { type: 'GO_BRIDGE' }
  | { type: 'START_INDICATORS' }
  | { type: 'SET_H_VALUE'; index: number; value: number | null }
  | { type: 'NEXT_H' }
  | { type: 'PREV_H' }
  | { type: 'GO_COMPUTING' };

const initialState: State = {
  screen: 'intro',
  bIndex: 0,
  hIndex: 0,
  bAnswers: Array(8).fill(null),
  hValues: Array(8).fill(null),
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

    case 'START_INDICATORS':
      return { ...state, screen: 'indicator', hIndex: 0 };

    case 'SET_H_VALUE': {
      const hValues = [...state.hValues];
      hValues[action.index] = action.value;
      return { ...state, hValues };
    }

    case 'NEXT_H':
      if (state.hIndex < 7) {
        return { ...state, hIndex: state.hIndex + 1 };
      }
      return { ...state, screen: 'computing' };

    case 'PREV_H':
      if (state.hIndex > 0) {
        return { ...state, hIndex: state.hIndex - 1 };
      }
      return { ...state, screen: 'bridge' };

    case 'GO_COMPUTING':
      return { ...state, screen: 'computing' };

    default:
      return state;
  }
}

/* ── Behaviour column keys matching the database ── */
const B_COLS = [
  'b_sleep', 'b_smoking', 'b_strength', 'b_sweat',
  'b_sugar', 'b_salt', 'b_spirits', 'b_stress',
] as const;

/* ── Indicator raw-value column keys ── */
const I_COLS = [
  'i_blood_pressure', 'i_blood_sugar', 'i_cholesterol', 'i_resting_hr',
  'i_body_fat', 'i_muscle_mass', 'i_pushups', 'i_5km_time',
] as const;

/* ── Indicator score column keys ── */
const IS_COLS = [
  'is_blood_pressure', 'is_blood_sugar', 'is_cholesterol', 'is_resting_hr',
  'is_body_fat', 'is_muscle_mass', 'is_pushups', 'is_5km_time',
] as const;

/* ── Component ── */
export default function HealthAssessPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [gender, setGender] = useState<string>('male');
  const [ageGroup, setAgeGroup] = useState<string>('30-44');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [inputStr, setInputStr] = useState('');

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

  /* Reset input string when indicator changes */
  useEffect(() => {
    if (state.screen === 'indicator') {
      const current = state.hValues[state.hIndex];
      setInputStr(current !== null ? String(current) : '');
    }
  }, [state.hIndex, state.screen, state.hValues]);

  /* Compute and save to Supabase */
  const computeAndSave = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    /* Calculate indicator scores */
    const indicatorScores = state.hValues.map((val, i) => {
      if (val === null) return null;
      return calcH(i, val, gender);
    });

    /* Compute aggregate scores */
    const validScores = indicatorScores.filter((s): s is number => s !== null);
    const validWeights: number[] = [];
    indicatorScores.forEach((s, i) => {
      if (s !== null) validWeights.push(HWEIGHTS[i]);
    });

    /* Normalise weights if some indicators were skipped */
    const weightSum = validWeights.reduce((a, b) => a + b, 0);
    const normWeights = weightSum > 0
      ? validWeights.map(w => w / weightSum)
      : validWeights;

    const octagonPct = validScores.length > 0
      ? computeWeightedScore(validScores, normWeights)
      : 0;

    const bScoresAll = state.bAnswers.map(s => s ?? 1);
    const behaviourPct = computeBehaviourPct(bScoresAll);

    /* Build the row */
    const row: Record<string, unknown> = {
      user_id: user.id,
      gender_snapshot: gender,
      age_group_snapshot: ageGroup,
      behaviour_score_pct: behaviourPct,
      octagon_score_pct: octagonPct,
    };

    B_COLS.forEach((col, i) => {
      row[col] = state.bAnswers[i];
    });

    I_COLS.forEach((col, i) => {
      row[col] = state.hValues[i];
    });

    IS_COLS.forEach((col, i) => {
      row[col] = indicatorScores[i];
    });

    // Check if there's a recent assessment within 8 weeks
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const { data: recentAssessment } = await supabase
      .from('health_assessments')
      .select('id')
      .eq('user_id', user.id)
      .gte('completed_at', eightWeeksAgo.toISOString())
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    let assessmentId: string;

    if (recentAssessment) {
      // Within 8 weeks — overwrite the existing assessment
      row.completed_at = new Date().toISOString();
      const { error } = await supabase
        .from('health_assessments')
        .update(row)
        .eq('id', recentAssessment.id);

      if (error) {
        console.error('Failed to update health assessment:', error);
        return;
      }
      assessmentId = recentAssessment.id;
    } else {
      // After 8 weeks — create new assessment
      const { data, error } = await supabase
        .from('health_assessments')
        .insert(row)
        .select('id')
        .single();

      if (error || !data) {
        console.error('Failed to save health assessment:', error);
        return;
      }
      assessmentId = data.id;
    }

    // Generate 8-week plan
    const bScoresArr = state.bAnswers.map(s => s || 1);
    const { planData, dailyRows } = generatePlan('health', bScoresArr);

    // Delete existing daily progress for any active health plan
    const { data: existingPlans } = await supabase
      .from('action_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('assessment_type', 'health')
      .eq('is_active', true);

    if (existingPlans) {
      for (const p of existingPlans) {
        await supabase.from('daily_progress').delete().eq('plan_id', p.id);
      }
    }

    // Deactivate previous health plans
    await supabase
      .from('action_plans')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('assessment_type', 'health')
      .eq('is_active', true);

    // Create new plan
    const { data: planRow } = await supabase
      .from('action_plans')
      .insert({
        user_id: user.id,
        assessment_type: 'health',
        assessment_id: assessmentId,
        plan_data: planData,
        start_date: new Date().toISOString().split('T')[0],
        is_active: true,
      })
      .select('id')
      .single();

    // Pre-generate daily progress rows
    if (planRow?.id) {
      const progressRows = dailyRows.map(r => ({
        user_id: user.id,
        plan_id: planRow.id,
        ...r,
        completed: false,
      }));

      for (let i = 0; i < progressRows.length; i += 100) {
        await supabase.from('daily_progress').insert(progressRows.slice(i, i + 100));
      }
    }

    router.push(`/results/health/${assessmentId}`);
  }, [state.bAnswers, state.hValues, gender, ageGroup, router]);

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
  const completedBehaviours = state.bAnswers.filter(a => a !== null).length;
  const completedIndicators = state.hValues.filter(v => v !== null).length;
  const totalCompleted = completedBehaviours + completedIndicators;
  const progressPct = Math.round((totalCompleted / 16) * 100);

  const progressLabel = state.screen === 'behaviour'
    ? 'Part 1 — Behaviours'
    : state.screen === 'indicator'
      ? 'Part 2 — Indicators'
      : 'Health Assessment';

  const progressCount = state.screen === 'behaviour'
    ? `${completedBehaviours}/8`
    : state.screen === 'indicator'
      ? `${completedBehaviours + completedIndicators}/16`
      : undefined;

  /* ── Live score preview for indicators ── */
  function getIndicatorPreview(index: number, value: number | null) {
    if (value === null || isNaN(value)) {
      return { score: '—', status: 'Enter a value', color: 'var(--text-dim)' };
    }
    const score = calcH(index, value, gender);
    const status = HSTATUS[score - 1];
    const color = getTierColor(score, 8);
    return { score: String(score), status, color };
  }

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
          <div className={styles.eyebrow}>Health Assessment</div>
          <h1 className={styles.heading}>
            Know your<br /><em>Health Octagon.</em>
          </h1>
          <p className={styles.body}>
            This assessment maps your health across 8 behaviours and 8
            indicators to build your personalised Health Octagon. It takes
            about 5 minutes. Answer honestly — this is your baseline.
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
            label={progressLabel}
            count={progressCount}
            percent={progressPct}
          />
        </div>

        <div className={styles.partLabel}>Part 1 of 2 — Behaviours</div>
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
            Your health<br /><em>Indicators.</em>
          </h1>
          <p className={styles.body}>
            Now enter your health indicators — real numbers from tests, devices
            or estimates. These are the measurable outcomes your behaviours
            drive. Skip any you do not know — you can update them later.
          </p>
          <Button onClick={() => dispatch({ type: 'START_INDICATORS' })}>
            Enter My Indicators &rarr;
          </Button>
        </div>
      </div>
    );
  }

  /* ──────────── INDICATOR SCREEN ──────────── */
  if (state.screen === 'indicator') {
    const ind = HEALTH_INDICATORS[state.hIndex];
    const numericInput = inputStr !== '' ? parseFloat(inputStr) : null;
    const preview = getIndicatorPreview(state.hIndex, numericInput);
    const hasValue = inputStr !== '' && !isNaN(Number(inputStr));

    function handleInputChange(val: string) {
      setInputStr(val);
      const num = parseFloat(val);
      if (val === '' || isNaN(num)) {
        dispatch({ type: 'SET_H_VALUE', index: state.hIndex, value: null });
      } else {
        dispatch({ type: 'SET_H_VALUE', index: state.hIndex, value: num });
      }
    }

    function handleSkip() {
      dispatch({ type: 'SET_H_VALUE', index: state.hIndex, value: null });
      dispatch({ type: 'NEXT_H' });
    }

    function handleNext() {
      dispatch({ type: 'NEXT_H' });
    }

    function handleBack() {
      dispatch({ type: 'PREV_H' });
    }

    return (
      <div className={`${styles.container} ${styles.screen}`} key={`h-${state.hIndex}`}>
        <div className={styles.progressWrap}>
          <ProgressBar
            label={progressLabel}
            count={progressCount}
            percent={progressPct}
          />
        </div>

        <div className={styles.partLabel}>Part 2 of 2 — Indicators</div>
        <div className={styles.questionNum}>Indicator {state.hIndex + 1} of 8</div>
        <h2 className={styles.questionTitle}>{ind.name}</h2>
        <p className={styles.hook}>{ind.hook}</p>
        <div className={styles.drivenBy}>
          <span className={styles.drivenByLabel}>Driven by</span>
          <span className={styles.drivesArrow}>&rarr;</span>
          <span className={styles.drivenByValue}>{ind.drivenBy}</span>
        </div>

        <div className={styles.inputWrap}>
          <input
            type="number"
            className={styles.numInput}
            placeholder={ind.placeholder}
            value={inputStr}
            onChange={(e) => handleInputChange(e.target.value)}
            min={ind.min}
            max={ind.max}
            step={ind.step}
            autoFocus
          />
          <span className={styles.unitLabel}>{ind.unit}</span>
        </div>

        <div className={styles.rangeHint}>{ind.range}</div>

        <div
          className={`${styles.scorePreview} ${hasValue ? styles.scorePreviewActive : ''}`}
        >
          <span
            className={styles.previewScore}
            style={{ color: hasValue ? preview.color : 'var(--text-dim)' }}
          >
            {preview.score}
          </span>
          <div className={styles.previewLabel}>
            <span className={styles.previewTitle}>Score Preview</span>
            <span
              className={styles.previewStatus}
              style={{ color: hasValue ? preview.color : 'var(--text-dim)' }}
            >
              {preview.status}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={handleBack}>
            &larr; Back
          </Button>
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button
            disabled={!hasValue}
            onClick={handleNext}
          >
            {state.hIndex < 7 ? 'Next \u2192' : 'Finish \u2192'}
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
            Scoring your behaviours and indicators.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
