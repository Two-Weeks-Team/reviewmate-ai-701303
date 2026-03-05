import { getDashboardMetrics, getLeaderboard, getRepos, getSuggestionsPreview } from '@/lib/api';
import { MetricsPanel } from '@/components/MetricsPanel';
import { RepoConfigTable } from '@/components/RepoConfigTable';
import { SuggestionInbox } from '@/components/SuggestionInbox';

export default async function Page() {
  const [repos, metrics, leaderboard, suggestions] = await Promise.all([
    getRepos(),
    getDashboardMetrics('30d'),
    getLeaderboard(),
    getSuggestionsPreview()
  ]);

  return (
    <div className="container">
      <header className="header">
        <h1>ReviewMate AI</h1>
        <p>Repo-aware AI code review operations for GitHub PRs.</p>
      </header>

      <MetricsPanel metrics={metrics} leaderboard={leaderboard} />

      <section className="panel">
        <h2>Repository Review Policies</h2>
        <p className="muted">Tune confidence thresholds and posting mode to control review noise.</p>
        <RepoConfigTable repos={repos} />
      </section>

      <section className="panel">
        <h2>AI Suggestion Inbox (Preview + Feedback Loop)</h2>
        <p className="muted">Review generated findings before posting, then accept/reject to train ranking.</p>
        <SuggestionInbox suggestions={suggestions} />
      </section>
    </div>
  );
}
