/**
 * Допоміжні функції для роботи з датами у форматі 'yyyy-MM-dd'
 * (саме такий рядок повертає <input type="date"> через ngModel).
 */

/** Сьогоднішня дата у форматі 'yyyy-MM-dd'. Використовується як [max] для date-інпутів. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** true, якщо рядок є коректною датою формату 'yyyy-MM-dd' */
export function isValidIsoDate(value: string | null | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

/** true, якщо дата у майбутньому відносно сьогодні */
export function isFutureIsoDate(value: string): boolean {
  return value > todayIso();
}

/** Дістає рік з дати 'yyyy-MM-dd' для показу у бейджах/таблицях. '—', якщо дати немає. */
export function extractYear(value: string | null | undefined): string {
  if (!value) return '—';
  const year = value.split('-')[0];
  return year?.length === 4 ? year : '—';
}