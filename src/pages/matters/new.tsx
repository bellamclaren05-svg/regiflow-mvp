import { useState } from 'react';
import { useRouter } from 'next/router';

export default function NewMatterPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/matters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          reference: reference.trim() || undefined,
          completion_date: completionDate || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Failed to create matter');
      }
      const matter = await res.json();
      router.push(`/matters/${matter.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  return (
    <>
      <h1 style={{ marginBottom: '1.5rem' }}>New Matter</h1>
      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Matter Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 12 Acacia Avenue Purchase"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reference">File Reference</label>
            <input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. JS/2024/0042"
            />
          </div>
          <div className="form-group">
            <label htmlFor="completion_date">Completion Date</label>
            <input
              id="completion_date"
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
            />
            <span className="text-muted" style={{ fontSize: '.8rem' }}>
              SDLT 14-day deadline will be calculated from this date.
            </span>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Matter'}
          </button>
        </form>
      </div>
    </>
  );
}
