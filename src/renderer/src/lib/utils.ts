import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatIsoDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatDataItaliana(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
