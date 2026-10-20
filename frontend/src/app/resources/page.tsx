'use client';

import React, { useState } from 'react';
import {
  Phone,
  GraduationCap,
  Clock,
  Heart,
  ExternalLink,
  MapPin,
  Landmark,
  ShieldAlert,
  Mail,
  UserCheck,
  Calendar,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ResourceItem {
  title: string;
  description: string;
  phone?: string;
  email?: string;
  action: string;
  actionType: 'tel' | 'email' | 'modal';
  hours: string;
  location?: string;
  leadStaff?: string;
  badge?: string;
}

interface ResourceSection {
  category: string;
  subtitle: string;
  icon: React.FC<any>;
  color: string;
  items: ResourceItem[];
}

const resources: ResourceSection[] = [
  {
    category: 'Immediate Crisis & 24/7 Triage',
    subtitle: 'Confidential human helplines & on-call crisis teams. Call whenever you feel overwhelmed.',
    icon: ShieldAlert,
    color: 'var(--critical)',
    items: [
      {
        title: 'Campus Emergency Response & Crisis Triage',
        description: '24/7 dedicated campus rapid-response line for psychiatric emergencies, physical safety, and acute distress triage.',
        phone: '+91 (080) 4122-9900',
        email: 'crisis-triage@campus.edu',
        action: 'Call Emergency Desk',
        actionType: 'tel',
        hours: '24/7 Immediate Dispatch',
        location: 'Emergency Care Pavilion, East Gate',
        leadStaff: 'Dr. Ananya Rao, MD (Chief Campus Medical Officer)',
        badge: 'Priority 24/7',
      },
      {
        title: 'Tele-MANAS National Psychological Line',
        description: 'Government of India 24/7 toll-free mental health helpline providing confidential trauma-informed counsel in 20+ languages.',
        phone: '14416 (or 1800-891-4416)',
        action: 'Call Toll-Free 14416',
        actionType: 'tel',
        hours: '24/7 Continuous Toll-Free',
        leadStaff: 'NIMHANS Tele-Psychiatry Grid',
        badge: 'National Helpline',
      },
      {
        title: 'iCall Psychosocial Helpline (TISS)',
        description: 'Psychologist-staffed non-judgmental counseling helpline operated by the Tata Institute of Social Sciences.',
        phone: '+91 91529 87821',
        email: 'icall@tiss.edu',
        action: 'Call +91 91529 87821',
        actionType: 'tel',
        hours: 'Mon–Sat: 8:00 AM – 10:00 PM',
        leadStaff: 'Licensed Clinical Psychologists (TISS)',
        badge: 'Peer Verified',
      },
    ],
  },
  {
    category: 'Campus Health, Counseling & Psychiatric Support',
    subtitle: 'Professional in-person consultations, routine therapy, and student solidarity circles.',
    icon: Heart,
    color: 'var(--safe)',
    items: [
      {
        title: 'Student Wellness & Psychological Consultation Center',
        description: 'Confidential 1-on-1 psychotherapy sessions for anxiety, mood concerns, sleep disruption, and social transitions. Walk-in slots daily.',
        phone: '+91 (080) 4122-3410',
        email: 'counseling@campus.edu',
        action: 'Request Wellness Slot',
        actionType: 'modal',
        hours: 'Mon–Fri: 8:30 AM – 6:30 PM (Walk-ins: 11 AM – 1 PM)',
        location: 'Wellness Block B, Suite 104',
        leadStaff: 'Prof. Rajesh K. Nair, Ph.D. & 4 Clinical Counselors',
        badge: 'Free & Confidential',
      },
      {
        title: 'Psychiatric Care & Pharmacotherapy Clinic',
        description: 'Specialist medical appointments for medication management, somatic anxiety symptoms, and neurodivergence accommodations (ADHD/ASD).',
        phone: '+91 (080) 4122-3415',
        email: 'psychiatry@campus.edu',
        action: 'Book Medical Consult',
        actionType: 'modal',
        hours: 'Tue, Thu & Sat: 10:00 AM – 4:00 PM',
        location: 'University Health Complex, Ground Floor',
        leadStaff: 'Dr. Shalini Mehta, MD (Psychiatry)',
      },
      {
        title: 'Peer Pacing & Exam Decompression Circles',
        description: 'Weekly student-led peer circles sharing evidence-based grounding techniques, exam anxiety management, and burnout recovery.',
        phone: '+91 (080) 4122-3490',
        email: 'peercare@campus.edu',
        action: 'Join Student Circle',
        actionType: 'modal',
        hours: 'Every Tuesday & Thursday at 5:15 PM',
        location: 'Central Library, Solarium Room 208',
        leadStaff: 'Student Welfare Peer Mentorship Guild',
        badge: 'Student-Led',
      },
    ],
  },
  {
    category: 'Financial Relief & Emergency Bursaries',
    subtitle: 'Need-based emergency aid, subsidized nutrition, and textbook grants handled with complete privacy.',
    icon: Landmark,
    color: 'var(--accent-ochre)',
    items: [
      {
        title: 'Dean of Student Welfare Emergency Micro-Bursary',
        description: 'Non-repayable direct institutional hardship grants (up to ₹25,000) for acute emergency living costs, sudden family loss, or medical crises.',
        phone: '+91 (080) 4122-5501',
        email: 'dsw-relief@campus.edu',
        action: 'Inquire Confidentially',
        actionType: 'modal',
        hours: 'Decisions dispatched within 48 business hours',
        location: 'Administrative Block, Office 12',
        leadStaff: 'Office of Dean of Student Welfare (Prof. V. Sharma)',
        badge: 'Non-Repayable Aid',
      },
      {
        title: 'Discreet Campus Dining & Nutrition Pass',
        description: 'Subsidized nutritious meal credits loaded automatically onto your RFID Student Card with zero public distinction at dining kiosks.',
        phone: '+91 (080) 4122-5510',
        email: 'dining-support@campus.edu',
        action: 'Request Meal Credits',
        actionType: 'modal',
        hours: 'Mon–Fri: 9:00 AM – 4:30 PM',
        location: 'Student Services Hub, Window 4',
        leadStaff: 'Student Dining Dignity Initiative',
      },
      {
        title: 'Courseware & Tech Equipment Lending Pool',
        description: 'Free semester loan of laptops, graphic calculators, scientific apparatus, and required physical textbooks for eligible students.',
        phone: '+91 (080) 4122-2240',
        email: 'tech-library@campus.edu',
        action: 'Reserve Device / Book',
        actionType: 'modal',
        hours: 'Mon–Sat: 9:00 AM – 8:00 PM',
        location: 'Digital Resource Center, Ground Floor',
        leadStaff: 'University Library Reserve Desk',
      },
    ],
  },
  {
    category: 'Academic Coaching & Pacing Assistance',
    subtitle: 'Tools, accommodations, and 1-on-1 guidance to break panic study cycles without all-nighters.',
    icon: GraduationCap,
    color: 'var(--interactive)',
    items: [
      {
        title: 'Center for Learning Strategy & Exam Pacing',
        description: 'Work with learning specialists to deconstruct overwhelming syllabi, establish Pomodoro intervals, and build manageable study rhythms.',
        phone: '+91 (080) 4122-7720',
        email: 'academic-coaching@campus.edu',
        action: 'Book Pacing Coach',
        actionType: 'modal',
        hours: 'Mon–Fri: 10:00 AM – 6:00 PM',
        location: 'Academic Commons, 3rd Floor',
        leadStaff: 'Dr. Priya Sundaram (Director of Academic Skills)',
      },
      {
        title: 'Peer Tutoring & Quantitative Assistance Hub',
        description: 'Drop-in collaborative tutoring across calculus, data structures, chemistry, and econometrics led by certified senior honor students.',
        phone: '+91 (080) 4122-7728',
        email: 'peertutors@campus.edu',
        action: 'Drop-In Schedule',
        actionType: 'modal',
        hours: 'Daily: 1:30 PM – 8:00 PM',
        location: 'Main Library, Collaborative Wing',
        leadStaff: 'Honor Society Student Tutors',
      },
      {
        title: 'Academic Disability & Medical Accommodation Registry',
        description: 'Confidential coordination of medical deferrals, extended testing windows, quiet exam seating, and attendance leniency for mental health needs.',
        phone: '+91 (080) 4122-7745',
        email: 'accommodations@campus.edu',
        action: 'Apply for Accommodations',
        actionType: 'modal',
        hours: 'Mon–Fri: 9:00 AM – 5:00 PM',
        location: 'Student Affairs Annex, Room 102',
        leadStaff: 'Office of Inclusive Learning & Access',
        badge: 'Official University Board',
      },
    ],
  },
];

export default function ResourcesPage() {
  const [activeModalItem, setActiveModalItem] = useState<ResourceItem | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Tomorrow Morning (9:00 AM - 12:00 PM)');
  const [note, setNote] = useState('');

  const handleOpenModal = (item: ResourceItem) => {
    setActiveModalItem(item);
    setRequestSent(false);
    setNote('');
  };

  const handleCloseModal = () => {
    setActiveModalItem(null);
    setRequestSent(false);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
  };

  return (
    <div>
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
          Campus Wellness & Support Network
        </span>
        <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 500, letterSpacing: '-0.025em' }}>
          Campus Support Services & Crisis Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.35rem', maxWidth: '720px', lineHeight: 1.6 }}>
          Direct campus offices, verified student relief programs, and confidential mental health contacts. Reach out via direct helpline or submit an inquiry right from this portal.
        </p>
      </div>

      {/* Directory Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {resources.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.category}>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                paddingBottom: '0.625rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={16} color={section.color} />
                  </div>
                  <h2 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {section.category}
                  </h2>
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  {section.subtitle}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}>
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '1.5rem',
                      position: 'relative',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    {item.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '1.25rem',
                          right: '1.25rem',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '999px',
                          background: 'var(--well)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)', paddingRight: item.badge ? '5rem' : '0' }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '1.25rem' }}>
                      {item.description}
                    </p>

                    {item.leadStaff && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.875rem',
                        padding: '0.375rem 0.625rem',
                        background: 'var(--well)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <UserCheck size={13} color="var(--interactive)" />
                        <span style={{ fontWeight: 500 }}>{item.leadStaff}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.875rem' }}>
                      {item.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          <Phone size={13} color="var(--interactive)" />
                          <span className="font-mono">{item.phone}</span>
                        </div>
                      )}
                      {item.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <Mail size={13} color="var(--text-tertiary)" />
                          <span className="font-mono">{item.email}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        <Clock size={13} />
                        <span>{item.hours}</span>
                      </div>
                      {item.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          <MapPin size={13} />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>

                    {item.actionType === 'tel' && item.phone ? (
                      <a
                        href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                        className="btn btn-ghost btn-sm"
                        style={{
                          textDecoration: 'none',
                          color: section.color,
                          borderColor: 'var(--border-subtle)',
                          width: '100%',
                          fontWeight: 600,
                          justifyContent: 'center',
                        }}
                      >
                        {item.action}
                        <Phone size={13} />
                      </a>
                    ) : item.actionType === 'email' && item.email ? (
                      <a
                        href={`mailto:${item.email}`}
                        className="btn btn-ghost btn-sm"
                        style={{
                          textDecoration: 'none',
                          color: section.color,
                          borderColor: 'var(--border-subtle)',
                          width: '100%',
                          fontWeight: 600,
                          justifyContent: 'center',
                        }}
                      >
                        {item.action}
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        className="btn btn-ghost btn-sm"
                        style={{
                          color: section.color,
                          borderColor: 'var(--border-subtle)',
                          width: '100%',
                          fontWeight: 600,
                          justifyContent: 'center',
                        }}
                      >
                        {item.action}
                        <Calendar size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Modal for Walk-Ins / Aid / Pacing */}
      {activeModalItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 1000,
        }}>
          <div className="card" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-card)',
          }}>
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
              }}
            >
              <X size={20} />
            </button>

            {!requestSent ? (
              <form onSubmit={handleSubmitRequest}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={18} color="var(--interactive)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--interactive)' }}>
                    Confidential Campus Booking
                  </span>
                </div>
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {activeModalItem.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Submit an inquiry directly to the service coordinator. Your request is kept private under campus student confidentiality protocols.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Student ID or Registered Email (Optional)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. STU-2024-8841 or leave blank for anonymous walk-in"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Preferred Consultation Window
                    </label>
                    <select
                      className="input-field"
                      value={preferredSlot}
                      onChange={(e) => setPreferredSlot(e.target.value)}
                    >
                      <option>Tomorrow Morning (9:00 AM - 12:00 PM)</option>
                      <option>Tomorrow Afternoon (1:00 PM - 4:00 PM)</option>
                      <option>This Week (Same-Day Drop-In Triage)</option>
                      <option>Urgent (Within 4 business hours)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Brief Context or Question (Optional)
                    </label>
                    <textarea
                      className="input-field"
                      rows={3}
                      placeholder="e.g., Looking for guidance on exam pacing or emergency meal pass eligibility..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Private Request
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'var(--safe-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}>
                  <CheckCircle2 size={28} color="var(--safe)" />
                </div>
                <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Request Logged Privately
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Your request has been routed to <strong>{activeModalItem.leadStaff || activeModalItem.title}</strong>. For walk-ins, you can also present directly at {activeModalItem.location || 'the department desk'}.
                </p>
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--well)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.5rem',
                }}>
                  {activeModalItem.phone && <div>Direct Telephone: <strong className="font-mono">{activeModalItem.phone}</strong></div>}
                  {activeModalItem.email && <div>Direct Inquiries: <strong className="font-mono">{activeModalItem.email}</strong></div>}
                </div>
                <button className="btn btn-primary" onClick={handleCloseModal} style={{ width: '100%' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
