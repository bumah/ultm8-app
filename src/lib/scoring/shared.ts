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
