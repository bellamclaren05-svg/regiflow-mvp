import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Requisition } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  matterId: string;
}

export default function RequisitionList({ matterId }: Props) {
  const key = `/api/requisitions?matter_id=${matterId}`;
  const { data, error, isLoading } = useSWR<Requisition[]>(key, fetcher);

  const [desc, setDesc] = useState('');
  const [raisedBy, setRaisedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!desc.trim()) { setFormError('Description is required.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matter_id: matterId, description: desc, raised_by: raisedBy }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Failed to create requisition');
      }
      setDesc('');
      setRaisedBy('');
      mutate(key);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Requisitions</h2>

      <form onSubmit={handleSubmit} className="mt-2">
        <div className="form-group">
          <label htmlFor="req-desc">Description *</label>
          <textarea
            id="req-desc"
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe the requisition…"
          />
        </div>
        <div className="form-group">
          <label htmlFor="req-by">Raised by</label>
          <input
            id="req-by"
            type="text"
            value={raisedBy}
            onChange={(e) => setRaisedBy(e.target.value)}
            placeholder="e.g. Land Registry"
          />
        </div>
        {formError && <p className="error-msg">{formError}</p>}
        <button className="btn btn-primary btn-sm" type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : '+ Add Requisition'}
        </button>
      </form>

      <div className="table-wrap mt-2">
        {isLoading && <p className="text-muted">Loading…</p>}
        {error && <p className="error-msg">Failed to load requisitions.</p>}
        {data && data.length === 0 && (
          <p className="text-muted">No requisitions yet.</p>
        )}
        {data && data.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Raised by</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td>{r.description}</td>
                  <td>{r.raised_by ?? '—'}</td>
                  <td>
                    <span className={`badge ${r.resolved ? 'badge-success' : 'badge-warning'}`}>
                      {r.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </td>
                  <td className="text-muted">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
