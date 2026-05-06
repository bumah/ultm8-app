// Shared scoring constants and utilities.
// Aligned with the ULTM8 Challenge: each answer scores -1 / 0 / +1 / +2.
// 8 questions per pool → sum range -8..+16 → normalised 0..100 via
// pct = ((sum + 8) / 24) * 100.

export const TIER_LABELS = ['Needs improvement', 'Getting there', 'Strong', 'Ultimate'] as const;
export const TIER_KEYS = ['needs', 'getting', 'strong', 'ultimate'] as const;

// Legacy aliases (still referenced in places).
export const BTIERS = TIER_LABELS;
export const BGRADES = ['C', 'B', 'A', 'A+'] as const;
export const HSTATUS = [
  'Needs improvement', 'Needs improvement',
  'Getting there', 'Getting there',
  'Strong', 'Strong',
  'Ultimate', 'Ultimate',
] as const;

/** Tier index 0..3 from a -1/0/1/2 score. */
export function getBehaviourTierIndex(score: number): number {
  if (score >= 2) return 3;
  if (score >= 1) return 2;
  if (score >= 0) return 1;
  return 0;
}

export function getBehaviourGrade(score: number): string {
  return BGRADES[getBehaviourTierIndex(score)];
}

/** 0..7 status index from a signed score (still used by some legacy views). */
export function getIndicatorStatusIndex(score: number): number {
  // Map signed scores (-1..2) to a 0..7 index for backwards compatibility.
  // -1 -> 0, 0 -> 2, 1 -> 4, 2 -> 7.
  if (score >= 2) return 7;
  if (score >= 1) return 4;
  if (score >= 0) return 2;
  return 0;
}

/** Tint colour by tier — uses the orange/cream palette.
 *  Optional `_maxScore` retained for legacy call sites; ignored. */
export function getTierColor(score: number, _maxScore?: number): string {
  void _maxScore;
  const tier = getBehaviourTierIndex(score);
  if (tier === 3) return '#F8F6F1'; // Ultimate — cream
  if (tier === 2) return '#FFB783'; // Strong — orange soft
  if (tier === 1) return '#F08A47'; // Getting there — orange
  return '#FF9A4D';                 // Needs improvement — orange bright (urgent)
}

/** Map a signed -1/0/1/2 score onto the octagon's 1..8 ring range.
 *  Mirrors the standalone challenge: (s + 2) * 2  →  -1=2, 0=4, 1=6, 2=8. */
export function signedScoreToRing(score: number | null | undefined): number {
  const s = score == null ? 0 : score;
  return (s + 2) * 2;
}

/** Convert a sum of -1/0/1/2 scores across `count` items into a 0..100 percentage. */
export function computePctFromSigned(sum: number, count: number): number {
  // sum range = -count .. +2*count, total span = 3*count
  const pct = ((sum + count) / (3 * count)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/** Behaviour score percentage from 8 -1/0/1/2 answers. */
export function computeBehaviourPct(scores: number[]): number {
  const total = scores.reduce((a, b) => a + b, 0);
  return computePctFromSigned(total, scores.length);
}

/** Indicator score percentage from 8 -1/0/1/2 answers. */
export function computeIndicatorPct(scores: number[]): number {
  const total = scores.reduce((a, b) => a + b, 0);
  return computePctFromSigned(total, scores.length);
}

/** Combined octagon score: 60% behaviour + 40% indicator. */
export function computeCombinedPct(behaviourPct: number, indicatorPct: number): number {
  return Math.round(behaviourPct * 0.6 + indicatorPct * 0.4);
}

/** Legacy compute (8-score weighted) — used in a few results views. */
export function computeWeightedScore(scores: number[], weights: number[]): number {
  return Math.round(
    scores.reduce((sum, s, i) => sum + ((s + 1) / 3) * weights[i] * 100, 0),
  );
}

/** Overall rating label + tint from a percentage 0..100. */
export function getOverallRating(pct: number): { label: string; color: string } {
  if (pct >= 80) return { label: 'Ultimate', color: '#F8F6F1' };
  if (pct >= 60) return { label: 'Strong', color: '#FFB783' };
  if (pct >= 40) return { label: 'Getting there', color: '#F08A47' };
  return { label: 'Needs improvement', color: '#FF9A4D' };
}

/** A position on the 9-step ladder: Levels 1\u20138 + Ultimate. */
export interface Level {
  idx: number;        // 1..9 (9 = Ultimate)
  label: string;      // "Level 1".."Level 8" or "Ultimate"
  tierIdx: number;    // 0..3 -> needs / getting / strong / ultimate
  color: string;      // tier colour
}

/** Map a combined percentage 0..100 onto the file's 9-step ladder.
 *  Bands: 0\u201320 L1 \u00b7 20\u201330 L2 \u00b7 30\u201340 L3 \u00b7 40\u201350 L4 \u00b7
 *  50\u201360 L5 \u00b7 60\u201370 L6 \u00b7 70\u201380 L7 \u00b7 80\u201390 L8 \u00b7 90\u2013100 Ultimate. */
export function levelFromPct(pct: number): Level {
  let idx: number;
  if (pct < 20) idx = 1;
  else if (pct < 30) idx = 2;
  else if (pct < 40) idx = 3;
  else if (pct < 50) idx = 4;
  else if (pct < 60) idx = 5;
  else if (pct < 70) idx = 6;
  else if (pct < 80) idx = 7;
  else if (pct < 90) idx = 8;
  else idx = 9;

  let tierIdx: number;
  if (pct >= 80) tierIdx = 3;
  else if (pct >= 60) tierIdx = 2;
  else if (pct >= 40) tierIdx = 1;
  else tierIdx = 0;

  // Same tier palette as getOverallRating but indexed.
  const tierColors = ['#FF9A4D', '#F08A47', '#FFB783', '#F8F6F1'];

  return {
    idx,
    label: idx === 9 ? 'Ultimate' : `Level ${idx}`,
    tierIdx,
    color: tierColors[tierIdx],
  };
}
