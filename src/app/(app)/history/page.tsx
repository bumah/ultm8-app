'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { HLABELS } from '@/lib/scoring/health-scoring';
import { WHLABELS } from '@/lib/scoring/wealth-scoring';
import OctagonOverlay from '@/components/octagon/OctagonOverlay';
import type { OctagonLayer } from '@/components/octagon/OctagonOverlay';
import styles from './history.module.css';

/* ── DB column keys for indicator scores ── */
const HEALTH_IS_KEYS = [
  'is_blood_pressure', 'is_blood_sugar', 'is_cholesterol', 'is_resting_hr',
  'is_body_fat', 'is_muscle_mass', 'is_pushups', 'is_5km_time',
] as const;

const WEALTH_IS_KEYS = [
  'is_net_worth', 'is_debt_level', 'is_savings_capacity', 'is_emergency_fund',
  'is_retirement_pot', 'is_fi_ratio', 'is_lifestyle_creep', 'is_credit_score',
] as const;

/* ── Layer colours (newest first in the palette) ── */
const LAYER_COLORS = ['#C8241A', '#F5A623', '#00D4AA'];

/* ── Types ── */
interface AssessmentRow {
  id: string;
  completed_at: string;
  octagon_score_pct: number;
  behaviour_score_pct: number;
  [key: string]: unknown;
}

/* ── Helpers ── */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
}

function getScoreColor(pct: number): string {
  if (pct >= 80) return '#C8F135';
  if (pct >= 60) return '#00D4AA';
  if (pct >= 40) return '#F5A623';
  return '#e74c3c';
}

function extractIndicatorScores(row: AssessmentRow, keys: readonly string[]): number[] {
  return keys.map((k) => (row[k] as number) || 0);
}

/* ── Component ── */

export default function HistoryPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [healthAssessments, setHealthAssessments] = useState<AssessmentRow[]>([]);
  const [wealthAssessments, setWealthAssessments] = useState<AssessmentRow[]>([]);
  const [activeTab, setActiveTab] = useState<'health' | 'wealth'>('health');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* ── Fetch all assessments ── */
  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const [healthRes, wealthRes] = await Promise.all([
      supabase
        .from('health_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false }),
      supabase
        .from('wealth_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false }),
    ]);

    const health = (healthRes.data || []) as AssessmentRow[];
    const wealth = (wealthRes.data || []) as AssessmentRow[];

    setHealthAssessments(health);
    setWealthAssessments(wealth);

    /* Default tab: whichever has assessments, or health */
    if (health.length === 0 && wealth.length > 0) {
      setActiveTab('wealth');
    } else {
      setActiveTab('health');
    }

    /* Pre-select most recent 2 for whichever tab has data */
    const primary = health.length > 0 ? health : wealth;
    if (primary.length >= 2) {
      setSelectedIds(new Set([primary[0].id, primary[1].id]));
    } else if (primary.length === 1) {
      setSelectedIds(new Set([primary[0].id]));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Derived data ── */
  const assessments = activeTab === 'health' ? healthAssessments : wealthAssessments;
  const labels = activeTab === 'health' ? [...HLABELS] : [...WHLABELS];
  const isKeys = activeTab === 'health' ? HEALTH_IS_KEYS : WEALTH_IS_KEYS;
  const resultPath = activeTab === 'health' ? '/results/health' : '/results/wealth';
  const assessPath = activeTab === 'health' ? '/assess/health' : '/assess/wealth';

  /* ── Selection logic ── */
  const toggleSelection = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (next.size >= 3) {
            /* Remove the oldest-selected (first inserted) */
            const first = next.values().next().value;
            if (first !== undefined) {
              next.delete(first);
            }
          }
          next.add(id);
        }
        return next;
      });
    },
    []
  );

  /* Re-select top 2 when switching tabs */
  const handleTabSwitch = useCallback(
    (tab: 'health' | 'wealth') => {
      setActiveTab(tab);
      const list = tab === 'health' ? healthAssessments : wealthAssessments;
      if (list.length >= 2) {
        setSelectedIds(new Set([list[0].id, list[1].id]));
      } else if (list.length === 1) {
        setSelectedIds(new Set([list[0].id]));
      } else {
        setSelectedIds(new Set());
      }
    },
    [healthAssessments, wealthAssessments]
  );

  /* ── Build overlay layers (oldest first so newest draws on top) ── */
  const overlayLayers: OctagonLayer[] = useMemo(() => {
    const selected = assessments.filter((a) => selectedIds.has(a.id));
    /* Sort oldest first */
    selected.sort(
      (a, b) =>
        new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    );
    return selected.map((row, idx) => ({
      scores: extractIndicatorScores(row, isKeys),
      color: LAYER_COLORS[selected.length - 1 - idx] || LAYER_COLORS[0],
      label: formatDate(row.completed_at),
    }));
  }, [assessments, selectedIds, isKeys]);

  /* ── Render ── */

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <div className={styles.loadingText}>Loading History</div>
        </div>
      </div>
    );
  }

  const hasHealth = healthAssessments.length > 0;
  const hasWealth = wealthAssessments.length > 0;
  const hasBoth = hasHealth && hasWealth;
  const hasAny = hasHealth || hasWealth;

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>Progress</div>
        <h1 className={styles.heading}>
          OCTAGON
          <br />
          <em>History.</em>
        </h1>
      </div>

      {/* ── Type tabs ── */}
      {hasAny && (
        <div className={styles.typeTabs}>
          <button
            className={`${styles.typeTab} ${activeTab === 'health' ? styles.typeTabActive : ''}`}
            onClick={() => handleTabSwitch('health')}
          >
            Health
          </button>
          <button
            className={`${styles.typeTab} ${activeTab === 'wealth' ? styles.typeTabActive : ''}`}
            onClick={() => handleTabSwitch('wealth')}
          >
            Wealth
          </button>
        </div>
      )}

      {/* ── No assessments state ── */}
      {assessments.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            No {activeTab} assessments yet. Take your first assessment to start
            tracking progress.
          </p>
          <Link href={assessPath} className={styles.emptyLink}>
            Take {activeTab} assessment &rarr;
          </Link>
        </div>
      )}

      {/* ── Octagon Overlay (2+ assessments) ── */}
      {assessments.length >= 2 && (
        <div className={styles.octagonSection}>
          <div className={styles.sectionTitle}>Octagon Comparison</div>
          <div className={styles.sectionSub}>
            Select assessments to overlay and compare.
          </div>

          <div className={styles.octagonWrap}>
            <OctagonOverlay
              layers={overlayLayers}
              labels={labels}
              maxScore={8}
              size={320}
            />
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            {overlayLayers.map((layer, idx) => (
              <div className={styles.legendItem} key={`${layer.label}-${idx}`}>
                <span
                  className={styles.legendDot}
                  style={{ background: layer.color }}
                />
                <span className={styles.legendLabel}>{layer.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Score Trend ── */}
      {assessments.length > 0 && (
        <div className={styles.trendSection}>
          <div className={styles.sectionTitle}>Score Over Time</div>
          <div className={styles.sectionSub}>
            Octagon score progression across assessments.
          </div>
          <div className={styles.trendRows}>
            {assessments.map((row) => {
              const pct = row.octagon_score_pct ?? 0;
              const color = getScoreColor(pct);
              return (
                <div className={styles.trendRow} key={row.id}>
                  <div className={styles.trendDate}>
                    {formatShortDate(row.completed_at)}
                  </div>
                  <div className={styles.trendBarWrap}>
                    <div
                      className={styles.trendBarFill}
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <div className={styles.trendScore} style={{ color }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Assessment History List ── */}
      {assessments.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.divider} />
          <div className={styles.sectionTitle}>Assessment History</div>
          <div className={styles.sectionSub}>
            {assessments.length >= 2
              ? 'Check assessments to include in the overlay comparison (max 3).'
              : 'Your recorded assessments.'}
          </div>

          <div className={styles.historyList}>
            {assessments.map((row) => {
              const octPct = row.octagon_score_pct ?? 0;
              const behPct = row.behaviour_score_pct ?? 0;
              const color = getScoreColor(octPct);
              const isSelected = selectedIds.has(row.id);

              return (
                <div
                  className={`${styles.historyCard} ${isSelected ? styles.historyCardSelected : ''}`}
                  key={row.id}
                >
                  {/* Score column */}
                  <div className={styles.historyScoreCol}>
                    <div className={styles.historyOctScore} style={{ color }}>
                      {octPct}%
                    </div>
                    <div className={styles.historyBehScore}>
                      BEH {behPct}%
                    </div>
                  </div>

                  {/* Details column */}
                  <div className={styles.historyDetails}>
                    <div className={styles.historyDate}>
                      {formatDate(row.completed_at)}
                    </div>
                    <div className={styles.historyMeta}>
                      Octagon {octPct}% &middot; Behaviour {behPct}%
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className={styles.historyActions}>
                    {/* Overlay toggle (only if 2+ assessments) */}
                    {assessments.length >= 2 && (
                      <div className={styles.overlayToggle}>
                        <input
                          type="checkbox"
                          className={styles.overlayToggleInput}
                          checked={isSelected}
                          onChange={() => toggleSelection(row.id)}
                          aria-label={`${isSelected ? 'Remove from' : 'Add to'} overlay comparison`}
                        />
                        <div
                          className={`${styles.overlayToggleBox} ${isSelected ? styles.overlayToggleChecked : ''}`}
                        >
                          <span
                            className={`${styles.overlayToggleMark} ${isSelected ? styles.overlayToggleMarkVisible : ''}`}
                          >
                            &#10003;
                          </span>
                        </div>
                      </div>
                    )}
                    <Link
                      href={`${resultPath}/${row.id}`}
                      className={styles.viewLink}
                    >
                      View Results &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
