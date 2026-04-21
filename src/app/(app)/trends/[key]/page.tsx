'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getIndicatorDef, formatIndicatorValue } from '@/lib/data/indicator-library';
import LineChart from '@/components/charts/LineChart';
import styles from './detail.module.css';

interface Log {
  id: string;
  indicator_key: string;
  value: number;
  value2: number | null;
  logged_date: string;
  notes: string | null;
}

export default function IndicatorDetailPage() {
  const params = useParams();
  const key = params.key as string;
  const def = getIndicatorDef(key);

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [currency, setCurrency] = useState<string>('£');

  // Log form state
  const [showForm, setShowForm] = useState(false);
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [logsRes, profRes] = await Promise.all([
      supabase
        .from('indicator_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('indicator_key', key)
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
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    const v1 = parseFloat(val1);
    if (isNaN(v1)) return;
    const v2 = def?.dual && val2 ? parseFloat(val2) : null;

    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); setSaveError('Not signed in.'); return; }

    const { data, error } = await supabase
      .from('indicator_logs')
      .insert({
        user_id: user.id,
        indicator_key: key,
        value: v1,
        value2: v2,
        logged_date: date,
        notes: notes.trim() || null,
      })
      .select()
      .single();

    if (error) {
      setSaveError(error.message || 'Failed to save reading.');
      setSaving(false);
      return;
    }

    if (data) {
      setLogs(prev => [data as Log, ...prev]);
    }

    setVal1('');
    setVal2('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reading?')) return;
    setLogs(prev => prev.filter(l => l.id !== id));
    const supabase = createClient();
    await supabase.from('indicator_logs').delete().eq('id', id);
  };

  /* Chart data: chronological, up to last 30 entries */
  const chartData = useMemo(() => {
    const recent = logs.slice(0, 30).slice().reverse();
    return recent.map(l => ({
      label: new Date(l.logged_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      value: l.value,
    }));
  }, [logs]);

  if (!def) {
    return (
      <div className={styles.container}>
        <Link href="/trends" className={styles.back}>&larr; Trends</Link>
        <p className={styles.error}>Unknown indicator.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  const latest = logs[0];

  return (
    <div className={styles.container}>
      <Link href="/trends" className={styles.back}>&larr; Trends</Link>

      <h1 className={styles.title}>{def.label}</h1>

      {/* Latest value */}
      {latest ? (
        <div className={styles.latestBlock}>
          <div className={styles.latestValue}>
            {formatIndicatorValue(def, latest.value, latest.value2, currency)}
          </div>
          <div className={styles.latestMeta}>
            Latest: {new Date(latest.logged_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      ) : (
        <div className={styles.latestBlock}>
          <div className={styles.latestValue} style={{ color: 'var(--text-dim)' }}>—</div>
          <div className={styles.latestMeta}>No readings yet</div>
        </div>
      )}

      {!showForm && (
        <button className={styles.logBtn} onClick={() => setShowForm(true)}>
          + Log Reading
        </button>
      )}

      {/* Log form */}
      {showForm && (
        <div className={styles.logForm}>
          <div className={styles.logFormRow}>
            <label className={styles.logLabel}>{def.dual ? 'Systolic' : 'Value'}</label>
            <input
              type="number"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              className={styles.logInput}
              placeholder={def.hint || `Enter ${def.label.toLowerCase()}`}
              autoFocus
              step={def.decimals && def.decimals > 0 ? '0.1' : '1'}
            />
            {def.unit && def.unit !== 'currency' && <span className={styles.logUnit}>{def.unit}</span>}
            {def.unit === 'currency' && <span className={styles.logUnit}>{currency}</span>}
          </div>

          {def.dual && (
            <div className={styles.logFormRow}>
              <label className={styles.logLabel}>Diastolic</label>
              <input
                type="number"
                value={val2}
                onChange={(e) => setVal2(e.target.value)}
                className={styles.logInput}
                placeholder="e.g. 80"
              />
              <span className={styles.logUnit}>{def.unit}</span>
            </div>
          )}

          <div className={styles.logFormRow}>
            <label className={styles.logLabel}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.logInput}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className={styles.logFormRow}>
            <label className={styles.logLabel}>Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.logInput}
              placeholder="Optional"
            />
          </div>

          {saveError && (
            <div className={styles.saveError}>{saveError}</div>
          )}

          <div className={styles.logActions}>
            <button
              className={styles.logSave}
              onClick={handleSave}
              disabled={saving || !val1.trim()}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              className={styles.logCancel}
              onClick={() => { setShowForm(false); setVal1(''); setVal2(''); setNotes(''); setSaveError(null); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      {logs.length > 0 && (
        <div className={styles.chartBlock}>
          <div className={styles.chartLabel}>
            Trend ({logs.length} {logs.length === 1 ? 'reading' : 'readings'})
          </div>
          <LineChart
            data={chartData}
            width={340}
            height={180}
            color="var(--red2)"
            yLabelFormat={(v) => {
              if (def.unit === 'currency') return Math.round(v).toLocaleString();
              return def.decimals && def.decimals > 0 ? v.toFixed(def.decimals) : Math.round(v).toString();
            }}
          />
        </div>
      )}

      {/* History */}
      {logs.length > 0 && (
        <div className={styles.historyBlock}>
          <div className={styles.historyLabel}>History</div>
          <div className={styles.historyList}>
            {logs.map(log => (
              <div key={log.id} className={styles.historyRow}>
                <div className={styles.historyDate}>
                  {new Date(log.logged_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className={styles.historyValue}>
                  {formatIndicatorValue(def, log.value, log.value2, currency)}
                </div>
                <button
                  className={styles.historyDelete}
                  onClick={() => handleDelete(log.id)}
                  aria-label="Delete reading"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
