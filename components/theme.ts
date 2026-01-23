// theme.ts
import { useMemo } from 'react';
import { useApp } from './AppContext';

export type ThemeMode = 'light' | 'dark';

export const light = {
  bg: '#f9fafb',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  subtext: '#6b7280',
  border: '#e5e7eb',

  input: '#f3f4f6',
  soft: '#f3f4f6',

  primary: '#00c056ff',
  primaryText: '#ffffff',
  primarySoft: '#d1fae5',

  danger: '#b91c1c',
  dangerSoft: '#fee2e2',

  // DODANE:
  overlay: 'rgba(0,0,0,0.35)'
};

export const dark = {
  bg: '#0b1220',
  card: '#111827',
  text: '#f9fafb',
  muted: '#9ca3af',
  subtext: '#9ca3af',
  border: '#1f2937',

  input: '#0f172a',
  soft: '#0f172a',

  primary: '#00c056ff',
  primaryText: '#ffffff',
  primarySoft: 'rgba(0,192,86,0.18)',

  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.18)',

  // DODANE:
  overlay: 'rgba(0,0,0,0.55)'
};

export function getColors(mode: ThemeMode) {
  return mode === 'dark' ? dark : light;
}

export function useTheme() {
  const { theme } = useApp();

  return useMemo(() => {
    const palette = getColors(theme);
    return {
      mode: theme,
      ...palette
    };
  }, [theme]);
}

export type ThemeColors = ReturnType<typeof useTheme>;
