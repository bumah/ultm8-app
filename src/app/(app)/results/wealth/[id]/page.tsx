'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { WBLABELS, WHLABELS, WBMAP } from '@/lib/scoring/wealth-scoring';
import { BTIERS, BGRADES, HSTATUS, getBehaviourTierIndex, getTierColor } from '@/lib/scoring/shared';
import { WBRECS, WHRECS } from '@/lib/data/wealth-recommendations';
import { WCONN_INSIGHTS } from '@/lib/data/wealth-connections';
import OctagonChart from '@/components/octagon/OctagonChart';
import Button from '@/components/ui/Button';
import styles from './results.module.css';

/* ── DB column keys ── */
const B_KEYS = ['b_active_income', 'b_passive_income', 'b_expenses', 'b_discretionary', 'b_savings', 'b_debt_repayment', 'b_retirement', 'b_investment'] as const;
const IS_KEYS = ['is_net_worth', 'is_debt_level', 'is_savings_capacity', 'is_emergency_fund', 'is_retirement_pot', 'is_fi_ratio', 'is_lifestyle_creep', 'is_credit_score'] as const;

/* ── Currency symbols ── */
const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '\u00A3',
  USD: '$',
  EUR: '\u20AC',
};

/* ── Computed value display helpers ── */
function formatCurrency(value: number, symbol: string): string {
  if (value < 0) return '-' + symbol + Math.round(Math.abs(value)).toLocaleString();
  return symbol + Math.round(value).toLocaleString();
}

function getComputedDisplay(index: number, data: AssessmentRow, currencySymbol: string): string {
  switch (index) {
    case 0: // Net Worth
      return formatCurrency((data.computed_net_worth as number) || 0, currencySymbol);
    case 1: // Debt Level
      return formatCurrency((data.fd_debt as number) || 0, currencySymbol);
    case 2: // Savings Capacity
      return Math.round((data.computed_savings_rate as number) || 0) + '%';
    case 3: // Emergency Fund
      return Math.round((data.computed_emergency_months as number) || 0) + ' months';
    case 4: // Retirement Pot
      return formatCurrency((data.fd_pension as number) || 0, currencySymbol);
    case 5: // FI Ratio
      return ((data.computed_fi_ratio as number) || 0).toFixed(2);
    case 6: // Lifestyle Creep
      return Math.round((data.computed_disc_pct as number) || 0) + '%';
    case 7: // Credit Score
      return 'Self-assessed';
    default:
      return '';
  }
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
  computed_net_worth: number;
  computed_savings_rate: number;
  computed_emergency_months: number;
  computed_fi_ratio: number;
  computed_disc_pct: number;
  fd_debt: number;
  fd_pension: number;
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

  /* ── Extract scores ── */
  const bScores: number[] = B_KEYS.map((k) => (data[k] as number) || 0);
  const iScores: number[] = IS_KEYS.map((k) => (data[k] as number) || 0);
  const behaviourPct: number = data.behaviour_score_pct ?? 0;
  const octagonPct: number = data.octagon_score_pct ?? 0;
  const currencySymbol = CURRENCY_SYMBOLS[data.currency_snapshot] || '';

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
          PART 1 — YOUR WEALTH BEHAVIOURS
      =================================================== */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Part 1 &mdash; Your Wealth Behaviours</div>
        <h2 className={styles.sectionHeading}>
          How you handle <em>money.</em>
        </h2>
        <p className={styles.sectionSub}>
          Your daily financial habits scored against the 8 ULTM8 wealth behaviours.
        </p>

        {/* Score box */}
        <div className={styles.scoreBox}>
          <div className={styles.scoreValue}>{behaviourPct}%</div>
          <div className={styles.scoreLabel}>Wealth Behaviour Score</div>
          <div className={styles.scoreSummary}>{getBehaviourSummary(behaviourPct)}</div>
        </div>

        {/* Behaviour bar rows */}
        <div className={styles.barRows}>
          {WBLABELS.map((label, i) => {
            const score = bScores[i];
            const tierIdx = getBehaviourTierIndex(score);
            const tierLabel = BTIERS[tierIdx];
            const color = getTierColor(score, 4);
            return (
              <div className={styles.barRow} key={i}>
                <div className={styles.barLabel}>{label}</div>
                <div className={styles.barSegments}>
                  {[1, 2, 3, 4].map((seg) => (
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
                <div className={styles.barTier} style={{ color }}>
                  {BGRADES[tierIdx]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Behaviour report cards */}
        <div className={styles.reportSection}>
          <div className={styles.reportSectionTitle}>Behaviour Report</div>
          <div className={styles.reportCards}>
            {WBLABELS.map((label, i) => {
              const score = bScores[i];
              const tierIdx = getBehaviourTierIndex(score);
              const tierLabel = BTIERS[tierIdx];
              const color = getTierColor(score, 4);
              const isOpen = openBehaviours.has(i);
              const rec = WBRECS[i]?.[score];

              return (
                <div className={styles.reportCard} key={i}>
                  <div
                    className={styles.reportCardHeader}
                    onClick={() => toggleBehaviour(i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleBehaviour(i);
                      }
                    }}
                  >
                    <div className={styles.reportCardLeft}>
                      <div className={styles.reportCardScore} style={{ color }}>
                        {BGRADES[tierIdx]}
                      </div>
                      <div className={styles.reportCardName}>{label}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={styles.reportCardTier} style={{ color }}>
                        {BGRADES[tierIdx]} &mdash; {tierLabel}
                      </div>
                      <div
                        className={`${styles.reportCardChevron} ${isOpen ? styles.reportCardChevronOpen : ''}`}
                      >
                        &#9662;
                      </div>
                    </div>
                  </div>
                  {isOpen && rec && (
                    <div className={styles.reportCardBody}>
                      <div className={styles.reportRecLabel}>Recommendation</div>
                      <div className={styles.reportRecText}>{rec.rec}</div>
                      <div className={styles.reportNextLabel}>Next Step</div>
                      <div className={styles.reportNextText}>{rec.next}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className={styles.divider} />

      {/* ===================================================
          PART 2 — YOUR WEALTH OCTAGON
      =================================================== */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Part 2 &mdash; Your Wealth Octagon</div>
        <h2 className={styles.sectionHeading}>
          Your wealth <em>right now.</em>
        </h2>
        <p className={styles.sectionSub}>
          Your 8 wealth indicators computed from your financial data.
        </p>

        {/* Score box */}
        <div className={styles.scoreBox}>
          <div className={styles.scoreValue}>{octagonPct}%</div>
          <div className={styles.scoreLabel}>Wealth Octagon Score</div>
          <div className={styles.scoreSummary}>{getOctagonSummary(octagonPct)}</div>
        </div>

        {/* Octagon chart */}
        <div className={styles.octagonWrap}>
          <OctagonChart
            scores={iScores}
            labels={[...WHLABELS]}
            maxScore={8}
            size={320}
          />
        </div>

        {/* Indicator bar rows */}
        <div className={styles.barRows}>
          {WHLABELS.map((label, i) => {
            const score = iScores[i];
            const displayVal = getComputedDisplay(i, data, currencySymbol);
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
              const displayVal = getComputedDisplay(i, data, currencySymbol);
              const statusIdx = Math.max(0, Math.min(7, score - 1));
              const statusLabel = HSTATUS[statusIdx];
              const color = getTierColor(score, 8);
              const isOpen = openIndicators.has(i);
              const recIdx = 8 - score; // index 0 = best score of 8
              const rec = WHRECS[i]?.[recIdx];

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
                        const strong = drivers.filter(bIdx => bScores[bIdx] >= 3);
                        const weak = drivers.filter(bIdx => bScores[bIdx] <= 2);
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

      {/* ===================================================
          PART 3 — THE CONNECTION
      =================================================== */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>The Connection</div>
        <h2 className={styles.sectionHeading}>
          Behaviours meet <em>outcomes.</em>
        </h2>
        <p className={styles.sectionSub}>
          For each indicator, which behaviours are helping and which are holding it back.
        </p>

        <div className={styles.connectionCards}>
          {WHLABELS.map((label, i) => {
            const indicatorScore = iScores[i];
            const indicatorColor = getTierColor(indicatorScore, 8);
            const driverIndices = WBMAP[i] || [];
            const insightText = WCONN_INSIGHTS[i]?.(bScores, iScores) || '';

            return (
              <div className={styles.connectionCard} key={i}>
                <div className={styles.connectionCardHeader}>
                  <div className={styles.connectionCardName}>{label}</div>
                  <div
                    className={styles.connectionCardScore}
                    style={{ color: indicatorColor }}
                  >
                    {indicatorScore}/8
                  </div>
                </div>

                <div className={styles.connectionDrivers}>
                  {driverIndices.map((bIdx) => {
                    const bScore = bScores[bIdx];
                    const bColor = getTierColor(bScore, 4);
                    const bGrade = BGRADES[getBehaviourTierIndex(bScore)];
                    return (
                      <div className={styles.connectionDriver} key={bIdx}>
                        <span
                          className={styles.connectionDriverScore}
                          style={{ color: bColor }}
                        >
                          {bGrade}
                        </span>
                        <span className={styles.connectionDriverName}>
                          {WBLABELS[bIdx]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.connectionInsight}>{insightText}</div>
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
          Retake Assessment
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
