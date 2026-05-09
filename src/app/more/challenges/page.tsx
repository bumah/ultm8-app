'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CHALLENGES, CHALLENGE_CATEGORY_LABELS, getUpcomingEvents, type ChallengeCategory } from '@/lib/data/challenges';
import styles from '../more.module.css';

const CATEGORY_ORDER: ChallengeCategory[] = ['functional', 'obstacle', 'triathlon'];

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ChallengesPage() {
  const upcoming = useMemo(() => getUpcomingEvents(), []);

  return (
    <div className={styles.container}>
      <Link href="/more" className={styles.back}>&larr; More</Link>

      <div className={styles.header}>
        <div className={styles.eyebrow}>Challenges</div>
        <h1 className={styles.heading}>
          Sign up.<br /><em>Show up.</em>
        </h1>
        <p className={styles.sub}>
          Global event series worth training for. Pick one, set a date,
          and let the calendar entry pull your training into focus.
        </p>
      </div>

      {/* ── Series cards ── */}
      {CATEGORY_ORDER.map(cat => {
        const list = CHALLENGES.filter(c => c.category === cat);
        if (list.length === 0) return null;
        return (
          <div key={cat}>
            <div className={styles.sectionLabel}>{CHALLENGE_CATEGORY_LABELS[cat]}</div>
            {list.map(c => (
              <article key={c.slug} className={styles.metricCard}>
                <div className={styles.metricName}>{c.name}</div>
                <div className={styles.metricOneLiner}>{c.format}</div>

                <div className={styles.metricBlock}>
                  <div className={styles.metricBlockLabel}>What it is</div>
                  <div className={styles.metricBlockText}>{c.description}</div>
                </div>

                <div className={styles.metricBlock}>
                  <div className={styles.metricBlockLabel}>When</div>
                  <div className={styles.metricBlockText}>{c.cadence}</div>
                </div>

                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.challengeLink}
                >
                  Visit {c.name} {'\u2197'}
                </a>
              </article>
            ))}
          </div>
        );
      })}

      {/* ── Upcoming events calendar ── */}
      {upcoming.length > 0 && (
        <>
          <div className={styles.sectionLabel}>Upcoming events</div>
          <div className={styles.eventList}>
            {upcoming.slice(0, 20).map((ev, i) => {
              const calendarUrl = `/calendar?title=${encodeURIComponent(`${ev.challenge.name} \u2014 ${ev.city}`)}&category=health&date=${ev.date}`;
              return (
                <div key={`${ev.challenge.slug}-${i}`} className={styles.eventRow}>
                  <div className={styles.eventDate}>{formatDate(ev.date)}</div>
                  <div className={styles.eventBody}>
                    <div className={styles.eventName}>{ev.challenge.name}</div>
                    <div className={styles.eventCity}>{ev.city}</div>
                  </div>
                  <Link href={calendarUrl} className={styles.eventAdd}>
                    + Add
                  </Link>
                </div>
              );
            })}
          </div>
          <p className={styles.eventDisclaimer}>
            Sample dates {'\u2014'} confirm on the official site before signing up.
          </p>
        </>
      )}
    </div>
  );
}
