import { UIThemeDefinition } from '../types';
import { resolveUITheme } from './uiThemeEngine';

export interface ParseUIThemeResult {
  success: boolean;
  theme?: UIThemeDefinition;
  error?: string;
}

/**
 * Exports a UI Theme definition as a formatted JSON file download.
 */
export function exportUIThemeAsJSON(theme: UIThemeDefinition): void {
  try {
    // Sanitize theme name for valid filename (e.g. "Modern Amber Dashboard.json")
    const safeName = (theme.name || theme.id || 'UI_Theme')
      .replace(/[\\/:*?"<>|]/g, '_')
      .trim();
    const filename = `${safeName}.json`;
    const jsonStr = JSON.stringify(theme, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export UI theme JSON', error);
  }
}

/**
 * Validates and parses a raw JSON string into a valid UIThemeDefinition.
 */
export function parseUIThemeJSON(content: string): ParseUIThemeResult {
  try {
    const parsed = JSON.parse(content);

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        error: 'File JSON kosong atau format tidak valid.',
      };
    }

    // 1. Check Root Type
    if (parsed.type !== 'talent_rating_ui_theme') {
      return {
        success: false,
        error: `Tipe file tidak cocok. Diharapkan "talent_rating_ui_theme", ditemukan "${parsed.type || 'undefined'}".`,
      };
    }

    // 2. Validate Required Fields
    if (!parsed.id || typeof parsed.id !== 'string') {
      return {
        success: false,
        error: 'Properti "id" tema wajib diisi dan harus berupa string unik.',
      };
    }

    if (!parsed.name || typeof parsed.name !== 'string') {
      return {
        success: false,
        error: 'Properti "name" tema wajib diisi.',
      };
    }

    // 3. Normalize & resolve with defaults to ensure complete layout config
    const validatedTheme = resolveUITheme({
      type: 'talent_rating_ui_theme',
      version: parsed.version || '3.0.0',
      id: parsed.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      name: parsed.name.trim(),
      badge: parsed.badge || 'CUSTOM',
      description: parsed.description || 'Tema UI Kustom hasil impor.',
      category: parsed.category || 'Custom Imported',
      accentColor: parsed.accentColor || parsed.global?.primaryColor || '#FE9900',
      icon: parsed.icon || 'Sparkles',
      tokens: parsed.tokens || {},
      shapeSystem: parsed.shapeSystem || {},
      decorationSystem: parsed.decorationSystem || {},
      navigation: parsed.navigation || {},
      global: parsed.global || {},
      home: parsed.home || {},
      artistDetail: parsed.artistDetail || {},
      ranking: parsed.ranking || {},
      compare: parsed.compare || {},
      sectionsConfig: parsed.sectionsConfig || {},
      fieldsConfig: parsed.fieldsConfig || {},
      scoreSpecDefaults: parsed.scoreSpecDefaults || undefined,
    });

    return {
      success: true,
      theme: validatedTheme,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Gagal membaca format JSON: ${err?.message || 'Sintaks tidak valid.'}`,
    };
  }
}
