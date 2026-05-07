'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { METRICS, METRIC_SECTION_LABELS, type MetricSection } from '@/lib/data/metrics';
import styles from '../more.module.css';

const SECTIONS: { key: MetricSection | 'all'; label: string }[] = [
  { key: 'all',                label: 'All' },
  { key: 'health-behaviour',   label: 'Health \u00B7 Behaviours' },
  { key: 'health-indicator',   label: 'Health \u00B7 Indicators' },
  { key: 'wealth-behaviour',   label: 'Wealth \u00B7 Behaviours' },
  { key: 'wealth-indicator',   label: 'Wealth \u00B7 Indicators' },
];

const SECTION_ORDER: MetricSection[] = [
  'health-behaviour',
  'health-indicator',
  'wealth-behaviour',
  'wealth-indicator',
];

export default function MetricsPage() {
  const [section, setSection] = useState<MetricSection | 'all'>('all');

  const grouped = useMemo(() => {
    const map = new Map<MetricSection, typeof METRICS>();
    for (const s of SECTION_ORDER) map.set(s, []);
    for (const m of METRICS) {
      if (section === 'all' || section === m.section) {
        map.get(m.section)!.push(m);
      }
    }
    return map;
  }, [section]);

  return (
    <div className={styles.container}>
      <Link href="/more" className={styles.back}>&larr; More</Link>

      <div className={styles.header}>
        <div className={styles.eyebrow}>Metrics</div>
        <h1 className={styles.heading}>
          Every metric.<br /><em>Explained.</em>
        </h1>
        <p className={styles.sub}>
          The 8 behaviours and 8 indicators ULTM8 tracks across health and wealth {'\u2014'}
          what each one is, why it matters, and the single lever that moves it.
        </p>
      </div>

      <div className={styles.sectionNav} role="tablist" aria-label="Filter by section">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            type="button"
            className={`${styles.sectionTab} ${section === s.key ? styles.sectionTabActive : ''}`}
            onClick={() => setSection(s.key)}
            aria-pressed={section === s.key}
          >
            {s.label}
          </button>
        ))}
      </div>

      {SECTION_ORDER.map(s => {
        const list = grouped.get(s)!;
        if (list.length === 0) return null;
        return (
          <div key={s}>
            <div className={styles.sectionLabel}>{METRIC_SECTION_LABELS[s]} {'\u00B7'} {list.length}</div>
            {list.map(m => (
              <article key={`${s}-${m.name}`} className={styles.metricCard}>
                <div className={styles.metricName}>{m.name}</div>
                <div className={styles.metricOneLiner}>{m.oneLiner}</div>

                <div className={styles.metricBlock}>
                  <div className={styles.metricBlockLabel}>What it is</div>
                  <div className={styles.metricBlockText}>{m.what}</div>
                </div>

                <div className={styles.metricBlock}>
                  <div className={styles.metricBlockLabel}>Why it matters</div>
                  <div className={styles.metricBlockText}>{m.why}</div>
                </div>

                <div className={styles.metricBlock}>
                  <div className={styles.metricBlockLabel}>The lever</div>
                  <div className={`${styles.metricBlockText} ${styles.metricLever}`}>{m.lever}</div>
                </div>
              </article>
            ))}
          </div>
        );
      })}
    </div>
  );
}
