'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { assessmentApi } from '@/lib/api';
import { Users, Feather } from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ZAxis,
} from 'recharts';

// Simulated peer cluster data (anonymous archetypes)
const clusterData = {
  sprinters: {
    name: 'The All-Nighter Sprinters',
    description: 'High academic workload, intense pressure, chronic sleep shortage',
    color: '#DC2626', // Vibrant Crimson
    points: [
      { x: 4.2, y: 4.5, z: 65 }, { x: 4.0, y: 4.8, z: 72 }, { x: 3.8, y: 4.2, z: 58 },
      { x: 4.5, y: 4.0, z: 61 }, { x: 3.5, y: 4.6, z: 68 }, { x: 4.1, y: 3.9, z: 55 },
      { x: 4.3, y: 4.7, z: 70 }, { x: 3.9, y: 4.3, z: 62 }, { x: 4.4, y: 4.1, z: 59 },
    ],
    insight: 'Students in this archetype saw the steepest wellness rebounds when enforcing a strict 11:30 PM digital shutdown and switching to 50/10 study intervals.',
  },
  balancers: {
    name: 'The Overburdened Balancers',
    description: 'Moderate study load, irregular meal habits, elevated financial strain',
    color: '#D97706', // Amber Gold
    points: [
      { x: 5.5, y: 3.2, z: 52 }, { x: 6.0, y: 3.5, z: 48 }, { x: 5.8, y: 2.8, z: 56 },
      { x: 6.2, y: 3.0, z: 50 }, { x: 5.3, y: 3.4, z: 45 }, { x: 5.7, y: 2.5, z: 54 },
      { x: 6.1, y: 3.1, z: 47 }, { x: 5.9, y: 2.9, z: 51 },
    ],
    insight: 'Campus emergency micro-bursaries and subsidized student meal cards proved to be the most decisive relief mechanisms for this group.',
  },
  pacemakers: {
    name: 'The Steady Pacemakers',
    description: 'Consistent sleep rhythm, regular nutrition, manageable stress',
    color: '#059669', // Emerald Jade
    points: [
      { x: 7.5, y: 2.0, z: 28 }, { x: 7.0, y: 2.2, z: 32 }, { x: 7.8, y: 1.8, z: 22 },
      { x: 7.2, y: 2.5, z: 35 }, { x: 8.0, y: 1.5, z: 18 }, { x: 7.3, y: 2.1, z: 30 },
      { x: 7.6, y: 1.9, z: 25 }, { x: 7.1, y: 2.3, z: 33 }, { x: 7.9, y: 1.7, z: 20 },
    ],
    insight: 'This cohort maintains sustainable resilience through consistent daily vitals. Their primary growth area is deepening subjective course fulfillment.',
  },
};

export default function ClustersPage() {
  const { token, isEphemeral } = useAuth();
  const [userPoint, setUserPoint] = useState<{ x: number; y: number; z: number } | null>(null);
  const [userCluster, setUserCluster] = useState<string | null>(null);

  const fetchLatest = useCallback(async () => {
    let latestInput = null;
    let riskScore = 0;

    if (isEphemeral || !token) {
      try {
        const stored = typeof window !== 'undefined' ? sessionStorage.getItem('mindpulse_ephemeral_result') : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          latestInput = parsed.input;
          riskScore = parsed.riskScore;
        }
      } catch (e) {}
    } else {
      try {
        const latest = await assessmentApi.latest(token);
        if (latest.hasData && latest.input) {
          latestInput = latest.input;
          riskScore = latest.riskScore;
        }
      } catch (err) { console.error(err); }
    }

    if (latestInput) {
      const pt = {
        x: latestInput.sleepDuration,
        y: latestInput.academicPressure,
        z: riskScore,
      };
      setUserPoint(pt);

      // Determine closest cluster
      if (pt.x <= 5.0 && pt.y >= 3.5) setUserCluster('sprinters');
      else if (pt.x <= 6.5 && pt.y <= 3.5) setUserCluster('balancers');
      else setUserCluster('pacemakers');
    }
  }, [token, isEphemeral]);

  useEffect(() => { fetchLatest(); }, [fetchLatest]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          color: 'var(--accent-terracotta)',
          display: 'block',
          marginBottom: '0.25rem',
        }}>
          Anonymous Peer Mapping
        </span>
        <h1 className="font-serif" style={{ fontSize: '2.1rem', fontWeight: 500, letterSpacing: '-0.025em' }}>
          Where You Stand Among Student Profiles
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          University demands manifest in recognizable patterns. Here is where your lifestyle and recovery rhythms align with common student archetypes.
        </p>
      </div>

      {/* Scatter Chart */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '2rem' }}>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis
                type="number"
                dataKey="x"
                name="Sleep Duration"
                unit="h"
                domain={[3, 9]}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border-subtle)' }}
                label={{ value: 'Daily Sleep Duration (Hours)', position: 'bottom', fill: 'var(--text-secondary)', fontSize: 12, offset: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Academic Pressure"
                domain={[1, 5]}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border-subtle)' }}
                label={{ value: 'Perceived Academic Workload', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 12 }}
              />
              <ZAxis type="number" dataKey="z" range={[80, 220]} />
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-subtle)',
                }}
                formatter={(val: any, name: any) => {
                  if (name === 'Sleep Duration') return [`${val} hrs`, name];
                  if (name === 'Academic Pressure') return [`Level ${val}/5`, name];
                  return [val ?? '', name ?? ''];
                }}
              />

              {/* Cluster Scatters */}
              <Scatter name="All-Nighter Sprinters" data={clusterData.sprinters.points.map(p => ({ ...p }))} fill={clusterData.sprinters.color} opacity={0.65} />
              <Scatter name="Overburdened Balancers" data={clusterData.balancers.points.map(p => ({ ...p }))} fill={clusterData.balancers.color} opacity={0.65} />
              <Scatter name="Steady Pacemakers" data={clusterData.pacemakers.points.map(p => ({ ...p }))} fill={clusterData.pacemakers.color} opacity={0.65} />

              {/* User Point */}
              {userPoint && (
                <Scatter
                  name="You"
                  data={[userPoint]}
                  fill="var(--interactive)"
                  shape={(props: any) => {
                    const { cx, cy } = props;
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={14} fill="var(--safe)" fillOpacity={0.2} stroke="var(--safe)" strokeWidth={2}>
                          <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={cx} cy={cy} r={5} fill="var(--interactive)" stroke="#FFFFFF" strokeWidth={1.5} />
                      </g>
                    );
                  }}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cluster Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {Object.entries(clusterData).map(([key, cluster]) => {
          const isActive = userCluster === key;
          return (
            <div
              key={key}
              className="card"
              style={{
                borderColor: isActive ? cluster.color : 'var(--border-subtle)',
                background: isActive ? '#FFFFFF' : 'var(--sidebar-bg)',
                boxShadow: isActive ? 'var(--shadow-lifted)' : 'var(--shadow-subtle)',
                position: 'relative',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: cluster.color,
                  background: `${cluster.color}15`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  Current Placement
                </div>
              )}
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: cluster.color,
                marginBottom: '0.875rem',
              }} />
              <h3 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                {cluster.name}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '0.875rem', lineHeight: 1.4 }}>
                {cluster.description}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {cluster.insight}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
