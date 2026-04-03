-- Add missing DELETE policies to all tables
-- Without these, RLS blocks delete operations

CREATE POLICY "Users can delete own health assessments"
  ON health_assessments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wealth assessments"
  ON wealth_assessments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON action_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON daily_progress FOR DELETE USING (auth.uid() = user_id);
