'use client';

import type { AxisResult } from '@/lib/data/composites';
import styles from './HabitGrades.module.css';

interface Props {
  axes: AxisResult[];
  /** Optional title for the section header. */
  title?: string;
}

/**
 * Compact grid: one row per axis with the habit grade and trajectory arrow.
 * Renders nothing if every axis has zero behaviours.
 */
export default function HabitGrades({ axes, title }: Props) {
  const visible = axes.filter(a => a.habitPct != null);
  if (visible.length === 0) return null;

  return (
    <div className={styles.block}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.grid}>
        {visible.map(a => (
          <div key={a.key} className={styles.row}>
            <span className={styles.axis}>{a.label}</span>
            <span className={styles.grade} style={{ color: a.color }}>{a.grade}</span>
            <span
              className={styles.traj}
              style={{ color: a.color }}
              aria-label={`Trajectory ${a.trajectory}`}
            >
              {a.trajectory}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
