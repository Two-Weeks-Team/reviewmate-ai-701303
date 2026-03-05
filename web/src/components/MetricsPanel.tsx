type Props = {
  metrics: {
    acceptance_rate: number;
    comments_posted: number;
    avg_time_to_merge_hours: number;
    top_issue_types: { category: string; count: number }[];
  };
  leaderboard: { key: string; accepted_suggestions: number; acceptance_rate: number }[];
};

export function MetricsPanel({ metrics, leaderboard }: Props) {
  return (
    <section className="panel">
      <h2>Quality & Velocity Dashboard (Last 30 Days)</h2>
      <div className="grid">
        <div className="card"><div className="muted">Suggestion Acceptance</div><div className="metric">{Math.round(metrics.acceptance_rate * 100)}%</div></div>
        <div className="card"><div className="muted">AI Comments Generated</div><div className="metric">{metrics.comments_posted}</div></div>
        <div className="card"><div className="muted">Avg Time to Merge</div><div className="metric">{metrics.avg_time_to_merge_hours.toFixed(1)}h</div></div>
      </div>
      <h3>Top Issue Categories</h3>
      <ul>
        {metrics.top_issue_types.map((x) => (
          <li key={x.category}>{x.category}: {x.count}</li>
        ))}
      </ul>
      <h3>Helpful Suggestion Leaderboard</h3>
      <ul>
        {leaderboard.map((x) => (
          <li key={x.key}>{x.key} — {x.accepted_suggestions} accepted ({Math.round(x.acceptance_rate * 100)}%)</li>
        ))}
      </ul>
    </section>
  );
}
