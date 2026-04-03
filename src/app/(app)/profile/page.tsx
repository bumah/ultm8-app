'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BLABELS } from '@/lib/scoring/health-scoring';
import { WBLABELS } from '@/lib/scoring/wealth-scoring';
import { BTIERS, getBehaviourTierIndex, getTierColor } from '@/lib/scoring/shared';
import Button from '@/components/ui/Button';
import SelectCard from '@/components/ui/SelectCard';
import InputField from '@/components/ui/InputField';
import { getAgeGroup } from '@/types/database';
import type { Profile, HealthAssessment, WealthAssessment } from '@/types/database';
import styles from './profile.module.css';

const HEALTH_B_KEYS = ['b_sleep','b_smoking','b_strength','b_sweat','b_sugar','b_salt','b_spirits','b_stress'] as const;
const WEALTH_B_KEYS = ['b_active_income','b_passive_income','b_expenses','b_discretionary','b_savings','b_debt_repayment','b_retirement','b_investment'] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female' | null>(null);
  const [editDob, setEditDob] = useState('');
  const [editCurrency, setEditCurrency] = useState<string>('£');
  const [editCustomCurrency, setEditCustomCurrency] = useState('');
  const [useCustomCurrency, setUseCustomCurrency] = useState(false);
  const [saving, setSaving] = useState(false);

  // Assessment state
  const [healthAssessment, setHealthAssessment] = useState<HealthAssessment | null>(null);
  const [wealthAssessment, setWealthAssessment] = useState<WealthAssessment | null>(null);
  const [healthCount, setHealthCount] = useState(0);
  const [wealthCount, setWealthCount] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Load latest health assessment
      const { data: healthData } = await supabase
        .from('health_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (healthData && healthData.length > 0) {
        setHealthAssessment(healthData[0]);
      }

      // Load latest wealth assessment
      const { data: wealthData } = await supabase
        .from('wealth_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (wealthData && wealthData.length > 0) {
        setWealthAssessment(wealthData[0]);
      }

      // Load assessment counts
      const { count: hCount } = await supabase
        .from('health_assessments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: wCount } = await supabase
        .from('wealth_assessments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setHealthCount(hCount ?? 0);
      setWealthCount(wCount ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  function startEditing() {
    if (!profile) return;
    setEditName(profile.name || '');
    setEditGender(profile.gender);
    setEditDob(profile.date_of_birth || '');
    const curr = profile.currency || '£';
    const isStandard = ['£', '$', '€'].includes(curr);
    setEditCurrency(isStandard ? curr : '');
    setEditCustomCurrency(isStandard ? '' : curr);
    setUseCustomCurrency(!isStandard);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const finalCurrency = useCustomCurrency ? editCustomCurrency : editCurrency;
    const ageGroup = editDob ? getAgeGroup(editDob) : profile.age_group;
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: editName,
        gender: editGender,
        date_of_birth: editDob || null,
        age_group: ageGroup,
        currency: finalCurrency,
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }
    setSaving(false);
    setEditing(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderBehaviourBar(score: number | null) {
    const s = score ?? 0;
    const tierIndex = getBehaviourTierIndex(s);
    const filledSegments = tierIndex + 1;
    const color = getTierColor(s, 4);

    return (
      <div className={styles.summaryBBar}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={styles.summaryBSeg}
            style={{
              background: i < filledSegments ? color : 'var(--border-dim)',
            }}
          />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'var(--text-dim)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.eyebrow}>Profile</div>
      <h1 className={styles.heading}>
        {profile?.name || 'Fighter'}
      </h1>

      {/* ── Basic Info ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Basic Info</div>
          {!editing && (
            <button className={styles.editBtn} onClick={startEditing}>
              Edit
            </button>
          )}
        </div>

        {!editing ? (
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Gender</span>
              <span className={styles.infoValue}>{profile?.gender || '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Age Group</span>
              <span className={styles.infoValue}>{profile?.age_group || '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Currency</span>
              <span className={styles.infoValue}>{profile?.currency || '—'}</span>
            </div>
          </div>
        ) : (
          <div className={styles.editForm}>
            <InputField
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your name"
            />

            <div className={styles.editLabel}>Gender</div>
            <div className={styles.editGrid2}>
              <SelectCard label="Male" selected={editGender === 'male'} onClick={() => setEditGender('male')} />
              <SelectCard label="Female" selected={editGender === 'female'} onClick={() => setEditGender('female')} />
            </div>

            <div className={styles.editLabel}>Date of Birth</div>
            <input
              type="date"
              className={styles.dobInput}
              value={editDob}
              onChange={(e) => setEditDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min="1930-01-01"
            />
            {editDob && (
              <div className={styles.dobResult}>
                Age group: <span>{getAgeGroup(editDob)}</span>
              </div>
            )}

            <div className={styles.editLabel}>Currency</div>
            {!useCustomCurrency ? (
              <>
                <div className={styles.editGrid3}>
                  <SelectCard label="£" selected={editCurrency === '£'} onClick={() => setEditCurrency('£')} />
                  <SelectCard label="$" selected={editCurrency === '$'} onClick={() => setEditCurrency('$')} />
                  <SelectCard label="€" selected={editCurrency === '€'} onClick={() => setEditCurrency('€')} />
                </div>
                <button className={styles.customToggle} onClick={() => { setUseCustomCurrency(true); setEditCurrency(''); }}>
                  Use a different currency
                </button>
              </>
            ) : (
              <>
                <InputField
                  label="Currency symbol"
                  value={editCustomCurrency}
                  onChange={(e) => setEditCustomCurrency(e.target.value)}
                  placeholder="e.g. ₹, R, kr, ¥"
                />
                <button className={styles.customToggle} onClick={() => { setUseCustomCurrency(false); setEditCustomCurrency(''); }}>
                  &larr; Back to common currencies
                </button>
              </>
            )}

            <div className={styles.editActions}>
              <Button variant="primary" onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="ghost" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Health Summary ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Health Summary</div>

        {healthAssessment ? (
          <div className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <div>
                <div className={styles.summaryLabel}>Octagon</div>
                <div className={styles.summaryScore}>{healthAssessment.octagon_score_pct}</div>
              </div>
              <div>
                <div className={styles.summaryLabel}>Behaviour</div>
                <div className={styles.summaryScoreSm}>{healthAssessment.behaviour_score_pct}</div>
              </div>
              <div className={styles.summaryMeta}>
                <div className={styles.summaryDate}>{formatDate(healthAssessment.completed_at)}</div>
                <div className={styles.summaryCount}>{healthCount} assessment{healthCount !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div className={styles.summaryBehaviours}>
              {HEALTH_B_KEYS.map((key, i) => {
                const score = healthAssessment[key] ?? 0;
                const tierIdx = getBehaviourTierIndex(score);
                const tierColor = getTierColor(score, 4);
                return (
                  <div key={key} className={styles.summaryBRow}>
                    <div className={styles.summaryBName}>{BLABELS[i]}</div>
                    {renderBehaviourBar(score)}
                    <div className={styles.summaryBTier} style={{ color: tierColor }}>
                      {BTIERS[tierIdx]}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.summaryActions}>
              <Link href={`/results/health/${healthAssessment.id}`} className={styles.summaryLink}>
                View Results &rarr;
              </Link>
              <Link href="/assess/health" className={styles.summaryLinkDim}>
                Retake
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.emptyCard}>
            <p className={styles.placeholder}>Complete a health assessment to see your summary.</p>
            <Link href="/assess/health" className={styles.emptyLink}>
              Take Assessment &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* ── Wealth Summary ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Wealth Summary</div>

        {wealthAssessment ? (
          <div className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <div>
                <div className={styles.summaryLabel}>Octagon</div>
                <div className={styles.summaryScore}>{wealthAssessment.octagon_score_pct}</div>
              </div>
              <div>
                <div className={styles.summaryLabel}>Behaviour</div>
                <div className={styles.summaryScoreSm}>{wealthAssessment.behaviour_score_pct}</div>
              </div>
              <div className={styles.summaryMeta}>
                <div className={styles.summaryDate}>{formatDate(wealthAssessment.completed_at)}</div>
                <div className={styles.summaryCount}>{wealthCount} assessment{wealthCount !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div className={styles.summaryBehaviours}>
              {WEALTH_B_KEYS.map((key, i) => {
                const score = wealthAssessment[key] ?? 0;
                const tierIdx = getBehaviourTierIndex(score);
                const tierColor = getTierColor(score, 4);
                return (
                  <div key={key} className={styles.summaryBRow}>
                    <div className={styles.summaryBName}>{WBLABELS[i]}</div>
                    {renderBehaviourBar(score)}
                    <div className={styles.summaryBTier} style={{ color: tierColor }}>
                      {BTIERS[tierIdx]}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.summaryActions}>
              <Link href={`/results/wealth/${wealthAssessment.id}`} className={styles.summaryLink}>
                View Results &rarr;
              </Link>
              <Link href="/assess/wealth" className={styles.summaryLinkDim}>
                Retake
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.emptyCard}>
            <p className={styles.placeholder}>Complete a wealth assessment to see your summary.</p>
            <Link href="/assess/wealth" className={styles.emptyLink}>
              Take Assessment &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* ── Sign Out ── */}
      <div className={styles.actions}>
        <Button variant="ghost" fullWidth onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
