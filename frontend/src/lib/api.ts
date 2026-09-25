const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions {
  method?: string;
  body?: any;
  token?: string | null;
}

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string, fullName: string) =>
    request('/api/auth/register', { method: 'POST', body: { email, password, fullName } }),

  login: (email: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }),

  me: (token: string) =>
    request('/api/auth/me', { token }),
};

// ─── Assessment ──────────────────────────────────────────
export interface AssessmentInput {
  academicPressure: number;
  cgpa: number;
  studySatisfaction: number;
  sleepDuration: number;
  dietaryHabits: string;
  financialStress: number;
  familyHistory: string;
  physicalActivity?: string; // "Sedentary", "Light", "Active"
  socialSupport?: number; // 1.0 to 5.0
  screenTime?: number; // Daily non-academic screen hours
  ephemeral?: boolean;
}

export interface AssessmentResult {
  id: string | null;
  ephemeral: boolean;
  riskScore: number;
  riskTier: string;
  triggers: Array<{
    factor: string;
    impact: string;
    description: string;
    icon: string;
  }>;
  counterfactual: {
    achievableScore: number;
    potentialReduction: number;
  };
  guidance: Array<{
    title: string;
    type: string;
    action: string;
    icon: string;
  }>;
  input: AssessmentInput;
}

export interface AssessmentRecord {
  id: string;
  academicPressure: number;
  cgpa: number;
  studySatisfaction: number;
  sleepDuration: number;
  dietaryHabits: string;
  financialStress: number;
  familyHistory: string;
  physicalActivity?: string;
  socialSupport?: number;
  screenTime?: number;
  riskScore: number;
  riskTier: string;
  createdAt: string;
}

export const assessmentApi = {
  create: (data: AssessmentInput, token?: string | null) =>
    request<AssessmentResult>('/api/assessment', { method: 'POST', body: data, token: token || undefined }),

  list: (token: string) =>
    request<AssessmentRecord[]>('/api/assessments', { token }),

  latest: (token: string) =>
    request<AssessmentResult & { hasData: boolean; createdAt?: string }>('/api/assessments/latest', { token }),

  purge: (token: string) =>
    request('/api/assessments', { method: 'DELETE', token }),
};

// ─── What-If ─────────────────────────────────────────────
export interface WhatIfInput extends AssessmentInput {
  sleepOverride?: number;
  dietOverride?: string;
  activityOverride?: string;
  socialOverride?: number;
  screenOverride?: number;
}

export interface WhatIfResult {
  baseline: AssessmentResult;
  simulated: {
    projectedScore: number;
    projectedTier: string;
  };
  delta: number;
}

export const whatIfApi = {
  simulate: (data: WhatIfInput, token?: string | null) =>
    request<WhatIfResult>('/api/what-if', { method: 'POST', body: data, token: token || undefined }),
};

// ─── Account ─────────────────────────────────────────────
export const accountApi = {
  delete: (token: string) =>
    request('/api/auth/account', { method: 'DELETE', token }),
};

// ─── Health ──────────────────────────────────────────────
export const healthApi = {
  check: () => request('/api/health'),
};
