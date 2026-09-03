/**
 * themeGuides.ts
 * Menyediakan teks panduan lengkap format Markdown (.md) untuk:
 * 1. Skema Tema Card Artis (talent_rating_card_theme)
 * 2. Skema Tema Tampilan Antarmuka UI Aplikasi (talent_rating_ui_theme)
 * Serta fungsi download instan file Markdown (.md).
 */

export const CARD_THEME_GUIDE_MARKDOWN = `# 📖 Panduan Lengkap Skema JSON Tema Card Artis (Card Theme)
**Aplikasi:** Sistem Rating Artis & Katalog Talent  
**Tipe File:** JSON (\`.json\`)  
**Tipe Skema:** \`talent_rating_card_theme\`  
**Versi:** \`1.0.0\`

Dokumen ini menjelaskan struktur data dan seluruh opsi konfigurasi untuk membuat file tema visual Card Artis kustom yang didukung penuh oleh aplikasi, termasuk dukungan rasio aspek, aset kustom, offset presisi, dan kustomisasi tipografi.

---

## 1. Struktur Root Objek (Wajib)

Setiap file JSON tema card memiliki atribut level root berikut:

| Properti | Tipe Data | Wajib | Keterangan & Contoh Nilai |
| :--- | :--- | :--- | :--- |
| \`type\` | \`string\` | **YA** | Harus bernilai tetap: \`"talent_rating_card_theme"\` |
| \`version\` | \`string\` | **YA** | Versi skema, contoh: \`"1.0.0"\` |
| \`id\` | \`string\` | **YA** | ID unik tema (huruf kecil, angka, underscore), contoh: \`"custom_cyber_gold"\` |
| \`name\` | \`string\` | **YA** | Nama tampilan tema, contoh: \`"Cyberpunk Royal Gold"\` |
| \`badge\` | \`string\` | Opsional | Teks badge singkat, contoh: \`"VIP EDITION"\`, \`"CYBER"\`, \`"RETRO"\`, \`"1:1 SQUARE"\` |
| \`description\`| \`string\` | Opsional | Deskripsi visual gaya tema |
| \`category\` | \`string\` | Opsional | Kategori tema, contoh: \`"Futuristic Luxury"\`, \`"Retro Nostalgia"\`, \`"Classic Royalty"\` |
| \`accentColor\`| \`string\` | Opsional | Kode warna HEX aksen tema, contoh: \`"#EAB308"\`, \`"#EC4899"\`, \`"#06B6D4"\` |
| \`icon\` | \`string\` | Opsional | Nama ikon Lucide: \`"Sparkles"\`, \`"Crown"\`, \`"Zap"\`, \`"Shield"\`, \`"Flame"\`, \`"Camera"\`, \`"LayoutGrid"\`, \`"Layers"\` |
| \`aspectRatio\`| \`string\` | Opsional | Rasio aspek kartu: \`"3:4"\`, \`"2:3"\`, \`"1:1"\`, \`"16:9"\`, \`"4:5"\`, \`"9:16"\`, \`"auto"\` |
| \`assets\` | \`object\` | Opsional | Objek URL gambar latar, pola tekstur, ikon lencana, atau watermark |
| \`layoutOffsets\` | \`object\` | Opsional | Koordinat pergeseran presisi \`{ x, y }\` dalam piksel untuk sub-elemen |
| \`typography\` | \`object\` | Opsional | Konfigurasi ukuran, ketebalan, dan warna teks khusus |
| \`layoutConfig\`| \`object\` | **YA** | Objek konfigurasi layout & styling visual kartu |

---

## 2. Opsi Objek \`assets\` (Aset Gambar PNG / SVG / WebP & Konfigurasi Fleksibel)

Mendukung URL gambar langsung (HTTPS), Base64 Data URI (\`data:image/png;base64,...\`), atau path file relatif dalam paket ZIP (\`./assets/symbol.png\`). Setiap aset grafis dapat dikonfigurasi skala, opacity, posisi, dan blend mode-nya:

| Properti | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| \`textureUrl\` | \`string\` | URL / path tekstur background overlay (PNG transparan/mesh/pola halus) |
| \`textureConfig\` | \`object\` | Konfigurasi tekstur: \`{ opacity: 0.3, blendMode: "overlay", scale: 1.0, position: "repeat" }\` |
| \`symbolUrl\` | \`string\` | URL / path simbol atau crest kustom (PNG transparan) |
| \`symbolConfig\` | \`object\` | Konfigurasi simbol: \`{ scale: 1.0, opacity: 0.8, position: "center", offsetX: 0, offsetY: 0, rotation: 0 }\` |
| \`bannerUrl\` | \`string\` | URL / path banner pita header atau footer kartu (PNG transparan) |
| \`bannerConfig\` | \`object\` | Konfigurasi banner: \`{ position: "top", opacity: 0.95 }\` |
| \`emblemUrl\` | \`string\` | URL / path emblem segel / stempel eksklusif di sudut kartu |
| \`emblemConfig\` | \`object\` | Konfigurasi emblem: \`{ scale: 0.8, opacity: 0.9 }\` |
| \`borderFrameUrl\` | \`string\` | URL / path bingkai ornamen PNG dekoratif yang mengelilingi kartu |
| \`borderFrameConfig\` | \`object\` | Konfigurasi bingkai: \`{ opacity: 0.9, inset: 0 }\` |
| \`backgroundImageUrl\`| \`string\` | URL gambar latar belakang kartu |
| \`watermarkUrl\` | \`string\` | URL logo watermark transparan di sudut kartu |

---

## 3. Struktur Paket ZIP (.zip) Tema Card

Aplikasi mendukung ekspor & impor tema kartu sebagai paket \`.zip\` mandiri:
\`\`\`text
my-card-theme.zip/
├── theme.json            <-- File konfigurasi tata letak JSON
├── README.md             <-- Dokumentasi tema
└── assets/               <-- Folder gambar
    ├── texture.png
    ├── symbol.png
    ├── banner.png
    ├── emblem.png
    └── border-frame.png
\`\`\`

---

## 4. Opsi Objek \`layoutOffsets\` (Offset Presisi dalam Piksel)

Mengatur pergeseran posisi elemen kartu dengan koordinat \`{ x: number, y: number }\`:

| Properti | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| \`ratingOffset\` | \`{ x: number, y: number }\` | Pergeseran posisi blok rating & skor |
| \`nameOffset\` | \`{ x: number, y: number }\` | Pergeseran posisi teks nama artis |
| \`badgeOffset\` | \`{ x: number, y: number }\` | Pergeseran posisi badge ranking / bendera |
| \`specsOffset\` | \`{ x: number, y: number }\` | Pergeseran posisi statistik (BWH, tinggi, cup, dll.) |
| \`thumbnailOffset\`| \`{ x: number, y: number }\` | Pergeseran posisi foto artis |

---

## 5. Opsi Objek \`typography\` (Tipografi Khusus)

Mengatur pewarnaan dan ukuran tipografi pada kartu:

| Properti | Tipe Data | Keterangan & Pilihan Nilai |
| :--- | :--- | :--- |
| \`nameFontSize\` | \`string\` | Ukuran nama artis: \`"xs"\`, \`"sm"\`, \`"md"\`, \`"lg"\`, \`"xl"\`, \`"2xl"\` |
| \`nameFontWeight\` | \`string\` | Ketebalan font nama: \`"normal"\`, \`"medium"\`, \`"semibold"\`, \`"bold"\`, \`"black"\` |
| \`primaryTextColor\` | \`string\` | Warna HEX teks utama / nama artis (contoh: \`"#FFFFFF"\`, \`"#FEF3C7"\`) |
| \`secondaryTextColor\`| \`string\` | Warna HEX teks sekunder / sub-judul (contoh: \`"#CBD5E1"\`, \`"#94A3B8"\`) |
| \`scoreTextColor\` | \`string\` | Warna HEX angka rating / skor (contoh: \`"#FACC15"\`, \`"#F43F5E"\`) |
| \`fontFamily\` | \`string\` | Font family kustom CSS (opsional) |

---

## 6. Opsi Objek \`layoutConfig\`

Objek \`layoutConfig\` mengontrol geometri, penempatan elemen, visibilitas statistik, ornamen, dan efek visual kartu:

### A. Bentuk & Struktur (\`cardShape\`, \`thumbnailShape\`, \`aspectRatio\`)
- **\`cardShape\`**: Bentuk siluet bingkai kartu:
  - \`"standard"\` : Persegi sudut melengkung standar
  - \`"rounded"\` : Sudut ekstra bulat modern (16px)
  - \`"square"\` : Sudut kotak tajam
  - \`"pill"\` : Sudut kapsul/pill
  - \`"asymmetric"\` : Sudut asimetris futuristik
  - \`"chamfer"\` : Sudut terpotong miring (*bevel/chamfer*)
  - \`"arch"\` : Atas melengkung kubah (*arch*)
- **\`thumbnailShape\`**: Bentuk wadah foto artis:
  - \`"full_bleed"\` : Foto memenuhi seluruh kartu (*overlay*)
  - \`"inset"\` : Foto dengan margin bingkai di dalam
  - \`"circular"\` : Foto berbentuk lingkaran
  - \`"arch"\` : Foto bagian atas melengkung kubah
  - \`"squircle"\` : Foto squircle superellips
  - \`"diamond"\` : Foto siluet belah ketupat (*diamond*)
  - \`"polaroid"\` : Foto bergaya cetak instan polaroid
- **\`aspectRatio\`**: \`"3:4"\` | \`"2:3"\` | \`"1:1"\` | \`"16:9"\` | \`"4:5"\` | \`"9:16"\` | \`"auto"\`
- **\`thumbnailScale\`**: \`"cover"\` | \`"contain"\` | \`"zoom"\` | \`"fit"\`
- **\`thumbnailPosition\`**: \`"top"\` | \`"center"\` | \`"bottom"\`
- **\`informationLayout\`**: \`"overlay"\` | \`"split"\` | \`"floating"\` | \`"bottom_sheet"\` | \`"side_by_side"\`

### B. Matriks Posisi Elemen
- **\`ratingPosition\`**: \`"top_right"\` | \`"top_left"\` | \`"top_center"\` | \`"bottom_right"\` | \`"bottom_left"\` | \`"bottom_center"\` | \`"center"\` | \`"header"\` | \`"hidden"\`
- **\`namePosition\`**: \`"bottom_center"\` | \`"bottom_left"\` | \`"bottom_right"\` | \`"top_left"\` | \`"top_center"\` | \`"top_right"\` | \`"middle"\` | \`"footer"\`
- **\`bodyTypePosition\`**: \`"top_right"\` | \`"top_left"\` | \`"top_center"\` | \`"bottom_right"\` | \`"bottom_left"\` | \`"bottom_center"\` | \`"with_name"\` | \`"with_specs"\` | \`"badge_pill"\` | \`"hidden"\`
- **\`countryPosition\`**: \`"top_left"\` | \`"top_right"\` | \`"top_center"\` | \`"bottom_left"\` | \`"bottom_right"\` | \`"with_name"\` | \`"with_rating"\` | \`"hidden"\`
- **\`measurementPosition\`**: \`"bottom_center"\` | \`"bottom_left"\` | \`"bottom_right"\` | \`"side_rail"\` | \`"with_name"\` | \`"footer"\` | \`"top_left"\` | \`"hidden"\`
- **\`ornamentPosition\`**: \`"corners"\` | \`"top"\` | \`"border"\` | \`"background"\` | \`"center"\` | \`"none"\`
- **\`sectionDivider\`**: \`"none"\` | \`"subtle_line"\` | \`"glowing"\` | \`"dashed"\` | \`"pill_border"\`

### C. Pengaturan Visibilitas Data (Boolean)
- \`showBwh\` (\`true\` / \`false\`): Tampilkan lingkar B/W/H (Dada, Pinggang, Pinggul)
- \`showAge\` (\`true\` / \`false\`): Tampilkan usia artis
- \`showMaturity\` (\`true\` / \`false\`): Tampilkan kematangan usia
- \`showRankBadge\` (\`true\` / \`false\`): Tampilkan lencana ranking #1, #2, dst.
- \`showAppImpScore\` (\`true\` / \`false\`): Tampilkan skor Appeal & Impression
- \`showHeight\` (\`true\` / \`false\`): Tampilkan tinggi badan
- \`showCupSize\` (\`true\` / \`false\`): Tampilkan ukuran cup bra

### D. Ornamen, Border, & Efek Visual
- **\`ornamentStyle\`**: \`"none"\` | \`"geometric_corners"\` | \`"crest_shield"\` | \`"laser_hud"\` | \`"ambient_glow"\` | \`"cyberpunk_bracket"\` | \`"double_ring"\`
- **\`borderWidth\`**: Ketebalan border dalam pixel, contoh: \`1\`, \`2\`, \`3\`
- **\`glassmorphism\`** (\`true\` / \`false\`): Aktifkan efek latar kaca transparan blur
- **\`themeColorMode\`**: \`"type_based"\` (warna mengikuti tipe artis) atau \`"custom"\` (mengikuti \`customBorderColor\` / \`accentColor\`)
- **\`customBorderColor\`**: Kode HEX warna border khusus, contoh: \`"#D97706"\`
- **\`gradientOverlay\`**: \`"dark_top_bottom"\` | \`"bottom_only"\` | \`"radial_subtle"\` | \`"none"\` | \`"vignette"\` | \`"top_only"\`

---

## 7. Contoh Template File JSON Siap Pakai

Simpan kode di bawah sebagai file \`.json\` (misalnya \`tema-dragon-sovereign.json\`), lalu impor melalui tab **Tema Card** di menu Pengaturan:

\`\`\`json
{
  "type": "talent_rating_card_theme",
  "version": "1.0.0",
  "id": "dragon_sovereign",
  "name": "Dragon Sovereign Crest",
  "badge": "SOVEREIGN",
  "description": "Tema mewah kerajaan naga emas dengan tekstur sisik naga, segel simbol keemasan, dan bingkai klasik berornamen.",
  "category": "Mythic Royalty",
  "accentColor": "#D97706",
  "icon": "Crown",
  "aspectRatio": "3:4",
  "assets": {
    "textureConfig": {
      "opacity": 0.25,
      "blendMode": "overlay"
    },
    "symbolConfig": {
      "scale": 1.0,
      "opacity": 0.75,
      "position": "center"
    },
    "emblemConfig": {
      "scale": 0.85,
      "opacity": 0.9
    }
  },
  "layoutOffsets": {
    "nameOffset": { "x": 0, "y": -4 }
  },
  "typography": {
    "nameFontSize": "lg",
    "nameFontWeight": "black",
    "primaryTextColor": "#FEF3C7",
    "secondaryTextColor": "#FDE68A",
    "scoreTextColor": "#FBBF24"
  },
  "layoutConfig": {
    "cardShape": "chamfer",
    "thumbnailShape": "full_bleed",
    "thumbnailScale": "cover",
    "informationLayout": "overlay",
    "aspectRatio": "3:4",
    "ratingPosition": "top_right",
    "namePosition": "bottom_center",
    "bodyTypePosition": "top_left",
    "countryPosition": "top_right",
    "measurementPosition": "bottom_center",
    "ornamentPosition": "corners",
    "sectionDivider": "glowing",
    "headerPosition": "split_top",
    "footerPosition": "bottom_center",
    "scoreDisplay": "prominent",
    "nameAlignment": "center",
    "nameStyle": "stacked",
    "showBwh": true,
    "showAge": true,
    "showMaturity": true,
    "showRankBadge": true,
    "showAppImpScore": true,
    "showHeight": true,
    "showCupSize": true,
    "ornamentStyle": "crest_shield",
    "borderWidth": 2,
    "glassmorphism": true,
    "themeColorMode": "custom",
    "customBorderColor": "#D97706",
    "gradientOverlay": "dark_top_bottom"
  }
}
\`\`\`
`;

export const UI_THEME_GUIDE_MARKDOWN = `# 📖 Panduan Lengkap Skema JSON Tema Tampilan UI Aplikasi (v3.0.0)
**Aplikasi:** Sistem Rating Artis & Katalog Talent  
**Tipe File:** JSON (\`.json\`)  
**Tipe Skema:** \`talent_rating_ui_theme\`  
**Versi:** \`3.0.0\`

Dokumen ini menjelaskan spesifikasi struktur data dan konfigurasi tema antarmuka global (*UI Theme v3.0.0*) yang mendukung kustomisasi menyeluruh terhadap section, field, layout, ukuran, tata letak, tipografi, dan gaya visual di seluruh halaman aplikasi, terkecuali bidang sticky dan card artis halaman utama.

---

## 1. Struktur Root Objek (Wajib)

Setiap file JSON tema UI harus memiliki atribut level root berikut:

| Properti | Tipe Data | Wajib | Keterangan & Contoh Nilai |
| :--- | :--- | :--- | :--- |
| \`type\` | \`string\` | **YA** | Harus bernilai tetap: \`"talent_rating_ui_theme"\` |
| \`version\` | \`string\` | **YA** | Versi skema, contoh: \`"3.0.0"\` |
| \`id\` | \`string\` | **YA** | ID unik tema UI (huruf kecil, angka, underscore), contoh: \`"amber_pro_slate"\` |
| \`name\` | \`string\` | **YA** | Nama tampilan tema UI, contoh: \`"Amber Slate Pro"\` |
| \`badge\` | \`string\` | Opsional | Teks badge tema, contoh: \`"PRO LUXURY"\`, \`"NEON HUD"\`, \`"EDITORIAL"\` |
| \`description\`| \`string\` | Opsional | Deskripsi karakteristik UI tema |
| \`category\` | \`string\` | Opsional | Kategori tema, contoh: \`"Dashboard"\`, \`"Sci-Fi HUD"\`, \`"Editorial"\` |
| \`accentColor\`| \`string\` | Opsional | Warna aksen utama aplikasi HEX, contoh: \`"#FE9900"\`, \`"#00F0FF"\` |
| \`icon\` | \`string\` | Opsional | Nama ikon Lucide: \`"Sparkles"\`, \`"Terminal"\`, \`"Crown"\`, \`"Layers"\` |
| \`tokens\` | \`object\` | **YA** | Token warna lengkap, tipografi, spasial, radius, border, dan shadow |
| \`shapeSystem\`| \`object\` | Opsional | Sistem bentuk container, badge, dan card |
| \`decorationSystem\`| \`object\` | Opsional | Corner brackets, grid background, geometrik lines, pendaran |
| \`global\` | \`object\` | **YA** | Nilai fallback kompatibilitas global |
| \`home\` | \`object\` | Opsional | Komposisi layout & hero section Halaman Utama |
| \`artistDetail\`| \`object\` | Opsional | Komposisi layout & hero section Halaman Detail Artis |
| \`ranking\` | \`object\` | Opsional | Komposisi layout podium & leaderboard Halaman Ranking |
| \`compare\` | \`object\` | Opsional | Komposisi duel & perbandingan Halaman Compare |
| \`sectionsConfig\`| \`object\` | Opsional | Kustomisasi granular per-section (biodata, spek, score, links, similar) |
| \`fieldsConfig\`| \`object\` | Opsional | Kustomisasi granular per-field (labels, values, badges) |
| \`scoreSpecDefaults\`| \`object\` | Opsional | Pengaturan bawaan layout & visual scoring dan spesifikasi |

---

## 2. Rincian Objek \`global\`

Objek \`global\` menentukan pondasi desain di seluruh aplikasi:

### A. \`tokens\` (Palet Warna & Tipografi)
- \`appBackground\`: Warna latar utama (contoh: \`"#0C0A09"\`, \`"#0B132B"\`, \`"#FFFFFF"\`)
- \`primaryColor\`: Warna aksen primer / tombol aktif (contoh: \`"#FE9900"\`, \`"#06B6D4"\`)
- \`accentColor\`: Warna aksen sekunder
- \`cardBackground\`: Warna latar kartu dan panel
- \`cardBorder\`: Warna garis batas container
- \`navbarBackground\`: Warna latar bilah navigasi
- \`modalBackground\`: Warna dialog modal
- \`subtleText\`: Warna teks keterangan sekunder (contoh: \`"#A8A29E"\`)
- \`bodyText\`: Warna teks utama
- \`fontFamily\`: \`"Plus Jakarta Sans"\` | \`"Inter"\` | \`"Roboto"\` | \`"Open Sans"\`
- \`fontSizeScale\`: \`"small"\` | \`"normal"\` | \`"medium"\` | \`"large"\`

### B. \`shapes\` (Radius Sudut)
Pilihan nilai: \`"none"\` (0px) | \`"sm"\` (6px) | \`"md"\` (12px) | \`"lg"\` (16px) | \`"xl"\` (24px) | \`"full"\` (Pill/Kapsul)
- \`cardRadius\` : Radius sudut kartu
- \`buttonRadius\` : Radius sudut tombol
- \`badgeRadius\` : Radius sudut lencana & pill
- \`thumbnailRadius\` : Radius sudut gambar profil

### C. \`decorations\` (Efek & Dekorasi)
- \`glowLevel\`: \`"none"\` | \`"subtle"\` | \`"medium"\` | \`"intense"\`
- \`borderWidthScale\`: \`"thin"\` (1px) | \`"normal"\` (2px) | \`"thick"\` (3px) | \`"heavy"\` (4px)
- \`dividerStyle\`: \`"solid"\` | \`"dashed"\` | \`"glowing"\` | \`"none"\`

### D. \`navigation\` (Bilah Navigasi)
- \`navbarStyle\`: \`"standard_solid"\` | \`"glass_floating"\` | \`"minimal_pill"\` | \`"compact_line"\` | \`"bordered_dock"\`
- \`navbarHeight\`: \`"compact"\` | \`"normal"\` | \`"tall"\`
- \`activeTabIndicator\`: \`"glow_pill"\` | \`"underline"\` | \`"badge"\` | \`"fill"\`

---

## 3. Komposisi Halaman (\`home\`, \`artistDetail\`, \`ranking\`, \`compare\`)

### \`home\`
- \`composition\`: \`"standard"\` | \`"bento_hero"\` | \`"stats_first"\` | \`"compact_catalog"\` | \`"magazine_editorial"\`
- \`catalogLayout\`: \`"grid"\` | \`"masonry"\` | \`"compact_list"\` | \`"dense_table"\`
- \`rankingPodiumLayout\`: \`"classic_podium"\` | \`"cards_row"\` | \`"compact_strip"\` | \`"floating_badges"\`

### \`artistDetail\`
- \`composition\`: \`"tabbed_classic"\` | \`"immersive_hero"\` | \`"split_datasheet"\` | \`"minimal_timeline"\`
- \`heroStyle\`: \`"standard_banner"\` | \`"portrait_focus"\` | \`"cinematic_blur"\` | \`"minimal_header"\`

### \`ranking\`
- \`composition\`: \`"podium_top"\` | \`"tier_list"\` | \`"leaderboard_table"\` | \`"dense_cards"\`
- \`podiumStyle\`: \`"elevation_trio"\` | \`"golden_pedestal"\` | \`"card_champions"\` | \`"compact_ranks"\`

### \`compare\`
- \`composition\`: \`"side_by_side"\` | \`"versus_arena"\` | \`"radar_centric"\` | \`"matrix_sheet"\`

---

## 4. Contoh Template File JSON Siap Pakai

Simpan template di bawah sebagai file \`.json\` (misalnya \`tema-ui-cyberpunk.json\`), lalu impor melalui tombol **Impor Tema (.json)** di bagian **Tema Tampilan Aplikasi**:

\`\`\`json
{
  "type": "talent_rating_ui_theme",
  "version": "1.0.0",
  "id": "cyber_amber_glow",
  "name": "Cyber Amber Glow",
  "badge": "CYBER UI",
  "description": "Tema antarmuka futuristik dengan aksen amber emas bercahaya, navbar floating glass, dan layout bento.",
  "category": "Futuristic UI",
  "accentColor": "#FE9900",
  "icon": "Sparkles",
  "global": {
    "tokens": {
      "appBackground": "#0C0A09",
      "primaryColor": "#FE9900",
      "accentColor": "#F59E0B",
      "cardBackground": "#1C1917",
      "cardBorder": "#292524",
      "navbarBackground": "#141210E6",
      "subtleText": "#A8A29E",
      "bodyText": "#FAFAF9",
      "fontFamily": "Plus Jakarta Sans",
      "fontSizeScale": "normal"
    },
    "shapes": {
      "cardRadius": "xl",
      "buttonRadius": "lg",
      "badgeRadius": "full",
      "thumbnailRadius": "lg"
    },
    "decorations": {
      "glowLevel": "medium",
      "borderWidthScale": "normal",
      "dividerStyle": "glowing"
    },
    "navigation": {
      "navbarStyle": "glass_floating",
      "navbarHeight": "normal",
      "activeTabIndicator": "glow_pill"
    }
  },
  "home": {
    "composition": "bento_hero",
    "catalogLayout": "grid",
    "rankingPodiumLayout": "classic_podium"
  },
  "artistDetail": {
    "composition": "immersive_hero",
    "heroStyle": "portrait_focus"
  },
  "ranking": {
    "composition": "podium_top",
    "podiumStyle": "elevation_trio"
  },
  "compare": {
    "composition": "versus_arena"
  }
}
\`\`\`
`;

/**
 * Download helper function for Card Theme Markdown Guide (.md)
 */
export function downloadCardThemeGuide(): void {
  try {
    const blob = new Blob([CARD_THEME_GUIDE_MARKDOWN], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PANDUAN_SKEMA_TEMA_CARD.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download Card Theme guide', error);
  }
}

/**
 * Download helper function for UI Theme Markdown Guide (.md)
 */
export function downloadUIThemeGuide(): void {
  try {
    const blob = new Blob([UI_THEME_GUIDE_MARKDOWN], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PANDUAN_SKEMA_TEMA_TAMPILAN_UI.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download UI Theme guide', error);
  }
}
