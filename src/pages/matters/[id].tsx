import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import { Matter } from '@/lib/types';
import SDLTCountdown from '@/components/SDLTCountdown';
import AP1Checklist from '@/components/AP1Checklist';
import RequisitionList from '@/components/RequisitionList';
import FileUpload from '@/components/FileUpload';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MatterDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: matter, error, isLoading } =
    useSWR<Matter>(id ? `/api/matters?id=${id}` : null, fetcher);

  if (isLoading) return <p className="text-muted">Loading matter…</p>;
  if (error || !matter || (matter as unknown as { error: string }).error) {
    return (
      <>
        <p className="error-msg">Matter not found.</p>
        <Link href="/">← Back to Matters</Link>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <div>
          <Link href="/" style={{ fontSize: '.875rem' }}>← All Matters</Link>
          <h1 style={{ marginTop: '.25rem' }}>{matter.title}</h1>
          {matter.reference && (
            <p className="text-muted">Ref: {matter.reference}</p>
          )}
        </div>
        <span className="badge badge-info">{matter.status}</span>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2>Matter Details</h2>
        <div className="mt-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem 2rem' }}>
          <div>
            <span className="text-muted">Completion Date</span>
            <div>{formatDate(matter.completion_date)}</div>
          </div>
          <div>
            <span className="text-muted">Created</span>
            <div>{formatDate(matter.created_at)}</div>
          </div>
        </div>
      </div>

      <SDLTCountdown completionDate={matter.completion_date} />
      <AP1Checklist />
      <RequisitionList matterId={matter.id} />
      <FileUpload />
    </>
  );
}
