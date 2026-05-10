'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  PERSONAL_CHALLENGES, challengeEndDate,
  type PersonalChallenge, type ChallengeCadence, type ChallengeCategory,
} from '@/lib/data/personal-challenges';
import { CHALLENGES as EVENTS, CHALLENGE_CATEGORY_LABELS, getUpcomingEvents } from '@/lib/data/challenges';
import styles from './challenges.module.css';

type Tab = 'personal' | 'events';

const CADENCE_LABELS: Record<ChallengeCadence, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const CADENCES: ChallengeCadence[] = ['daily', 'weekly', 'monthly'];

export default function ChallengesPage() {
  const [tab, setTab] = useState<Tab>('personal');
  const [filterCategory, setFilterCategory] = useState<ChallengeCategory | 'all'>('all');
  const [filterCadence, setFilterCadence] = useState<ChallengeCadence | 'all'>('all');

  // Active challenge slugs (anything with a matching title currently in user_events)
  const [activeTitles, setActiveTitles] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('user_events')
        .select('title')
        .eq('user_id', user.id)
        .not('recurrence_freq', 'is', null);
      const titles = new Set((data || []).map(r => (r.title as string).toLowerCase()));
      setActiveTitles(titles);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return PERSONAL_CHALLENGES.filter(c => {
      if (filterCategory !== 'all' && c.category !== filterCategory) return false;
      if (filterCadence !== 'all' && c.cadence !== filterCadence) return false;
      return true;
    });
  }, [filterCategory, filterCadence]);

  const grouped = useMemo(() => {
    const map = new Map<ChallengeCadence, PersonalChallenge[]>();
    for (const c of CADENCES) map.set(c, []);
    for (const c of filtered) map.get(c.cadence)!.push(c);
    return map;
  }, [filtered]);

  function takeChallengeUrl(c: PersonalChallenge): string {
    const params = new URLSearchParams({
      title: c.name,
      category: c.category,
      recurFreq: c.cadence,
      recurInterval: '1',
      recurEndDate: challengeEndDate(c),
    });
    return `/calendar?${params.toString()}`;
  }

  const upcomingEvents = useMemo(() => getUpcomingEvents(), []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Challenges</div>
        <h1 className={styles.heading}>
          Pick a challenge.<br /><em>Show up.</em>
        </h1>
        <p className={styles.sub}>
          Personal habit streaks you can take any time, plus the global events
          worth training for.
        </p>
      </div>

      {/* Tab switcher */}
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          className={`${styles.tab} ${tab === 'personal' ? styles.tabActive : ''}`}
          onClick={() => setTab('personal')}
          aria-selected={tab === 'personal'}
        >
          Personal
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'events' ? styles.tabActive : ''}`}
          onClick={() => setTab('events')}
          aria-selected={tab === 'events'}
        >
          Events
        </button>
      </div>

      {tab === 'personal' && (
        <>
          {/* Filters */}
          <div className={styles.filterRow}>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCategory === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCategory('all')}
            >All</button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCategory === 'health' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCategory('health')}
            >Health</button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCategory === 'wealth' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCategory('wealth')}
            >Wealth</button>
            <span className={styles.filterDivider} />
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCadence === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCadence('all')}
            >All cadences</button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCadence === 'daily' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCadence('daily')}
            >Daily</button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCadence === 'weekly' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCadence('weekly')}
            >Weekly</button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCadence === 'monthly' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCadence('monthly')}
            >Monthly</button>
          </div>

          {CADENCES.map(c => {
            const list = grouped.get(c)!;
            if (list.length === 0) return null;
            return (
              <div key={c}>
                <div className={styles.sectionLabel}>{CADENCE_LABELS[c]} {'\u00B7'} {list.length}</div>
                {list.map(ch => {
                  const isActive = activeTitles.has(ch.name.toLowerCase());
                  return (
                    <article key={ch.slug} className={styles.challengeCard}>
                      <div className={styles.challengeBody}>
                        <div className={styles.challengeName}>{ch.short}</div>
                        <div className={styles.challengeFull}>{ch.name}</div>
                        <div className={styles.challengeBadges}>
                          <span className={`${styles.challengeBadge} ${styles[`challengeBadge_${ch.category}`]}`}>
                            {ch.category === 'health' ? 'Health' : 'Wealth'}
                          </span>
                          <span className={styles.challengeBadge}>{CADENCE_LABELS[ch.cadence]}</span>
                          <span className={styles.challengeBadge}>
                            {ch.durationCount} {ch.durationUnit}
                          </span>
                        </div>
                      </div>
                      {isActive ? (
                        <span className={styles.challengeActive}>{'\u2713'} In your calendar</span>
                      ) : (
                        <Link href={takeChallengeUrl(ch)} className={styles.challengeCta}>
                          Take challenge {'\u2192'}
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>
            );
          })}
        </>
      )}

      {tab === 'events' && (
        <>
          {/* Series cards */}
          {(['functional', 'obstacle', 'triathlon'] as const).map(cat => {
            const list = EVENTS.filter(e => e.category === cat);
            if (list.length === 0) return null;
            return (
              <div key={cat}>
                <div className={styles.sectionLabel}>{CHALLENGE_CATEGORY_LABELS[cat]}</div>
                {list.map(c => (
                  <article key={c.slug} className={styles.challengeCard}>
                    <div className={styles.challengeBody}>
                      <div className={styles.challengeName}>{c.name}</div>
                      <div className={styles.challengeFull}>{c.format}</div>
                      <p className={styles.challengeDesc}>{c.description}</p>
                      <div className={styles.challengeBadges}>
                        <span className={styles.challengeBadge}>{c.cadence}</span>
                      </div>
                    </div>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.challengeCta}
                    >
                      Visit {'\u2197'}
                    </a>
                  </article>
                ))}
              </div>
            );
          })}

          {/* Upcoming events */}
          {upcomingEvents.length > 0 && (
            <>
              <div className={styles.sectionLabel}>Upcoming events</div>
              <div className={styles.eventList}>
                {upcomingEvents.slice(0, 20).map((ev, i) => {
                  const calendarUrl = `/calendar?title=${encodeURIComponent(`${ev.challenge.name} \u2014 ${ev.city}`)}&category=health&date=${ev.date}`;
                  return (
                    <div key={`${ev.challenge.slug}-${i}`} className={styles.eventRow}>
                      <div className={styles.eventDate}>
                        {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className={styles.eventBody}>
                        <div className={styles.eventName}>{ev.challenge.name}</div>
                        <div className={styles.eventCity}>{ev.city}</div>
                      </div>
                      <Link href={calendarUrl} className={styles.eventAdd}>+ Add</Link>
                    </div>
                  );
                })}
              </div>
              <p className={styles.eventDisclaimer}>
                Sample dates {'\u2014'} confirm on the official site before signing up.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
