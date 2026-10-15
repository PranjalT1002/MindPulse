'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { assessmentApi, whatIfApi, AssessmentResult } from '@/lib/api';
import {
  Plus,
  TrendingDown,
  TrendingUp,
  Moon,
  Wallet,
  BookOpen,
  Utensils,
  Frown,
  Clock,
  Apple,
  AlertTriangle,
  X,
  Sparkles,
  ChevronRight,
  FileDown,
  Compass,
  Heart,
  Feather,
  Activity,
  Users,
  Smartphone,
} from 'lucide-react';
import {
  ResponsiveContainer,
  Tooltip as ReTooltip,
  Area,
  AreaChart,
} from 'recharts';

const iconMap: Record<string, React.FC<any>> = {
  'moon': Moon,
  'wallet': Wallet,
  'book-open': BookOpen,
  'utensils': Utensils,
  'frown': Frown,
  'trending-down': TrendingDown,
  'clock': Clock,
  'apple': Apple,
  'hand-coins': Wallet,
  'activity': Activity,
  'users': Users,
  'smartphone': Smartphone,
};

function getTierClass(tier: string) {
  if (tier.includes('Critical')) return 'tier-critical';
  if (tier.includes('Elevated')) return 'tier-elevated';
  return 'tier-manageable';
}

function getTierColor(tier: string) {
  if (tier.includes('Critical')) return 'var(--critical)';
  if (tier.includes('Elevated')) return 'var(--elevated)';
  return 'var(--safe)';
}

export default function DashboardPage() {
  const { user, token, isEphemeral } = useAuth();
  const router = useRouter();

  const [latestData, setLatestData] = useState<(AssessmentResult & { hasData?: boolean; createdAt?: string }) | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [crisisDismissed, setCrisisDismissed] = useState(false);

  // What-If mini simulator state
  const [simSleep, setSimSleep] = useState(7.5);
  const [simDiet, setSimDiet] = useState('Healthy');
  const [simActivity, setSimActivity] = useState('Light');
  const [simSocial, setSimSocial] = useState(3.0);
  const [simScreen, setSimScreen] = useState(4.0);
  const [simResult, setSimResult] = useState<{ projectedScore: number; projectedTier: string } | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (isEphemeral || !token) {
      try {
        const stored = typeof window !== 'undefined' ? sessionStorage.getItem('mindpulse_ephemeral_result') : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          const assessmentData = {
            ...parsed,
            hasData: true,
            createdAt: parsed.createdAt || new Date().toISOString(),
          };
          setLatestData(assessmentData);
          setHistory([{
            id: 'ephemeral-1',
            riskScore: parsed.riskScore,
            sleepDuration: parsed.input?.sleepDuration || 7.0,
            createdAt: new Date().toISOString(),
          }]);
          if (parsed.input) {
            setSimSleep(parsed.input.sleepDuration);
            setSimDiet(parsed.input.dietaryHabits);
            if (parsed.input.physicalActivity) setSimActivity(parsed.input.physicalActivity);
            if (parsed.input.socialSupport) setSimSocial(parsed.input.socialSupport);
            if (parsed.input.screenTime !== undefined) setSimScreen(parsed.input.screenTime);
          }
        }
      } catch (err) {
        console.error('Failed to load ephemeral data:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const [latest, hist] = await Promise.all([
        assessmentApi.latest(token),
        assessmentApi.list(token),
      ]);
      setLatestData(latest);
      setHistory(hist);
      if (latest.hasData && latest.input) {
        setSimSleep(latest.input.sleepDuration);
        setSimDiet(latest.input.dietaryHabits);
        if (latest.input.physicalActivity) setSimActivity(latest.input.physicalActivity);
        if (latest.input.socialSupport) setSimSocial(latest.input.socialSupport);
        if (latest.input.screenTime !== undefined) setSimScreen(latest.input.screenTime);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [token, isEphemeral]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Run what-if simulation when sliders change
  useEffect(() => {
    if (!latestData?.hasData || !latestData.input) return;

    const timeout = setTimeout(async () => {
      setSimLoading(true);
      try {
        const res = await whatIfApi.simulate({
          ...latestData.input,
          sleepOverride: simSleep,
          dietOverride: simDiet,
          activityOverride: simActivity,
          socialOverride: simSocial,
          screenOverride: simScreen,
        }, token);
        setSimResult(res.simulated);
      } catch (err) {
        console.error('Sim error:', err);
      } finally {
        setSimLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [simSleep, simDiet, simActivity, simSocial, simScreen, latestData, token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>Opening your private journal…</p>
      </div>
    );
  }

  const hasData = latestData?.hasData;
  const sparkData = history.slice().reverse().map((a, i) => ({
    idx: i,
    score: a.riskScore,
    sleep: a.sleepDuration,
    date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // EMPTY STATE
  if (!hasData) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '2rem', fontWeight: 500, letterSpacing: '-0.02em' }}>
              Welcome, {user?.fullName?.split(' ')[0] || 'Friend'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.375rem' }}>
              {isEphemeral ? 'You are exploring in private Ephemeral mode.' : 'Your quiet rhythm overview and personal reflection ledger.'}
            </p>
          </div>
        </div>

        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4.5rem 2rem',
          textAlign: 'center',
          background: 'var(--sidebar-bg)',
          border: '1px dashed var(--border-medium)',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-subtle)',
          }}>
            <Feather size={26} color="var(--interactive)" strokeWidth={1.75} />
          </div>
          <h2 className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 500, marginBottom: '0.75rem' }}>
            No check-ins recorded yet
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9375rem',
            maxWidth: '460px',
            lineHeight: 1.65,
            marginBottom: '2rem',
          }}>
            Complete a quiet 60-second wellness reflection to understand your current psychological strain index, identify key triggers, and explore actionable habit shifts.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => router.push('/assessment')}
          >
            <Plus size={16} />
            Begin First Reflection
          </button>
        </div>
      </div>
    );
  }

  // POPULATED STATE
  const data = latestData!;
  const showCrisis = data.riskScore >= 75 && !crisisDismissed;
  const simProjected = simResult?.projectedScore ?? data.counterfactual.achievableScore;
  const simTier = simResult?.projectedTier ?? 'Manageable';
  const simDelta = data.riskScore - simProjected;

  return (
    <div>
      {/* Editorial Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        padding: '1.75rem 2rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-subtle)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--safe)',
            }} />
            <span style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
              color: 'var(--text-tertiary)',
            }}>
              Personal Well-Being Index
            </span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Overview & Cognitive Load
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Latest check-in recorded: {data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn btn-ghost"
            onClick={() => router.push('/history')}
            style={{ fontSize: '0.8125rem' }}
          >
            <FileDown size={14} />
            Counselor Summary
          </button>
          <button className="btn btn-primary" onClick={() => router.push('/assessment')}>
            <Plus size={15} />
            New Check-In
          </button>
        </div>
      </div>

      {/* Empathetic Crisis Alert */}
      {showCrisis && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.125rem 1.5rem',
          background: 'var(--critical-bg)',
          border: '1px solid var(--critical-border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-subtle)',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid var(--critical-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Heart size={18} color="var(--critical)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--critical)', fontWeight: 600 }}>
              Significant strain detected in your daily metrics.
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
              You don’t have to handle heavy weeks alone. Campus Counseling walk-in hours are 9 AM – 5 PM. 24/7 confidential student support is reachable anytime at <strong style={{ color: 'var(--text-primary)' }}>14416 (Tele-MANAS)</strong>.
            </p>
          </div>
          <button
            onClick={() => setCrisisDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top 2 Cards: Score + Triggers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Card 1: Strain Index */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={16} color="var(--interactive)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
                  Calibrated Psychological Strain
                </span>
              </div>
              <span className={`badge ${getTierClass(data.riskTier)}`} style={{ padding: '0.35rem 0.85rem' }}>
                {data.riskTier}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.85rem',
              marginBottom: '1rem',
              padding: '1rem 1.25rem',
              background: 'var(--well)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <span className="font-serif" style={{
                fontSize: '3.6rem',
                fontWeight: 700,
                color: getTierColor(data.riskTier),
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}>
                {data.riskScore}%
              </span>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                  Index Score
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Calibrated Lifestyle Load
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              {data.riskScore >= 65
                ? 'Your recent metrics indicate high fatigue and compounding academic deadlines. Prioritizing rest and meal consistency will make the largest immediate difference.'
                : data.riskScore >= 35
                ? 'Your strain is in an elevated zone. Targeted routine modifications can prevent further burnout before exam deadlines.'
                : 'Your current workload and recovery habits appear harmonized. Continue protecting your sleep cadence.'}
            </p>
          </div>

          {sparkData.length > 1 && (
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Recent Reflection Trend
              </div>
              <div style={{ height: '55px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={getTierColor(data.riskTier)} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={getTierColor(data.riskTier)} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke={getTierColor(data.riskTier)}
                      strokeWidth={2}
                      fill="url(#scoreGrad)"
                      dot={{ r: 3, fill: getTierColor(data.riskTier), stroke: '#FFFFFF', strokeWidth: 1.5 }}
                    />
                    <ReTooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-subtle)',
                      }}
                      formatter={(val: any) => [`${val}%`, 'Strain']}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Key Strain Triggers */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sparkles size={16} color="var(--accent-terracotta)" />
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
              Primary Drivers Contributing to Strain
            </div>
          </div>
          {data.triggers.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              No critical lifestyle triggers detected. Your current balance between study hours and restorative habits is well maintained.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {data.triggers.map((t, i) => {
                const Icon = iconMap[t.icon] || AlertTriangle;
                const impactColor = t.impact === 'High' ? 'var(--critical)' : 'var(--elevated)';
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.875rem',
                    padding: '0.75rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--well)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={15} color={impactColor} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t.factor}
                        </span>
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: impactColor,
                        }}>
                          {t.impact} Impact
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {t.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom 2 Cards: What-If + Action Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: '1.25rem' }}>
        {/* Card 3: What-If Simulator */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
              Habit Shift Explorer
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push('/what-if')}
              style={{ fontSize: '0.75rem' }}
            >
              Dedicated Lab <ChevronRight size={13} />
            </button>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Adjust your target routine to preview projected strain relief:
          </p>

          {/* Sleep Slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Target Restful Sleep</label>
              <span className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--interactive)' }}>
                {simSleep.toFixed(1)} hrs
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="0.5"
              value={simSleep}
              onChange={(e) => setSimSleep(parseFloat(e.target.value))}
            />
          </div>

          {/* Diet Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Meal Cadence
            </label>
            <div className="pill-group">
              {[
                { key: 'Unhealthy', label: 'Irregular' },
                { key: 'Moderate', label: 'Mostly Regular' },
                { key: 'Healthy', label: 'Consistent & Balanced' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`pill-btn ${simDiet === key ? 'active' : ''}`}
                  onClick={() => setSimDiet(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Physical Activity Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Physical Activity
            </label>
            <div className="pill-group">
              {[
                { key: 'Sedentary', label: 'Sedentary' },
                { key: 'Light', label: '1–2 Days' },
                { key: 'Active', label: '3+ Days (Active)' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`pill-btn ${simActivity === key ? 'active' : ''}`}
                  onClick={() => setSimActivity(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Time Slider */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Target Screen Exposure
              </label>
              <span className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--interactive)' }}>
                {simScreen.toFixed(1)} hrs
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              step="0.5"
              value={simScreen}
              onChange={(e) => setSimScreen(parseFloat(e.target.value))}
            />
          </div>

          {/* Projected Result */}
          <div className="card-well" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--sidebar-bg)',
          }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Projected Strain
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="font-serif" style={{
                  fontSize: '1.6rem',
                  fontWeight: 600,
                  color: getTierColor(simTier),
                }}>
                  {simLoading ? '…' : `${simProjected.toFixed(1)}%`}
                </span>
                <span className={`badge ${getTierClass(simTier)}`} style={{ fontSize: '0.6875rem' }}>
                  {simTier}
                </span>
              </div>
            </div>
            {simDelta > 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'var(--safe)',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: 'var(--safe-bg)',
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--safe-border)',
              }}>
                <TrendingDown size={15} />
                <span className="font-mono">▼ {simDelta.toFixed(1)}% relief</span>
              </div>
            ) : simDelta < 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'var(--critical)',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: 'var(--critical-bg)',
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--critical-border)',
              }}>
                <TrendingUp size={15} />
                <span className="font-mono">▲ {Math.abs(simDelta).toFixed(1)}% strain increase</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Card 4: Tailored Action Steps */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Compass size={16} color="var(--interactive)" />
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
              Empathetic Prescriptions & Guidance
            </div>
          </div>
          {data.guidance.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              No critical interventions required right now. Keep holding healthy boundaries around your personal downtime.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {data.guidance.map((g, i) => {
                const typeColor = g.type === 'resource' ? 'var(--accent-ochre)' : g.type === 'academic' ? 'var(--interactive)' : 'var(--safe)';
                const Icon = iconMap[g.icon] || Sparkles;
                return (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '0.875rem',
                    alignItems: 'flex-start',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: '0 1px 3px rgba(38, 34, 30, 0.03)',
                  }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'var(--well)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={16} color={typeColor} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {g.title}
                        </span>
                        <span style={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: typeColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: 'var(--well)',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px',
                        }}>
                          {g.type}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {g.action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
