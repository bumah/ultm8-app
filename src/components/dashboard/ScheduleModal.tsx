'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './ScheduleModal.module.css';

interface Props {
  eventId: string;
  title: string;
  initialTime: string | null;
  initialFreq: 'daily' | 'weekly' | 'monthly' | 'annually' | null;
  onClose: () => void;
  onSaved: (next: { event_time: string | null; recurrence_freq: string | null }) => void;
}

/**
 * Schedule a tip: pick a time of day, optionally adjust the recurrence
 * frequency for this event. Writes a partial UPDATE to user_events.
 */
export default function ScheduleModal({
  eventId,
  title,
  initialTime,
  initialFreq,
  onClose,
  onSaved,
}: Props) {
  const [time, setTime] = useState(initialTime ?? '');
  const [freq, setFreq] = useState<string>(initialFreq ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const update: Record<string, unknown> = {
      event_time: time.trim() ? time : null,
    };
    if (freq) update.recurrence_freq = freq;
    const { error: updErr } = await supabase
      .from('user_events')
      .update(update)
      .eq('id', eventId);
    setSaving(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    onSaved({
      event_time: time.trim() ? time : null,
      recurrence_freq: freq || null,
    });
    onClose();
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Schedule</div>
          <div className={styles.title}>{title}</div>
        </div>

        <div className={styles.field}>
          <label htmlFor="sched-time" className={styles.label}>Time of day</label>
          <input
            id="sched-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="sched-freq" className={styles.label}>Cadence</label>
          <select
            id="sched-freq"
            value={freq}
            onChange={(e) => setFreq(e.target.value)}
            className={styles.input}
          >
            <option value="">No recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className={styles.save} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving\u2026' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
