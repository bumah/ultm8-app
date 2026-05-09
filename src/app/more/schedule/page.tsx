'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  SCHEDULE, CADENCE_LABELS, CADENCE_ORDER, cadenceToRecurrence,
  type ScheduleCadence, type ScheduleCategory,
} from '@/lib/data/schedule';
import styles from '../more.module.css';

const CATEGORY_FILTERS: { key: ScheduleCategory | 'all'; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'health', label: 'Health' },
  { key: 'wealth', label: 'Wealth' },
];

export default function SchedulePage() {
  const [filter, setFilter] = useState<ScheduleCategory | 'all'>('all');

  const grouped = useMemo(() => {
    const map = new Map<ScheduleCadence, typeof SCHEDULE>();
    for (const c of CADENCE_ORDER) map.set(c, []);
    for (const item of SCHEDULE) {
      if (filter === 'all' || filter === item.category) {
        map.get(item.cadence)!.push(item);
      }
    }
    return map;
  }, [filter]);

  return (
    <div className={styles.container}>
      <Link href="/more" className={styles.back}>&larr; More</Link>

      <div className={styles.header}>
        <div className={styles.eyebrow}>ULTM8 Schedule</div>
        <h1 className={styles.heading}>
          A rhythm to live<br /><em>your best life.</em>
        </h1>
        <p className={styles.sub}>
          What to do daily, weekly, monthly, quarterly and annually to reach
          ULTM8 status across health and wealth. Tap to add any item to your
          calendar with the right recurrence pre-filled.
        </p>
      </div>

      <div className={styles.filterRow} role="tablist" aria-label="Filter by category">
        {CATEGORY_FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {CADENCE_ORDER.map(c => {
        const list = grouped.get(c)!;
        if (list.length === 0) return null;
        return (
          <div key={c}>
            <div className={styles.sectionLabel}>{CADENCE_LABELS[c]} {'\u00B7'} {list.length}</div>
            {list.map((item, i) => {
              const rec = cadenceToRecurrence(item.cadence);
              const url = `/calendar?title=${encodeURIComponent(item.name)}&category=${item.category}&recurFreq=${rec.freq}&recurInterval=${rec.interval}`;
              return (
                <Link key={`${c}-${i}`} href={url} className={styles.scheduleRow}>
                  <div className={styles.scheduleBody}>
                    <div className={styles.scheduleName}>{item.name}</div>
                    {item.desc && <div className={styles.scheduleDesc}>{item.desc}</div>}
                    <div className={styles.scheduleBadges}>
                      <span className={styles.scheduleBadge}>{CADENCE_LABELS[item.cadence]}</span>
                      <span className={`${styles.scheduleBadge} ${styles[`scheduleBadge_${item.category}`]}`}>
                        {item.category === 'health' ? 'Health' : 'Wealth'}
                      </span>
                    </div>
                  </div>
                  <span className={styles.eventAdd}>+ Add</span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
