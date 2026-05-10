'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './calendar.module.css';

/* ── Types ── */
type Freq = 'daily' | 'weekly' | 'monthly' | 'annually';

interface UserEvent {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  event_date: string;
  event_time: string | null;
  category: 'health' | 'wealth' | 'other';
  behaviour_index: number | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  recurrence_freq: Freq | null;
  recurrence_interval: number | null;
  recurrence_end_date: string | null;
  completed_dates: string[] | null;
}

/** A rendered event occurrence (master events expand into 1..N of these). */
interface DisplayEvent {
  occurrenceId: string;        // stable key for React
  masterId: string;            // row in user_events
  title: string;
  notes: string | null;
  event_date: string;          // the occurrence date (may differ from master)
  event_time: string | null;
  category: 'health' | 'wealth' | 'other';
  completed: boolean;
  isRecurring: boolean;
  recurrenceLabel: string | null;
}

/* ── Helpers ── */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function parseISODate(s: string): Date {
  // Treat as local date at midnight to avoid timezone drift.
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatLongDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatShortMonth(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function recurrenceLabel(freq: Freq, interval: number): string {
  const n = interval || 1;
  const unitMap: Record<Freq, string> = {
    daily: n === 1 ? 'day' : 'days',
    weekly: n === 1 ? 'week' : 'weeks',
    monthly: n === 1 ? 'month' : 'months',
    annually: n === 1 ? 'year' : 'years',
  };
  return n === 1 ? `Every ${unitMap[freq]}` : `Every ${n} ${unitMap[freq]}`;
}

/** Expand a recurring event into occurrence dates within [rangeStart, rangeEnd]. */
function expandOccurrences(
  ev: UserEvent,
  rangeStart: Date,
  rangeEnd: Date,
): string[] {
  if (!ev.recurrence_freq) return [];
  const interval = Math.max(1, ev.recurrence_interval || 1);
  const start = parseISODate(ev.event_date);
  const end = ev.recurrence_end_date ? parseISODate(ev.recurrence_end_date) : null;

  const occurrences: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  const maxIter = 5000;
  for (let i = 0; i < maxIter; i++) {
    if (cursor > rangeEnd) break;
    if (end && cursor > end) break;
    if (cursor >= rangeStart) occurrences.push(formatDate(cursor));
    switch (ev.recurrence_freq) {
      case 'daily': cursor.setDate(cursor.getDate() + interval); break;
      case 'weekly': cursor.setDate(cursor.getDate() + 7 * interval); break;
      case 'monthly': cursor.setMonth(cursor.getMonth() + interval); break;
      case 'annually': cursor.setFullYear(cursor.getFullYear() + interval); break;
    }
  }
  return occurrences;
}

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

/* ── Component ── */
export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Add event form state
  const searchParams = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCategory, setNewCategory] = useState<'health' | 'wealth' | 'other'>('other');
  const [newTime, setNewTime] = useState('');
  const [newFreq, setNewFreq] = useState<'' | Freq>('');
  const [newInterval, setNewInterval] = useState('1');
  const [newEndDate, setNewEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /* Pre-fill from URL params. Used by:
   *   - Plan page \u2192 "Schedule in Calendar" (title + category)
   *   - Schedule page \u2192 "Add to schedule" (title + category + recurFreq + recurInterval)
   *   - Challenges page \u2192 event "Add" (title + category + date) */
  useEffect(() => {
    const prefillTitle = searchParams.get('title');
    const prefillCategory = searchParams.get('category');
    const prefillDate = searchParams.get('date');
    const prefillFreq = searchParams.get('recurFreq');
    const prefillInterval = searchParams.get('recurInterval');
    const prefillEndDate = searchParams.get('recurEndDate');

    if (prefillTitle) {
      setNewTitle(prefillTitle);
      if (prefillCategory === 'health' || prefillCategory === 'wealth') {
        setNewCategory(prefillCategory);
      }
      if (prefillFreq && ['daily', 'weekly', 'monthly', 'annually'].includes(prefillFreq)) {
        setNewFreq(prefillFreq as Freq);
      }
      if (prefillInterval) {
        const n = parseInt(prefillInterval, 10);
        if (Number.isFinite(n) && n > 0) setNewInterval(String(n));
      }
      if (prefillEndDate && /^\d{4}-\d{2}-\d{2}$/.test(prefillEndDate)) {
        setNewEndDate(prefillEndDate);
      }
      if (prefillDate && /^\d{4}-\d{2}-\d{2}$/.test(prefillDate)) {
        const d = parseISODate(prefillDate);
        if (!isNaN(d.getTime())) {
          setSelectedDate(d);
          setWeekStart(getWeekStart(d));
        }
      }
      setShowAddForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Load ALL events for the user (needed so recurring ones show across weeks) ── */
  const loadEvents = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', user.id)
      .is('ended_at', null)
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true, nullsFirst: true });

    setEvents((data || []) as UserEvent[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /* ── Derived data ── */
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, [weekStart]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekStart]);

  /** Expand events into display occurrences within the current week. */
  const displayEvents = useMemo<DisplayEvent[]>(() => {
    const out: DisplayEvent[] = [];
    for (const ev of events) {
      if (ev.recurrence_freq) {
        const dates = expandOccurrences(ev, weekStart, weekEnd);
        const label = recurrenceLabel(ev.recurrence_freq, ev.recurrence_interval || 1);
        const doneSet = new Set(ev.completed_dates || []);
        for (const d of dates) {
          out.push({
            occurrenceId: `${ev.id}:${d}`,
            masterId: ev.id,
            title: ev.title,
            notes: ev.notes,
            event_date: d,
            event_time: ev.event_time,
            category: ev.category,
            completed: doneSet.has(d),
            isRecurring: true,
            recurrenceLabel: label,
          });
        }
      } else {
        const d = parseISODate(ev.event_date);
        if (d >= weekStart && d <= weekEnd) {
          out.push({
            occurrenceId: ev.id,
            masterId: ev.id,
            title: ev.title,
            notes: ev.notes,
            event_date: ev.event_date,
            event_time: ev.event_time,
            category: ev.category,
            completed: ev.completed,
            isRecurring: false,
            recurrenceLabel: null,
          });
        }
      }
    }
    // Sort by date then time (nulls first)
    out.sort((a, b) => {
      if (a.event_date !== b.event_date) return a.event_date.localeCompare(b.event_date);
      const at = a.event_time || '';
      const bt = b.event_time || '';
      return at.localeCompare(bt);
    });
    return out;
  }, [events, weekStart, weekEnd]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, DisplayEvent[]>();
    for (const e of displayEvents) {
      const key = e.event_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [displayEvents]);

  const selectedEvents = useMemo(() => {
    return eventsByDay.get(formatDate(selectedDate)) || [];
  }, [eventsByDay, selectedDate]);

  const selectedIsPastLocked = useMemo(() => {
    const diffMs = today.getTime() - selectedDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  }, [today, selectedDate]);

  /* ── Navigation ── */
  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const goToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setWeekStart(getWeekStart(d));
    setSelectedDate(d);
  };

  /* ── CRUD ── */
  const handleAddEvent = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); setSaveError('Not signed in.'); return; }

    const interval = Math.max(1, parseInt(newInterval, 10) || 1);

    // Build payload defensively — only include recurrence fields if the user
    // actually picked a frequency. This means non-recurring events work even
    // when migration 008 (recurrence columns) hasn't been applied yet.
    const payload: Record<string, unknown> = {
      user_id: user.id,
      title: newTitle.trim(),
      notes: newNotes.trim() || null,
      event_date: formatDate(selectedDate),
      event_time: newTime || null,
      category: newCategory,
    };
    if (newFreq) {
      payload.recurrence_freq = newFreq;
      payload.recurrence_interval = interval;
      if (newEndDate) payload.recurrence_end_date = newEndDate;
    }

    const { data, error } = await supabase
      .from('user_events')
      .insert(payload)
      .select()
      .single();

    if (error) {
      setSaveError(error.message || 'Failed to save event.');
      setSaving(false);
      return;
    }

    if (data) {
      setEvents(prev => [...prev, data as UserEvent]);
    }

    setNewTitle('');
    setNewNotes('');
    setNewTime('');
    setNewCategory('other');
    setNewFreq('');
    setNewInterval('1');
    setNewEndDate('');
    setShowAddForm(false);
    setSaving(false);
  };

  const handleToggleComplete = async (occ: DisplayEvent) => {
    const supabase = createClient();

    if (occ.isRecurring) {
      // Toggle inclusion in completed_dates
      const master = events.find(e => e.id === occ.masterId);
      if (!master) return;
      const current = master.completed_dates || [];
      const has = current.includes(occ.event_date);
      const next = has
        ? current.filter(d => d !== occ.event_date)
        : [...current, occ.event_date];

      setEvents(prev => prev.map(e => e.id === occ.masterId ? { ...e, completed_dates: next } : e));
      await supabase
        .from('user_events')
        .update({ completed_dates: next })
        .eq('id', occ.masterId);
    } else {
      const newCompleted = !occ.completed;
      const newCompletedAt = newCompleted ? new Date().toISOString() : null;
      setEvents(prev => prev.map(e => e.id === occ.masterId
        ? { ...e, completed: newCompleted, completed_at: newCompletedAt }
        : e,
      ));
      await supabase
        .from('user_events')
        .update({ completed: newCompleted, completed_at: newCompletedAt })
        .eq('id', occ.masterId);
    }
  };

  const handleDeleteEvent = async (occ: DisplayEvent) => {
    const msg = occ.isRecurring
      ? `Delete "${occ.title}" and all its recurrences?`
      : `Delete "${occ.title}"?`;
    if (!confirm(msg)) return;
    setEvents(prev => prev.filter(e => e.id !== occ.masterId));
    const supabase = createClient();
    await supabase.from('user_events').delete().eq('id', occ.masterId);
  };

  /* ── Render ── */
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>Calendar</div>
        <h1 className={styles.heading}>
          Your<br /><em>Schedule.</em>
        </h1>
      </div>

      {/* Week navigation */}
      <div className={styles.weekNav}>
        <button onClick={prevWeek} className={styles.navBtn} aria-label="Previous week">‹</button>
        <div className={styles.weekLabel}>
          Week of {formatShortMonth(weekStart)}
        </div>
        <button onClick={nextWeek} className={styles.navBtn} aria-label="Next week">›</button>
        {!isSameDay(getWeekStart(today), weekStart) && (
          <button onClick={goToday} className={styles.todayBtn}>Today</button>
        )}
      </div>

      {/* Week grid */}
      <div className={styles.weekGrid}>
        {weekDays.map((day, idx) => {
          const dayEvents = eventsByDay.get(formatDate(day)) || [];
          const completedCount = dayEvents.filter(e => e.completed).length;
          const isTodayCol = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`${styles.dayCol} ${isTodayCol ? styles.dayColToday : ''} ${isSelected ? styles.dayColSelected : ''}`}
            >
              <div className={styles.dayLabel}>{DAY_LABELS[idx]}</div>
              <div className={styles.dayNum}>{day.getDate()}</div>
              <div className={styles.dayDot}>
                {dayEvents.length > 0 && (
                  <span className={`${styles.dot} ${completedCount === dayEvents.length ? styles.dotAllDone : ''}`}>
                    {dayEvents.length}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day detail panel */}
      <div className={styles.dayDetail}>
        <div className={styles.dayDetailTitle}>{formatLongDate(selectedDate)}</div>

        {selectedEvents.length === 0 && !showAddForm && (
          <div className={styles.dayEmpty}>No events scheduled.</div>
        )}

        {/* Event list */}
        {selectedEvents.length > 0 && (
          <div className={styles.eventList}>
            {selectedEvents.map(ev => (
              <div
                key={ev.occurrenceId}
                className={`${styles.eventCard} ${ev.completed ? styles.eventCardDone : ''}`}
              >
                <button
                  onClick={() => handleToggleComplete(ev)}
                  disabled={selectedIsPastLocked}
                  className={`${styles.eventCheckbox} ${ev.completed ? styles.eventCheckboxChecked : ''} ${selectedIsPastLocked ? styles.eventCheckboxDisabled : ''}`}
                  aria-label={ev.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {ev.completed && <span>✓</span>}
                </button>
                <div className={styles.eventContent}>
                  <div className={styles.eventTitleRow}>
                    <span className={styles.eventTitle}>{ev.title}</span>
                    <span className={`${styles.eventBadge} ${styles[`badge_${ev.category}`]}`}>
                      {ev.category === 'health' ? 'H' : ev.category === 'wealth' ? 'W' : '·'}
                    </span>
                  </div>
                  {ev.event_time && (
                    <div className={styles.eventTime}>{ev.event_time}</div>
                  )}
                  {ev.recurrenceLabel && (
                    <div className={styles.eventRecurrence}>↻ {ev.recurrenceLabel}</div>
                  )}
                  {ev.notes && (
                    <div className={styles.eventNotes}>{ev.notes}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteEvent(ev)}
                  className={styles.eventDelete}
                  aria-label="Delete event"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add event form */}
        {showAddForm ? (
          <div className={styles.addForm}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Event title (e.g. Gym session)"
              className={styles.addInput}
              autoFocus
            />
            <div className={styles.addFormRow}>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as 'health' | 'wealth' | 'other')}
                className={styles.addSelect}
              >
                <option value="other">Other</option>
                <option value="health">Health</option>
                <option value="wealth">Wealth</option>
              </select>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className={styles.addTime}
                placeholder="Time"
              />
            </div>

            {/* Recurrence */}
            <div className={styles.addFormRow}>
              <select
                value={newFreq}
                onChange={(e) => setNewFreq(e.target.value as '' | Freq)}
                className={styles.addSelect}
                aria-label="Repeat frequency"
              >
                <option value="">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
              {newFreq && (
                <div className={styles.recurIntervalGroup}>
                  <span className={styles.recurEvery}>every</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={newInterval}
                    onChange={(e) => setNewInterval(e.target.value)}
                    className={styles.recurInterval}
                  />
                  <span className={styles.recurUnit}>
                    {newFreq === 'daily' && (parseInt(newInterval, 10) === 1 ? 'day' : 'days')}
                    {newFreq === 'weekly' && (parseInt(newInterval, 10) === 1 ? 'week' : 'weeks')}
                    {newFreq === 'monthly' && (parseInt(newInterval, 10) === 1 ? 'month' : 'months')}
                    {newFreq === 'annually' && (parseInt(newInterval, 10) === 1 ? 'year' : 'years')}
                  </span>
                </div>
              )}
            </div>

            {newFreq && (
              <div className={styles.addFormRow}>
                <label className={styles.recurEndLabel}>Ends</label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className={styles.addTime}
                  placeholder="Never"
                />
              </div>
            )}

            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Notes (optional)"
              className={styles.addTextarea}
              rows={2}
            />

            {saveError && (
              <div className={styles.saveError}>{saveError}</div>
            )}

            <div className={styles.addActions}>
              <button
                onClick={handleAddEvent}
                disabled={saving || !newTitle.trim()}
                className={styles.addSave}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTitle(''); setNewNotes(''); setNewTime('');
                  setNewFreq(''); setNewInterval('1'); setNewEndDate('');
                  setSaveError(null);
                }}
                className={styles.addCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className={styles.addBtn}
          >
            + Add Event
          </button>
        )}

        {selectedIsPastLocked && selectedEvents.length > 0 && (
          <div className={styles.lockedHint}>
            This day is more than 7 days ago — events are read-only.
          </div>
        )}
      </div>
    </div>
  );
}
