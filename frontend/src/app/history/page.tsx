'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { assessmentApi, AssessmentRecord } from '@/lib/api';
import {
  History,
  FileDown,
  Printer,
  Feather,
  Calendar,
  Clock,
  Shield,
  Activity,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  X,
  FileText,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend,
} from 'recharts';

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

export default function HistoryPage() {
  const { user, token, isEphemeral } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async () => {
    if (isEphemeral || !token) {
      try {
        const stored = typeof window !== 'undefined' ? sessionStorage.getItem('mindpulse_ephemeral_result') : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          setAssessments([{
            id: 'ephemeral-1',
            academicPressure: parsed.input?.academicPressure || 3,
            cgpa: parsed.input?.cgpa || 7,
            studySatisfaction: parsed.input?.studySatisfaction || 3,
            sleepDuration: parsed.input?.sleepDuration || 7,
            dietaryHabits: parsed.input?.dietaryHabits || 'Moderate',
            financialStress: parsed.input?.financialStress || 2,
            familyHistory: parsed.input?.familyHistory || 'No',
            physicalActivity: parsed.input?.physicalActivity || 'Light',
            socialSupport: parsed.input?.socialSupport || 3,
            screenTime: parsed.input?.screenTime || 4,
            riskScore: parsed.riskScore,
            riskTier: parsed.riskTier,
            createdAt: parsed.createdAt || new Date().toISOString(),
          }]);
        }
      } catch (e) {}
      setLoading(false);
      return;
    }

    try {
      const data = await assessmentApi.list(token);
      setAssessments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, isEphemeral]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const chartData = assessments.slice().reverse().map((a) => ({
    date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    strain: a.riskScore,
    sleep: a.sleepDuration,
  }));

  const handlePrintPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadTxt = () => {
    if (assessments.length === 0) return;
    const latest = assessments[0];
    const content = `
MINDPULSE — CONFIDENTIAL STUDENT WELLNESS INTAKE SUMMARY
═════════════════════════════════════════════════════════════
Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Student: ${user ? user.fullName : 'Anonymous Student (Ephemeral Session)'}
Note: Generated on-device for direct submission to Campus Counseling or Student Health triage.

MOST RECENT CALIBRATED METRICS
─────────────────────────────────────────────
Date Recorded:          ${new Date(latest.createdAt).toLocaleDateString()}
Calibrated Strain:      ${latest.riskScore}% (${latest.riskTier})
Academic Workload:      Level ${latest.academicPressure} / 5
Cumulative CGPA:        ${latest.cgpa} / 10.0
Study Fulfillment:      Level ${latest.studySatisfaction} / 5
Nightly Rest Duration:  ${latest.sleepDuration} hours
Meal Regularity:        ${latest.dietaryHabits}
Financial Strain:       Level ${latest.financialStress} / 5
Peer Support / Network: Level ${latest.socialSupport || 3.0} / 5
Recreational Screen:    ${latest.screenTime || 4.0} hours/day
Family History Factor:  ${latest.familyHistory}

LONGITUDINAL OBSERVATIONS (${assessments.length} check-ins recorded)
─────────────────────────────────────────────
${assessments.map(a =>
  `${new Date(a.createdAt).toLocaleDateString().padEnd(12)} | Sleep: ${a.sleepDuration.toFixed(1)}h | Screen: ${(a.screenTime || 4).toFixed(1)}h | Strain: ${a.riskScore}% | Status: ${a.riskTier}`
).join('\n')}

─────────────────────────────────────────────
Local On-Device Private Journal. Kept strictly on this device.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindpulse-counselor-intake-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Loading reflection history…</p>
      </div>
    );
  }

  const latest = assessments.length > 0 ? assessments[0] : null;

  return (
    <div>
      {/* Print Stylesheet for Browser PDF Export */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #counselor-report-modal,
          #counselor-report-modal * {
            visibility: visible !important;
          }
          #counselor-report-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--accent-terracotta)',
            display: 'block',
            marginBottom: '0.25rem',
          }}>
            Longitudinal Reflections
          </span>
          <h1 className="font-serif" style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Past Trends & Rhythm History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Observe how periods of consistent sleep, screen boundaries, and study pacing directly alleviate psychological strain over time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn btn-ghost"
            onClick={handleDownloadTxt}
            disabled={assessments.length === 0}
            style={{ fontSize: '0.8125rem' }}
          >
            <FileDown size={14} />
            Raw Data [TXT]
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowPdfModal(true)}
            disabled={assessments.length === 0}
            style={{ fontSize: '0.8125rem' }}
          >
            <FileText size={15} />
            Counselor PDF Summary
          </button>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4.5rem 2rem', background: 'var(--well)' }}>
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
            <History size={24} color="var(--interactive)" />
          </div>
          <h2 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No History Recorded</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Complete your first daily reflection to begin logging your longitudinal wellness trends.
          </p>
        </div>
      ) : (
        <>
          {/* Dual-Axis Trend Chart */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
                  Rhythm Correlation
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
                  Psychological Strain vs. Nightly Sleep
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--interactive)' }} />
                  <span>Strain Score (%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-ochre)' }} />
                  <span>Sleep (Hours)</span>
                </div>
              </div>
            </div>

            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" domain={[0, 100]} stroke="var(--text-tertiary)" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 12]} stroke="var(--text-tertiary)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="strain" fill="rgba(37, 99, 235, 0.08)" stroke="var(--interactive)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="var(--accent-ochre)" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Check-In Logs */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Historical Check-In Records ({assessments.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Strain Score</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Sleep</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Screen</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Nutrition</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Academic Pressure</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', fontWeight: 700, color: getTierColor(a.riskTier) }}>
                        {a.riskScore}%
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-primary)' }}>
                        {a.sleepDuration} hrs
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-primary)' }}>
                        {a.screenTime !== undefined ? `${a.screenTime} hrs` : '4.0 hrs'}
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {a.dietaryHabits}
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-secondary)' }}>
                        Level {a.academicPressure} / 5
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        <span className={`badge ${getTierClass(a.riskTier)}`}>
                          {a.riskTier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── Printable PDF Counselor Intake Modal ────────────────────── */}
      {showPdfModal && latest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '780px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            position: 'relative',
          }}>
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 2rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: '#F8FAFC',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--interactive)" />
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Counselor Intake Clinical Summary (Print / Save as PDF)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button className="btn btn-primary btn-sm" onClick={handlePrintPdf}>
                  <Printer size={14} />
                  Print / Save as PDF
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div
              id="counselor-report-modal"
              ref={printRef}
              style={{
                padding: '2.5rem',
                overflowY: 'auto',
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#0F172A',
                background: '#FFFFFF',
              }}
            >
              {/* Report Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingBottom: '1.5rem',
                borderBottom: '2px solid #0F172A',
                marginBottom: '1.5rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                    }}>
                      M
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A' }}>
                      MindPulse Student Clinical Intake Summary
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#475569' }}>
                    Confidential Longitudinal Well-Being & Lifestyle Profile for Counseling Services
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748B' }}>
                  <div><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div><strong>Student Name:</strong> {user ? user.fullName : 'Anonymous Intake'}</div>
                  <div><strong>Source:</strong> Personal Wellness Journal</div>
                </div>
              </div>

              {/* Status Alert Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.125rem 1.5rem',
                background: latest.riskScore >= 65 ? '#FFF1F2' : latest.riskScore >= 35 ? '#FFFBEB' : '#ECFDF5',
                border: `1px solid ${latest.riskScore >= 65 ? '#FECDD3' : latest.riskScore >= 35 ? '#FDE68A' : '#A7F3D0'}`,
                borderRadius: '8px',
                marginBottom: '1.75rem',
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#475569' }}>
                    Presenting Psychological Strain Level
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: getTierColor(latest.riskTier) }}>
                    {latest.riskScore}% — {latest.riskTier}
                  </div>
                </div>
                <div style={{ textAlign: 'right', maxWidth: '320px', fontSize: '0.75rem', color: '#475569', lineHeight: 1.45 }}>
                  Evaluated across 10 key student lifestyle, restorative, and academic dimensions.
                </div>
              </div>

              {/* Core Biometric & Academic Breakdown */}
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', marginBottom: '0.75rem' }}>
                Primary Lifestyle & Academic Vitals (Most Recent Check-In)
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1.75rem',
              }}>
                {[
                  { label: 'Nightly Sleep Duration', value: `${latest.sleepDuration} hours / night` },
                  { label: 'Recreational Screen Time', value: `${latest.screenTime || 4.0} hours / day` },
                  { label: 'Academic Workload Pressure', value: `Level ${latest.academicPressure} of 5` },
                  { label: 'Cumulative Academic CGPA', value: `${latest.cgpa} / 10.0` },
                  { label: 'Meal Cadence & Nutrition', value: latest.dietaryHabits },
                  { label: 'Physical Movement Level', value: latest.physicalActivity || 'Light' },
                  { label: 'Social & Peer Support Net', value: `Level ${latest.socialSupport || 3} of 5` },
                  { label: 'Financial Stress Indicator', value: `Level ${latest.financialStress} of 5` },
                  { label: 'Course Fulfillment Level', value: `Level ${latest.studySatisfaction} of 5` },
                  { label: 'Reported Family History', value: latest.familyHistory === 'Yes' ? 'Predisposition Present' : 'None Reported' },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.8125rem',
                  }}>
                    <span style={{ color: '#64748B' }}>{label}</span>
                    <strong style={{ color: '#0F172A' }}>{value}</strong>
                  </div>
                ))}
              </div>

              {/* Longitudinal History Table */}
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', marginBottom: '0.75rem' }}>
                Longitudinal Assessment Track Record
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', marginBottom: '1.75rem' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Date</th>
                    <th style={{ padding: '0.5rem' }}>Strain %</th>
                    <th style={{ padding: '0.5rem' }}>Sleep</th>
                    <th style={{ padding: '0.5rem' }}>Screen</th>
                    <th style={{ padding: '0.5rem' }}>Academic Pressure</th>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.slice(0, 8).map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.45rem 0.5rem', color: '#475569' }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.45rem 0.5rem', fontWeight: 700, color: getTierColor(a.riskTier) }}>
                        {a.riskScore}%
                      </td>
                      <td style={{ padding: '0.45rem 0.5rem' }}>{a.sleepDuration}h</td>
                      <td style={{ padding: '0.45rem 0.5rem' }}>{(a.screenTime || 4).toFixed(1)}h</td>
                      <td style={{ padding: '0.45rem 0.5rem' }}>Level {a.academicPressure}/5</td>
                      <td style={{ padding: '0.45rem 0.5rem' }}>{a.riskTier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Counselor Consultation Signature Block */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr',
                gap: '2rem',
                borderTop: '1px solid #CBD5E1',
                paddingTop: '1.25rem',
                fontSize: '0.75rem',
                color: '#64748B',
              }}>
                <div>
                  <strong>Student Confidentiality Notice:</strong>
                  <p style={{ marginTop: '0.25rem', lineHeight: 1.45 }}>
                    This report was prepared by the student using the MindPulse self-reflection system. It is non-diagnostic and intended solely to facilitate structured intake conversations with certified mental health professionals.
                  </p>
                </div>
                <div style={{ borderLeft: '1px dashed #CBD5E1', paddingLeft: '1.25rem' }}>
                  <div style={{ height: '35px', borderBottom: '1px solid #94A3B8', marginBottom: '0.25rem' }} />
                  <div>Counselor / Clinician Signature</div>
                  <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.15rem' }}>Date Reviewed: _________________</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
