/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a ISO date string or Date object into a readable stadium-local timestamp.
 */
export function formatLocalTime(date: string | Date | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Formats duration in seconds into a friendly format (e.g. "4m 20s" or "12s").
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const remainingSecs = Math.round(seconds % 60);
  return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
}
