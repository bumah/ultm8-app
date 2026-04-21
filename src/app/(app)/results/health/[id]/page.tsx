'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BLABELS, HLABELS, HUNITS, BMAP } from '@/lib/scoring/health-scoring';
import { BTIERS, BGRADES, HSTATUS, getBehaviourTierIndex, getTierColor } from '@/lib/scoring/shared';
import { HRECS } from '@/lib/data/health-recommendations';
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
  const bpDiastolic = (data['i_blood_pressure_diastolic'] as number) || null;
  const behaviourPct: number = data.behaviour_score_pct ?? 0;
  const octagonPct: number = data.octagon_score_pct ?? 0;

  /* Check-in mode: no indicator data collected (new model) */
  const hasIndicators = iScores.some(s => s > 0);

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
          YOUR HEALTH OCTAGON (only shown if indicators were submitted)
      ═══════════════════════════════════════════ */}
      {hasIndicators && (<>
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Your Health Octagon</div>
        <h2 className={styles.sectionHeading}>
          Your health <em>right now.</em>
        </h2>
        <p className={styles.sectionSub}>
          Your 8 health indicators measured and scored.
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
                    <span className={styles.barRaw}>
                      {i === 0 && bpDiastolic ? `${raw}/${bpDiastolic}` : raw}
                    </span>
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

                      {(() => {
                        const drivers = BMAP[i] || [];
                        const strong = drivers.filter(bIdx => bScores[bIdx] >= 3);
                        const weak = drivers.filter(bIdx => bScores[bIdx] <= 2);
                        const insightText = CONN_INSIGHTS[i]?.(bScores, iScores) || '';
                        // Split insight into going well / needs attention parts
                        const sentences = insightText.split(/(?<=\.)\s+/);
                        const wellSentences = sentences.filter(s => /working in your favour|currently working|at its best|consistent/i.test(s));
                        const attentionSentences = sentences.filter(s => /pushing|limiting|actively|elevated|holding|working against/i.test(s));
                        const actionSentences = sentences.filter(s => /improving|improve|fastest route/i.test(s));

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
                                      <span style={{ color: bColor, fontWeight: 800 }}>{BLABELS[bIdx]}</span>
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
                                  {wellSentences.length > 0 ? wellSentences.join(' ') : `${strong.map(bIdx => BLABELS[bIdx]).join(' and ')} ${strong.length > 1 ? 'are' : 'is'} working in your favour.`}
                                </div>
                              </div>
                            )}

                            {/* Needs Attention */}
                            {weak.length > 0 && (
                              <div className={styles.insightSection}>
                                <div className={styles.insightLabelWarn}>Needs Attention</div>
                                <div className={styles.insightText}>
                                  {attentionSentences.length > 0 ? attentionSentences.join(' ') : `${weak.map(bIdx => BLABELS[bIdx]).join(' and ')} ${weak.length > 1 ? 'are' : 'is'} holding back your ${HLABELS[i].toLowerCase()}.`}
                                </div>
                              </div>
                            )}

                            {/* Action — no specific health advice, just point to behaviours */}
                            {weak.length > 0 && (
                              <div className={styles.insightSection}>
                                <div className={styles.insightLabel}>Action</div>
                                <div className={styles.insightText}>
                                  Focus on improving your {weak.map(bIdx => BLABELS[bIdx]).join(' and ')} {weak.length > 1 ? 'habits' : 'habit'}.
                                </div>
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

      {/* ═══════════════════════════════════════════
          YOUR HEALTH BEHAVIOURS
      ═══════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Your Health Behaviours</div>
        <h2 className={styles.sectionHeading}>
          What you do <em>every day.</em>
        </h2>

        <div className={styles.scoreBox}>
          <div className={styles.scoreValue}>{behaviourPct}%</div>
          <div className={styles.scoreLabel}>Behaviour Score</div>
        </div>

        <div className={styles.barRows}>
          {BLABELS.map((label, i) => {
            const score = bScores[i];
            const tierIdx = getBehaviourTierIndex(score);
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
