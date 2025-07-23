import { format, addMilliseconds } from "date-fns";

/**
 * Formats a countdown time in milliseconds to a human-readable string
 * @param diff - Time difference in milliseconds
 * @returns Formatted countdown string (e.g., "12:34:56" or "05:30")
 */
export const formatCountdown = (diff: number): string => {
  if (diff <= 0) return "Ready now";

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    // Format as HH:MM:SS
    const baseDate = new Date(0); // Start from epoch
    const targetDate = addMilliseconds(baseDate, diff);
    return format(targetDate, "HH:mm:ss");
  }

  // Format as MM:SS (zero-padded)
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};
