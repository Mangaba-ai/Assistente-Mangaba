import type { ColorOption } from '../types'

export const COLOR_OPTIONS: ColorOption[] = [
  { name: 'gray', class: 'bg-gray-500', hex: '#6B7280' },
  { name: 'slate', class: 'bg-slate-500', hex: '#64748B' },
  { name: 'zinc', class: 'bg-zinc-500', hex: '#71717A' },
  { name: 'neutral', class: 'bg-neutral-500', hex: '#737373' },
  { name: 'stone', class: 'bg-stone-500', hex: '#78716C' },
  { name: 'red', class: 'bg-red-500', hex: '#EF4444' },
  { name: 'orange', class: 'bg-orange-500', hex: '#F97316' },
  { name: 'amber', class: 'bg-amber-500', hex: '#F59E0B' },
  { name: 'yellow', class: 'bg-yellow-500', hex: '#EAB308' },
  { name: 'lime', class: 'bg-lime-500', hex: '#84CC16' },
  { name: 'green', class: 'bg-green-500', hex: '#22C55E' },
  { name: 'emerald', class: 'bg-emerald-500', hex: '#10B981' },
  { name: 'teal', class: 'bg-teal-500', hex: '#14B8A6' },
  { name: 'cyan', class: 'bg-cyan-500', hex: '#06B6D4' },
  { name: 'sky', class: 'bg-sky-500', hex: '#0EA5E9' },
  { name: 'blue', class: 'bg-blue-500', hex: '#3B82F6' },
  { name: 'indigo', class: 'bg-indigo-500', hex: '#6366F1' },
  { name: 'violet', class: 'bg-violet-500', hex: '#8B5CF6' },
  { name: 'purple', class: 'bg-purple-500', hex: '#A855F7' },
  { name: 'fuchsia', class: 'bg-fuchsia-500', hex: '#D946EF' },
  { name: 'pink', class: 'bg-pink-500', hex: '#EC4899' },
  { name: 'rose', class: 'bg-rose-500', hex: '#F43F5E' }
]

export const DEFAULT_COLOR = 'blue'

export const THEME_COLORS = {
  light: {
    background: '#FFFFFF',    // Fundo branco puro - exato ChatGPT
    sidebar: '#F7F7F8',      // Sidebar cinza claro - exato ChatGPT
    card: '#FFFFFF',         // Cards brancos - exato ChatGPT
    border: '#E5E5E5',       // Bordas sutis - exato ChatGPT
    text: '#212121',         // Texto principal escuro - exato ChatGPT
    textSecondary: '#737373', // Texto secundário - exato ChatGPT
    accent: '#F0F0F0',       // Elementos destacados - exato ChatGPT
    hover: '#F7F7F8',        // Hover states - exato ChatGPT
    input: '#F7F7F8'         // Inputs - exato ChatGPT
  },
  dark: {
    background: '#141414',    // Fundo escuro principal - exato ChatGPT
    sidebar: '#1A1A1A',      // Sidebar escura - exato ChatGPT
    card: '#1A1A1A',        // Cards escuros - exato ChatGPT
    border: '#2A2A2A',       // Bordas escuras - exato ChatGPT
    text: '#F2F2F2',         // Texto principal claro - exato ChatGPT
    textSecondary: '#A6A6A6', // Texto secundário - exato ChatGPT
    accent: '#2A2A2A',       // Elementos destacados - exato ChatGPT
    hover: '#2A2A2A',        // Hover states - exato ChatGPT
    input: '#1A1A1A'         // Inputs - exato ChatGPT
  }
}