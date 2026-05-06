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

interface Goal {
  id: string;
  user_id: string;
  indicator_key: string;
  target_value: number;
  target_value2: number | null;
  start_date: string;
  target_date: string;
  notes: string | null;
  achieved_at: string | null;
  created_at: string;
}

type GoalStatus = 'achieved' | 'progressing';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Has the latest reading hit (or beaten) the target? */
function isMet(latest: Log | undefined, goal: Goal, higherIsBetter: boolean): boolean {
  if (!latest) return false;
  if (higherIsBetter) return latest.value >= goal.target_value;
  return latest.value <= goal.target_value;
}

/** Progress percent from start baseline -> target, clamped 0-100. */
function computeProgress(
  latest: Log | undefined,
  baseline: Log | undefined,
  goal: Goal,
): number {
  if (!latest || !baseline) return 0;
  const start = baseline.value;
  const cur = latest.value;
  const tgt = goal.target_value;
  if (tgt === start) return cur === tgt ? 100 : 0;
  const pct = ((cur - start) / (tgt - start)) * 100;
  return Math.max(0, Math.min(100, pct));
}

export default function IndicatorDetailPage() {
  const params = useParams();
  const key = params.key as string;
  const def = getIndicatorDef(key);

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [currency, setCurrency] = useState<string>('£');

  // Log form state
  const [showForm, setShowForm] = useState(false);
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [date, setDate] = useState(() => todayISO());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Goal form state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalT1, setGoalT1] = useState('');
  const [goalT2, setGoalT2] = useState('');
  const [goalStart, setGoalStart] = useState(() => todayISO());
  const [goalEnd, setGoalEnd] = useState('');
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [logsRes, profRes, goalRes] = await Promise.all([
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
      supabase
        .from('indicator_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('indicator_key', key)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    setLogs((logsRes.data || []) as Log[]);
    if (profRes.data?.currency) setCurrency(profRes.data.currency);
    setGoal((goalRes.data as Goal | null) ?? null);
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

    if (!data) {
      setSaveError('Reading saved but could not be read back. Check Supabase RLS policies on indicator_logs.');
      setSaving(false);
      return;
    }

    const newLog = data as Log;
    setLogs(prev => [newLog, ...prev]);

    // If a goal exists and we just hit the target for the first time, mark achieved.
    if (goal && !goal.achieved_at && def) {
      const wouldMeet = (def.higherIsBetter ?? false)
        ? newLog.value >= goal.target_value
        : newLog.value <= goal.target_value;
      if (wouldMeet) {
        const stamped = new Date().toISOString();
        await supabase
          .from('indicator_goals')
          .update({ achieved_at: stamped })
          .eq('id', goal.id);
        setGoal({ ...goal, achieved_at: stamped });
      }
    }

    setVal1('');
    setVal2('');
    setNotes('');
    setDate(todayISO());
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reading?')) return;
    setLogs(prev => prev.filter(l => l.id !== id));
    const supabase = createClient();
    await supabase.from('indicator_logs').delete().eq('id', id);
  };

  const handleSaveGoal = async () => {
    const t1 = parseFloat(goalT1);
    if (isNaN(t1)) { setGoalError('Enter a target value.'); return; }
    const t2 = def?.dual && goalT2 ? parseFloat(goalT2) : null;
    if (!goalEnd) { setGoalError('Pick a target date.'); return; }
    if (goalEnd <= goalStart) { setGoalError('Target date must be after the start date.'); return; }

    setGoalSaving(true);
    setGoalError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setGoalSaving(false); setGoalError('Not signed in.'); return; }

    if (goal) {
      // Update existing
      const { data, error } = await supabase
        .from('indicator_goals')
        .update({
          target_value: t1,
          target_value2: t2,
          start_date: goalStart,
          target_date: goalEnd,
        })
        .eq('id', goal.id)
        .select()
        .single();
      if (error) { setGoalError(error.message); setGoalSaving(false); return; }
      setGoal(data as Goal);
    } else {
      // Create new
      const { data, error } = await supabase
        .from('indicator_goals')
        .insert({
          user_id: user.id,
          indicator_key: key,
          target_value: t1,
          target_value2: t2,
          start_date: goalStart,
          target_date: goalEnd,
        })
        .select()
        .single();
      if (error) { setGoalError(error.message); setGoalSaving(false); return; }
      setGoal(data as Goal);
    }

    setShowGoalForm(false);
    setGoalSaving(false);
  };

  const handleDeleteGoal = async () => {
    if (!goal) return;
    if (!confirm('Delete this goal?')) return;
    const supabase = createClient();
    await supabase.from('indicator_goals').delete().eq('id', goal.id);
    setGoal(null);
  };

  const openGoalForm = () => {
    setGoalT1(goal ? String(goal.target_value) : '');
    setGoalT2(goal && goal.target_value2 != null ? String(goal.target_value2) : '');
    setGoalStart(goal ? goal.start_date : todayISO());
    setGoalEnd(goal ? goal.target_date : '');
    setGoalError(null);
    setShowGoalForm(true);
  };

  /* Chart data: chronological, up to last 30 entries */
  const chartData = useMemo(() => {
    const recent = logs.slice(0, 30).slice().reverse();
    return recent.map(l => ({
      label: new Date(l.logged_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      value: l.value,
    }));
  }, [logs]);

  /** Find the reading closest to (and at-or-before) the goal start date. */
  const baselineLog = useMemo<Log | undefined>(() => {
    if (!goal) return undefined;
    const onOrBefore = logs.filter(l => l.logged_date <= goal.start_date);
    if (onOrBefore.length > 0) {
      // most recent on/before start
      return onOrBefore.reduce((acc, cur) =>
        cur.logged_date > acc.logged_date ? cur : acc,
      );
    }
    // Otherwise the earliest reading we have
    return logs.length > 0 ? logs[logs.length - 1] : undefined;
  }, [logs, goal]);

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

  // Goal status
  const goalStatus: GoalStatus | null = goal
    ? (goal.achieved_at || isMet(latest, goal, def.higherIsBetter ?? false)
        ? 'achieved'
        : 'progressing')
    : null;

  const goalProgressPct = goal ? computeProgress(latest, baselineLog, goal) : 0;

  const daysRemaining = goal
    ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

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
              max={todayISO()}
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

      {/* ── Goal block ── */}
      {!showGoalForm && (
        goal ? (
          <div className={styles.goalBlock}>
            <div className={styles.goalHeader}>
              <span className={styles.goalLabel}>Goal</span>
              <span className={`${styles.goalStatus} ${goalStatus === 'achieved' ? styles.goalStatusAchieved : styles.goalStatusProgressing}`}>
                {goalStatus === 'achieved' ? 'Achieved' : 'Progressing'}
              </span>
            </div>
            <div className={styles.goalRow}>
              <span className={styles.goalRowLabel}>Target</span>
              <span className={styles.goalRowValue}>
                {formatIndicatorValue(def, goal.target_value, goal.target_value2, currency)}
              </span>
            </div>
            <div className={styles.goalRow}>
              <span className={styles.goalRowLabel}>Window</span>
              <span className={styles.goalRowValue}>
                {new Date(goal.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                {' \u2192 '}
                {new Date(goal.target_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {goalStatus === 'progressing' && (
              <div className={styles.goalRow}>
                <span className={styles.goalRowLabel}>{daysRemaining < 0 ? 'Overdue' : 'Remaining'}</span>
                <span className={styles.goalRowValue}>
                  {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days` : `${daysRemaining} days`}
                </span>
              </div>
            )}
            <div className={styles.goalProgressBar}>
              <div
                className={styles.goalProgressFill}
                style={{ width: `${goalProgressPct}%` }}
              />
            </div>
            <div className={styles.goalRowMeta}>
              {Math.round(goalProgressPct)}% toward target
              {goal.achieved_at && (
                <> {'\u00B7'} hit on {new Date(goal.achieved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</>
              )}
            </div>
            <div className={styles.goalActions}>
              <button className={styles.goalEdit} onClick={openGoalForm}>Edit</button>
              <button className={styles.goalDelete} onClick={handleDeleteGoal}>Delete</button>
            </div>
          </div>
        ) : (
          <button className={styles.goalAdd} onClick={openGoalForm}>
            + Set a goal
          </button>
        )
      )}

      {/* Goal form */}
      {showGoalForm && (
        <div className={styles.logForm}>
          <div className={styles.logFormRow}>
            <label className={styles.logLabel}>{def.dual ? 'Target sys.' : 'Target'}</label>
            <input
              type="number"
              value={goalT1}
              onChange={(e) => setGoalT1(e.target.value)}
              className={styles.logInput}
              placeholder={def.hint || `Target ${def.label.toLowerCase()}`}
              autoFocus
              step={def.decimals && def.decimals > 0 ? '0.1' : '1'}
            />
            {def.unit && def.unit !== 'currency' && <span className={styles.logUnit}>{def.unit}</span>}
            {def.unit === 'currency' && <span className={styles.logUnit}>{currency}</span>}
          </div>

          {def.dual && (
            <div className={styles.logFormRow}>
              <label className={styles.logLabel}>Target dia.</label>
              <input
                type="number"
                value={goalT2}
                onChange={(e) => setGoalT2(e.target.value)}
                className={styles.logInput}
                placeholder="e.g. 80"
              />
              <span className={styles.logUnit}>{def.unit}</span>
            </div>
          )}

          <div className={styles.logFormRow}>
            <label className={styles.logLabel}>Start</label>
            <input
              type="date"
              value={goalStart}
              onChange={(e) => setGoalStart(e.target.value)}
              className={styles.logInput}
            />
          </div>

          <div className={styles.logFormRow}>
            <label className={styles.logLabel}>Target by</label>
            <input
              type="date"
              value={goalEnd}
              onChange={(e) => setGoalEnd(e.target.value)}
              className={styles.logInput}
              min={goalStart}
            />
          </div>

          {goalError && (
            <div className={styles.saveError}>{goalError}</div>
          )}

          <div className={styles.logActions}>
            <button
              className={styles.logSave}
              onClick={handleSaveGoal}
              disabled={goalSaving || !goalT1.trim() || !goalEnd}
            >
              {goalSaving ? 'Saving…' : (goal ? 'Update goal' : 'Save goal')}
            </button>
            <button
              className={styles.logCancel}
              onClick={() => { setShowGoalForm(false); setGoalError(null); }}
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
