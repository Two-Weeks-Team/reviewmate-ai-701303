'use client';

import { useState } from 'react';
import { Suggestion, submitFeedback } from '@/lib/api';

type Props = { suggestions: Suggestion[] };

export function SuggestionInbox({ suggestions }: Props) {
  const [items, setItems] = useState(suggestions);

  async function handleFeedback(suggestionId: string, verdict: 'accepted' | 'rejected') {
    await submitFeedback(suggestionId, verdict);
    setItems((prev) => prev.map((s) => (s.suggestion_id === suggestionId ? { ...s, status: verdict } : s)));
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Issue</th>
          <th>Location</th>
          <th>Confidence</th>
          <th>Status</th>
          <th>Feedback</th>
        </tr>
      </thead>
      <tbody>
        {items.map((s) => (
          <tr key={s.suggestion_id}>
            <td>{s.category}</td>
            <td>
              <strong>{s.title}</strong>
              <div className="muted">{s.message_md}</div>
            </td>
            <td>{s.file_path}</td>
            <td>{Math.round(s.confidence * 100)}%</td>
            <td>
              <span className={`badge ${s.status === 'accepted' ? 'ok' : s.status === 'rejected' ? 'danger' : 'warn'}`}>
                {s.status}
              </span>
            </td>
            <td>
              <div className="actions">
                <button onClick={() => handleFeedback(s.suggestion_id, 'accepted')}>Accept</button>
                <button className="secondary" onClick={() => handleFeedback(s.suggestion_id, 'rejected')}>Reject</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
