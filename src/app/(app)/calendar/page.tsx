'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './calendar.module.css';

/* ── Types ── */
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCategory, setNewCategory] = useState<'health' | 'wealth' | 'other'>('other');
  const [newTime, setNewTime] = useState('');
  const [saving, setSaving] = useState(false);

  /* ── Load events for the current week ── */
  const loadEvents = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const start = formatDate(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);

    const { data } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('event_date', start)
      .lte('event_date', formatDate(end))
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true, nullsFirst: true });

    setEvents((data || []) as UserEvent[]);
    setLoading(false);
  }, [weekStart]);

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

  const eventsByDay = useMemo(() => {
    const map = new Map<string, UserEvent[]>();
    for (const e of events) {
      const key = e.event_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_events')
      .insert({
        user_id: user.id,
        title: newTitle.trim(),
        notes: newNotes.trim() || null,
        event_date: formatDate(selectedDate),
        event_time: newTime || null,
        category: newCategory,
      })
      .select()
      .single();

    if (!error && data) {
      setEvents(prev => [...prev, data as UserEvent]);
    }

    setNewTitle('');
    setNewNotes('');
    setNewTime('');
    setNewCategory('other');
    setShowAddForm(false);
    setSaving(false);
  };

  const handleToggleComplete = async (ev: UserEvent) => {
    const newCompleted = !ev.completed;
    const newCompletedAt = newCompleted ? new Date().toISOString() : null;

    setEvents(prev =>
      prev.map(e => e.id === ev.id ? { ...e, completed: newCompleted, completed_at: newCompletedAt } : e)
    );

    const supabase = createClient();
    await supabase
      .from('user_events')
      .update({ completed: newCompleted, completed_at: newCompletedAt })
      .eq('id', ev.id);
  };

  const handleDeleteEvent = async (ev: UserEvent) => {
    if (!confirm(`Delete "${ev.title}"?`)) return;
    setEvents(prev => prev.filter(e => e.id !== ev.id));
    const supabase = createClient();
    await supabase.from('user_events').delete().eq('id', ev.id);
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
                key={ev.id}
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
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Notes (optional)"
              className={styles.addTextarea}
              rows={2}
            />
            <div className={styles.addActions}>
              <button
                onClick={handleAddEvent}
                disabled={saving || !newTitle.trim()}
                className={styles.addSave}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewTitle(''); setNewNotes(''); setNewTime(''); }}
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
