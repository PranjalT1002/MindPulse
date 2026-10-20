'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { assessmentApi, accountApi } from '@/lib/api';
import { Settings, Shield, Trash2, AlertTriangle, Lock, User, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, token, isEphemeral, logout } = useAuth();
  const [purging, setPurging] = useState(false);
  const [purged, setPurged] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const handlePurge = async () => {
    if (!token) return;
    setPurging(true);
    try {
      await assessmentApi.purge(token);
      setPurged(true);
      setShowPurgeConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPurging(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      await accountApi.delete(token);
      logout();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          color: 'var(--accent-terracotta)',
          display: 'block',
          marginBottom: '0.25rem',
        }}>
          Preferences & Controls
        </span>
        <h1 className="font-serif" style={{ fontSize: '2.1rem', fontWeight: 500, letterSpacing: '-0.025em' }}>
          Privacy & Device Ledger
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          MindPulse is engineered for complete local confidentiality. Inspect your local profile and purge data anytime.
        </p>
      </div>

      {/* Profile Section */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <User size={15} color="var(--text-tertiary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
            Student Profile Details
          </span>
        </div>

        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Full Name</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.fullName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Campus Identifier / Email</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Profile Created</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {isEphemeral ? 'You are currently operating in Ephemeral Mode. No personal records are saved to disk.' : 'Not signed in.'}
          </p>
        )}
      </div>

      {/* Privacy & Local Data */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Shield size={15} color="var(--safe)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
            Data Custody & Guarantee
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          padding: '1rem 1.25rem',
          background: 'var(--safe-bg)',
          border: '1px solid var(--safe-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
        }}>
          <Lock size={18} color="var(--safe)" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--safe)' }}>
              Storage: Stored Privately on This Device (Local SQLite)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem', lineHeight: 1.45 }}>
              All assessment results, inputs, and password hashes reside strictly on your local disk. Zero cloud analytics or telemetric harvesting.
            </div>
          </div>
        </div>

        {token && !isEphemeral && (
          <>
            {/* Purge History */}
            {!showPurgeConfirm ? (
              <button
                className="btn btn-ghost"
                onClick={() => setShowPurgeConfirm(true)}
                disabled={purged}
                style={{ width: '100%', borderColor: 'var(--border-medium)', color: 'var(--accent-terracotta)' }}
              >
                <Trash2 size={15} />
                {purged ? 'Check-In Records Successfully Wiped' : 'Purge All My Check-In History'}
              </button>
            ) : (
              <div style={{
                padding: '1.125rem',
                background: 'var(--critical-bg)',
                border: '1px solid var(--critical-border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={15} color="var(--critical)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--critical)' }}>
                    Permanently wipe all past check-in rows from local database?
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <button className="btn btn-danger" onClick={handlePurge} disabled={purging} style={{ flex: 1 }}>
                    {purging ? 'Purging…' : 'Yes, Permanently Purge'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setShowPurgeConfirm(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Danger Zone */}
      {token && !isEphemeral && (
        <div className="card" style={{ borderColor: 'var(--critical-border)', padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertTriangle size={15} color="var(--critical)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--critical)' }}>
              Account Termination
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost" onClick={logout} style={{ flex: 1 }}>
              <LogOut size={15} />
              Sign Out
            </button>
            {!showDeleteConfirm ? (
              <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)} style={{ flex: 1 }}>
                <Trash2 size={15} />
                Delete Profile
              </button>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--critical)', fontWeight: 500 }}>Delete account and purge all data completely?</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount} disabled={deleting} style={{ flex: 1 }}>
                    {deleting ? 'Deleting…' : 'Confirm'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
