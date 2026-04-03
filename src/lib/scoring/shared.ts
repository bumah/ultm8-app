// Shared scoring constants and utilities

export const BTIERS = ['Needs improvement', 'Getting there', 'Strong', 'Ultimate'] as const;
export const BTIER_COLS = ['#ff3b2f', '#C8241A', '#C8241A', '#C8241A'];

export const HSTATUS = [
  'Needs improvement', 'Needs improvement',
  'Getting there', 'Getting there',
  'Strong', 'Strong',
  'Ultimate', 'Ultimate',
] as const;

export function getTierColor(score: number, maxScore: number = 8): string {
  const pct = score / maxScore;
  if (pct >= 0.875) return '#C8F135'; // Ultimate
  if (pct >= 0.625) return '#00D4AA'; // Strong
  if (pct >= 0.375) return '#F5A623'; // Getting there
  return '#e74c3c'; // Needs improvement
}

export function getBehaviourTierIndex(score: number): number {
  return Math.max(0, Math.min(3, score - 1));
}

export function getIndicatorStatusIndex(score: number): number {
  return Math.max(0, Math.min(7, score - 1));
}

export function computeWeightedScore(scores: number[], weights: number[]): number {
  return Math.round(
    scores.reduce((sum, score, i) => sum + (score / 8) * weights[i] * 100, 0)
  );
}

export function computeBehaviourPct(scores: number[]): number {
  const total = scores.reduce((a, b) => a + b, 0);
  return Math.round((total / 32) * 100);
}
