'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BLABELS, HLABELS, HUNITS, BMAP } from '@/lib/scoring/health-scoring';
import { BTIERS, BGRADES, HSTATUS, getBehaviourTierIndex, getTierColor } from '@/lib/scoring/shared';
import { BRECS, HRECS } from '@/lib/data/health-recommendations';
import { CONN_INSIGHTS } from '@/lib/data/health-connections';
import OctagonChart from '@/components/octagon/OctagonChart';
import Button from '@/components/ui/Button';
import styles from './results.module.css';

/* ── DB column keys ── */
const B_KEYS = ['b_sleep', 'b_smoking', 'b_strength', 'b_sweat', 'b_sugar', 'b_salt', 'b_spirits', 'b_stress'] as const;
const IS_KEYS = ['is_blood_pressure', 'is_blood_sugar', 'is_cholesterol', 'is_resting_hr', 'is_body_fat', 'is_muscle_mass', 'is_pushups', 'is_5km_time'] as const;
const I_KEYS = ['i_blood_pressure', 'i_blood_sugar', 'i_cholesterol', 'i_resting_hr', 'i_body_fat', 'i_muscle_mass', 'i_pushups', 'i_5km_time'] as const;

/* ── Summary helpers ── */
function getBehaviourSummary(pct: number): string {
  if (pct >= 80) return 'Consistently strong habits across the board. Your behaviours are working in your favour.';
  if (pct >= 60) return 'Solid habits with clear gaps. Focus on the behaviours scoring 1-2 for the biggest improvements.';
  if (pct >= 40) return 'Mixed picture \u2014 some habits are working for you, others against you.';
  return 'Your habits are significantly impacting your health. Start with the lowest-scoring behaviour.';
}

function getOctagonSummary(pct: number): string {
  if (pct >= 80) return 'Strong octagon. Your indicators reflect consistently good health habits.';
  if (pct >= 60) return 'Solid foundation with room to grow. Focus on the indicators scoring 1-4.';
  if (pct >= 40) return 'Taking shape \u2014 meaningful improvements are available. Focus on your lowest indicators.';
  return 'Just beginning. Every improvement you make from here will show in your octagon.';
}

/* ── Types ── */
interface AssessmentRow {
  id: string;
  behaviour_score_pct: number;
  octagon_score_pct: number;
  [key: string]: unknown;
}

export default function HealthResultsPage() {
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
          .from('health_assessments')
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
  const iRaw: number[] = I_KEYS.map((k) => (data[k] as number) || 0);
  const behaviourPct: number = data.behaviour_score_pct ?? 0;
  const octagonPct: number = data.octagon_score_pct ?? 0;

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

      {/* ═══════════════════════════════════════════
          PART 1 — YOUR HEALTH BEHAVIOURS
      ═══════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Part 1 &mdash; Your Health Behaviours</div>
        <h2 className={styles.sectionHeading}>
          What you do <em>every day.</em>
        </h2>
        <p className={styles.sectionSub}>
          Your daily habits scored against the 8 ULTM8 behaviours.
        </p>

        {/* Score box */}
        <div className={styles.scoreBox}>
          <div className={styles.scoreValue}>{behaviourPct}%</div>
          <div className={styles.scoreLabel}>Behaviour Score</div>
          <div className={styles.scoreSummary}>{getBehaviourSummary(behaviourPct)}</div>
        </div>

        {/* Behaviour bar rows */}
        <div className={styles.barRows}>
          {BLABELS.map((label, i) => {
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
            {BLABELS.map((label, i) => {
              const score = bScores[i];
              const tierIdx = getBehaviourTierIndex(score);
              const tierLabel = BTIERS[tierIdx];
              const color = getTierColor(score, 4);
              const isOpen = openBehaviours.has(i);
              const rec = BRECS[i]?.[score];

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

      {/* ═══════════════════════════════════════════
          PART 2 — YOUR HEALTH OCTAGON
      ═══════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Part 2 &mdash; Your Health Octagon</div>
        <h2 className={styles.sectionHeading}>
          Your health <em>right now.</em>
        </h2>
        <p className={styles.sectionSub}>
          Your 8 health indicators measured and scored against clinical thresholds.
        </p>

        {/* Score box */}
        <div className={styles.scoreBox}>
          <div className={styles.scoreValue}>{octagonPct}%</div>
          <div className={styles.scoreLabel}>Health Octagon Score</div>
          <div className={styles.scoreSummary}>{getOctagonSummary(octagonPct)}</div>
        </div>

        {/* Octagon chart */}
        <div className={styles.octagonWrap}>
          <OctagonChart
            scores={iScores}
            labels={[...HLABELS]}
            maxScore={8}
            size={320}
          />
        </div>

        {/* Indicator bar rows */}
        <div className={styles.barRows}>
          {HLABELS.map((label, i) => {
            const score = iScores[i];
            const raw = iRaw[i];
            const unit = HUNITS[i];
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
                    <span className={styles.barRaw}>{raw}</span>
                    <span className={styles.barUnit}>{unit}</span>
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
            {HLABELS.map((label, i) => {
              const score = iScores[i];
              const raw = iRaw[i];
              const unit = HUNITS[i];
              const statusIdx = Math.max(0, Math.min(7, score - 1));
              const statusLabel = HSTATUS[statusIdx];
              const color = getTierColor(score, 8);
              const isOpen = openIndicators.has(i);
              const recIdx = 8 - score; // index 0 = best score of 8
              const rec = HRECS[i]?.[recIdx];

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
                          <span className={styles.indicatorCardRaw}>{raw}</span>
                          <span className={styles.indicatorCardUnit}>{unit}</span>
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

                      {/* Factors */}
                      <div className={styles.insightSection}>
                        <div className={styles.insightLabel}>Factors</div>
                        <div className={styles.insightText}>
                          Driven by {(BMAP[i] || []).map((bIdx) => {
                            const bGrade = BGRADES[getBehaviourTierIndex(bScores[bIdx])];
                            const bColor = getTierColor(bScores[bIdx], 4);
                            return (
                              <span key={bIdx} className={styles.insightDriver}>
                                <span style={{ color: bColor, fontWeight: 800 }}>{BLABELS[bIdx]}</span>
                                <span className={styles.insightGrade} style={{ color: bColor }}>({bGrade})</span>
                              </span>
                            );
                          }).reduce((prev, curr, idx) => idx === 0 ? [curr] : [...prev, <span key={`sep-${idx}`}>, </span>, curr], [] as React.ReactNode[])}
                        </div>
                      </div>

                      {/* Observations */}
                      <div className={styles.insightSection}>
                        <div className={styles.insightLabel}>Observations</div>
                        <div className={styles.insightText}>
                          {CONN_INSIGHTS[i]?.(bScores, iScores) || ''}
                        </div>
                      </div>

                      {/* Action */}
                      {rec && (
                        <div className={styles.insightSection}>
                          <div className={styles.insightLabel}>Action</div>
                          <div className={styles.insightText}>{rec.rec}</div>
                          <div className={styles.insightTarget}>{rec.next}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className={styles.divider} />

      {/* ═══════════════════════════════════════════
          PART 3 — THE CONNECTION
      ═══════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>The Connection</div>
        <h2 className={styles.sectionHeading}>
          How your behaviours <em>drive</em> your indicators.
        </h2>
        <p className={styles.sectionSub}>
          Every indicator is driven by one or more daily behaviours. Here is how yours connect.
        </p>

        <div className={styles.connectionCards}>
          {HLABELS.map((label, i) => {
            const indicatorScore = iScores[i];
            const indicatorColor = getTierColor(indicatorScore, 8);
            const driverIndices = BMAP[i] || [];
            const insightText = CONN_INSIGHTS[i]?.(bScores, iScores) || '';

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
                          {BLABELS[bIdx]}
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

      {/* ═══════════════════════════════════════════
          ACTIONS
      ═══════════════════════════════════════════ */}
      <div className={styles.actions}>
        <Button variant="primary" fullWidth onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
        <Button variant="outline" fullWidth onClick={() => router.push('/assess/health')}>
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
                  // Delete associated plan and progress
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
                  await supabase.from('health_assessments').delete().eq('id', id);
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
