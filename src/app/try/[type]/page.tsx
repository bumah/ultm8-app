'use client';

/**
 * Guest assessment flow.
 * Anyone can take the 16-question check-in here without an account.
 * Results live in localStorage so a refresh doesn't lose them.
 * The results screen ends with a primary CTA to create an account
 * (so the result can be saved + tracked over time).
 */

import { useEffect, useMemo, useReducer, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HEALTH_QUESTIONS, HEALTH_INDICATOR_QUESTIONS,
} from '@/lib/data/health-questions';
import {
  WEALTH_QUESTIONS, WEALTH_INDICATOR_QUESTIONS,
} from '@/lib/data/wealth-questions';
import { BLABELS, HLABELS } from '@/lib/scoring/health-scoring';
import { WBLABELS, WHLABELS } from '@/lib/scoring/wealth-scoring';
import {
  computeBehaviourPct, computeIndicatorPct, computeCombinedPct,
  signedScoreToRing, getOverallRating, getBehaviourTierIndex, getTierColor,
  BGRADES,
} from '@/lib/scoring/shared';
import OctagonChart from '@/components/octagon/OctagonChart';
import Button from '@/components/ui/Button';
import OptionCard from '@/components/ui/OptionCard';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './try.module.css';

type DomainType = 'health' | 'wealth';
type Screen = 'intro' | 'question' | 'computing' | 'result';

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
  | { type: 'GO_RESULT' }
  | { type: 'RESTART' };

const TOTAL_QS = 16;

const initialState: State = {
  screen: 'intro',
  qIndex: 0,
  answers: Array(TOTAL_QS).fill(null),
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':    return { ...state, screen: 'question', qIndex: 0 };
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
    case 'GO_RESULT': return { ...state, screen: 'result' };
    case 'RESTART':   return initialState;
    default:          return state;
  }
}

const STORAGE_KEY = (type: DomainType) => `ultm8.try.${type}.v1`;

export default function TryPage() {
  const params = useParams();
  const router = useRouter();
  const raw = (params.type as string) || 'health';
  const type: DomainType = raw === 'wealth' ? 'wealth' : 'health';

  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  const behaviourQs = type === 'health' ? HEALTH_QUESTIONS : WEALTH_QUESTIONS;
  const indicatorQs = type === 'health' ? HEALTH_INDICATOR_QUESTIONS : WEALTH_INDICATOR_QUESTIONS;
  const bLabels = type === 'health' ? BLABELS : WBLABELS;
  const iLabels = type === 'health' ? HLABELS : WHLABELS;

  /* Hydrate previous result from localStorage on first mount */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(type));
      if (saved) {
        const parsed = JSON.parse(saved) as { answers: (number | null)[] };
        if (Array.isArray(parsed.answers) && parsed.answers.length === TOTAL_QS) {
          // If a complete previous run exists, jump straight to result.
          if (parsed.answers.every(a => a !== null)) {
            dispatch({ type: 'SET_ANSWER', index: 0, score: parsed.answers[0]! });
            // Use a fresh state to avoid the dispatch reset; restore by hand:
            for (let i = 0; i < TOTAL_QS; i++) {
              dispatch({ type: 'SET_ANSWER', index: i, score: parsed.answers[i]! });
            }
            dispatch({ type: 'GO_RESULT' });
          }
        }
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Move from computing → result after a short delay (so user sees the spinner). */
  useEffect(() => {
    if (state.screen === 'computing') {
      const t = setTimeout(() => {
        // Persist for the user before showing result
        try {
          localStorage.setItem(
            STORAGE_KEY(type),
            JSON.stringify({ answers: state.answers, ts: Date.now() }),
          );
        } catch {
          // ignore quota errors
        }
        dispatch({ type: 'GO_RESULT' });
      }, 700);
      return () => clearTimeout(t);
    }
  }, [state.screen, state.answers, type]);

  /* ── Derived data for results ── */
  const { bScores, iScoresRaw, behaviourPct, indicatorPct, combinedPct, octagonScores } = useMemo(() => {
    const bs = state.answers.slice(0, 8).map(s => s ?? 0);
    const is = state.answers.slice(8, 16).map(s => s ?? 0);
    return {
      bScores: bs,
      iScoresRaw: is,
      behaviourPct: computeBehaviourPct(bs),
      indicatorPct: computeIndicatorPct(is),
      combinedPct: computeCombinedPct(computeBehaviourPct(bs), computeIndicatorPct(is)),
      octagonScores: is.map(signedScoreToRing),
    };
  }, [state.answers]);

  const overall = getOverallRating(combinedPct);
  const completed = state.answers.filter(a => a !== null).length;
  const progressPct = Math.round((completed / TOTAL_QS) * 100);

  if (!hydrated) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  /* ── INTRO ── */
  if (state.screen === 'intro') {
    return (
      <div className={styles.container}>
        <Link href="/" className={styles.back}>&larr; Home</Link>
        <div className={styles.intro}>
          <div className={styles.eyebrow}>{type === 'health' ? 'Health' : 'Wealth'} Assessment</div>
          <h1 className={styles.heading}>
            How is your<br /><em>{type === 'health' ? 'health' : 'wealth'} right now?</em>
          </h1>
          <p className={styles.body}>
            16 quick questions {'\u2014'} 8 habits, then 8 indicators.
            Takes 2 minutes. Get an octagon score and see where you stand.
          </p>
          <p className={styles.bodyDim}>
            No account needed to take the assessment.
          </p>
          <Button onClick={() => dispatch({ type: 'START' })}>
            Start &rarr;
          </Button>
          <div className={styles.swap}>
            Or take the {type === 'health' ? (
              <Link href="/try/wealth" className={styles.swapLink}>wealth assessment</Link>
            ) : (
              <Link href="/try/health" className={styles.swapLink}>health assessment</Link>
            )}
            {' '}instead.
          </div>
        </div>
      </div>
    );
  }

  /* ── QUESTION ── */
  if (state.screen === 'question') {
    const isBehaviour = state.qIndex < 8;
    const q = isBehaviour ? behaviourQs[state.qIndex] : indicatorQs[state.qIndex - 8];
    const phase = isBehaviour
      ? `${type === 'health' ? 'Health' : 'Wealth'} \u00B7 Behaviour`
      : `${type === 'health' ? 'Health' : 'Wealth'} \u00B7 Indicator`;
    const selected = state.answers[state.qIndex];

    return (
      <div className={styles.container} key={`q-${state.qIndex}`}>
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
            {state.qIndex < TOTAL_QS - 1 ? 'Next \u2192' : 'See result \u2192'}
          </Button>
        </div>
      </div>
    );
  }

  /* ── COMPUTING ── */
  if (state.screen === 'computing') {
    return (
      <div className={styles.container}>
        <div className={styles.computing}>
          <div className={styles.spinner} />
          <h2 className={styles.computingTitle}>Scoring your check-in…</h2>
          <p className={styles.computingSub}>Building your octagon.</p>
        </div>
      </div>
    );
  }

  /* ── RESULT ── */
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.back}>&larr; Home</Link>

      <div className={styles.resultHead}>
        <div className={styles.eyebrow}>Your {type === 'health' ? 'Health' : 'Wealth'} Octagon</div>
        <h1 className={styles.heading}>
          You&rsquo;re scoring<br /><em>{combinedPct}%</em>
        </h1>
        <div className={styles.rating} style={{ color: overall.color }}>
          {overall.label}
        </div>
      </div>

      <div className={styles.scoreRow}>
        <div className={styles.scoreCell}>
          <div className={styles.scoreCellLabel}>Behaviour</div>
          <div className={styles.scoreCellValue}>{behaviourPct}%</div>
        </div>
        <div className={styles.scoreCellDivider} />
        <div className={styles.scoreCell}>
          <div className={styles.scoreCellLabel}>Indicator</div>
          <div className={styles.scoreCellValue}>{indicatorPct}%</div>
        </div>
      </div>

      <div className={styles.octagonWrap}>
        <OctagonChart
          scores={octagonScores}
          labels={[...iLabels]}
          maxScore={8}
          size={300}
          showLabels
          showScores={false}
        />
      </div>

      {/* Behaviour breakdown */}
      <div className={styles.breakdownBlock}>
        <div className={styles.blockLabel}>Your 8 habits</div>
        {bLabels.map((label, i) => {
          const score = bScores[i];
          const grade = BGRADES[getBehaviourTierIndex(score)];
          const color = getTierColor(score);
          const filled = score + 2;
          return (
            <div className={styles.barRow} key={i}>
              <div className={styles.barName}>{label}</div>
              <div className={styles.barSegments}>
                {[1, 2, 3, 4].map(seg => (
                  <span
                    key={seg}
                    className={styles.barSeg}
                    style={seg <= filled ? { background: color } : undefined}
                  />
                ))}
              </div>
              <div className={styles.barTier} style={{ color }}>{grade}</div>
            </div>
          );
        })}
      </div>

      {/* Indicator breakdown */}
      <div className={styles.breakdownBlock}>
        <div className={styles.blockLabel}>Your 8 indicators</div>
        {iLabels.map((label, i) => {
          const raw = iScoresRaw[i];
          const grade = BGRADES[getBehaviourTierIndex(raw)];
          const color = getTierColor(raw);
          const filled = raw + 2;
          return (
            <div className={styles.barRow} key={i}>
              <div className={styles.barName}>{label}</div>
              <div className={styles.barSegments}>
                {[1, 2, 3, 4].map(seg => (
                  <span
                    key={seg}
                    className={styles.barSeg}
                    style={seg <= filled ? { background: color } : undefined}
                  />
                ))}
              </div>
              <div className={styles.barTier} style={{ color }}>{grade}</div>
            </div>
          );
        })}
      </div>

      {/* CTA: save / sign in */}
      <div className={styles.savePrompt}>
        <div className={styles.savePromptTitle}>Want to track this?</div>
        <p className={styles.savePromptText}>
          Create a free account to save this result, take regular check-ins,
          set goals against indicators, and watch your trends over time.
        </p>
        <Link href="/register" className={styles.ctaPrimary}>
          Create account &rarr;
        </Link>
        <div className={styles.signInRow}>
          Already have an account?{' '}
          <Link href="/login" className={styles.signInLink}>Sign in</Link>
        </div>
      </div>

      <div className={styles.subActions}>
        <button
          className={styles.retake}
          onClick={() => {
            try { localStorage.removeItem(STORAGE_KEY(type)); } catch {}
            dispatch({ type: 'RESTART' });
          }}
        >
          Retake assessment
        </button>
        <button
          className={styles.swapBtn}
          onClick={() => router.push(`/try/${type === 'health' ? 'wealth' : 'health'}`)}
        >
          Take the {type === 'health' ? 'wealth' : 'health'} assessment
        </button>
      </div>
    </div>
  );
}
