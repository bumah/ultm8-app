'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { WBLABELS, WHLABELS, WBMAP } from '@/lib/scoring/wealth-scoring';
import { BTIERS, BGRADES, HSTATUS, getBehaviourTierIndex, getTierColor, signedScoreToRing, levelFromPct } from '@/lib/scoring/shared';
import { WHRECS } from '@/lib/data/wealth-recommendations';
import { WCONN_INSIGHTS } from '@/lib/data/wealth-connections';
import OctagonChart from '@/components/octagon/OctagonChart';
import CompositeOctagon from '@/components/composites/CompositeOctagon';
import HabitGrades from '@/components/composites/HabitGrades';
import { buildWealthAxes } from '@/lib/data/composites';
import Button from '@/components/ui/Button';
import styles from './results.module.css';

/* ── DB column keys ── */
const B_KEYS = ['b_active_income', 'b_passive_income', 'b_expenses', 'b_discretionary', 'b_savings', 'b_debt_repayment', 'b_retirement', 'b_investment'] as const;
const IS_KEYS = ['is_net_income', 'is_discretionary_spend', 'is_emergency_fund', 'is_debt_level', 'is_net_worth', 'is_pension_fund', 'is_passive_income', 'is_fi_ratio'] as const;

/* ── Currency symbols ── */
const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '\u00A3',
  USD: '$',
  EUR: '\u20AC',
};

/* ── Indicator display helpers ── */
// In v2 the wealth check-in is behaviour-only; indicator values are user-logged
// on the Trends page. On the results screen we just show the category label
// rather than a derived value.
function getComputedDisplay(index: number): string {
  const suffixes = [
    'monthly',      // Net Income
    'monthly',      // Discretionary Spend
    'months',       // Emergency Fund
    'of income',    // Debt Level
    'of income',    // Net Worth
    'of income',    // Pension Fund
    '% covered',    // FI Ratio
    'monthly',      // Passive Income
  ];
  return suffixes[index] ?? '';
}

/* ── Summary helpers ── */
function getBehaviourSummary(pct: number): string {
  if (pct >= 80) return 'Your wealth behaviours are consistently strong. Your habits are working in your favour.';
  if (pct >= 60) return 'Solid habits with clear gaps. A few targeted changes will move your wealth indicators significantly.';
  if (pct >= 40) return 'A mixed picture. Start with your lowest scoring behaviour and change one thing this week.';
  return 'Your current wealth behaviours are limiting your financial progress. Focus on one behaviour at a time.';
}

function getOctagonSummary(pct: number): string {
  if (pct >= 80) return 'Your wealth octagon is strong. Your indicators reflect consistently good financial habits.';
  if (pct >= 60) return 'A solid foundation with clear room to grow. Focus on the indicators scoring 1-4.';
  if (pct >= 40) return 'Your octagon is taking shape. Start with your weakest indicator first.';
  return 'Your wealth octagon is just beginning. Small consistent improvements compound quickly.';
}

/* ── Types ── */
interface AssessmentRow {
  id: string;
  behaviour_score_pct: number;
  octagon_score_pct: number;
  currency_snapshot: string;
  [key: string]: unknown;
}

export default function WealthResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<AssessmentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Expandable cards state */
  const [openBehaviours, setOpenBehaviours] = useState<Set<number>>(new Set());
  const [openIndicators, setOpenIndicators] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: row, error: fetchError } = await supabase
          .from('wealth_assessments')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError || !row) {
          setError(fetchError?.message || 'Assessment not found.');
          return;
        }
        setData(row as AssessmentRow);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <div className={styles.loadingText}>Loading Results</div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className={styles.error}>
        <div className={styles.errorText}>Could Not Load Results</div>
        <div className={styles.errorSub}>{error || 'Assessment data was not found.'}</div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  /* ── Extract scores ──
     Behaviour + indicator scores are signed -1/0/+1/+2.
     iScores is the ring-projected (2/4/6/8) version used for octagon + bar UI;
     iScoresRaw keeps the signed value for recommendations + analysis. */
  const bScores: number[] = B_KEYS.map((k) => (data[k] as number) ?? 0);
  const iScoresRaw: number[] = IS_KEYS.map((k) => (data[k] as number) ?? 0);
  const iScores: number[] = iScoresRaw.map(signedScoreToRing);
  const behaviourPct: number = data.behaviour_score_pct ?? 0;
  const indicatorPct: number = (data.indicator_score_pct as number) ?? 0;
  const octagonPct: number = data.octagon_score_pct ?? 0;
  const hasIndicators = iScoresRaw.some(s => s !== 0) || indicatorPct > 0;

  /* Composite axes (4 pillars) for the headline octagon. */
  const wealthAxes = buildWealthAxes(bScores, iScoresRaw);

  /* ── Toggle helpers ── */
  function toggleBehaviour(idx: number) {
    setOpenBehaviours((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function toggleIndicator(idx: number) {
    setOpenIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className={styles.container}>

      {/* ===================================================
          YOUR WEALTH OCTAGON (only if indicators submitted)
      =================================================== */}
      {hasIndicators && (<>
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Your Wealth Octagon</div>
        <h2 className={styles.sectionHeading}>
          Your wealth <em>right now.</em>
        </h2>
        <p className={styles.sectionSub}>
          Your 8 wealth indicators computed from your financial data.
        </p>

        {/* Score box */}
        <div className={styles.scoreBox}>
          <div className={styles.scoreValue} style={{ color: levelFromPct(octagonPct).color }}>
            {levelFromPct(octagonPct).label}
          </div>
          <div className={styles.scoreLabel}>
            Behaviours: <span style={{ color: levelFromPct(behaviourPct).color }}>{levelFromPct(behaviourPct).label}</span>
            {' \u00B7 '}
            Indicators: <span style={{ color: levelFromPct(indicatorPct).color }}>{levelFromPct(indicatorPct).label}</span>
          </div>
          <div className={styles.scoreSummary}>{getOctagonSummary(octagonPct)}</div>
        </div>

        {/* Composite octagon: 4 wealth pillars (Cashflow / Assets / Debt / Retirement). */}
        <div className={styles.octagonWrap}>
          <CompositeOctagon axes={wealthAxes} size={320} />
        </div>

        {/* Habit grades + trajectory per pillar. */}
        <HabitGrades axes={wealthAxes} title="Habit grades" />

        {/* Indicator bar rows */}
        <div className={styles.barRows}>
          {WHLABELS.map((label, i) => {
            const score = iScores[i];
            const displayVal = getComputedDisplay(i);
            const statusIdx = Math.max(0, Math.min(7, score - 1));
            const statusLabel = HSTATUS[statusIdx];
            const color = getTierColor(score, 8);
            return (
              <div className={`${styles.barRow} ${styles.barRowIndicator}`} key={i}>
                <div className={styles.barLabel}>{label}</div>
                <div className={styles.barSegments}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((seg) => (
                    <div
                      key={seg}
                      className={
                        seg <= score
                          ? `${styles.barSegment} ${styles.barSegmentFilled}`
                          : `${styles.barSegment} ${styles.barSegmentEmpty}`
                      }
                      style={seg <= score ? { background: color } : undefined}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={styles.barValueWrap}>
                    <span className={styles.barRaw}>{displayVal}</span>
                  </div>
                  <div className={styles.barTier} style={{ color }}>
                    {statusLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicator report cards */}
        <div className={styles.reportSection}>
          <div className={styles.reportSectionTitle}>Indicator Report</div>
          <div className={styles.indicatorCards}>
            {WHLABELS.map((label, i) => {
              const score = iScores[i];
              const displayVal = getComputedDisplay(i);
              const statusIdx = Math.max(0, Math.min(7, score - 1));
              const statusLabel = HSTATUS[statusIdx];
              const color = getTierColor(score, 8);
              const isOpen = openIndicators.has(i);
              const rec = WHRECS[i]?.[iScoresRaw[i]];

              return (
                <div className={styles.indicatorCard} key={i}>
                  <div
                    className={styles.indicatorCardHeader}
                    onClick={() => toggleIndicator(i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleIndicator(i);
                      }
                    }}
                  >
                    <div className={styles.indicatorCardLeft}>
                      <div className={styles.indicatorCardScore} style={{ color }}>
                        {score}
                      </div>
                      <div>
                        <div className={styles.indicatorCardName}>{label}</div>
                        <div className={styles.indicatorCardMeta}>
                          <span className={styles.indicatorCardRaw}>{displayVal}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={styles.indicatorCardStatus} style={{ color }}>
                        {statusLabel}
                      </div>
                      <div
                        className={`${styles.indicatorCardChevron} ${isOpen ? styles.indicatorCardChevronOpen : ''}`}
                      >
                        &#9662;
                      </div>
                    </div>
                  </div>
                  {isOpen && (
                    <div className={styles.indicatorCardBody}>
                      {/* Step bar */}
                      <div className={styles.stepBar}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((seg) => (
                          <div
                            key={seg}
                            className={
                              seg <= score
                                ? `${styles.stepBarSeg} ${styles.stepBarFilled}`
                                : `${styles.stepBarSeg} ${styles.stepBarEmpty}`
                            }
                            style={seg <= score ? { background: color } : undefined}
                          />
                        ))}
                      </div>

                      {(() => {
                        const drivers = WBMAP[i] || [];
                        const strong = drivers.filter(bIdx => bScores[bIdx] >= 1);
                        const weak = drivers.filter(bIdx => bScores[bIdx] <= 0);
                        const insightText = WCONN_INSIGHTS[i]?.(bScores, iScores) || '';
                        const sentences = insightText.split(/(?<=\.)\s+/);
                        const wellSentences = sentences.filter(s => /working in your favour|currently working|at its best|consistent|building|supporting/i.test(s));
                        const attentionSentences = sentences.filter(s => /pushing|limiting|actively|holding|working against|slowing/i.test(s));

                        return (
                          <>
                            {/* Key Factors */}
                            <div className={styles.insightSection}>
                              <div className={styles.insightLabel}>Key Factors</div>
                              <div className={styles.insightDriverList}>
                                {drivers.map((bIdx) => {
                                  const bGrade = BGRADES[getBehaviourTierIndex(bScores[bIdx])];
                                  const bColor = getTierColor(bScores[bIdx], 4);
                                  return (
                                    <span key={bIdx} className={styles.insightDriverPill} style={{ borderColor: bColor }}>
                                      <span style={{ color: bColor, fontWeight: 800 }}>{WBLABELS[bIdx]}</span>
                                      <span className={styles.insightGrade} style={{ color: bColor }}>({bGrade})</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Going Well */}
                            {strong.length > 0 && (
                              <div className={styles.insightSection}>
                                <div className={styles.insightLabelGood}>Going Well</div>
                                <div className={styles.insightText}>
                                  {wellSentences.length > 0 ? wellSentences.join(' ') : `${strong.map(bIdx => WBLABELS[bIdx]).join(' and ')} ${strong.length > 1 ? 'are' : 'is'} working in your favour.`}
                                </div>
                              </div>
                            )}

                            {/* Needs Attention */}
                            {weak.length > 0 && (
                              <div className={styles.insightSection}>
                                <div className={styles.insightLabelWarn}>Needs Attention</div>
                                <div className={styles.insightText}>
                                  {attentionSentences.length > 0 ? attentionSentences.join(' ') : `${weak.map(bIdx => WBLABELS[bIdx]).join(' and ')} ${weak.length > 1 ? 'are' : 'is'} holding back your ${WHLABELS[i].toLowerCase()}.`}
                                </div>
                              </div>
                            )}

                            {/* Action */}
                            {rec && (
                              <div className={styles.insightSection}>
                                <div className={styles.insightLabel}>Action</div>
                                <div className={styles.insightText}>{rec.rec}</div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className={styles.divider} />
      </>)}

      {/* ===================================================
          YOUR WEALTH BEHAVIOURS
      =================================================== */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Your Wealth Behaviours</div>
        <h2 className={styles.sectionHeading}>
          How you handle <em>money.</em>
        </h2>

        <div className={styles.scoreBox}>
          <div className={styles.scoreValue} style={{ color: levelFromPct(behaviourPct).color }}>
            {levelFromPct(behaviourPct).label}
          </div>
          <div className={styles.scoreLabel}>Behaviour Tier</div>
        </div>

        {/* Behaviour octagon */}
        <div className={styles.octagonWrap}>
          <OctagonChart
            scores={bScores.map(signedScoreToRing)}
            labels={[...WBLABELS]}
            maxScore={8}
            size={320}
          />
        </div>

        <div className={styles.barRows}>
          {WBLABELS.map((label, i) => {
            const score = bScores[i];
            const tierIdx = getBehaviourTierIndex(score);
            const color = getTierColor(score);
            const filled = score + 2;
            return (
              <div className={styles.barRow} key={i}>
                <div className={styles.barLabel}>{label}</div>
                <div className={styles.barSegments}>
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className={
                        seg <= filled
                          ? `${styles.barSegment} ${styles.barSegmentFilled}`
                          : `${styles.barSegment} ${styles.barSegmentEmpty}`
                      }
                      style={seg <= filled ? { background: color } : undefined}
                    />
                  ))}
                </div>
                <div className={styles.barTier} style={{ color }}>
                  {BGRADES[tierIdx]}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className={styles.divider} />

      {/* ===================================================
          ACTIONS
      =================================================== */}
      <div className={styles.actions}>
        <Button variant="primary" fullWidth onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
        <Button variant="outline" fullWidth onClick={() => router.push('/assess/wealth')}>
          New Check-in
        </Button>
        <Button variant="ghost" fullWidth onClick={() => router.push('/compare/wealth')}>
          Compare past check-ins
        </Button>
      </div>

      <div className={styles.deleteSection}>
        {!showDeleteConfirm ? (
          <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>
            Delete this assessment
          </button>
        ) : (
          <div className={styles.deleteConfirm}>
            <p className={styles.deleteText}>
              This will permanently delete this assessment and its associated plan. This cannot be undone.
            </p>
            <div className={styles.deleteActions}>
              <Button
                variant="primary"
                onClick={async () => {
                  const supabase = createClient();
                  const { data: plans } = await supabase
                    .from('action_plans')
                    .select('id')
                    .eq('assessment_id', id);
                  if (plans) {
                    for (const p of plans) {
                      await supabase.from('daily_progress').delete().eq('plan_id', p.id);
                    }
                    await supabase.from('action_plans').delete().eq('assessment_id', id);
                  }
                  await supabase.from('wealth_assessments').delete().eq('id', id);
                  router.push('/dashboard');
                  router.refresh();
                }}
              >
                Yes, Delete
              </Button>
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
