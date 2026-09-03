export interface CardThemePreset {
  id: string
  name: string
  bgColor: string // CSS color / gradient or Tailwind class
  textColor: string // CSS color or Tailwind class
  borderColor: string // CSS color or Tailwind class
  badgeBg: string // CSS color or Tailwind class
  badgeText: string // CSS color or Tailwind class
  borderRadius: string // e.g. "1rem" or "1.5rem"
  cardStyle: 'standard' | 'glass' | 'neon' | 'cyberpunk' | 'minimal'
}

export const DEFAULT_THEME_PRESETS: CardThemePreset[] = [
  {
    id: 'default-dark',
    name: 'Default Dark Slate',
    bgColor: '#1e293b',
    textColor: '#f8fafc',
    borderColor: '#334155',
    badgeBg: '#4f46e5',
    badgeText: '#ffffff',
    borderRadius: '1rem',
    cardStyle: 'standard',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    bgColor: '#0f172a',
    textColor: '#38bdf8',
    borderColor: '#06b6d4',
    badgeBg: '#f43f5e',
    badgeText: '#ffffff',
    borderRadius: '1.25rem',
    cardStyle: 'neon',
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism Velvet',
    bgColor: 'rgba(30, 27, 75, 0.75)',
    textColor: '#e0e7ff',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    badgeBg: '#6366f1',
    badgeText: '#ffffff',
    borderRadius: '1.5rem',
    cardStyle: 'glass',
  },
  {
    id: 'gold-luxury',
    name: 'Gold Luxury Premium',
    bgColor: '#18181b',
    textColor: '#fef08a',
    borderColor: '#eab308',
    badgeBg: '#ca8a04',
    badgeText: '#000000',
    borderRadius: '1.25rem',
    cardStyle: 'cyberpunk',
  },
]

const STORAGE_KEY = 'card_theme_presets_v1'
const ACTIVE_KEY = 'card_theme_active_id_v1'

export function getSavedPresets(): CardThemePreset[] {
  if (typeof window === 'undefined') return DEFAULT_THEME_PRESETS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return DEFAULT_THEME_PRESETS
}

export function savePresets(presets: CardThemePreset[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
    window.dispatchEvent(new Event('card_theme_changed'))
  } catch {}
}

export function getActiveTheme(): CardThemePreset {
  if (typeof window === 'undefined') return DEFAULT_THEME_PRESETS[0]
  const presets = getSavedPresets()
  try {
    const activeId = localStorage.getItem(ACTIVE_KEY)
    const found = presets.find((p) => p.id === activeId)
    if (found) return found
  } catch {}
  return presets[0] || DEFAULT_THEME_PRESETS[0]
}

export function setActiveThemeId(id: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ACTIVE_KEY, id)
    window.dispatchEvent(new Event('card_theme_changed'))
  } catch {}
}
