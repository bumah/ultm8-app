'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AxisResult } from '@/lib/data/composites';
import {
  HSTATUS, BGRADES, getBehaviourTierIndex, getTierColor, levelFromPct,
  signedScoreToRing,
} from '@/lib/scoring/shared';
import {
  challengesForAxis, challengeEndDate, type PersonalChallenge,
} from '@/lib/data/personal-challenges';
import styles from './PillarAccordion.module.css';

export interface PillarRow {
  axis: AxisResult;
  /** Human labels for each indicator on this axis. */
  indicatorLabels: string[];
  /** Raw signed scores for each indicator on this axis. */
  indicatorScores: number[];
  /** Human labels for each behaviour on this axis. */
  behaviourLabels: string[];
  /** Raw signed scores for each behaviour on this axis. */
  behaviourScores: number[];
  /** Behaviour slugs (matches `targets` in personal-challenges). */
  behaviourSlugs: string[];
  /** Used so the calendar deep link can colour-code by domain. */
  domain: 'health' | 'wealth';
}

interface Props {
  rows: PillarRow[];
  title?: string;
}

/**
 * 8-row accordion. Each row is a composite axis (Mind/Strength/Fitness/Heart
 * for health, Cashflow/Assets/Debt/Retirement for wealth). The header shows
 * indicator level + habit grade + trajectory; expanding reveals the indicator
 * detail, behaviour grades, and recommended challenges.
 */
export default function PillarAccordion({ rows, title }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className={styles.block}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.list}>
        {rows.map(row => {
          const isOpen = open.has(row.axis.key);
          const axisLevel = row.axis.indicatorPct != null
            ? levelFromPct(row.axis.indicatorPct)
            : null;

          // Map slug -> score for ranking.
          const scoresBySlug: Record<string, number> = {};
          row.behaviourSlugs.forEach((s, i) => {
            scoresBySlug[s] = row.behaviourScores[i] ?? 0;
          });
          const recs: PersonalChallenge[] = challengesForAxis(
            row.behaviourSlugs,
            scoresBySlug,
            3,
          );

          return (
            <div key={row.axis.key} className={styles.row}>
              <button
                type="button"
                className={styles.header}
                aria-expanded={isOpen}
                onClick={() => toggle(row.axis.key)}
              >
                <span className={styles.axisName}>{row.axis.label}</span>
                <span className={styles.headerMeta}>
                  {axisLevel && (
                    <span className={styles.headerLevel} style={{ color: axisLevel.color }}>
                      {axisLevel.label}
                    </span>
                  )}
                  <span className={styles.headerGrade} style={{ color: row.axis.color }}>
                    {row.axis.grade}
                  </span>
                  <span className={styles.headerTraj} style={{ color: row.axis.color }}>
                    {row.axis.trajectory}
                  </span>
                  <span className={`${styles.chev} ${isOpen ? styles.chevOpen : ''}`}>
                    {'\u25BE'}
                  </span>
                </span>
              </button>

              {isOpen && (
                <div className={styles.body}>
                  {/* Indicator block */}
                  {row.indicatorLabels.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionLabel}>Indicators</div>
                      <div className={styles.miniGrid}>
                        {row.indicatorLabels.map((label, i) => {
                          const score = row.indicatorScores[i] ?? 0;
                          const ring = signedScoreToRing(score);
                          const status = HSTATUS[Math.max(0, Math.min(7, ring - 1))];
                          const color = getTierColor(score);
                          return (
                            <div key={label} className={styles.miniRow}>
                              <span className={styles.miniName}>{label}</span>
                              <span className={styles.miniValue} style={{ color }}>
                                {status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Behaviour block */}
                  {row.behaviourLabels.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionLabel}>Behaviours</div>
                      <div className={styles.miniGrid}>
                        {row.behaviourLabels.map((label, i) => {
                          const score = row.behaviourScores[i] ?? 0;
                          const grade = BGRADES[getBehaviourTierIndex(score)];
                          const color = getTierColor(score);
                          return (
                            <div key={label} className={styles.miniRow}>
                              <span className={styles.miniName}>{label}</span>
                              <span className={styles.miniValue} style={{ color }}>
                                {grade}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recommended challenges */}
                  {recs.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionLabel}>Recommended challenges</div>
                      <div className={styles.recList}>
                        {recs.map(c => (
                          <Link
                            key={c.slug}
                            href={`/calendar?title=${encodeURIComponent(c.name)}&category=${c.category}&recurFreq=${c.cadence}&recurInterval=1&recurEndDate=${challengeEndDate(c)}`}
                            className={styles.recRow}
                          >
                            <div className={styles.recBody}>
                              <div className={styles.recName}>{c.short}</div>
                              <div className={styles.recMeta}>
                                {c.cadence === 'daily' ? 'Daily' : c.cadence === 'weekly' ? 'Weekly' : 'Monthly'}
                                {' \u00B7 '}
                                {c.durationCount} {c.durationUnit}
                              </div>
                            </div>
                            <span className={styles.recAdd}>+ Take</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
