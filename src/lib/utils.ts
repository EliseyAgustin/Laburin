import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dos = (n: number) => String(n).padStart(2, '0');

export function fechaLocalISO(fecha: Date) {
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

export function datetimeLocalValue(fecha: Date) {
  return `${fechaLocalISO(fecha)}T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}

export function scoreBandClasses(score: number | null) {
  if (score === null) return 'bg-surface-container-low text-on-surface-variant border-outline-variant';
  if (score >= 75) return 'bg-success-container text-on-success-container border-success';
  if (score >= 50) return 'bg-warning-container text-on-warning-container border-warning';
  return 'bg-error-container text-on-error-container border-error';
}

export function scoreBorderClasses(score: number | null) {
  if (score === null) return 'border-t-outline-variant';
  if (score >= 75) return 'border-t-success';
  if (score >= 50) return 'border-t-warning';
  return 'border-t-error';
}
