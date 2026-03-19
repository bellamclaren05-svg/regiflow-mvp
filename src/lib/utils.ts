import { addDays, differenceInCalendarDays, parseISO, isValid } from 'date-fns';

/**
 * Returns the SDLT submission deadline: completion_date + 14 calendar days.
 * Returns null if completion_date is absent or invalid.
 */
export function sdltDeadline(completionDate: string | null | undefined): Date | null {
  if (!completionDate) return null;
  const parsed = parseISO(completionDate);
  if (!isValid(parsed)) return null;
  return addDays(parsed, 14);
}

/**
 * Days remaining until the SDLT deadline (can be negative if overdue).
 */
export function sdltDaysRemaining(
  completionDate: string | null | undefined
): number | null {
  const deadline = sdltDeadline(completionDate);
  if (!deadline) return null;
  return differenceInCalendarDays(deadline, new Date());
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) return '—';
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
