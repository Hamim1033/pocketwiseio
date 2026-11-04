import { DatePreset, DateRange } from './types';

export const toISO = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const todayISO = (): string => toISO(new Date());

const addDays = (iso: string, days: number): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toISO(date);
};

const addMonths = (iso: string, months: number): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(d, lastDay));
  return toISO(date);
};

export const PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
];

// Monday-start week
const weekBounds = (d: Date): { start: string; end: string } => {
  const day = d.getDay(); // 0 = Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() + mondayOffset);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + mondayOffset + 6);
  return { start: toISO(start), end: toISO(end) };
};

export const getDateRange = (preset: DatePreset, customStart?: string, customEnd?: string, now: Date = new Date()): DateRange => {
  const today = toISO(now);
  const monthStart = toISO(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  switch (preset) {
    case 'today': {
      const prev = addDays(today, -1);
      return { preset, start: today, end: today, prevStart: prev, prevEnd: prev, label: 'Today' };
    }
    case 'yesterday': {
      const prev = addDays(today, -1);
      const prevPrev = addDays(today, -2);
      return { preset, start: prev, end: prev, prevStart: prevPrev, prevEnd: prevPrev, label: 'Yesterday' };
    }
    case 'this_week': {
      const w = weekBounds(now);
      const prevW = weekBounds(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7));
      return { preset, start: w.start, end: w.end, prevStart: prevW.start, prevEnd: prevW.end, label: 'This Week' };
    }
    case 'last_week': {
      const prevW = weekBounds(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7));
      const prevPrevW = weekBounds(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14));
      return { preset, start: prevW.start, end: prevW.end, prevStart: prevPrevW.start, prevEnd: prevPrevW.end, label: 'Last Week' };
    }
    case 'this_month': {
      const prevM = addMonths(monthStart, -1);
      const prevME = addMonths(monthEnd, -1);
      return { preset, start: monthStart, end: monthEnd, prevStart: prevM, prevEnd: prevME, label: 'This Month' };
    }
    case 'last_month': {
      const prevM = addMonths(monthStart, -1);
      const prevME = addMonths(monthEnd, -1);
      return { preset, start: prevM, end: prevME, prevStart: addMonths(prevM, -1), prevEnd: addMonths(prevME, -1), label: 'Last Month' };
    }
    case 'last_3_months': {
      const start = addDays(monthStart, -1);
      const from = addMonths(start, -2);
      const prevFrom = addMonths(from, -3);
      const prevTo = addMonths(start, -3);
      return { preset, start: from, end: start, prevStart: prevFrom, prevEnd: prevTo, label: 'Last 3 Months' };
    }
    case 'last_6_months': {
      const start = addDays(monthStart, -1);
      const from = addMonths(start, -5);
      const prevFrom = addMonths(from, -6);
      const prevTo = addMonths(start, -6);
      return { preset, start: from, end: start, prevStart: prevFrom, prevEnd: prevTo, label: 'Last 6 Months' };
    }
    case 'this_year': {
      const start = toISO(new Date(now.getFullYear(), 0, 1));
      const end = toISO(new Date(now.getFullYear(), 11, 31));
      return {
        preset, start, end,
        prevStart: toISO(new Date(now.getFullYear() - 1, 0, 1)),
        prevEnd: toISO(new Date(now.getFullYear() - 1, 11, 31)),
        label: String(now.getFullYear()),
      };
    }
    case 'last_year': {
      return {
        preset,
        start: toISO(new Date(now.getFullYear() - 1, 0, 1)),
        end: toISO(new Date(now.getFullYear() - 1, 11, 31)),
        prevStart: toISO(new Date(now.getFullYear() - 2, 0, 1)),
        prevEnd: toISO(new Date(now.getFullYear() - 2, 11, 31)),
        label: String(now.getFullYear() - 1),
      };
    }
    case 'custom': {
      const start = customStart || today;
      const end = customEnd || today;
      const days = Math.max(1, daysBetween(start, end));
      return {
        preset, start, end,
        prevStart: addDays(start, -days),
        prevEnd: addDays(end, -days),
        label: `${start} → ${end}`,
      };
    }
    case 'all':
    default:
      return { preset: 'all', start: '0000-01-01', end: '9999-12-31', prevStart: '0000-01-01', prevEnd: '0000-01-01', label: 'All Time' };
  }
};

export const daysBetween = (a: string, b: string): number => {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86400000);
};

export const inRange = (date: string, start: string, end: string): boolean => date >= start && date <= end;

export const formatDateShort = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
