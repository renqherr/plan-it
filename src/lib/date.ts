import { getLang } from '../i18n/i18n';

const localeOf = () => (getLang() === 'es' ? 'es-ES' : 'en-US');

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Whole-day difference (target - today); negative = past, 0 = today, 1 = tomorrow. */
function dayDelta(iso: string): number {
  const today = startOfDay(new Date()).getTime();
  const target = startOfDay(new Date(iso)).getTime();
  return Math.round((target - today) / 86_400_000);
}

/** An incomplete task is overdue if its scheduled time is before now. */
export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

export function hasTime(iso: string): boolean {
  const d = new Date(iso);
  return d.getHours() !== 0 || d.getMinutes() !== 0;
}

/** Human label like "Today 14:30", "Tomorrow", "Mon, 12 Aug". */
export function formatSchedule(iso: string): string {
  const d = new Date(iso);
  const delta = dayDelta(iso);
  const time = hasTime(iso)
    ? new Intl.DateTimeFormat(localeOf(), { hour: '2-digit', minute: '2-digit' }).format(d)
    : '';

  let day: string;
  if (delta === 0) day = getLang() === 'es' ? 'Hoy' : 'Today';
  else if (delta === 1) day = getLang() === 'es' ? 'Mañana' : 'Tomorrow';
  else if (delta === -1) day = getLang() === 'es' ? 'Ayer' : 'Yesterday';
  else {
    day = new Intl.DateTimeFormat(localeOf(), {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(d);
  }
  return time ? `${day} · ${time}` : day;
}

/** Sort key: scheduled tasks ascend by time; unscheduled sort last. */
export function scheduleSortKey(iso: string | null): number {
  return iso ? new Date(iso).getTime() : Number.POSITIVE_INFINITY;
}

/** Convert an ISO string to the value a <input type="datetime-local"> expects. */
export function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert a datetime-local input value back to an ISO string (or null if empty). */
export function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
