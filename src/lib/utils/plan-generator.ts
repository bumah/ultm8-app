import { HEALTH_PLAN } from '@/lib/data/health-plan';
import { WEALTH_PLAN } from '@/lib/data/wealth-plan';
import type { PlanBehaviour } from '@/types/database';

/**
 * Given an assessment's behaviour scores, build the plan_data JSONB
 * and generate all daily_progress rows for 56 days (8 weeks).
 */

export interface GeneratedPlan {
  planData: PlanBehaviour[];
  dailyRows: DailyRow[];
}

export interface DailyRow {
  date: string;           // YYYY-MM-DD
  week_number: number;    // 1-8
  behaviour_index: number;
  behaviour_name: string;
  target_text: string;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getWeekNumber(dayIndex: number): number {
  return Math.floor(dayIndex / 7) + 1;
}

export function generatePlan(
  type: 'health' | 'wealth',
  behaviourScores: number[],  // 8 scores, each 1-4
  startDate: Date = new Date()
): GeneratedPlan {
  const planDefs = type === 'health' ? HEALTH_PLAN : WEALTH_PLAN;

  // Build plan_data: for each behaviour, pick the correct track based on score
  const planData: PlanBehaviour[] = planDefs.map((def, i) => {
    const score = behaviourScores[i] || 1;
    const trackIndex = Math.min(score - 1, 3); // 0-3
    return {
      behaviour: def.behaviour,
      direction: def.type === 'increase' ? 'increase' : def.type === 'reduce' ? 'reduce' : 'maintain',
      weekly_targets: def.plans[trackIndex],
    };
  });

  // Generate 56 days × 8 behaviours = 448 daily_progress rows
  const dailyRows: DailyRow[] = [];

  for (let day = 0; day < 56; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const weekNum = getWeekNumber(day);
    const dateStr = formatDate(date);

    for (let b = 0; b < 8; b++) {
      dailyRows.push({
        date: dateStr,
        week_number: weekNum,
        behaviour_index: b,
        behaviour_name: planData[b].behaviour,
        target_text: planData[b].weekly_targets[weekNum - 1],
      });
    }
  }

  return { planData, dailyRows };
}
