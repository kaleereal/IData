export interface AppUIThemePreset {
  id: string;
  name: string;
  description: string;
  iconStyle: 'minimal' | 'cyber_hud' | 'brutalist' | 'editorial' | 'glassmorphic';
  stickyStyle: 'frosted_glass' | 'cyber_matrix' | 'brutalist_sharp' | 'editorial_inset' | 'deep_glass';
  buttonStyle: 'rounded_soft' | 'chamfer_hud' | 'sharp_square' | 'classic_pill' | 'glass_pill';
  scoreBadgeStyle: 'pill_compact' | 'hud_bracket' | 'hard_rect' | 'serif_numeral' | 'glow_circle';
  cardShape: 'rounded_standard' | 'chamfer' | 'square_sharp' | 'editorial_border' | 'glass_ultra';
  borderRadius: string;
  borderWidth: string;
}

export interface AppColorThemePreset {
  id: string;
  name: string;
  description: string;
  background: string;
  secondary: string;
  primary: string;
  text: string;
  accent: string;
  buttonText: string;
  card?: string;
  surface?: string;
  border?: string;
  isDark?: boolean;
}

// 5 BUILT-IN UI THEMES (Struktur, Icon, Button, Sticky, Style Nilai - Bukan Warna)
export const BUILTIN_UI_THEMES: AppUIThemePreset[] = [
  {
    id: 'minimal_modern',
    name: 'Minimalis Modern',
    description: 'Bentuk membulat halus proporsional, ikon minimal garis bersih, dan badge skor pill kompak.',
    iconStyle: 'minimal',
    stickyStyle: 'frosted_glass',
    buttonStyle: 'rounded_soft',
    scoreBadgeStyle: 'pill_compact',
    cardShape: 'rounded_standard',
    borderRadius: '1rem',
    borderWidth: '1px',
  },
  {
    id: 'cyberpunk_hud',
    name: 'Cyberpunk HUD',
    description: 'Sudut terpotong (chamfered), bracket telemetri [95], garis batas tegas, dan sticky matrix.',
    iconStyle: 'cyber_hud',
    stickyStyle: 'cyber_matrix',
    buttonStyle: 'chamfer_hud',
    scoreBadgeStyle: 'hud_bracket',
    cardShape: 'chamfer',
    borderRadius: '0.25rem',
    borderWidth: '1.5px',
  },
  {
    id: 'neo_brutalist',
    name: 'Neo-Brutalist',
    description: 'Sudut kotak tajam 90 derajat, border 2.5px tegas berkarakter, dan bayangan blok solid.',
    iconStyle: 'brutalist',
    stickyStyle: 'brutalist_sharp',
    buttonStyle: 'sharp_square',
    scoreBadgeStyle: 'hard_rect',
    cardShape: 'square_sharp',
    borderRadius: '0px',
    borderWidth: '2.5px',
  },
  {
    id: 'classic_editorial',
    name: 'Classic Editorial',
    description: 'Gaya majalah klasik, garis pembatas berjarak proporsional, dan tipografi angka anggun.',
    iconStyle: 'editorial',
    stickyStyle: 'editorial_inset',
    buttonStyle: 'classic_pill',
    scoreBadgeStyle: 'serif_numeral',
    cardShape: 'editorial_border',
    borderRadius: '0.5rem',
    borderWidth: '1px',
  },
  {
    id: 'smooth_glassmorphic',
    name: 'Smooth Glassmorphic',
    description: 'Efek kaca tembus pandang mendalam (deep blur), border gradasi lembut, dan pill ultra-rounded.',
    iconStyle: 'glassmorphic',
    stickyStyle: 'deep_glass',
    buttonStyle: 'glass_pill',
    scoreBadgeStyle: 'glow_circle',
    cardShape: 'glass_ultra',
    borderRadius: '1.5rem',
    borderWidth: '1px',
  },
];

// 6 BUILT-IN COLOR THEMES (Warna Gelap Elegan Standar Dark Theme)
export const BUILTIN_COLOR_THEMES: AppColorThemePreset[] = [
  {
    id: 'midnight_gold',
    name: 'Midnight Gold (Default)',
    description: 'Palet malam elegan dengan latar biru malam pekat dan aksen emas menyala kontras tinggi.',
    background: '#0b0f19',
    secondary: '#151c2c',
    primary: '#d97706',
    text: '#f8fafc',
    accent: '#fbbf24',
    buttonText: '#ffffff',
    card: '#151c2c',
    surface: '#151c2c',
    border: '#232f48',
    isDark: true,
  },
  {
    id: 'cyber_neon_blue',
    name: 'Cyber Neon Blue',
    description: 'Gaya futuristik cyberpunk bernuansa biru pekat dengan aksen biru neon elektrik.',
    background: '#090d16',
    secondary: '#111827',
    primary: '#2563eb',
    text: '#f3f4f6',
    accent: '#38bdf8',
    buttonText: '#ffffff',
    card: '#111827',
    surface: '#111827',
    border: '#1e293b',
    isDark: true,
  },
  {
    id: 'dark_emerald',
    name: 'Dark Emerald',
    description: 'Latar hijau malam botani pekat dengan aksen zamrud bercahaya dan teks mint segar.',
    background: '#061412',
    secondary: '#0d2623',
    primary: '#059669',
    text: '#ecfdf5',
    accent: '#34d399',
    buttonText: '#ffffff',
    card: '#0d2623',
    surface: '#0d2623',
    border: '#163d38',
    isDark: true,
  },
  {
    id: 'crimson_velvet',
    name: 'Crimson Velvet',
    description: 'Nuansa gelap anggun beludru merah dengan aksen crimson mawar mewah.',
    background: '#14080e',
    secondary: '#26101c',
    primary: '#e11d48',
    text: '#fff1f2',
    accent: '#fb7185',
    buttonText: '#ffffff',
    card: '#26101c',
    surface: '#26101c',
    border: '#3d1a2d',
    isDark: true,
  },
  {
    id: 'deep_amethyst',
    name: 'Deep Amethyst / Purple',
    description: 'Kanvas ungu kosmik mistis dengan aksen kristal kecubung ungu yang elegan.',
    background: '#0f0a1c',
    secondary: '#1d1435',
    primary: '#7c3aed',
    text: '#f5f3ff',
    accent: '#a78bfa',
    buttonText: '#ffffff',
    card: '#1d1435',
    surface: '#1d1435',
    border: '#2e2054',
    isDark: true,
  },
  {
    id: 'obsidian_monochrome',
    name: 'Obsidian Monochrome',
    description: 'Gaya monokrom batu obsidian minimalis murni dengan kontras tinggi hitam dan abu-abu arang.',
    background: '#09090b',
    secondary: '#18181b',
    primary: '#3f3f46',
    text: '#fafafa',
    accent: '#a1a1aa',
    buttonText: '#ffffff',
    card: '#18181b',
    surface: '#18181b',
    border: '#27272a',
    isDark: true,
  },
];
