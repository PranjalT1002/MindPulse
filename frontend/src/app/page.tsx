'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Shield, Sparkles, Feather, ArrowRight, Eye, EyeOff, Lock, HeartHandshake, Compass, Activity, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login, register, enterEphemeral } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--canvas)',
    }}>
      {/* Left Panel - Editorial Presentation */}
      <div style={{
        flex: 1.15,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '4rem 5rem',
        borderRight: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative Ambient Aura */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15, 118, 110, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Brand */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '3.5rem',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
            }}>
              <Feather size={20} strokeWidth={2.2} />
            </div>
            <div>
              <span className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', display: 'block', lineHeight: 1 }}>
                MindPulse
              </span>
              <span style={{ fontSize: '0.625rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                Student Well-Being Space
              </span>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '999px', marginBottom: '1.25rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0F766E' }} />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#0F766E',
              letterSpacing: '0.02em',
            }}>
              Holistic Reflection & Practical Habits
            </span>
          </div>

          <h1 style={{
            fontSize: '2.85rem',
            fontWeight: 700,
            lineHeight: 1.18,
            letterSpacing: '-0.035em',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
          }}>
            A calm, confidential space to understand your student strain.
          </h1>

          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: '2.5rem',
            maxWidth: '500px',
          }}>
            College deadlines compound quickly. MindPulse offers gentle 60-second reflections that evaluate your routine across sleep, nutrition, screen load, and coursework to prescribe actionable habit shifts.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
            {[
              { icon: Activity, label: 'Personalized strain reflection across academic and daily habits', color: '#0F766E' },
              { icon: Sparkles, label: 'Interactive Routine Lab to preview real-time stress relief', color: '#4F46E5' },
              { icon: Shield, label: 'Strict on-device privacy — confidential and never shared publicly', color: '#059669' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                }}>
                  <Icon size={17} color={color} strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Local Guarantee Badge */}
        <div style={{
          padding: '1.125rem 1.35rem',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          maxWidth: '500px',
          position: 'relative',
          zIndex: 1,
        }}>
          <CheckCircle2 size={20} color="#059669" strokeWidth={2.2} />
          <span style={{ fontSize: '0.8125rem', color: '#065F46', lineHeight: 1.55, fontWeight: 500 }}>
            <strong>Privacy Guarantee:</strong> Your information stays on this device. MindPulse keeps your wellness reflections completely private.
          </span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3.5rem',
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.75rem', boxShadow: 'var(--shadow-lifted)' }}>
          <h2 style={{
            fontSize: '1.85rem',
            marginBottom: '0.4rem',
            letterSpacing: '-0.025em',
            fontWeight: 700,
          }}>
            {isRegister ? 'Begin Your Journal' : 'Welcome Back'}
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem',
          }}>
            {isRegister ? 'Create your private on-device student profile.' : 'Sign in to access your calibrated wellness dashboard.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Alex Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Email Address
              </label>
              <input
                type="email"
                className="input"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'var(--critical-bg)',
                border: '1px solid var(--critical-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                color: 'var(--critical)',
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              {loading ? 'Authenticating…' : isRegister ? 'Create Private Profile' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {isRegister ? 'Already registered on this device?' : 'First time using MindPulse?'}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--interactive)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          {/* Ephemeral Guest Mode */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={enterEphemeral}
              style={{ width: '100%', fontSize: '0.8125rem', padding: '0.7rem' }}
            >
              <Lock size={14} color="var(--interactive)" />
              Try Anonymously (Guest Mode)
            </button>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', display: 'block' }}>
              No email required. Session evaporates upon tab close.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
