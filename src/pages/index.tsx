import Link from 'next/link';
import useSWR from 'swr';
import { Matter } from '@/lib/types';
import { formatDate, sdltDaysRemaining } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function sdltBadge(completionDate: string | null | undefined) {
  const days = sdltDaysRemaining(completionDate);
  if (days === null) return <span className="badge badge-info">No date</span>;
  if (days < 0)  return <span className="badge badge-danger">{Math.abs(days)}d overdue</span>;
  if (days <= 3) return <span className="badge badge-warning">{days}d left</span>;
  return <span className="badge badge-success">{days}d left</span>;
}

export default function IndexPage() {
  const { data, error, isLoading } = useSWR<Matter[]>('/api/matters', fetcher);

  return (
    <>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <h1>Matters</h1>
        <Link href="/matters/new" className="btn btn-primary">+ New Matter</Link>
      </div>

      {isLoading && <p className="text-muted">Loading matters…</p>}
      {error && <p className="error-msg">Failed to load matters.</p>}

      {data && data.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">No matters yet.</p>
          <Link href="/matters/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Create your first matter
          </Link>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Reference</th>
                  <th>Completion</th>
                  <th>SDLT</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.title}</strong></td>
                    <td className="text-muted">{m.reference ?? '—'}</td>
                    <td>{formatDate(m.completion_date)}</td>
                    <td>{sdltBadge(m.completion_date)}</td>
                    <td>
                      <span className="badge badge-info">{m.status}</span>
                    </td>
                    <td>
                      <Link href={`/matters/${m.id}`} className="btn btn-primary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
