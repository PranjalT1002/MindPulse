'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

const PUBLIC_PATHS = ['/', '/login'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isEphemeral, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicPage = PUBLIC_PATHS.includes(pathname);
  const isAuthenticated = !!user || isEphemeral;

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublicPage) {
      router.push('/');
    }
    if (isAuthenticated && isPublicPage) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, isPublicPage, router]);

  // Keyboard shortcut: N to open assessment
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        if (isAuthenticated && !isPublicPage) {
          e.preventDefault();
          router.push('/assessment');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAuthenticated, isPublicPage, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--canvas)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--safe-bg)',
            border: '1px solid var(--safe-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--safe)',
            boxShadow: 'var(--shadow-subtle)',
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'var(--safe)',
              animation: 'warmPulse 1.8s infinite',
            }} />
          </div>
          <span className="font-serif" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Opening MindPulse…</span>
        </div>
      </div>
    );
  }

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="main-content animate-in">
        {children}
      </main>
    </div>
  );
}
