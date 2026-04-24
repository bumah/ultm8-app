'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import SelectCard from '@/components/ui/SelectCard';
import InputField from '@/components/ui/InputField';
import { getAgeGroup } from '@/types/database';
import type { Profile, HealthAssessment, WealthAssessment } from '@/types/database';
import styles from './profile.module.css';

interface HealthSnapshotData {
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  body_fat: number | null;
  dental_next: string | null;
  eye_next: string | null;
  cancer_next: string | null;
}

interface WealthSnapshotItem {
  id: string;
  category: string;
  name: string;
  value: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female' | null>(null);
  const [editDob, setEditDob] = useState('');
  const [editCurrency, setEditCurrency] = useState<string>('\u00a3');
  const [editCustomCurrency, setEditCustomCurrency] = useState('');
  const [useCustomCurrency, setUseCustomCurrency] = useState(false);
  const [saving, setSaving] = useState(false);

  // Snapshot data
  const [healthAssessment, setHealthAssessment] = useState<HealthAssessment | null>(null);
  const [wealthAssessment, setWealthAssessment] = useState<WealthAssessment | null>(null);
  const [healthSnapshot, setHealthSnapshot] = useState<HealthSnapshotData | null>(null);
  const [wealthItems, setWealthItems] = useState<WealthSnapshotItem[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: profileData },
        { data: healthData },
        { data: wealthData },
        { data: hsData },
        { data: wiData },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        supabase
          .from('health_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1),
        supabase
          .from('wealth_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1),
        supabase
          .from('health_snapshot')
          .select('blood_pressure_systolic,blood_pressure_diastolic,body_fat,dental_next,eye_next,cancer_next')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('wealth_snapshot_items')
          .select('id,category,name,value')
          .eq('user_id', user.id),
      ]);

      setProfile(profileData);
      if (healthData && healthData.length > 0) setHealthAssessment(healthData[0]);
      if (wealthData && wealthData.length > 0) setWealthAssessment(wealthData[0]);
      setHealthSnapshot(hsData);
      setWealthItems(wiData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function getAge(dob: string | null): number | null {
    if (!dob) return null;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function startEditing() {
    if (!profile) return;
    setEditName(profile.name || '');
    setEditGender(profile.gender);
    setEditDob(profile.date_of_birth || '');
    const curr = profile.currency || '\u00a3';
    const isStandard = ['\u00a3', '$', '\u20ac'].includes(curr);
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

  // Derive health card data
  const bp = healthSnapshot?.blood_pressure_systolic
    ?? (healthAssessment?.i_blood_pressure ?? null);
  const bodyFat = healthSnapshot?.body_fat
    ?? (healthAssessment?.i_body_fat ?? null);

  // Find earliest upcoming health check date
  function getNextCheckDate(): string | null {
    const candidates: string[] = [];
    if (healthAssessment?.completed_at) {
      const d = new Date(healthAssessment.completed_at);
      d.setDate(d.getDate() + 56);
      candidates.push(d.toISOString());
    }
    if (healthSnapshot?.dental_next) candidates.push(healthSnapshot.dental_next);
    if (healthSnapshot?.eye_next) candidates.push(healthSnapshot.eye_next);
    if (healthSnapshot?.cancer_next) candidates.push(healthSnapshot.cancer_next);
    if (candidates.length === 0) return null;
    candidates.sort();
    return candidates[0];
  }

  const nextCheck = getNextCheckDate();

  function formatShortDate(dateStr: string | null): string {
    if (!dateStr) return '\u2014';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Derive wealth card data
  const currency = profile?.currency || '\u00a3';
  const assetItems = wealthItems.filter(i => i.category === 'asset');
  const liabilityItems = wealthItems.filter(i => i.category === 'liability');
  const incomeActiveItems = wealthItems.filter(i => i.category === 'income_active');
  const incomePassiveItems = wealthItems.filter(i => i.category === 'income_passive');
  const expenseItems = wealthItems.filter(i => i.category === 'expense');

  const totalAssets = assetItems.reduce((s, i) => s + (i.value || 0), 0);
  const totalLiabilities = liabilityItems.reduce((s, i) => s + (i.value || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const totalIncome = incomeActiveItems.reduce((s, i) => s + (i.value || 0), 0)
    + incomePassiveItems.reduce((s, i) => s + (i.value || 0), 0);
  const totalExpenses = expenseItems.reduce((s, i) => s + (i.value || 0), 0);
  const netIncome = totalIncome - totalExpenses;

  const hasWealthData = wealthAssessment || wealthItems.length > 0;
  const hasHealthData = healthAssessment || healthSnapshot;

  function formatCurrency(value: number): string {
    const abs = Math.abs(value);
    let formatted: string;
    if (abs >= 1000000) {
      formatted = `${(abs / 1000000).toFixed(1)}m`;
    } else if (abs >= 1000) {
      formatted = abs.toLocaleString('en-GB');
    } else {
      formatted = abs.toString();
    }
    return `${value < 0 ? '-' : ''}${currency}${formatted}`;
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'var(--text-dim)' }}>Loading...</p>
      </div>
    );
  }

  const age = getAge(profile?.date_of_birth ?? null);

  return (
    <div className={styles.container}>
      <div className={styles.eyebrow}>Profile</div>

      {/* ── Compact Header ── */}
      {!editing ? (
        <div className={styles.headerRow}>
          <span className={styles.name}>{profile?.name || 'Fighter'}</span>
          <div className={styles.headerMeta}>
            {age !== null && (
              <>
                <span className={styles.headerSep}>|</span>
                <span>{age}</span>
              </>
            )}
            {profile?.gender && (
              <>
                <span className={styles.headerSep}>|</span>
                <span style={{ textTransform: 'capitalize' }}>{profile.gender}</span>
              </>
            )}
            {profile?.currency && (
              <>
                <span className={styles.headerSep}>|</span>
                <span>{profile.currency}</span>
              </>
            )}
          </div>
          <button className={styles.editBtn} onClick={startEditing}>
            Edit
          </button>
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
                <SelectCard label="\u00a3" selected={editCurrency === '\u00a3'} onClick={() => setEditCurrency('\u00a3')} />
                <SelectCard label="$" selected={editCurrency === '$'} onClick={() => setEditCurrency('$')} />
                <SelectCard label="\u20ac" selected={editCurrency === '\u20ac'} onClick={() => setEditCurrency('\u20ac')} />
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
                placeholder="e.g. \u20b9, R, kr, \u00a5"
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

      {/* ── Health Snapshot Card ── */}
      {hasHealthData ? (
        <Link href="/profile/health" className={styles.snapshotCard}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>Health Snapshot</span>
          </div>
          <div className={styles.cardMetrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>BP</span>
              <span className={styles.metricValue}>
                {bp !== null ? `${bp} mmHg` : '\u2014'}
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Body Fat</span>
              <span className={styles.metricValue}>
                {bodyFat !== null ? `${bodyFat}%` : '\u2014'}
              </span>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <span className={styles.cardSub}>
              {nextCheck ? `Next check: ${formatShortDate(nextCheck)}` : 'No upcoming checks'}
            </span>
            <span className={styles.cardArrow}>{'\u2192'}</span>
          </div>
        </Link>
      ) : (
        <Link href="/profile/health" className={styles.emptyCard}>
          <div className={styles.emptyTitle}>
            <span>Health Snapshot</span>
          </div>
          <span className={styles.emptyText}>
            Set up your health snapshot<span className={styles.emptyArrow}> {'\u2192'}</span>
          </span>
        </Link>
      )}

      {/* ── Wealth Snapshot Card ── */}
      {hasWealthData ? (
        <Link href="/profile/wealth" className={styles.snapshotCard}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>Wealth Snapshot</span>
          </div>
          <div className={styles.cardMetrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Net Worth</span>
              <span className={styles.metricValue}>{formatCurrency(netWorth)}</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Net Income</span>
              <span className={styles.metricValue}>{formatCurrency(netIncome)}</span>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <span className={styles.cardSub}>
              {assetItems.length} asset{assetItems.length !== 1 ? 's' : ''}
              {' \u2022 '}
              {liabilityItems.length} liabilit{liabilityItems.length !== 1 ? 'ies' : 'y'}
            </span>
            <span className={styles.cardArrow}>{'\u2192'}</span>
          </div>
        </Link>
      ) : (
        <Link href="/profile/wealth" className={styles.emptyCard}>
          <div className={styles.emptyTitle}>
            <span>Wealth Snapshot</span>
          </div>
          <span className={styles.emptyText}>
            Set up your wealth snapshot<span className={styles.emptyArrow}> {'\u2192'}</span>
          </span>
        </Link>
      )}

      {/* ── Sign Out ── */}
      <div className={styles.actions}>
        <Button variant="ghost" fullWidth onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
