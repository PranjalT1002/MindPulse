'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { assessmentApi } from '@/lib/api';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Feather } from 'lucide-react';

const pressureLabels: Record<number, string> = {
  1: 'Relaxed & Unhurried',
  2: 'Manageable Workload',
  3: 'Demanding Deadlines',
  4: 'High Sustained Strain',
  5: 'Overwhelming Pressure',
};

const satisfactionLabels: Record<number, string> = {
  1: 'Completely Disconnected',
  2: 'Low Fulfillment',
  3: 'Moderate Satisfaction',
  4: 'Engaged & Productive',
  5: 'Deeply Energized',
};

const financialLabels: Record<number, string> = {
  1: 'No Immediate Concern',
  2: 'Slight Discomfort',
  3: 'Moderate Everyday Stress',
  4: 'Significant Financial Strain',
  5: 'Severe Monetary Burden',
};

const socialLabels: Record<number, string> = {
  1: 'Completely Isolated',
  2: 'Limited Social Contact',
  3: 'Occasional Peer Connection',
  4: 'Supportive Friend Circle',
  5: 'Strong Trusted Community',
};

export default function AssessmentPage() {
  const { token, isEphemeral } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [academicPressure, setAcademicPressure] = useState(3);
  const [cgpa, setCgpa] = useState('7.0');
  const [studySatisfaction, setStudySatisfaction] = useState(3);
  const [sleepDuration, setSleepDuration] = useState(6.5);
  const [dietaryHabits, setDietaryHabits] = useState('Moderate');
  const [financialStress, setFinancialStress] = useState(2);
  const [familyHistory, setFamilyHistory] = useState('No');
  const [physicalActivity, setPhysicalActivity] = useState('Light');
  const [socialSupport, setSocialSupport] = useState(3);
  const [screenTime, setScreenTime] = useState(4.0);

  // Keyboard: Cmd/Ctrl+Enter to submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && step === 3) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, academicPressure, cgpa, studySatisfaction, sleepDuration, dietaryHabits, financialStress, familyHistory, physicalActivity, socialSupport, screenTime]);

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await assessmentApi.create({
        academicPressure,
        cgpa: parseFloat(cgpa) || 7.0,
        studySatisfaction,
        sleepDuration,
        dietaryHabits,
        financialStress,
        familyHistory,
        physicalActivity,
        socialSupport,
        screenTime,
        ephemeral: isEphemeral,
      }, token);

      // Always save to sessionStorage as reliable client state
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mindpulse_ephemeral_result', JSON.stringify({
          ...result,
          hasData: true,
          createdAt: new Date().toISOString(),
        }));
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const StepSelector = ({ value, onChange, labels }: { value: number; onChange: (v: number) => void; labels: Record<number, string> }) => (
    <div>
      <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="btn"
            onClick={() => onChange(n)}
            style={{
              flex: 1,
              padding: '0.75rem 0',
              borderRadius: 'var(--radius-md)',
              background: value === n ? 'var(--interactive)' : '#FFFFFF',
              color: value === n ? '#FFFFFF' : 'var(--text-primary)',
              border: `1px solid ${value === n ? 'var(--interactive)' : 'var(--border-subtle)'}`,
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: value === n ? '0 2px 8px rgba(44, 74, 62, 0.2)' : '0 1px 2px rgba(38, 34, 30, 0.02)',
              transition: 'all 0.15s ease',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={{
        marginTop: '0.625rem',
        fontSize: '0.8125rem',
        color: 'var(--accent-terracotta)',
        fontWeight: 500,
      }}>
        Level {value}: {labels[value] || ''}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.75rem 2.25rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--safe)', fontWeight: 600 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--safe)' }} />
            <span>Private Local Session</span>
          </div>
        </div>

        <span style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 700,
          color: 'var(--accent-terracotta)',
          display: 'block',
          marginBottom: '0.35rem',
        }}>
          Personal Wellness Reflection
        </span>
        <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 600, letterSpacing: '-0.025em' }}>
          Daily Wellness & Lifestyle Check-In
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.35rem', maxWidth: '640px' }}>
          Takes under 60 seconds. Calibrates your psychological strain score, detects root lifestyle triggers, and simulates counterfactual relief.
        </p>
      </div>

      {/* Stepper Progress */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem 1.75rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        {[
          { num: 1, label: 'Academic Rhythm' },
          { num: 2, label: 'Daily Vitals' },
          { num: 3, label: 'Personal Context' },
        ].map(({ num, label }, idx) => (
          <React.Fragment key={num}>
            {idx > 0 && (
              <div style={{
                flex: 1,
                height: '2px',
                background: step > num - 1 ? 'var(--interactive)' : 'var(--border-subtle)',
                transition: 'background 0.25s',
              }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div className={`step-dot ${step === num ? 'active' : step > num ? 'completed' : 'inactive'}`}>
                {step > num ? <Check size={15} /> : num}
              </div>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: step === num ? 700 : 500,
                color: step === num ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}>
                {label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="card animate-in" style={{ marginBottom: '2rem', padding: '2.75rem', boxShadow: 'var(--shadow-card)' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Academic Pressure
              </label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                How intensely are coursework, projects, and upcoming exam deadlines weighing on you right now?
              </p>
              <StepSelector value={academicPressure} onChange={setAcademicPressure} labels={pressureLabels} />
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Current Cumulative CGPA
              </label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Used as a reference point for your academic context.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  className="input font-mono"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  style={{ maxWidth: '140px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 600 }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>scale of 0.00 – 10.00</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Study Satisfaction
              </label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Do you feel genuine engagement or fulfillment in your current major and learning path?
              </p>
              <StepSelector value={studySatisfaction} onChange={setStudySatisfaction} labels={satisfactionLabels} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Average Daily Sleep
                </label>
                <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--interactive)' }}>
                  {sleepDuration.toFixed(1)} hrs
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Your actual average nightly rest over the past 7 days (continuous sleep).
              </p>
              <input
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={sleepDuration}
                onChange={(e) => setSleepDuration(parseFloat(e.target.value))}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
              }}>
                <span>3.0 hrs (Severe shortage)</span>
                <span>6.5 hrs (Median)</span>
                <span>10.0 hrs (Restorative)</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Daily Meal Routine
              </label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
                Nutritional consistency stabilizes blood glucose and neurochemical stress resistance.
              </p>
              <div className="pill-group">
                {[
                  { val: 'Unhealthy', label: 'Irregular / Skipped' },
                  { val: 'Moderate', label: 'Mostly Regular' },
                  { val: 'Healthy', label: 'Healthy & Consistent' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    className={`pill-btn ${dietaryHabits === val ? 'active' : ''}`}
                    onClick={() => setDietaryHabits(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Physical Activity & Movement
              </label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
                Aerobic movement stimulates neurogenesis and naturally regulates elevated cortisol levels.
              </p>
              <div className="pill-group">
                {[
                  { val: 'Sedentary', label: 'Sedentary (Minimal movement)' },
                  { val: 'Light', label: 'Light (1–2 days/wk)' },
                  { val: 'Active', label: 'Active (3+ days/wk regular)' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    className={`pill-btn ${physicalActivity === val ? 'active' : ''}`}
                    onClick={() => setPhysicalActivity(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Non-Academic Screen Exposure
                </label>
                <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--interactive)' }}>
                  {screenTime.toFixed(1)} hrs/day
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Recreational media, social browsing, and bedtime phone usage that strain attention and sleep onset.
              </p>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={screenTime}
                onChange={(e) => setScreenTime(parseFloat(e.target.value))}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
              }}>
                <span>1.0 hr (Mindful / Low)</span>
                <span>4.0 hrs (Median)</span>
                <span>8.0+ hrs (High overload)</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Financial Worry
              </label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Degree of anxiety regarding tuition, housing, food security, or daily living expenses.
              </p>
              <StepSelector value={financialStress} onChange={setFinancialStress} labels={financialLabels} />
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Social Connection & Peer Support
              </label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Having trusted friends or confidants to confide in acts as a primary buffer against acute academic strain.
              </p>
              <StepSelector value={socialSupport} onChange={setSocialSupport} labels={socialLabels} />
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Family History of Mental Strain
              </label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
                Family history helps personalize your stress response profile.
              </p>
              <div className="pill-group" style={{ maxWidth: '240px' }}>
                {['No', 'Yes'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`pill-btn ${familyHistory === opt ? 'active' : ''}`}
                    onClick={() => setFamilyHistory(opt)}
                  >
                    {opt === 'No' ? 'None Reported' : 'Yes, Present'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div style={{
          padding: '0.875rem 1.125rem',
          background: 'var(--critical-bg)',
          border: '1px solid var(--critical-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          color: 'var(--critical)',
          marginBottom: '1.25rem',
        }}>
          {error}
        </div>
      )}

      {/* Navigation Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn btn-ghost"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          style={{ opacity: step === 1 ? 0.35 : 1 }}
        >
          <ArrowLeft size={15} />
          Previous Step
        </button>

        {step < 3 ? (
          <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
            Continue to {step === 1 ? 'Daily Vitals' : 'Personal Context'}
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={(e) => handleSubmit(e)}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing Lifestyle Rhythm…
              </>
            ) : (
              <>
                Compute Wellness Index
                <kbd className="font-mono" style={{ fontSize: '0.6875rem', opacity: 0.8, background: 'rgba(255,255,255,0.2)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                  ⌘↵
                </kbd>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
