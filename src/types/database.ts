export interface Profile {
  id: string;
  name: string;
  gender: 'male' | 'female' | null;
  age_group: '18-29' | '30-44' | '45-59' | '60+' | null;
  date_of_birth: string | null;
  currency: string;
  onboarding_complete: boolean;
  // Baseline figures captured at onboarding, editable from /profile.
  monthly_income: number | null;     // monthly take-home, in profile currency
  monthly_expenses: number | null;   // monthly total expenses
  height_cm: number | null;          // height in cm
  created_at: string;
  updated_at: string;
}

/** Derive age group from DOB */
export function getAgeGroup(dob: string | null): '18-29' | '30-44' | '45-59' | '60+' {
  if (!dob) return '30-44';
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  if (age >= 60) return '60+';
  if (age >= 45) return '45-59';
  if (age >= 30) return '30-44';
  return '18-29';
}

export interface HealthAssessment {
  id: string;
  user_id: string;
  // 8 behaviour scores (1-4)
  b_sleep: number | null;
  b_smoking: number | null;
  b_strength: number | null;
  b_sweat: number | null;
  b_sugar: number | null;
  b_salt: number | null;
  b_spirits: number | null;
  b_stress: number | null;
  // 8 indicator raw values (nullable; filled via Trends)
  i_blood_pressure: number | null;
  i_blood_pressure_diastolic: number | null;
  i_weight: number | null;
  i_waist: number | null;
  i_resting_hr: number | null;
  i_body_fat: number | null;
  i_sleep_quality: number | null;
  i_blood_sugar: number | null;
  i_wellbeing: number | null;
  // 8 indicator scores (1-8)
  is_blood_pressure: number | null;
  is_weight: number | null;
  is_waist: number | null;
  is_resting_hr: number | null;
  is_body_fat: number | null;
  is_sleep_quality: number | null;
  is_blood_sugar: number | null;
  is_wellbeing: number | null;
  // Aggregates
  behaviour_score_pct: number;
  octagon_score_pct: number;
  gender_snapshot: string;
  age_group_snapshot: string;
  completed_at: string;
}

export interface WealthAssessment {
  id: string;
  user_id: string;
  // 8 behaviour scores (-1/0/+1/+2)
  b_active_income: number | null;
  b_passive_income: number | null;
  b_expenses: number | null;
  b_discretionary: number | null;
  b_savings: number | null;
  b_debt_repayment: number | null;
  b_retirement: number | null;
  b_investment: number | null;
  // 8 indicator scores (1-8, optional — filled from Trends)
  is_net_income: number | null;
  is_discretionary_spend: number | null;
  is_emergency_fund: number | null;
  is_debt_level: number | null;
  is_net_worth: number | null;
  is_pension_fund: number | null;
  is_fi_ratio: number | null;
  is_passive_income: number | null;
  // Aggregates
  behaviour_score_pct: number;
  octagon_score_pct: number;
  age_group_snapshot: string;
  currency_snapshot: string;
  completed_at: string;
}

export interface ActionPlan {
  id: string;
  user_id: string;
  assessment_type: 'health' | 'wealth';
  assessment_id: string;
  plan_data: PlanBehaviour[];
  start_date: string;
  is_active: boolean;
  created_at: string;
}

export interface PlanBehaviour {
  behaviour: string;
  direction: 'increase' | 'reduce' | 'maintain';
  weekly_targets: string[];
}

export interface DailyProgress {
  id: string;
  user_id: string;
  plan_id: string;
  date: string;
  week_number: number;
  behaviour_index: number;
  behaviour_name: string;
  target_text: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}
