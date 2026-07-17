/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const THEME = {
  colors: {
    // Premium FIFA Synapse Dark Palette
    background: {
      dark: 'bg-slate-950',
      card: 'bg-slate-900/60 border border-slate-800/80',
      cardHover: 'hover:bg-slate-900/80 hover:border-slate-700/80 transition-all duration-300',
    },
    brand: {
      primary: 'text-blue-500',
      primaryBg: 'bg-blue-500',
      primaryBorder: 'border-blue-500',
      accent: 'text-amber-500',
      accentBg: 'bg-amber-500',
    },
    text: {
      primary: 'text-slate-100',
      secondary: 'text-slate-400',
      muted: 'text-slate-500',
    },
    status: {
      success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
  },
  animation: {
    transitionDefault: 'transition-all duration-200 ease-in-out',
    hoverScale: 'hover:scale-[1.02] active:scale-[0.98]',
  },
  fonts: {
    sans: 'font-sans',
    mono: 'font-mono',
  },
};
