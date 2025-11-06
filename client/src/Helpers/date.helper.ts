import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Format date to a readable string
 */
export const formatDate = (
  date: string | Date,
  format: string = 'MMM DD, YYYY'
): string => {
  return dayjs(date).format(format);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

/**
 * Check if date is valid
 */
export const isValidDate = (date: string | Date): boolean => {
  return dayjs(date).isValid();
};

/**
 * Get date in specific timezone
 */
export const getDateInTimezone = (
  date: string | Date,
  tz: string = 'America/New_York'
): string => {
  return dayjs(date).tz(tz).format();
};

/**
 * Get start of day
 */
export const getStartOfDay = (date?: string | Date): Date => {
  return dayjs(date).startOf('day').toDate();
};

/**
 * Get end of day
 */
export const getEndOfDay = (date?: string | Date): Date => {
  return dayjs(date).endOf('day').toDate();
};
