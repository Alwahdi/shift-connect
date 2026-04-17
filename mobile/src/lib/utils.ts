import { format, formatDistanceToNow, parseISO, isToday, isTomorrow } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatTimeAgo = (date: string): string => {
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
};

export const formatCurrency = (amount: number, currency = 'SAR'): string => {
  return `${currency} ${amount.toFixed(0)}`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getVerificationColor = (status: string | null, colors: any) => {
  switch (status) {
    case 'verified': return colors.verified;
    case 'pending': return colors.pending;
    case 'rejected': return colors.rejected;
    default: return colors.textTertiary;
  }
};

export const getBookingStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'confirmed':
    case 'completed':
    case 'checked_in':
    case 'checked_out':
      return colors.success;
    case 'pending':
    case 'accepted':
      return colors.warning;
    case 'declined':
    case 'cancelled':
      return colors.error;
    default:
      return colors.textSecondary;
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};
