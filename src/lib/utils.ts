import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
