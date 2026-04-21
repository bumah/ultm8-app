'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { INDICATOR_LIBRARY, getIndicatorDef, formatIndicatorValue } from '@/lib/data/indicator-library';
import Sparkline from '@/components/charts/Sparkline';
import styles from './trends.module.css';

interface Log {
  id: string;
  indicator_key: string;
  value: number;
  value2: number | null;
  logged_date: string;
}

type Filter = 'all' | 'health' | 'wealth';

export default function TrendsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [currency, setCurrency] = useState<string>('£');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [logsRes, profRes] = await Promise.all([
        supabase
          .from('indicator_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('logged_date', { ascending: false }),
        supabase
          .from('profiles')
          .select('currency')
          .eq('id', user.id)
          .single(),
      ]);

      setLogs((logsRes.data || []) as Log[]);
      if (profRes.data?.currency) setCurrency(profRes.data.currency);
      setLoading(false);
    }
    load();
  }, []);

  /** Group logs by indicator_key. */
  const grouped = useMemo(() => {
    const map = new Map<string, Log[]>();
    for (const log of logs) {
      if (!map.has(log.indicator_key)) map.set(log.indicator_key, []);
      map.get(log.indicator_key)!.push(log);
    }
    // Each group is already in desc order (from query). For sparklines we want asc.
    return map;
  }, [logs]);

  /** Build indicator rows, filtered. */
  const rows = useMemo(() => {
    const trackedKeys = Array.from(grouped.keys());
    const defs = trackedKeys
      .map(k => getIndicatorDef(k))
      .filter((d): d is NonNullable<typeof d> => !!d)
      .filter(d => filter === 'all' || d.category === filter);

    // Sort: most recently logged first
    defs.sort((a, b) => {
      const aLatest = grouped.get(a.key)?.[0]?.logged_date || '';
      const bLatest = grouped.get(b.key)?.[0]?.logged_date || '';
      return bLatest.localeCompare(aLatest);
    });

    return defs.map(def => {
      const all = grouped.get(def.key) || [];
      const latest = all[0];
      // Sparkline: last 4 readings (rolling), chronological order
      const recent4 = all.slice(0, 4).reverse().map(l => l.value);
      // Delta from earliest of those to latest
      let delta: number | null = null;
      if (all.length >= 2) {
        delta = latest.value - all[Math.min(all.length - 1, 3)].value;
      }
      return { def, latest, recent4, delta, total: all.length };
    });
  }, [grouped, filter]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Trends</div>
        <h1 className={styles.heading}>
          Your<br /><em>indicators.</em>
        </h1>
        <p className={styles.sub}>
          Track key numbers over time. Tap to see history.
        </p>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`${styles.filterTab} ${filter === 'health' ? styles.filterTabActive : ''}`}
          onClick={() => setFilter('health')}
        >
          Health
        </button>
        <button
          className={`${styles.filterTab} ${filter === 'wealth' ? styles.filterTabActive : ''}`}
          onClick={() => setFilter('wealth')}
        >
          Wealth
        </button>
      </div>

      {/* Indicator rows */}
      {rows.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyTitle}>No trends yet</div>
          <p className={styles.emptyText}>
            Start tracking any health or wealth metric. Log readings whenever you have them. Watch the trend over time.
          </p>
          <button className={styles.addBtn} onClick={() => setShowPicker(true)}>
            + Track an Indicator
          </button>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {rows.map(({ def, latest, recent4, delta, total }) => {
              const isPositive = delta !== null && delta > 0;
              const isNegative = delta !== null && delta < 0;
              const good = def.higherIsBetter
                ? isPositive
                : isNegative;
              const bad = def.higherIsBetter
                ? isNegative
                : isPositive;
              const arrow = isPositive ? '↑' : isNegative ? '↓' : '→';
              const arrowColor = good
                ? 'var(--tier-3)'
                : bad
                  ? 'var(--tier-1)'
                  : 'var(--text-dim)';

              return (
                <Link
                  key={def.key}
                  href={`/trends/${def.key}`}
                  className={styles.row}
                >
                  <div className={styles.rowMain}>
                    <div className={styles.rowName}>{def.label}</div>
                    <div className={styles.rowValue}>
                      {formatIndicatorValue(def, latest.value, latest.value2, currency)}
                    </div>
                  </div>
                  <div className={styles.rowSpark}>
                    <Sparkline data={recent4} width={70} height={24} color="var(--red2)" />
                  </div>
                  <div className={styles.rowTrend} style={{ color: arrowColor }}>
                    <span className={styles.rowArrow}>{arrow}</span>
                    <span className={styles.rowCount}>{total}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <button className={styles.addBtn} onClick={() => setShowPicker(true)}>
            + Track Another Indicator
          </button>
        </>
      )}

      {/* Picker modal */}
      {showPicker && (
        <IndicatorPicker
          onClose={() => setShowPicker(false)}
          existingKeys={new Set(grouped.keys())}
        />
      )}
    </div>
  );
}

/* ── Indicator Picker ── */
function IndicatorPicker({
  onClose,
  existingKeys,
}: {
  onClose: () => void;
  existingKeys: Set<string>;
}) {
  const healthList = INDICATOR_LIBRARY.filter(i => i.category === 'health');
  const wealthList = INDICATOR_LIBRARY.filter(i => i.category === 'wealth');

  return (
    <div className={styles.pickerOverlay} onClick={onClose}>
      <div className={styles.pickerSheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.pickerHeader}>
          <div className={styles.pickerTitle}>Pick an indicator</div>
          <button className={styles.pickerClose} onClick={onClose}>×</button>
        </div>

        <div className={styles.pickerGroup}>
          <div className={styles.pickerGroupLabel}>Health</div>
          {healthList.map(def => (
            <Link
              key={def.key}
              href={`/trends/${def.key}`}
              className={styles.pickerRow}
            >
              <span>{def.label}</span>
              {existingKeys.has(def.key) && <span className={styles.pickerExisting}>tracked</span>}
            </Link>
          ))}
        </div>

        <div className={styles.pickerGroup}>
          <div className={styles.pickerGroupLabel}>Wealth</div>
          {wealthList.map(def => (
            <Link
              key={def.key}
              href={`/trends/${def.key}`}
              className={styles.pickerRow}
            >
              <span>{def.label}</span>
              {existingKeys.has(def.key) && <span className={styles.pickerExisting}>tracked</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
