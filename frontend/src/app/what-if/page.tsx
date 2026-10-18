'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { assessmentApi, whatIfApi } from '@/lib/api';
import { Sliders, TrendingDown, TrendingUp, Lock, Unlock, Feather, ArrowLeft, Smartphone } from 'lucide-react';
import Link from 'next/link';

function getTierColor(tier: string) {
  if (tier.includes('Critical')) return 'var(--critical)';
  if (tier.includes('Elevated')) return 'var(--elevated)';
  return 'var(--safe)';
}

function getTierClass(tier: string) {
  if (tier.includes('Critical')) return 'tier-critical';
  if (tier.includes('Elevated')) return 'tier-elevated';
  return 'tier-manageable';
}

export default function WhatIfPage() {
  const { token, isEphemeral } = useAuth();
  const [baseline, setBaseline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Overrides
  const [sleepOverride, setSleepOverride] = useState(7.5);
  const [dietOverride, setDietOverride] = useState('Healthy');
  const [activityOverride, setActivityOverride] = useState('Active');
  const [socialOverride, setSocialOverride] = useState(4.0);
  const [screenOverride, setScreenOverride] = useState(4.0);
  const [simResult, setSimResult] = useState<{ projectedScore: number; projectedTier: string } | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const fetchBaseline = useCallback(async () => {
    if (isEphemeral || !token) {
      try {
        const stored = typeof window !== 'undefined' ? sessionStorage.getItem('mindpulse_ephemeral_result') : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          setBaseline(parsed);
          if (parsed.input) {
            setSleepOverride(parsed.input.sleepDuration);
            setDietOverride(parsed.input.dietaryHabits);
            if (parsed.input.physicalActivity) setActivityOverride(parsed.input.physicalActivity);
            if (parsed.input.socialSupport) setSocialOverride(parsed.input.socialSupport);
            if (parsed.input.screenTime !== undefined) setScreenOverride(parsed.input.screenTime);
          }
        }
      } catch (err) {
        console.error('Failed to load ephemeral baseline:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const latest = await assessmentApi.latest(token);
      if (latest.hasData) {
        setBaseline(latest);
        setSleepOverride(latest.input.sleepDuration);
        setDietOverride(latest.input.dietaryHabits);
        if (latest.input.physicalActivity) setActivityOverride(latest.input.physicalActivity);
        if (latest.input.socialSupport) setSocialOverride(latest.input.socialSupport);
        if (latest.input.screenTime !== undefined) setScreenOverride(latest.input.screenTime);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, isEphemeral]);

  useEffect(() => { fetchBaseline(); }, [fetchBaseline]);

  // Simulate on change
  useEffect(() => {
    if (!baseline?.input) return;
    const t = setTimeout(async () => {
      setSimLoading(true);
      try {
        const res = await whatIfApi.simulate({
          ...baseline.input,
          sleepOverride,
          dietOverride,
          activityOverride,
          socialOverride,
          screenOverride,
        }, token);
        setSimResult(res.simulated);
      } catch (err) { console.error(err); }
      finally { setSimLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [sleepOverride, dietOverride, activityOverride, socialOverride, screenOverride, baseline, token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Opening Routine Lab…</p>
      </div>
    );
  }

  if (!baseline) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4.5rem 2rem', background: 'var(--sidebar-bg)' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <Feather size={24} color="var(--interactive)" />
        </div>
        <h2 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Baseline Recorded</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Complete a quick reflection first to calibrate your baseline metrics.
        </p>
        <Link href="/assessment">
          <button className="btn btn-primary">Take First Check-In</button>
        </Link>
      </div>
    );
  }

  const projected = simResult?.projectedScore ?? baseline.riskScore;
  const projTier = simResult?.projectedTier ?? baseline.riskTier;
  const delta = baseline.riskScore - projected;

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.75rem 2.25rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0F766E' }} />
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--accent-terracotta)',
          }}>
            Routine & Habit Explorer
          </span>
        </div>
        <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
          Interactive Routine Sandbox & What-If Lab
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.35rem', maxWidth: '640px' }}>
          Simulate bidirectional adjustments across sleep, screen curfews, meal consistency, and physical activity to preview real-time strain impacts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1.5rem' }}>
        {/* Left: Baseline State (Immutable) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Lock size={14} color="var(--text-tertiary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
                Immutable Baseline Profile
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Academic Workload', value: `Level ${baseline.input.academicPressure} / 5` },
                { label: 'Cumulative CGPA', value: `${baseline.input.cgpa.toFixed(1)} / 10.0` },
                { label: 'Study Satisfaction', value: `Level ${baseline.input.studySatisfaction} / 5` },
                { label: 'Financial Stress', value: `Level ${baseline.input.financialStress} / 5` },
                { label: 'Family Predisposition', value: baseline.input.familyHistory === 'Yes' ? 'Reported' : 'None' },
                { label: 'Baseline Average Sleep', value: `${baseline.input.sleepDuration} hrs` },
                { label: 'Baseline Screen Exposure', value: `${baseline.input.screenTime !== undefined ? baseline.input.screenTime : 4.0} hrs` },
                { label: 'Baseline Nutrition', value: baseline.input.dietaryHabits },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.625rem 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Calibrated Strain
            </span>
            <div className="font-serif" style={{
              fontSize: '3rem',
              fontWeight: 600,
              color: getTierColor(baseline.riskTier),
              lineHeight: 1.1,
              marginTop: '0.25rem',
            }}>
              {baseline.riskScore}%
            </div>
            <span className={`badge ${getTierClass(baseline.riskTier)}`} style={{ marginTop: '0.5rem' }}>
              {baseline.riskTier}
            </span>
          </div>
        </div>

        {/* Right: Interactive Lab */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Unlock size={14} color="var(--interactive)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
                Targeted Routine Modifications
              </span>
            </div>

            {/* Sleep Slider */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Target Nightly Rest
                </label>
                <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--interactive)' }}>
                  {sleepOverride.toFixed(1)} hrs
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={sleepOverride}
                onChange={(e) => setSleepOverride(parseFloat(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                <span>3.0h (Deficit)</span>
                <span>7.5h (Optimal)</span>
                <span>10.0h</span>
              </div>
            </div>

            {/* Diet Selector */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Meal Regularity
              </label>
              <div className="pill-group">
                {[
                  { val: 'Unhealthy', label: 'Irregular / Skipped' },
                  { val: 'Moderate', label: 'Mostly Regular' },
                  { val: 'Healthy', label: 'Consistent & Balanced' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    className={`pill-btn ${dietOverride === val ? 'active' : ''}`}
                    onClick={() => setDietOverride(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Activity Selector */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Target Physical Activity
              </label>
              <div className="pill-group">
                {[
                  { val: 'Sedentary', label: 'Sedentary' },
                  { val: 'Light', label: 'Light (1–2 days)' },
                  { val: 'Active', label: 'Active (3+ days regular)' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    className={`pill-btn ${activityOverride === val ? 'active' : ''}`}
                    onClick={() => setActivityOverride(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Support Slider */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Target Peer Connection Level
                </label>
                <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--interactive)' }}>
                  Level {socialOverride.toFixed(0)} / 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={socialOverride}
                onChange={(e) => setSocialOverride(parseFloat(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                <span>Level 1 (Isolated)</span>
                <span>Level 3 (Moderate)</span>
                <span>Level 5 (Strong Support)</span>
              </div>
            </div>

            {/* Screen Time Slider */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Target Recreational Screen Time
                </label>
                <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--interactive)' }}>
                  {screenOverride.toFixed(1)} hrs/day
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={screenOverride}
                onChange={(e) => setScreenOverride(parseFloat(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                <span>1.0h (Minimal)</span>
                <span>3.0h (Balanced)</span>
                <span>10.0h (High Exposure)</span>
              </div>
            </div>
          </div>

          {/* Delta Projection Box */}
          <div className="card-well" style={{ textAlign: 'center', padding: '1.75rem', background: 'var(--sidebar-bg)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Projected Psychological Strain
            </span>
            <div className="font-serif" style={{
              fontSize: '3rem',
              fontWeight: 600,
              color: getTierColor(projTier),
              margin: '0.25rem 0',
            }}>
              {simLoading ? '…' : `${projected.toFixed(1)}%`}
            </div>
            <span className={`badge ${getTierClass(projTier)}`}>
              {projTier}
            </span>

            {delta > 0 ? (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.75rem 1rem',
                background: 'var(--safe-bg)',
                border: '1px solid var(--safe-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}>
                <TrendingDown size={18} color="var(--safe)" />
                <span className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--safe)' }}>
                  ▼ {delta.toFixed(1)}% Potential Strain Relief
                </span>
              </div>
            ) : delta < 0 ? (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.75rem 1rem',
                background: 'var(--critical-bg)',
                border: '1px solid var(--critical-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}>
                <TrendingUp size={18} color="var(--critical)" />
                <span className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--critical)' }}>
                  ▲ {Math.abs(delta).toFixed(1)}% Projected Strain Escalation
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
