'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAgeGroup } from '@/types/database';
import Button from '@/components/ui/Button';
import SelectCard from '@/components/ui/SelectCard';
import InputField from '@/components/ui/InputField';
import styles from './onboarding.module.css';

type Step = 'gender' | 'dob' | 'currency' | 'baseline';

const CURRENCIES = [
  { value: '\u00a3', label: '\u00a3 GBP', sub: 'British Pound' },
  { value: '$', label: '$ USD', sub: 'US Dollar' },
  { value: '\u20ac', label: '\u20ac EUR', sub: 'Euro' },
];

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('gender');
  const [gender, setGender] = useState<string | null>(null);
  const [dob, setDob] = useState('');
  const [currency, setCurrency] = useState<string | null>(null);
  const [customCurrency, setCustomCurrency] = useState('');
  const [useCustomCurrency, setUseCustomCurrency] = useState(false);
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleComplete() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expired. Please sign in again.');
        setLoading(false);
        return;
      }
    }

    const userId = user?.id || (await supabase.auth.getSession()).data.session?.user?.id;
    if (!userId) {
      setError('Could not identify user. Please sign in again.');
      setLoading(false);
      return;
    }

    const finalCurrency = useCustomCurrency ? customCurrency : currency;
    const ageGroup = getAgeGroup(dob || null);

    const updateData: Record<string, unknown> = {
      gender,
      age_group: ageGroup,
      currency: finalCurrency,
      monthly_income: income ? parseFloat(income) : null,
      monthly_expenses: expenses ? parseFloat(expenses) : null,
      height_cm: height ? parseFloat(height) : null,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };
    if (dob) {
      updateData.date_of_birth = dob;
    }

    const { error: updateError } = await supabase.from('profiles').update(updateData).eq('id', userId);

    if (updateError) {
      console.error('Onboarding save failed:', updateError);
      setError('Failed to save. Please try again.');
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  }

  function handleNext() {
    if (step === 'gender') setStep('dob');
    else if (step === 'dob') setStep('currency');
    else if (step === 'currency') setStep('baseline');
    else handleComplete();
  }

  function handleBack() {
    if (step === 'dob') setStep('gender');
    else if (step === 'currency') setStep('dob');
    else if (step === 'baseline') setStep('currency');
  }

  const stepNumber =
    step === 'gender' ? 1 :
    step === 'dob' ? 2 :
    step === 'currency' ? 3 : 4;

  const finalCurrencyValue = useCustomCurrency ? customCurrency : currency;
  const canProceed =
    (step === 'gender' && gender) ||
    (step === 'dob' && dob) ||
    (step === 'currency' && finalCurrencyValue) ||
    (step === 'baseline' && income.trim() && expenses.trim() && height.trim());

  const derivedAgeGroup = dob ? getAgeGroup(dob) : null;
  const currencySymbol = finalCurrencyValue || '\u00a3';

  return (
    <div className={styles.container}>
      {error && <div style={{ background: 'rgba(200,36,26,0.15)', border: '1px solid rgba(200,36,26,0.3)', borderRadius: '3px', padding: '12px 16px', marginBottom: '1rem', fontSize: '13px', color: 'var(--red2)' }}>{error}</div>}
      <div className={styles.eyebrow}>Setup {'\u2014'} Step {stepNumber} of {TOTAL_STEPS}</div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${(stepNumber / TOTAL_STEPS) * 100}%` }} />
      </div>

      {step === 'gender' && (
        <>
          <h2 className={styles.heading}>Select your<br /><em>profile.</em></h2>
          <p className={styles.body}>Calibrates health thresholds like body fat, muscle mass, and performance benchmarks.</p>
          <div className={styles.grid2}>
            <SelectCard label="Male" selected={gender === 'male'} onClick={() => setGender('male')} />
            <SelectCard label="Female" selected={gender === 'female'} onClick={() => setGender('female')} />
          </div>
        </>
      )}

      {step === 'dob' && (
        <>
          <h2 className={styles.heading}>Date of<br /><em>birth.</em></h2>
          <p className={styles.body}>Your age adjusts health benchmarks and wealth targets like retirement pot expectations.</p>
          <div className={styles.dobWrap}>
            <input
              type="date"
              className={styles.dobInput}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min="1930-01-01"
            />
          </div>
          {derivedAgeGroup && (
            <div className={styles.dobResult}>
              Age group: <span>{derivedAgeGroup}</span>
            </div>
          )}
        </>
      )}

      {step === 'currency' && (
        <>
          <h2 className={styles.heading}>Your<br /><em>currency.</em></h2>
          <p className={styles.body}>Used to display your financial data throughout the app.</p>
          {!useCustomCurrency ? (
            <>
              <div className={styles.grid1}>
                {CURRENCIES.map((c) => (
                  <SelectCard
                    key={c.value}
                    label={c.label}
                    sub={c.sub}
                    selected={currency === c.value}
                    onClick={() => setCurrency(c.value)}
                  />
                ))}
              </div>
              <button
                className={styles.customToggle}
                onClick={() => { setUseCustomCurrency(true); setCurrency(null); }}
              >
                Use a different currency
              </button>
            </>
          ) : (
            <>
              <InputField
                label="Currency symbol"
                value={customCurrency}
                onChange={(e) => setCustomCurrency(e.target.value)}
                placeholder="e.g. \u20b9, R, kr, \u00a5"
              />
              <p className={styles.customHint}>Enter the symbol shown before amounts (e.g. {'\u20b9'} for INR, R for ZAR)</p>
              <button
                className={styles.customToggle}
                onClick={() => { setUseCustomCurrency(false); setCustomCurrency(''); }}
              >
                &larr; Back to common currencies
              </button>
            </>
          )}
        </>
      )}

      {step === 'baseline' && (
        <>
          <h2 className={styles.heading}>Your<br /><em>baseline.</em></h2>
          <p className={styles.body}>
            We use these to calculate your goal benchmarks {'\u2014'} waist target, emergency fund, FI ratio, net worth target.
            Editable any time from your profile.
          </p>

          <InputField
            label={`Monthly net income (${currencySymbol})`}
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="e.g. 4000"
            type="number"
          />
          <InputField
            label={`Monthly expenses (${currencySymbol})`}
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            placeholder="e.g. 2500"
            type="number"
          />
          <InputField
            label="Height (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 178"
            type="number"
          />
        </>
      )}

      <div className={styles.actions}>
        {step !== 'gender' && (
          <Button variant="ghost" onClick={handleBack}>
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed || loading}
          fullWidth={step === 'gender'}
        >
          {step === 'baseline' ? (loading ? 'Saving...' : 'Start') : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
