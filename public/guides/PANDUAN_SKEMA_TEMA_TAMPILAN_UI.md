# 📖 Panduan Lengkap Skema JSON Tema Tampilan UI Aplikasi (v3.0.0)
**Aplikasi:** Sistem Rating Artis & Katalog Talent  
**Tipe File:** JSON (`.json`)  
**Tipe Skema:** `talent_rating_ui_theme`  
**Versi Skema:** `3.0.0`

Dokumen ini menjelaskan spesifikasi struktur data, batasan operasional (*Theme Scope Rules*), dan konfigurasi tema antarmuka global (*UI Theme v3.0.0*) yang mendukung kustomisasi menyeluruh terhadap section, field, layout, ukuran, tata letak, tipografi, dan gaya visual di seluruh halaman aplikasi, serta integrasinya dengan fitur **Gunakan Bawaan Tema** (*Use Theme Defaults*).

---

## 🛡️ ATURAN RUANG LINGKUP TEMA v3.0.0 (THEME SCOPE RULES)

Tema Tampilan UI v3.0.0 memberikan kendali penuh terhadap seluruh tampilan antarmuka visual aplikasi, **terkecuali** dua bidang terisolasi berikut:
1. **Bidang Sticky:** Header navigasi atas yang sticky, sticky search bar di halaman utama, serta sticky profile bar di halaman detail artis (tetap menjaga fungsionalitas dan ergonomi UX saat di-scroll).
2. **Card Artis di Halaman Utama:** Kartu profil talent di halaman utama menggunakan skema dan engine *Card Theme* tersendiri (`talent_rating_card_theme`).

### 🚫 Batasan Operasional (MUST NOT):
1. **Memodifikasi skema database atau nilai data database** (*database schema/values*).
2. **Mengubah struktur data atau field teks Card Artis utama** (*Card Artist data structure*).
3. **Mengubah fungsionalitas logika inti aplikasi** (*core logic/calculations*).

### ✅ Kemampuan Penuh Tema v3.0.0 (FULL UPGRADE CAPABILITIES):
- **Section Kustomisasi (`sectionsConfig`):** Mengatur tata letak, padding, border radius, background style, dan visibilitas untuk Section Biodata, Spesifikasi (Attributes, Appeal, Specialty), Scoring (Appearance, Impression), Tautan Resmi, serta Similar Artists.
- **Field Kustomisasi (`fieldsConfig`):** Mengatur format label, ukuran font, ketebalan nilai teks, jenis font (sans, serif, mono), warna field, serta gaya badge/pill.
- **Warna & Palet Lengkap (`tokens.colors`):** `primary`, `primaryHover`, `accent`, `background`, `surface`, `secondarySurface`, `surfaceElevated`, `primaryText`, `secondaryText`, `mutedText`, `border`, `borderActive`, `divider`, `glow`.
- **Tipografi (`tokens.typography`):** `fontFamily`, `displayFont`, `headingFont`, `fontScale`, `headingWeight`, `bodyWeight`, `letterSpacing`, `uppercaseHeadings`.
- **Spasial, Gap & Ukuran (`tokens.spacing`, `tokens.radius`, `tokens.borders`, `tokens.shadows`):** Ukuran padding, gap antar elemen, radius sudut (none sampai full), ketebalan border, dan efek bayangan/glow.
- **Sistem Bentuk & Dekorasi (`shapeSystem`, `decorationSystem`):** Sudut chamfer, rounded, flat, neon tag, corner brackets, technical grid texture, radial ambient glows.
- **Konfigurasi Modul Halaman:**
  - `home`: Layout halaman utama, hero spotlight banner, shelves, grid density.
  - `artistDetail`: Layout detail artis (split hero, reverse split, centered profile, banner hero, HUD cockpit), avatar style & size, biodata style.
  - `ranking`: Layout podium (centered olympic, step horizontal, vertical stack, winner spotlight), leaderboard row styling.
  - `compare`: Layout duel perbandingan (side by side, horizontal/vertical duel, matrix table, diff radar).
- **Konfigurasi Bawaan Score & Spek (`scoreSpecDefaults`):** Otomatis menyelaraskan tampilan visual dan warna kategori spek & score saat fitur *Gunakan Bawaan Tema* aktif.

---

## 🎛️ Fitur "Gunakan Bawaan Tema" (Use Theme Defaults)

Fitur **Gunakan Bawaan Tema** terdapat pada menu *Pengaturan Kustomisasi Tampilan Score & Spek*.

- **Nilai Default Aplikasi:** `true` (**Aktif secara default**).
- **Cara Kerja:**
  - Saat **AKTIF**: Tampilan kategori Spek (*Attributes, Appeal, Specialty*) dan Score (*Appearance 60% + Impression 40%*) pada halaman Detail Artis dan Live Preview akan otomatis mengikuti konfigurasi `scoreSpecDefaults` dari tema UI yang sedang aktif.
  - Saat **NON-AKTIF (KUSTOM MANUAL)**: Pengguna memiliki kebebasan penuh untuk memilih layout (*3 Columns, 2 Columns, Bento Grid, Matrix HUD, dsb.*), visual style (*Progress Bars, Circular Gauges, Score Cards, Equalizer, dsb.*), serta custom color picker sesuai preferensi manual tanpa terikat tema aktif.

---

## 1. Struktur Root Objek Tema UI v3.0.0

| Properti | Tipe Data | Wajib | Keterangan & Contoh Nilai |
| :--- | :--- | :--- | :--- |
| `type` | `string` | **YA** | Harus bernilai tetap: `"talent_rating_ui_theme"` |
| `version` | `string` | **YA** | Versi skema: `"3.0.0"` |
| `id` | `string` | **YA** | ID unik tema UI, contoh: `"amber_pro_slate"` |
| `name` | `string` | **YA** | Nama tampilan tema UI, contoh: `"Amber Slate Pro"` |
| `badge` | `string` | Opsional | Teks badge tema, contoh: `"PRO LUXURY"`, `"NEON HUD"`, `"EDITORIAL"` |
| `description`| `string` | Opsional | Deskripsi karakteristik visual dan estetika tema UI |
| `category` | `string` | Opsional | Kategori tema, contoh: `"Dashboard"`, `"Editorial"`, `"Sci-Fi HUD"`, `"Minimalist"` |
| `accentColor`| `string` | Opsional | Warna aksen utama HEX, contoh: `"#FE9900"`, `"#00F0FF"`, `"#10B981"` |
| `icon` | `string` | Opsional | Nama ikon Lucide: `"Sparkles"`, `"Terminal"`, `"Crown"`, `"Layers"`, `"Zap"` |
| `tokens` | `object` | **YA** | Token warna lengkap, tipografi, spasial, radius, border, dan shadow |
| `shapeSystem`| `object` | Opsional | Sistem bentuk container, badge, dan card |
| `decorationSystem`| `object` | Opsional | Corner brackets, grid background, geometrik lines, pendaran |
| `global` | `object` | **YA** | Nilai fallback kompatibilitas global |
| `home` | `object` | Opsional | Komposisi layout & hero section Halaman Utama |
| `artistDetail`| `object` | Opsional | Komposisi layout & hero section Halaman Detail Artis |
| `ranking` | `object` | Opsional | Komposisi layout podium & leaderboard Halaman Ranking |
| `compare` | `object` | Opsional | Komposisi duel & perbandingan Halaman Compare |
| `sectionsConfig`| `object` | Opsional | Kustomisasi granular per-section (biodata, spek, score, links, similar) |
| `fieldsConfig`| `object` | Opsional | Kustomisasi granular per-field (labels, values, badges) |
| `scoreSpecDefaults`| `object` | Opsional | Pengaturan bawaan layout & visual scoring dan spesifikasi |

---

## 2. Struktur Objek `scoreSpecDefaults`

Objek `scoreSpecDefaults` mendefinisikan tampilan Spek dan Score bawaan saat pengguna mengaktifkan mode **Gunakan Bawaan Tema**:

```json
{
  "scoreSpecDefaults": {
    "spek": {
      "layout": "three_columns",
      "visualStyle": "bordered_cards",
      "spacing": 3,
      "showIcons": true,
      "attributesColor": "#FE9900",
      "appealColor": "#F59E0B",
      "specialtyColor": "#10B981"
    },
    "score": {
      "layout": "two_columns",
      "visualStyle": "progress_bars",
      "spacing": 3,
      "showLabels": true,
      "showValues": true,
      "appearanceColor": "#06B6D4",
      "impressionColor": "#EC4899",
      "overallColor": "#FE9900"
    }
  }
}
```

### Opsi Nilai untuk `spek`:
- `layout`: `"three_columns"` | `"two_columns"` | `"stacked"` | `"horizontal_carousel"` | `"compact_badges"` | `"matrix_hud"` | `"bento_grid"` | `"minimal_list"`
- `visualStyle`: `"bordered_cards"` | `"soft_chips"` | `"gradient_glow"` | `"striped_accent"` | `"minimal_text"` | `"pill_tags"` | `"matrix_boxes"` | `"glassmorphism"`
- `spacing`: Angka `1` sampai `6`
- `showIcons`: `true` | `false`
- `attributesColor`, `appealColor`, `specialtyColor`: Kode HEX warna

### Opsi Nilai untuk `score`:
- `layout`: `"two_columns"` | `"stacked_rows"` | `"radial_dials"` | `"compact_matrix"` | `"bento_scores"` | `"equalizer_bars"` | `"clean_table"`
- `visualStyle`: `"progress_bars"` | `"circular_gauges"` | `"score_cards"` | `"minimal_numbers"` | `"neon_glow"` | `"cyber_bars"` | `"gradient_fill"`
- `spacing`: Angka `1` sampai `6`
- `showLabels`: `true` | `false`
- `showValues`: `true` | `false`
- `appearanceColor`, `impressionColor`, `overallColor`: Kode HEX warna

---

## 3. Contoh Template Tema JSON Siap Impor

Berikut adalah contoh tema JSON lengkap yang siap diimpor:

```json
{
  "type": "talent_rating_ui_theme",
  "version": "2.0.0",
  "id": "cyber_matrix_neon",
  "name": "Cyber Matrix Neon",
  "badge": "NEON HUD",
  "description": "Antarmuka konsol cyberpunk futuristik dengan aksen neon cyan dan pink, matrix telemetry, dan visual audio equalizer.",
  "category": "Sci-Fi HUD",
  "accentColor": "#00F0FF",
  "icon": "Terminal",
  "tokens": {
    "colors": {
      "primary": "#00F0FF",
      "primaryHover": "#38BDF8",
      "accent": "#FF007F",
      "background": "#020617",
      "surface": "#0B1120",
      "secondarySurface": "#131D31",
      "surfaceElevated": "#1E293B",
      "primaryText": "#F8FAFC",
      "secondaryText": "#94A3B8",
      "mutedText": "#64748B",
      "border": "#0284C7",
      "borderActive": "#00F0FF",
      "divider": "#0C4A6E",
      "glow": "rgba(0, 240, 255, 0.4)"
    },
    "typography": {
      "fontFamily": "JetBrains Mono, monospace",
      "displayFont": "JetBrains Mono, monospace",
      "headingFont": "JetBrains Mono, monospace",
      "fontScale": "compact",
      "headingWeight": "bold",
      "bodyWeight": "normal",
      "letterSpacing": "wide",
      "uppercaseHeadings": true
    },
    "spacing": {
      "pagePadding": "compact",
      "sectionGap": "compact",
      "cardGap": "tight",
      "itemPadding": "compact"
    },
    "radius": {
      "base": "none",
      "card": "none",
      "button": "none",
      "badge": "none",
      "inner": "none"
    },
    "borders": {
      "width": 1,
      "style": "chamfer",
      "color": "#0284C7",
      "opacity": 1
    },
    "shadows": {
      "elevation": "glowing",
      "glowSpread": 12,
      "glowColor": "rgba(0, 240, 255, 0.3)"
    }
  },
  "shapeSystem": {
    "containerStyle": "chamfer",
    "badgeStyle": "neon_tag",
    "cardStyle": "hud_panel"
  },
  "decorationSystem": {
    "showCornerBrackets": true,
    "showGridBackground": true,
    "showGeometricLines": false,
    "showRadialGlows": true,
    "accentBarPosition": "left",
    "ornamentStyle": "crosshairs"
  },
  "global": {
    "primaryColor": "#00F0FF",
    "accentColor": "#FF007F",
    "backgroundColor": "#020617",
    "surfaceColor": "#0B1120",
    "secondarySurfaceColor": "#131D31",
    "primaryTextColor": "#F8FAFC",
    "secondaryTextColor": "#94A3B8",
    "borderColor": "#0284C7",
    "dividerColor": "#0C4A6E",
    "borderRadius": "none",
    "spacing": "compact",
    "uiDensity": "compact",
    "elevation": "glowing",
    "navigationStyle": "compact_hud",
    "buttonStyle": "chamfer",
    "inputStyle": "flush_hud",
    "tabStyle": "chamfer",
    "sliderStyle": "compact_chips",
    "toggleStyle": "chip_active",
    "glassmorphism": true
  },
  "home": {
    "layout": "compact_grid",
    "composition": {
      "direction": "vertical",
      "heroSection": { "enabled": false },
      "sectionsOrder": ["search_filter", "grid"],
      "shelves": { "enabled": false },
      "grid": { "columns": 4, "gap": "tight", "asymmetric": false }
    },
    "header": "compact",
    "searchBar": "integrated",
    "typeTabs": "chamfer_tabs",
    "sortBar": "compact_pills",
    "cardDensityControl": "icons_only",
    "gridGap": "tight",
    "emptyStateStyle": "hud_radar",
    "sectionDivider": "glowing"
  },
  "artistDetail": {
    "layout": "hud_cockpit",
    "composition": {
      "heroDirection": "row",
      "ratio": [40, 60],
      "avatarPosition": "left",
      "telemetryRails": true,
      "biodataLayout": "table"
    },
    "avatarStyle": "chamfer",
    "avatarSize": "giant",
    "overallRatingStyle": "hud_ring",
    "biodataStyle": "table_hud",
    "attributeStyle": "glowing_chips",
    "scoringDisplay": "circular_gauges",
    "panelStyle": "chamfer_boxes",
    "sectionDivider": "glowing",
    "stickyProfileBar": true
  },
  "ranking": {
    "layout": "compact_table",
    "composition": {
      "podiumType": "step_horizontal",
      "listType": "compact_table",
      "showLiveTelemetry": true
    },
    "podiumStyle": "floating_circles",
    "podiumArrangement": "1st_center",
    "listItemStyle": "chamfer_slot",
    "positionBadgeStyle": "square_neon",
    "scoreDisplay": "tier_label",
    "dimensionFilterStyle": "compact_chips",
    "sectionDivider": "glowing"
  },
  "compare": {
    "layout": "comparison_matrix",
    "composition": {
      "duelOrientation": "horizontal",
      "vsBadgePosition": "embedded_matrix",
      "statLayout": "matrix_rows"
    },
    "headerStyle": "sticky_strip",
    "pickerStyle": "grid_selector",
    "statRowStyle": "diff_table",
    "winnerHighlight": "glow_border",
    "stickyHeader": true,
    "sectionDivider": "glowing"
  },
  "scoreSpecDefaults": {
    "spek": {
      "layout": "matrix_hud",
      "visualStyle": "matrix_boxes",
      "spacing": 2,
      "showIcons": true,
      "attributesColor": "#00F0FF",
      "appealColor": "#FF007F",
      "specialtyColor": "#10B981"
    },
    "score": {
      "layout": "compact_matrix",
      "visualStyle": "cyber_bars",
      "spacing": 2,
      "showLabels": true,
      "showValues": true,
      "appearanceColor": "#00F0FF",
      "impressionColor": "#FF007F",
      "overallColor": "#00F0FF"
    }
  }
}
```
