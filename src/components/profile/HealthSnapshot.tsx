'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import type { HealthAssessment } from '@/types/database';
import styles from './HealthSnapshot.module.css';

interface HealthSnapshotData {
  id?: string;
  user_id: string;
  height: number | null;
  height_unit: string;
  weight: number | null;
  weight_updated: string | null;
  waistline: number | null;
  waistline_unit: string;
  waistline_updated: string | null;
  body_fat: number | null;
  body_fat_updated: string | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  blood_pressure_updated: string | null;
  dental_last: string | null;
  dental_next: string | null;
  eye_last: string | null;
  eye_next: string | null;
  cancer_last: string | null;
  cancer_next: string | null;
  updated_at?: string;
}

interface Props {
  userId: string;
  latestHealthAssessment?: HealthAssessment | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function calcBMI(weight: number | null, height: number | null, heightUnit: string): string {
  if (!weight || !height || height <= 0) return '\u2014';
  let heightM: number;
  if (heightUnit === 'ft') {
    heightM = height * 0.3048;
  } else {
    heightM = height / 100;
  }
  if (heightM <= 0) return '\u2014';
  const bmi = weight / (heightM * heightM);
  return bmi.toFixed(1);
}

function getWeightKg(weight: number | null, unit: string): number | null {
  if (weight === null) return null;
  if (unit === 'lbs') return weight * 0.453592;
  return weight;
}

function getHeightForBMI(height: number | null, unit: string): number | null {
  if (height === null) return null;
  return height;
}

export default function HealthSnapshot({ userId, latestHealthAssessment }: Props) {
  const [data, setData] = useState<HealthSnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [editingChecks, setEditingChecks] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state for body metrics
  const [editHeight, setEditHeight] = useState<string>('');
  const [editHeightUnit, setEditHeightUnit] = useState<string>('cm');
  const [editWeight, setEditWeight] = useState<string>('');
  const [editWeightUnit, setEditWeightUnit] = useState<string>('kg');
  const [editWaistline, setEditWaistline] = useState<string>('');
  const [editWaistlineUnit, setEditWaistlineUnit] = useState<string>('in');
  const [editBodyFat, setEditBodyFat] = useState<string>('');
  const [editSystolic, setEditSystolic] = useState<string>('');
  const [editDiastolic, setEditDiastolic] = useState<string>('');

  // Edit state for health checks
  const [editDentalLast, setEditDentalLast] = useState<string>('');
  const [editDentalNext, setEditDentalNext] = useState<string>('');
  const [editEyeLast, setEditEyeLast] = useState<string>('');
  const [editEyeNext, setEditEyeNext] = useState<string>('');
  const [editCancerLast, setEditCancerLast] = useState<string>('');
  const [editCancerNext, setEditCancerNext] = useState<string>('');

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: snapshot } = await supabase
      .from('health_snapshot')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (snapshot) {
      // Auto-populate from latest assessment if fields are null
      let bodyFat = snapshot.body_fat;
      let bpSystolic = snapshot.blood_pressure_systolic;
      let bpDiastolic = snapshot.blood_pressure_diastolic;

      if (latestHealthAssessment) {
        if (bodyFat === null && latestHealthAssessment.i_body_fat !== null) {
          bodyFat = latestHealthAssessment.i_body_fat;
        }
        if (bpSystolic === null && latestHealthAssessment.i_blood_pressure !== null) {
          // i_blood_pressure is a single score; we cannot split into systolic/diastolic
          // Leave as null unless the snapshot has its own values
        }
      }

      setData({
        ...snapshot,
        body_fat: bodyFat,
        blood_pressure_systolic: bpSystolic,
        blood_pressure_diastolic: bpDiastolic,
      });
    } else {
      // No snapshot exists yet
      setData(null);
    }
    setLoading(false);
  }, [userId, latestHealthAssessment]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function startEditMetrics() {
    setEditHeight(data?.height?.toString() ?? '');
    setEditHeightUnit(data?.height_unit ?? 'cm');
    setEditWeight(data?.weight?.toString() ?? '');
    setEditWeightUnit('kg');
    setEditWaistline(data?.waistline?.toString() ?? '');
    setEditWaistlineUnit(data?.waistline_unit ?? 'in');
    setEditBodyFat(data?.body_fat?.toString() ?? '');
    setEditSystolic(data?.blood_pressure_systolic?.toString() ?? '');
    setEditDiastolic(data?.blood_pressure_diastolic?.toString() ?? '');
    setEditingMetrics(true);
  }

  function startEditChecks() {
    const assessmentDate = latestHealthAssessment?.completed_at
      ? latestHealthAssessment.completed_at.split('T')[0]
      : '';
    const assessmentNext = assessmentDate
      ? (() => {
          const d = new Date(assessmentDate);
          d.setDate(d.getDate() + 56); // +8 weeks
          return d.toISOString().split('T')[0];
        })()
      : '';

    setEditDentalLast(data?.dental_last ?? '');
    setEditDentalNext(data?.dental_next ?? '');
    setEditEyeLast(data?.eye_last ?? '');
    setEditEyeNext(data?.eye_next ?? '');
    setEditCancerLast(data?.cancer_last ?? '');
    setEditCancerNext(data?.cancer_next ?? '');
    setEditingChecks(true);
  }

  async function saveMetrics() {
    setSaving(true);
    const supabase = createClient();
    const now = new Date().toISOString();

    const heightVal = editHeight ? parseFloat(editHeight) : null;
    const weightVal = editWeight ? parseFloat(editWeight) : null;
    const waistVal = editWaistline ? parseFloat(editWaistline) : null;
    const fatVal = editBodyFat ? parseFloat(editBodyFat) : null;
    const sysVal = editSystolic ? parseFloat(editSystolic) : null;
    const diaVal = editDiastolic ? parseFloat(editDiastolic) : null;

    const updates: Record<string, unknown> = {
      user_id: userId,
      height: heightVal,
      height_unit: editHeightUnit,
      weight: weightVal,
      waistline: waistVal,
      waistline_unit: editWaistlineUnit,
      body_fat: fatVal,
      blood_pressure_systolic: sysVal,
      blood_pressure_diastolic: diaVal,
      updated_at: now,
    };

    // Set individual timestamps for changed fields
    if (weightVal !== data?.weight) updates.weight_updated = now;
    if (waistVal !== data?.waistline) updates.waistline_updated = now;
    if (fatVal !== data?.body_fat) updates.body_fat_updated = now;
    if (sysVal !== data?.blood_pressure_systolic || diaVal !== data?.blood_pressure_diastolic) {
      updates.blood_pressure_updated = now;
    }

    await supabase
      .from('health_snapshot')
      .upsert(updates, { onConflict: 'user_id' });

    await loadData();
    setSaving(false);
    setEditingMetrics(false);
  }

  async function saveChecks() {
    setSaving(true);
    const supabase = createClient();
    const now = new Date().toISOString();

    const updates: Record<string, unknown> = {
      user_id: userId,
      dental_last: editDentalLast || null,
      dental_next: editDentalNext || null,
      eye_last: editEyeLast || null,
      eye_next: editEyeNext || null,
      cancer_last: editCancerLast || null,
      cancer_next: editCancerNext || null,
      updated_at: now,
    };

    await supabase
      .from('health_snapshot')
      .upsert(updates, { onConflict: 'user_id' });

    await loadData();
    setSaving(false);
    setEditingChecks(false);
  }

  // Compute BMI from current data
  const weightKg = data ? getWeightKg(data.weight, 'kg') : null;
  const bmiStr = data ? calcBMI(weightKg, data.height, data.height_unit) : '\u2014';

  // Edit mode BMI
  const editWeightKg = editWeight ? getWeightKg(parseFloat(editWeight), editWeightUnit) : null;
  const editBmiStr = calcBMI(
    editWeightKg,
    editHeight ? parseFloat(editHeight) : null,
    editHeightUnit
  );

  // Assessment health check dates
  const assessmentLast = latestHealthAssessment?.completed_at ?? null;
  const assessmentNext = assessmentLast
    ? (() => {
        const d = new Date(assessmentLast);
        d.setDate(d.getDate() + 56);
        return d.toISOString();
      })()
    : null;

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Health Snapshot</div>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Health Snapshot</div>

      {/* ── Body Metrics ── */}
      <div className={styles.subHeader}>
        <div className={styles.subTitle}>Body Metrics</div>
        {!editingMetrics && (
          <button className={styles.editBtn} onClick={startEditMetrics}>
            Edit
          </button>
        )}
      </div>

      {!editingMetrics ? (
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Height</span>
            <span className={styles.infoValue}>
              {data?.height ? `${data.height} ${data.height_unit}` : '\u2014'}
            </span>
            <span className={styles.infoMeta}>{'\u2014'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Weight</span>
            <span className={styles.infoValue}>
              {data?.weight ? `${data.weight} kg` : '\u2014'}
            </span>
            <span className={styles.infoMeta}>
              {data?.weight_updated ? `Updated ${formatDate(data.weight_updated)}` : '\u2014'}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Waistline</span>
            <span className={styles.infoValue}>
              {data?.waistline ? `${data.waistline} ${data.waistline_unit}` : '\u2014'}
            </span>
            <span className={styles.infoMeta}>
              {data?.waistline_updated ? `Updated ${formatDate(data.waistline_updated)}` : '\u2014'}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Body Fat</span>
            <span className={styles.infoValue}>
              {data?.body_fat !== null && data?.body_fat !== undefined ? `${data.body_fat}%` : '\u2014'}
            </span>
            <span className={styles.infoMeta}>
              {data?.body_fat_updated ? `Updated ${formatDate(data.body_fat_updated)}` : '\u2014'}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>BMI</span>
            <span className={styles.infoValueCalc}>{bmiStr}</span>
            <span className={styles.calcBadge}>calculated</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Blood Pressure</span>
            <span className={styles.infoValue}>
              {data?.blood_pressure_systolic && data?.blood_pressure_diastolic
                ? `${data.blood_pressure_systolic}/${data.blood_pressure_diastolic}`
                : '\u2014'}
            </span>
            <span className={styles.infoMeta}>
              {data?.blood_pressure_updated ? `Updated ${formatDate(data.blood_pressure_updated)}` : '\u2014'}
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.editForm}>
          <div className={styles.editRow}>
            <span className={styles.editLabel}>Height</span>
            <div className={styles.editInputGroup}>
              <input
                type="number"
                className={styles.editInput}
                value={editHeight}
                onChange={(e) => setEditHeight(e.target.value)}
                placeholder="0"
                step="any"
              />
              <select
                className={styles.unitSelect}
                value={editHeightUnit}
                onChange={(e) => setEditHeightUnit(e.target.value)}
              >
                <option value="cm">cm</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>
          <div className={styles.editRow}>
            <span className={styles.editLabel}>Weight</span>
            <div className={styles.editInputGroup}>
              <input
                type="number"
                className={styles.editInput}
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                placeholder="0"
                step="any"
              />
              <select
                className={styles.unitSelect}
                value={editWeightUnit}
                onChange={(e) => setEditWeightUnit(e.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>
          <div className={styles.editRow}>
            <span className={styles.editLabel}>Waistline</span>
            <div className={styles.editInputGroup}>
              <input
                type="number"
                className={styles.editInput}
                value={editWaistline}
                onChange={(e) => setEditWaistline(e.target.value)}
                placeholder="0"
                step="any"
              />
              <select
                className={styles.unitSelect}
                value={editWaistlineUnit}
                onChange={(e) => setEditWaistlineUnit(e.target.value)}
              >
                <option value="in">in</option>
                <option value="cm">cm</option>
              </select>
            </div>
          </div>
          <div className={styles.editRow}>
            <span className={styles.editLabel}>Body Fat</span>
            <div className={styles.editInputGroup}>
              <input
                type="number"
                className={styles.editInput}
                value={editBodyFat}
                onChange={(e) => setEditBodyFat(e.target.value)}
                placeholder="0"
                step="any"
                min="0"
                max="100"
              />
              <span className={styles.bpSeparator}>%</span>
            </div>
          </div>
          <div className={styles.editRow}>
            <span className={styles.editLabel}>Blood Pressure</span>
            <div className={styles.editInputGroup}>
              <input
                type="number"
                className={styles.editInputSm}
                value={editSystolic}
                onChange={(e) => setEditSystolic(e.target.value)}
                placeholder="SYS"
                min="0"
                max="300"
              />
              <span className={styles.bpSeparator}>/</span>
              <input
                type="number"
                className={styles.editInputSm}
                value={editDiastolic}
                onChange={(e) => setEditDiastolic(e.target.value)}
                placeholder="DIA"
                min="0"
                max="200"
              />
            </div>
          </div>
          <div className={styles.editRow}>
            <span className={styles.editLabel}>BMI</span>
            <span className={styles.bmiDisplay}>{editBmiStr}</span>
          </div>
          <div className={styles.editActions}>
            <Button variant="primary" onClick={saveMetrics} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="ghost" onClick={() => setEditingMetrics(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className={styles.divider} />

      {/* ── Health Checks ── */}
      <div className={styles.subHeader}>
        <div className={styles.subTitle}>Health Checks</div>
        {!editingChecks && (
          <button className={styles.editBtn} onClick={startEditChecks}>
            Edit
          </button>
        )}
      </div>

      {!editingChecks ? (
        <div className={styles.checksGrid}>
          <div className={styles.checkRow}>
            <span className={styles.checkLabel}>ULTM8 Assessment</span>
            <span className={styles.checkDate}>
              <span className={styles.checkPrefix}>Last:</span>
              {formatShortDate(assessmentLast)}
            </span>
            <span className={styles.checkDate}>
              <span className={styles.checkPrefix}>Next:</span>
              {formatShortDate(assessmentNext)}
            </span>
          </div>
          <div className={styles.checkRow}>
            <span className={styles.checkLabel}>Dental Check</span>
            <span className={data?.dental_last ? styles.checkDate : styles.checkDateDim}>
              <span className={styles.checkPrefix}>Last:</span>
              {formatShortDate(data?.dental_last ?? null)}
            </span>
            <span className={data?.dental_next ? styles.checkDate : styles.checkDateDim}>
              <span className={styles.checkPrefix}>Next:</span>
              {formatShortDate(data?.dental_next ?? null)}
            </span>
          </div>
          <div className={styles.checkRow}>
            <span className={styles.checkLabel}>Full Body Check</span>
            <span className={data?.eye_last ? styles.checkDate : styles.checkDateDim}>
              <span className={styles.checkPrefix}>Last:</span>
              {formatShortDate(data?.eye_last ?? null)}
            </span>
            <span className={data?.eye_next ? styles.checkDate : styles.checkDateDim}>
              <span className={styles.checkPrefix}>Next:</span>
              {formatShortDate(data?.eye_next ?? null)}
            </span>
          </div>
          <div className={styles.checkRow}>
            <span className={styles.checkLabel}>Cancer Check</span>
            <span className={data?.cancer_last ? styles.checkDate : styles.checkDateDim}>
              <span className={styles.checkPrefix}>Last:</span>
              {formatShortDate(data?.cancer_last ?? null)}
            </span>
            <span className={data?.cancer_next ? styles.checkDate : styles.checkDateDim}>
              <span className={styles.checkPrefix}>Next:</span>
              {formatShortDate(data?.cancer_next ?? null)}
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.editForm}>
          <div className={styles.checkEditRow}>
            <span className={styles.editLabel}>ULTM8 Assessment</span>
            <div className={styles.dateCol}>
              <span className={styles.dateLabelSm}>Last</span>
              <input
                type="date"
                className={styles.dateInput}
                value={assessmentLast ? assessmentLast.split('T')[0] : ''}
                disabled
              />
            </div>
            <div className={styles.dateCol}>
              <span className={styles.dateLabelSm}>Next</span>
              <input
                type="date"
                className={styles.dateInput}
                value={assessmentNext ? assessmentNext.split('T')[0] : ''}
                disabled
              />
            </div>
          </div>
          <div className={styles.checkEditRow}>
            <span className={styles.editLabel}>Dental Check</span>
            <div className={styles.dateCol}>
              <span className={styles.dateLabelSm}>Last</span>
              <input
                type="date"
                className={styles.dateInput}
                value={editDentalLast}
                onChange={(e) => setEditDentalLast(e.target.value)}
              />
            </div>
            <div className={styles.dateCol}>
              <span className={styles.dateLabelSm}>Next</span>
              <input
                type="date"
                className={styles.dateInput}
                value={editDentalNext}
                onChange={(e) => setEditDentalNext(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.checkEditRow}>
            <span className={styles.editLabel}>Full Body Check</span>
            <div className={styles.dateCol}>
              <span className={styles.dateLabelSm}>Last</span>
              <input
                type="date"
                className={styles.dateInput}
                value={editEyeLast}
                onChange={(e) => setEditEyeLast(e.target.value)}
              />
            </div>
            <div className={styles.dateCol}>
              <span className={styles.dateLabelSm}>Next</span>
              <input
                type="date"
                className={styles.dateInput}
                value={editEyeNext}
                onChange={(e) => setEditEyeNext(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.checkEditRow}>
            <span className={styles.editLabel}>Cancer Check</span>
            <div className={styles.dateCol}>
              <span className={styles.dateLabelSm}>Last</span>
              <input
                type="date"
                className={styles.dateInput}
                value={editCancerLast}
                onChange={(e) => setEditCancerLast(e.target.value)}
              />
            </div>
            <div className={styles.dateCol}>
              <span className={styles.dateLabelSm}>Next</span>
              <input
                type="date"
                className={styles.dateInput}
                value={editCancerNext}
                onChange={(e) => setEditCancerNext(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.editActions}>
            <Button variant="primary" onClick={saveChecks} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="ghost" onClick={() => setEditingChecks(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
