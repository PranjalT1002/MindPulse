'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Compass,
  Sliders,
  Users,
  History,
  LifeBuoy,
  Settings,
  Plus,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Feather,
  Sparkles,
} from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Overview', icon: Compass, badge: 'Live' },
  { href: '/what-if', label: 'Routine Lab', icon: Sliders },
  { href: '/clusters', label: 'Student Cohorts', icon: Users },
  { href: '/history', label: 'Past Rhythm', icon: History },
  { href: '/resources', label: 'Campus Support', icon: LifeBuoy, highlight: true },
  { href: '/settings', label: 'Privacy & Data', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isEphemeral, logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '0 1.5rem', marginBottom: '1.75rem' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #244237 0%, #193128 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FBF9F5',
              boxShadow: '0 3px 8px rgba(36, 66, 55, 0.25)',
            }}>
              <Feather size={17} strokeWidth={2.2} />
            </div>
            <div>
              <span className="font-serif" style={{
                fontSize: '1.4rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                display: 'block',
                lineHeight: 1.1,
              }}>
                MindPulse
              </span>
              <span style={{
                fontSize: '0.625rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
              }}>
                Well-Being Space
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Primary Action Button */}
      <div style={{ padding: '0 1.25rem', marginBottom: '1.25rem' }}>
        <Link href="/assessment" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
          <button className="btn btn-primary" style={{
            width: '100%',
            fontSize: '0.8125rem',
            padding: '0.7rem 1.1rem',
            justifyContent: 'space-between',
            borderRadius: 'var(--radius-md)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={15} strokeWidth={2.2} />
              <span>New Check-In</span>
            </span>
            <kbd className="font-mono" style={{
              fontSize: '0.625rem',
              background: 'rgba(255, 255, 255, 0.18)',
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontWeight: 600,
            }}>
              N
            </kbd>
          </button>
        </Link>
      </div>

      {/* Security Status Pill */}
      <div style={{
        margin: '0 1.25rem 1rem',
        padding: '0.4rem 0.85rem',
        borderRadius: 'var(--radius-sm)',
        background: isEphemeral ? 'var(--elevated-bg)' : '#FFFFFF',
        border: `1px solid ${isEphemeral ? 'var(--elevated-border)' : 'var(--border-subtle)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: isEphemeral ? 'var(--elevated)' : 'var(--text-secondary)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {isEphemeral ? <EyeOff size={13} strokeWidth={2} /> : <Lock size={12} color="var(--safe)" strokeWidth={2} />}
          <span style={{ fontWeight: 600 }}>
            {isEphemeral ? 'Guest Session' : 'Private Journal'}
          </span>
        </div>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: isEphemeral ? 'var(--elevated)' : 'var(--safe)',
        }} />
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.25rem 1.5rem 0.85rem' }} />

      {/* Navigation Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {navLinks.map(({ href, label, icon: Icon, badge, highlight }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon
                size={16}
                strokeWidth={isActive ? 2.2 : 1.7}
                color={isActive ? 'var(--interactive)' : highlight ? 'var(--accent-terracotta)' : 'currentColor'}
              />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && (
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px',
                  background: isActive ? 'var(--interactive-bg)' : 'var(--well)',
                  color: isActive ? 'var(--interactive)' : 'var(--text-tertiary)',
                  letterSpacing: '0.04em',
                }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          background: 'var(--well)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-serif)',
          flexShrink: 0,
        }}>
          {user ? user.fullName.charAt(0).toUpperCase() : isEphemeral ? 'G' : '—'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user ? user.fullName : isEphemeral ? 'Anonymous Guest' : '—'}
          </div>
          <div style={{
            fontSize: '0.6875rem',
            color: 'var(--text-tertiary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user ? user.email : isEphemeral ? 'Private Temporary Session' : ''}
          </div>
        </div>
        {(user || isEphemeral) && (
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--critical)';
              e.currentTarget.style.background = 'var(--critical-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
