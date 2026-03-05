export type Repo = {
  repo_id: string;
  owner: string;
  name: string;
  enabled: boolean;
  mode?: 'conservative' | 'balanced' | 'aggressive';
  confidence_threshold?: number;
  last_review_at?: string;
};

export type DashboardMetrics = {
  acceptance_rate: number;
  comments_posted: number;
  avg_time_to_merge_hours: number;
  top_issue_types: { category: string; count: number }[];
};

export type LeaderboardEntry = {
  key: string;
  accepted_suggestions: number;
  acceptance_rate: number;
};

export type Suggestion = {
  suggestion_id: string;
  category: 'bug' | 'security' | 'performance' | 'style' | 'maintainability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  title: string;
  file_path: string;
  message_md: string;
  status: 'open' | 'accepted' | 'rejected';
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${path}`);
  }

  return res.json();
}

export async function getRepos(): Promise<Repo[]> {
  const data = await request<{ items: Repo[] }>('/api/v1/repos');
  return data.items;
}

export async function getDashboardMetrics(range: '7d' | '30d' | '90d'): Promise<DashboardMetrics> {
  const data = await request<any>(`/api/v1/dashboard/metrics?range=${range}`);
  return {
    acceptance_rate: data?.series?.acceptance_rate?.at?.(-1)?.v ?? 0,
    comments_posted: data?.series?.suggestions_generated?.reduce((acc: number, p: { v: number }) => acc + p.v, 0) ?? 0,
    avg_time_to_merge_hours: data?.series?.time_to_merge_hours?.at?.(-1)?.v ?? 0,
    top_issue_types: data?.breakdowns?.top_issue_types ?? []
  };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const data = await request<{ items: LeaderboardEntry[] }>('/api/v1/dashboard/leaderboard?dimension=repo&limit=5');
  return data.items;
}

export async function getSuggestionsPreview(): Promise<Suggestion[]> {
  const review = await request<{ review_id: string }>('/api/v1/reviews/submit', {
    method: 'POST',
    body: JSON.stringify({
      owner: 'acme',
      repo: 'checkout-service',
      pr_number: 42,
      head_sha: 'latest',
      base_sha: 'base',
      trigger: 'manual_preview',
      publish_mode: 'preview'
    })
  });

  const data = await request<{ suggestions: Suggestion[] }>(`/api/v1/reviews/${review.review_id}/suggestions`);
  return data.suggestions.slice(0, 6);
}

export async function submitFeedback(suggestionId: string, verdict: 'accepted' | 'rejected'): Promise<void> {
  await request(`/api/v1/suggestions/${suggestionId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ verdict })
  });
}
