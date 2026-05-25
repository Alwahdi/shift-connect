/**
 * Calculates the duration in hours between two time strings in HH:MM or HH:MM:SS format.
 * Falls back to 8 hours if parsing fails or duration is invalid.
 */
export function shiftDurationHours(startTime: string, endTime: string): number {
  try {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = sh * 60 + sm;
    let end = eh * 60 + em;
    if (end <= start) end += 24 * 60; // overnight shift
    const hours = (end - start) / 60;
    return hours > 0 && hours <= 24 ? hours : 8;
  } catch {
    return 8;
  }
}
