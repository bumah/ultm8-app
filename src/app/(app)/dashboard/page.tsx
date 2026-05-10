'use client';

/**
 * Worklist dashboard.
 *
 * Three sections aggregate the user's `user_events` into:
 *   - Today      : daily-recurring events whose window contains today,
 *                  plus any one-off events on today.
 *   - This Week  : weekly-recurring events whose window covers this week,
 *                  plus any one-off events later this week.
 *   - This Month : monthly-recurring events whose window covers this month,
 *                  plus any one-off events later this month.
 *
 * Each row has a checkbox that flips done-state for the current period
 * (today / this week / this month) by editing `completed_dates[]` on the
 * recurring master, or the `completed` boolean on the one-off.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './dashboard.module.css';

/* ── Types ── */
type Freq = 'daily' | 'weekly' | 'monthly' | 'annually';

interface UserEvent {
  id: string;
  title: string;
  notes: string | null;
  event_date: string;
  event_time: string | null;
  category: 'health' | 'wealth' | 'other';
  completed: boolean;
  recurrence_freq: Freq | null;
  recurrence_interval: number | null;
  recurrence_end_date: string | null;
  completed_dates: string[] | null;
}

interface Profile {
  name: string | null;
}

/* ── Date helpers ── */
function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getMondayISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function getSundayISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function getMonthStartISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function getMonthEndISO(): string {
  const d = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  return d.toISOString().split('T')[0];
}

function fmtRange(start: string, end: string): string {
  const a = new Date(start + 'T00:00:00');
  const b = new Date(end + 'T00:00:00');
  const sameMonth = a.getMonth() === b.getMonth();
  const sa = a.toLocaleDateString('en-GB', { day: 'numeric', month: sameMonth ? undefined : 'short' });
  const sb = b.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${sa}\u2013${sb}`;
}

function fmtMonth(): string {
  return new Date().toLocaleDateString('en-GB', { month: 'long' });
}

function fmtToday(): string {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/* ── Period helpers ── */
function dailyOccurrenceNumber(ev: UserEvent): number {
  // 1-based day number in the recurring window.
  const start = new Date(ev.event_date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

function dailyTotal(ev: UserEvent): number | null {
  if (!ev.recurrence_end_date) return null;
  const start = new Date(ev.event_date + 'T00:00:00');
  const end = new Date(ev.recurrence_end_date + 'T00:00:00');
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

function weeklyOccurrenceNumber(ev: UserEvent): number {
  // 1-based week number in the recurring window.
  const start = new Date(ev.event_date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
  return Math.max(1, diff + 1);
}

function weeklyTotal(ev: UserEvent): number | null {
  if (!ev.recurrence_end_date) return null;
  const start = new Date(ev.event_date + 'T00:00:00');
  const end = new Date(ev.recurrence_end_date + 'T00:00:00');
  const weeks = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
  return Math.max(1, weeks);
}

function monthlyOccurrenceNumber(ev: UserEvent): number {
  const start = new Date(ev.event_date + 'T00:00:00');
  const today = new Date();
  return (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth()) + 1;
}

function monthlyTotal(ev: UserEvent): number | null {
  if (!ev.recurrence_end_date) return null;
  const start = new Date(ev.event_date + 'T00:00:00');
  const end = new Date(ev.recurrence_end_date + 'T00:00:00');
  return Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1);
}

/* ── Component ── */
export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(todayISO, []);
  const weekStart = useMemo(getMondayISO, []);
  const weekEnd = useMemo(getSundayISO, []);
  const monthStart = useMemo(getMonthStartISO, []);
  const monthEnd = useMemo(getMonthEndISO, []);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: profileData }, { data: eventsData }] = await Promise.all([
      supabase.from('profiles').select('name').eq('id', user.id).single(),
      supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id),
    ]);

    setProfile(profileData);
    setEvents((eventsData || []) as UserEvent[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Bucketing ── */
  const todayItems = useMemo(() => events.filter(ev => {
    if (ev.recurrence_freq === 'daily') {
      if (ev.event_date > today) return false;
      if (ev.recurrence_end_date && ev.recurrence_end_date < today) return false;
      return true;
    }
    return !ev.recurrence_freq && ev.event_date === today;
  }), [events, today]);

  const weekItems = useMemo(() => events.filter(ev => {
    if (ev.recurrence_freq === 'weekly') {
      if (ev.event_date > weekEnd) return false;
      if (ev.recurrence_end_date && ev.recurrence_end_date < weekStart) return false;
      return true;
    }
    // One-off events later this week (excluding today)
    return !ev.recurrence_freq
      && ev.event_date > today
      && ev.event_date <= weekEnd;
  }), [events, weekStart, weekEnd, today]);

  const monthItems = useMemo(() => events.filter(ev => {
    if (ev.recurrence_freq === 'monthly') {
      if (ev.event_date > monthEnd) return false;
      if (ev.recurrence_end_date && ev.recurrence_end_date < monthStart) return false;
      return true;
    }
    // One-off events later this month (excluding this week)
    return !ev.recurrence_freq
      && ev.event_date > weekEnd
      && ev.event_date <= monthEnd;
  }), [events, monthStart, monthEnd, weekEnd]);

  /* ── Done check per period ── */
  function isDone(ev: UserEvent): boolean {
    if (!ev.recurrence_freq) return ev.completed;
    const dates = ev.completed_dates || [];
    if (ev.recurrence_freq === 'daily')   return dates.includes(today);
    if (ev.recurrence_freq === 'weekly')  return dates.some(d => d >= weekStart && d <= weekEnd);
    if (ev.recurrence_freq === 'monthly') return dates.some(d => d >= monthStart && d <= monthEnd);
    return false;
  }

  async function toggleDone(ev: UserEvent) {
    const supabase = createClient();
    const done = isDone(ev);

    if (!ev.recurrence_freq) {
      // One-off: flip the boolean.
      const newCompleted = !done;
      setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, completed: newCompleted } : e));
      await supabase
        .from('user_events')
        .update({ completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null })
        .eq('id', ev.id);
      return;
    }

    // Recurring: add/remove a date in completed_dates.
    const periodKey =
      ev.recurrence_freq === 'daily'  ? today :
      ev.recurrence_freq === 'weekly' ? today :
      ev.recurrence_freq === 'monthly' ? today : today;
    const current = ev.completed_dates || [];
    let next: string[];
    if (done) {
      // Remove any date matching this period.
      if (ev.recurrence_freq === 'daily') {
        next = current.filter(d => d !== today);
      } else if (ev.recurrence_freq === 'weekly') {
        next = current.filter(d => !(d >= weekStart && d <= weekEnd));
      } else {
        next = current.filter(d => !(d >= monthStart && d <= monthEnd));
      }
    } else {
      next = [...current, periodKey];
    }
    setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, completed_dates: next } : e));
    await supabase
      .from('user_events')
      .update({ completed_dates: next })
      .eq('id', ev.id);
  }

  /* ── Render helpers ── */
  function renderRow(ev: UserEvent, periodLabel: string) {
    const done = isDone(ev);
    let progress = '';
    if (ev.recurrence_freq === 'daily') {
      const n = dailyOccurrenceNumber(ev);
      const t = dailyTotal(ev);
      progress = t ? `Day ${Math.min(n, t)} of ${t}` : `Day ${n}`;
    } else if (ev.recurrence_freq === 'weekly') {
      const n = weeklyOccurrenceNumber(ev);
      const t = weeklyTotal(ev);
      progress = t ? `Week ${Math.min(n, t)} of ${t}` : `Week ${n}`;
    } else if (ev.recurrence_freq === 'monthly') {
      const n = monthlyOccurrenceNumber(ev);
      const t = monthlyTotal(ev);
      progress = t ? `Month ${Math.min(n, t)} of ${t}` : `Month ${n}`;
    }

    const showSchedule = ev.recurrence_freq === 'weekly' || ev.recurrence_freq === 'monthly';
    const scheduleHref = `/calendar?title=${encodeURIComponent(ev.title)}&category=${ev.category}`;

    return (
      <div key={ev.id} className={`${styles.row} ${done ? styles.rowDone : ''}`}>
        <button
          type="button"
          className={`${styles.checkbox} ${done ? styles.checkboxOn : ''}`}
          onClick={() => toggleDone(ev)}
          aria-label={done ? 'Mark not done' : 'Mark done'}
        >
          {done && <span>{'\u2713'}</span>}
        </button>
        <div className={styles.rowBody}>
          <div className={styles.rowTitle}>{ev.title}</div>
          <div className={styles.rowMeta}>
            <span className={`${styles.rowChip} ${styles[`rowChip_${ev.category}`]}`}>
              {ev.category === 'health' ? 'Health' : ev.category === 'wealth' ? 'Wealth' : 'Other'}
            </span>
            <span className={styles.rowChip}>{periodLabel}</span>
            {progress && <span className={styles.rowProgress}>{progress}</span>}
            {!ev.recurrence_freq && ev.event_time && (
              <span className={styles.rowProgress}>{ev.event_time}</span>
            )}
          </div>
        </div>
        {showSchedule && !done && (
          <Link href={scheduleHref} className={styles.scheduleBtn}>
            + Schedule
          </Link>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading\u2026</div>
      </div>
    );
  }

  const greeting = profile?.name ? `Hi, ${profile.name.split(' ')[0]}` : 'Welcome';

  return (
    <div className={styles.container}>
      <div className={styles.greeting}>
        <div className={styles.eyebrow}>Today</div>
        <h1 className={styles.heading}>{greeting}</h1>
      </div>

      {/* TODAY */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>Today</span>
          <span className={styles.sectionDate}>{fmtToday()}</span>
        </div>
        {todayItems.length === 0 ? (
          <div className={styles.empty}>
            Nothing scheduled today.{' '}
            <Link href="/challenges" className={styles.emptyLink}>Take a challenge {'\u2192'}</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {todayItems.map(ev => renderRow(ev, 'Daily'))}
          </div>
        )}
      </div>

      {/* THIS WEEK */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>This week</span>
          <span className={styles.sectionDate}>{fmtRange(weekStart, weekEnd)}</span>
        </div>
        {weekItems.length === 0 ? (
          <div className={styles.empty}>Nothing for this week.</div>
        ) : (
          <div className={styles.list}>
            {weekItems.map(ev => renderRow(ev, ev.recurrence_freq === 'weekly' ? 'Weekly' : 'Event'))}
          </div>
        )}
      </div>

      {/* THIS MONTH */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>This month</span>
          <span className={styles.sectionDate}>{fmtMonth()}</span>
        </div>
        {monthItems.length === 0 ? (
          <div className={styles.empty}>Nothing for this month.</div>
        ) : (
          <div className={styles.list}>
            {monthItems.map(ev => renderRow(ev, ev.recurrence_freq === 'monthly' ? 'Monthly' : 'Event'))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Link href="/challenges" className={styles.actionPrimary}>Browse challenges {'\u2192'}</Link>
        <Link href="/calendar" className={styles.actionGhost}>+ New event</Link>
      </div>
    </div>
  );
}
