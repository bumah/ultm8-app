'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { RESOURCES, RESOURCE_TYPE_LABELS, type ResourceRegion, type ResourceType } from '@/lib/data/resources';
import styles from '../more.module.css';

const REGION_FILTERS: { key: ResourceRegion | 'all'; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'global', label: 'Global' },
  { key: 'uk',     label: 'UK' },
  { key: 'us',     label: 'US' },
  { key: 'hk',     label: 'HK' },
];

const TYPE_ORDER: ResourceType[] = ['app', 'wearable', 'hardware', 'programme', 'guide', 'book'];

export default function ResourcesPage() {
  const [region, setRegion] = useState<ResourceRegion | 'all'>('all');

  const filtered = useMemo(() => {
    if (region === 'all') return RESOURCES;
    return RESOURCES.filter(r => r.regions.includes(region) || (region !== 'global' && r.regions.includes('global')));
  }, [region]);

  const byType = useMemo(() => {
    const map = new Map<ResourceType, typeof RESOURCES>();
    for (const t of TYPE_ORDER) map.set(t, []);
    for (const r of filtered) map.get(r.type)!.push(r);
    return map;
  }, [filtered]);

  return (
    <div className={styles.container}>
      <Link href="/more" className={styles.back}>&larr; More</Link>

      <div className={styles.header}>
        <div className={styles.eyebrow}>Resources</div>
        <h1 className={styles.heading}>
          Tools to build<br /><em>better habits.</em>
        </h1>
        <p className={styles.sub}>
          Curated apps, wearables, books and guides. Editorial picks {'\u2014'} ULTM8 doesn{'\u2019'}t earn commissions on any of these.
        </p>
      </div>

      <div className={styles.filterRow} role="tablist" aria-label="Filter by region">
        {REGION_FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filterBtn} ${region === f.key ? styles.filterBtnActive : ''}`}
            onClick={() => setRegion(f.key)}
            aria-pressed={region === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {TYPE_ORDER.map(t => {
        const list = byType.get(t)!;
        if (list.length === 0) return null;
        return (
          <div key={t}>
            <div className={styles.sectionLabel}>{RESOURCE_TYPE_LABELS[t]} {'\u00B7'} {list.length}</div>
            {list.map(r => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.resRow}
              >
                <div>
                  <div className={styles.resName}>{r.name}</div>
                  <div className={styles.resDesc}>{r.desc}</div>
                  <div className={styles.resBadges}>
                    {r.regions.map(rg => (
                      <span key={rg} className={styles.resBadge}>{rg.toUpperCase()}</span>
                    ))}
                    {r.category && <span className={styles.resBadge}>{r.category}</span>}
                  </div>
                </div>
                <span className={styles.resArrow} aria-hidden>{'\u2197'}</span>
              </a>
            ))}
          </div>
        );
      })}
    </div>
  );
}
