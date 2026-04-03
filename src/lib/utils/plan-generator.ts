import { HEALTH_PLAN } from '@/lib/data/health-plan';
import { WEALTH_PLAN } from '@/lib/data/wealth-plan';
import type { PlanBehaviour } from '@/types/database';

/**
 * Given an assessment's behaviour scores, build the plan_data JSONB
 * and generate progress rows.
 *
 * Health: 56 days × 8 behaviours = 448 daily rows (daily habits)
 * Wealth: 8 weeks × 8 behaviours = 64 weekly rows (one-time weekly tasks)
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

  const dailyRows: DailyRow[] = [];

  if (type === 'health') {
    // Health: 56 days × 8 behaviours = 448 daily rows
    for (let day = 0; day < 56; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      const weekNum = Math.floor(day / 7) + 1;
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
  } else {
    // Wealth: 8 weeks × 8 behaviours = 64 weekly rows
    // Each row's date = the Monday of that week (start of week)
    for (let week = 0; week < 8; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + week * 7);
      const dateStr = formatDate(weekStart);

      for (let b = 0; b < 8; b++) {
        dailyRows.push({
          date: dateStr,
          week_number: week + 1,
          behaviour_index: b,
          behaviour_name: planData[b].behaviour,
          target_text: planData[b].weekly_targets[week],
        });
      }
    }
  }

  return { planData, dailyRows };
}
