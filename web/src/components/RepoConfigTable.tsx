import { Repo } from '@/lib/api';

type Props = { repos: Repo[] };

export function RepoConfigTable({ repos }: Props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Repository</th>
          <th>Status</th>
          <th>Mode</th>
          <th>Confidence Threshold</th>
          <th>Last Analysis</th>
        </tr>
      </thead>
      <tbody>
        {repos.map((repo) => (
          <tr key={repo.repo_id}>
            <td>{repo.owner}/{repo.name}</td>
            <td><span className={`badge ${repo.enabled ? 'ok' : 'danger'}`}>{repo.enabled ? 'Enabled' : 'Disabled'}</span></td>
            <td>{repo.mode ?? 'conservative'}</td>
            <td>{repo.confidence_threshold?.toFixed(2) ?? '0.80'}</td>
            <td>{repo.last_review_at ? new Date(repo.last_review_at).toLocaleString() : 'No runs yet'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
