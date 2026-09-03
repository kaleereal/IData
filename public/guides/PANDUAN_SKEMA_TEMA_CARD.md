# 📖 Panduan Lengkap Skema JSON Tema Card Artis (Card Theme)
**Aplikasi:** Sistem Rating Artis & Katalog Talent  
**Tipe File:** JSON (`.json`)  
**Tipe Skema:** `talent_rating_card_theme`  
**Versi:** `1.0.0`

Dokumen ini menjelaskan struktur data dan seluruh opsi konfigurasi untuk membuat file tema visual Card Artis kustom yang didukung penuh oleh aplikasi, termasuk dukungan rasio aspek, aset kustom, offset presisi, dan kustomisasi tipografi.

---

## 1. Struktur Root Objek (Wajib)

Setiap file JSON tema card memiliki atribut level root berikut:

| Properti | Tipe Data | Wajib | Keterangan & Contoh Nilai |
| :--- | :--- | :--- | :--- |
| `type` | `string` | **YA** | Harus bernilai tetap: `"talent_rating_card_theme"` |
| `version` | `string` | **YA** | Versi skema, contoh: `"1.0.0"` |
| `id` | `string` | **YA** | ID unik tema (huruf kecil, angka, underscore), contoh: `"custom_cyber_gold"` |
| `name` | `string` | **YA** | Nama tampilan tema, contoh: `"Cyberpunk Royal Gold"` |
| `badge` | `string` | Opsional | Teks badge singkat, contoh: `"VIP EDITION"`, `"CYBER"`, `"RETRO"`, `"1:1 SQUARE"` |
| `description`| `string` | Opsional | Deskripsi visual gaya tema |
| `category` | `string` | Opsional | Kategori tema, contoh: `"Futuristic Luxury"`, `"Retro Nostalgia"`, `"Classic Royalty"` |
| `accentColor`| `string` | Opsional | Kode warna HEX aksen tema, contoh: `"#EAB308"`, `"#EC4899"`, `"#06B6D4"` |
| `icon` | `string` | Opsional | Nama ikon Lucide: `"Sparkles"`, `"Crown"`, `"Zap"`, `"Shield"`, `"Flame"`, `"Camera"`, `"LayoutGrid"`, `"Layers"` |
| `aspectRatio`| `string` | Opsional | Rasio aspek kartu: `"3:4"`, `"2:3"`, `"1:1"`, `"16:9"`, `"4:5"`, `"9:16"`, `"auto"` |
| `assets` | `object` | Opsional | Objek URL gambar latar, pola tekstur, ikon lencana, atau watermark |
| `layoutOffsets` | `object` | Opsional | Koordinat pergeseran presisi `{ x, y }` dalam piksel untuk sub-elemen |
| `typography` | `object` | Opsional | Konfigurasi ukuran, ketebalan, dan warna teks khusus |
| `layoutConfig`| `object` | **YA** | Objek konfigurasi layout & styling visual kartu |

---

## 2. Opsi Objek `assets` (Aset Gambar Kustom)

Mendukung URL gambar langsung (HTTPS) maupun format Base64 Data URI (`data:image/svg+xml;base64,...` atau `data:image/png;base64,...`):

| Properti | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `backgroundImageUrl` | `string` | URL gambar latar belakang kartu (diberi opacity lembut agar teks tetap terbaca) |
| `overlayPatternUrl` | `string` | URL tekstur/pattern pengulangan latar belakang (blend mode overlay) |
| `customBadgeIconUrl` | `string` | URL ikon lencana kustom di samping rank badge |
| `watermarkUrl` | `string` | URL logo watermark transparan di sudut kartu |
| `frameMaskUrl` | `string` | Data URI mask SVG/PNG untuk masking bentuk foto kustom |

---

## 3. Opsi Objek `layoutOffsets` (Offset Presisi dalam Piksel)

Mengatur pergeseran posisi elemen kartu dengan koordinat `{ x: number, y: number }`:

| Properti | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `ratingOffset` | `{ x: number, y: number }` | Pergeseran posisi blok rating & skor |
| `nameOffset` | `{ x: number, y: number }` | Pergeseran posisi teks nama artis |
| `badgeOffset` | `{ x: number, y: number }` | Pergeseran posisi badge ranking / bendera |
| `specsOffset` | `{ x: number, y: number }` | Pergeseran posisi statistik (BWH, tinggi, cup, dll.) |
| `thumbnailOffset`| `{ x: number, y: number }` | Pergeseran posisi foto artis |

---

## 4. Opsi Objek `typography` (Tipografi Khusus)

Mengatur pewarnaan dan ukuran tipografi pada kartu:

| Properti | Tipe Data | Keterangan & Pilihan Nilai |
| :--- | :--- | :--- |
| `nameFontSize` | `string` | Ukuran nama artis: `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, `"2xl"` |
| `nameFontWeight` | `string` | Ketebalan font nama: `"normal"`, `"medium"`, `"semibold"`, `"bold"`, `"black"` |
| `primaryTextColor` | `string` | Warna HEX teks utama / nama artis (contoh: `"#FFFFFF"`, `"#FEF3C7"`) |
| `secondaryTextColor`| `string` | Warna HEX teks sekunder / sub-judul (contoh: `"#CBD5E1"`, `"#94A3B8"`) |
| `scoreTextColor` | `string` | Warna HEX angka rating / skor (contoh: `"#FACC15"`, `"#F43F5E"`) |
| `fontFamily` | `string` | Font family kustom CSS (opsional) |

---

## 5. Opsi Objek `layoutConfig`

Objek `layoutConfig` mengontrol geometri, penempatan elemen, visibilitas statistik, ornamen, dan efek visual kartu:

### A. Bentuk & Struktur (`cardShape`, `thumbnailShape`, `aspectRatio`)
- **`cardShape`**: Bentuk siluet bingkai kartu:
  - `"standard"` : Persegi sudut melengkung standar
  - `"rounded"` : Sudut ekstra bulat modern (16px)
  - `"square"` : Sudut kotak tajam
  - `"pill"` : Sudut kapsul/pill
  - `"asymmetric"` : Sudut asimetris futuristik
  - `"chamfer"` : Sudut terpotong miring (*bevel/chamfer*)
  - `"arch"` : Atas melengkung kubah (*arch*)
- **`thumbnailShape`**: Bentuk wadah foto artis:
  - `"full_bleed"` : Foto memenuhi seluruh kartu (*overlay*)
  - `"inset"` : Foto dengan margin bingkai di dalam
  - `"circular"` : Foto berbentuk lingkaran
  - `"arch"` : Foto bagian atas melengkung kubah
  - `"squircle"` : Foto squircle superellips
  - `"diamond"` : Foto siluet belah ketupat (*diamond*)
  - `"polaroid"` : Foto bergaya cetak instan polaroid
- **`aspectRatio`**: `"3:4"` | `"2:3"` | `"1:1"` | `"16:9"` | `"4:5"` | `"9:16"` | `"auto"`
- **`thumbnailScale`**: `"cover"` | `"contain"` | `"zoom"` | `"fit"`
- **`thumbnailPosition`**: `"top"` | `"center"` | `"bottom"`
- **`informationLayout`**: `"overlay"` | `"split"` | `"floating"` | `"bottom_sheet"` | `"side_by_side"`
- **`maskShape`**: `"none"` | `"shield"` | `"diamond"` | `"hexagon"` | `"circle"` | `"arch"` | `"squircle"` | `"chamfer"`

### B. Matriks Posisi Elemen
- **`ratingPosition`**: `"top_right"` | `"top_left"` | `"top_center"` | `"bottom_right"` | `"bottom_left"` | `"bottom_center"` | `"center"` | `"header"` | `"with_score"` | `"hidden"`
- **`namePosition`**: `"bottom_center"` | `"bottom_left"` | `"bottom_right"` | `"top_left"` | `"top_center"` | `"top_right"` | `"middle"` | `"footer"`
- **`bodyTypePosition`**: `"top_right"` | `"top_left"` | `"top_center"` | `"bottom_right"` | `"bottom_left"` | `"bottom_center"` | `"with_name"` | `"with_specs"` | `"badge_pill"` | `"header"` | `"hidden"`
- **`countryPosition`**: `"top_left"` | `"top_right"` | `"top_center"` | `"bottom_left"` | `"bottom_right"` | `"with_name"` | `"with_rating"` | `"header"` | `"hidden"`
- **`measurementPosition`**: `"bottom_center"` | `"bottom_left"` | `"bottom_right"` | `"side_rail"` | `"with_name"` | `"footer"` | `"top_left"` | `"hidden"`
- **`ornamentPosition`**: `"corners"` | `"top"` | `"border"` | `"background"` | `"center"` | `"none"`
- **`sectionDivider`**: `"none"` | `"subtle_line"` | `"glowing"` | `"dashed"` | `"pill_border"`

### C. Mode Tampilan & Tipografi
- **`scoreDisplay`**: `"compact"` | `"prominent"` | `"hud_rail"` | `"pill"` | `"crest"` | `"badge"` | `"minimal"` | `"hidden"`
- **`nameAlignment`**: `"center"` | `"left"` | `"right"`
- **`nameStyle`**: `"stacked"` | `"inline"` | `"hero"` | `"modern_compact"` | `"badge"`
- **`headerPosition`**: `"top_left"` | `"top_right"` | `"top_center"` | `"split_top"` | `"floating_pills"` | `"minimal_top"` | `"none"`
- **`footerPosition`**: `"bottom_center"` | `"bottom_full"` | `"bottom_left"` | `"pill_center"` | `"bottom_simple"` | `"bottom_right"` | `"none"`

### D. Pengaturan Visibilitas Data (Boolean)
- `showBwh` (`true` / `false`): Tampilkan lingkar B/W/H (Dada, Pinggang, Pinggul)
- `showAge` (`true` / `false`): Tampilkan usia artis
- `showMaturity` (`true` / `false`): Tampilkan kematangan usia
- `showRankBadge` (`true` / `false`): Tampilkan lencana ranking #1, #2, dst.
- `showAppImpScore` (`true` / `false`): Tampilkan skor Appeal & Impression
- `showHeight` (`true` / `false`): Tampilkan tinggi badan
- `showCupSize` (`true` / `false`): Tampilkan ukuran cup bra

### E. Ornamen, Border, & Efek Visual
- **`ornamentStyle`**: `"none"` | `"geometric_corners"` | `"crest_shield"` | `"laser_hud"` | `"ambient_glow"` | `"cyberpunk_bracket"` | `"double_ring"`
- **`borderWidth`**: Ketebalan border dalam pixel, contoh: `1`, `2`, `3`
- **`glassmorphism`** (`true` / `false`): Aktifkan efek latar kaca transparan blur
- **`themeColorMode`**: `"type_based"` (warna mengikuti tipe artis) atau `"custom"` (mengikuti `customBorderColor` / `accentColor`)
- **`customBorderColor`**: Kode HEX warna border khusus, contoh: `"#EAB308"`
- **`gradientOverlay`**: `"dark_top_bottom"` | `"bottom_only"` | `"radial_subtle"` | `"none"` | `"vignette"` | `"top_only"`

---

## 6. Contoh Template File JSON Siap Pakai

Simpan kode di bawah sebagai file `.json` (misalnya `tema-cyber-gold.json`), lalu impor melalui tab **Tema Card** di menu Pengaturan:

```json
{
  "type": "talent_rating_card_theme",
  "version": "1.0.0",
  "id": "cyber_gold_advanced",
  "name": "Cyber Gold Advanced Edition",
  "badge": "VIP GOLD",
  "description": "Desain kartu futuristik elegan dengan dukungan aset kustom, offset presisi, rasio 3:4, dan tipografi modern.",
  "category": "Futuristic Luxury",
  "accentColor": "#EAB308",
  "icon": "Crown",
  "aspectRatio": "3:4",
  "layoutOffsets": {
    "ratingOffset": { "x": 0, "y": 0 },
    "nameOffset": { "x": 0, "y": -4 }
  },
  "typography": {
    "nameFontSize": "lg",
    "nameFontWeight": "bold",
    "primaryTextColor": "#FFFFFF",
    "secondaryTextColor": "#CBD5E1",
    "scoreTextColor": "#FACC15"
  },
  "layoutConfig": {
    "cardShape": "chamfer",
    "thumbnailShape": "full_bleed",
    "thumbnailScale": "cover",
    "thumbnailPosition": "top",
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
    "ornamentStyle": "geometric_corners",
    "borderWidth": 2,
    "glassmorphism": true,
    "themeColorMode": "custom",
    "customBorderColor": "#EAB308",
    "gradientOverlay": "dark_top_bottom"
  }
}
```
