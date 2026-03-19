import { sdltDeadline, sdltDaysRemaining, formatDate } from '@/lib/utils';

interface Props {
  completionDate: string | null | undefined;
}

export default function SDLTCountdown({ completionDate }: Props) {
  const days = sdltDaysRemaining(completionDate);
  const deadline = sdltDeadline(completionDate);

  if (days === null || !deadline) {
    return (
      <div className="sdlt-box">
        <h3>SDLT 14-Day Deadline</h3>
        <p className="text-muted mt-1">No completion date set — deadline not calculable.</p>
      </div>
    );
  }

  const isOverdue = days < 0;
  const isUrgent = days >= 0 && days <= 3;
  const cls = isOverdue ? 'sdlt-box overdue' : isUrgent ? 'sdlt-box urgent' : 'sdlt-box';

  return (
    <div className={cls}>
      <h3>SDLT 14-Day Deadline</h3>
      <div className="flex items-center gap-3 mt-1">
        <span className="sdlt-days">{isOverdue ? `${Math.abs(days)}` : days}</span>
        <div>
          <div style={{ fontWeight: 600 }}>
            {isOverdue
              ? `day${Math.abs(days) !== 1 ? 's' : ''} overdue`
              : days === 0
              ? 'due TODAY'
              : `day${days !== 1 ? 's' : ''} remaining`}
          </div>
          <div className="text-muted">Deadline: {formatDate(deadline.toISOString())}</div>
        </div>
      </div>
    </div>
  );
}
