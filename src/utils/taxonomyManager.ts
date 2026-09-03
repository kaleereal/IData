/**
 * ============================================================================
 * MASTER TAXONOMY & 4-TIER RELATIONAL SCHEMA ENGINE (V2 TOTAL REBUILD)
 * 4-Level Hierarchy: Section -> Category -> Sub-category -> Item (Field)
 * Full Metadata, Mandatory Control, Dynamic Formats, Formula Builder,
 * Global & Form Sync, and High-Performance SWR / Redis Invalidation.
 * ============================================================================
 */

import { DatabaseSchema, FieldMetadata, ScoringTraitMetadata } from '../types';
import { DEFAULT_DATABASE_SCHEMA } from '../data/defaultSchema';

export type FieldDataType =
  | 'text'
  | 'number'
  | 'date'
  | 'button_link'
  | 'single_select'
  | 'multi_select'
  | 'scoring';

export interface FieldFormatConfig {
  unit?: string;               // e.g. ".cm", "kg", "pts", "th"
  dateFormat?: string;         // e.g. "YYYY-MM-DD", "DD/MM/YYYY"
  placeholder?: string;        // e.g. "Masukkan nama artis..."
  min?: number;                // e.g. 0, 100
  max?: number;                // e.g. 100, 250
  step?: number;               // e.g. 1, 0.5
  urlPrefix?: string;          // e.g. "https://instagram.com/"
  options?: TaxonomyChoiceItem[]; // For single_select and multi_select
}

export interface TaxonomyChoiceItem {
  id: string;
  systemValue: string;
  appLabel: string;
  formLabel: string;
  badgeColor?: string;
  description?: string;
  guideline?: string;
}

/**
 * Base metadata shared by all 4 levels of hierarchy
 */
export interface BaseTaxonomyElement {
  id: string;
  systemKey: string;           // Teks Asli (System/Database Key/ID)
  appLabel: string;            // Teks Tampilan Aplikasi (Public UI Label)
  formLabel: string;           // Teks Tampilan Halaman Edit/Buat Artis (Admin Form Label)
  description: string;         // Deskripsi Elemen
  evaluationGuideline: string; // Panduan Penilaian (Tooltip / Pedoman Pengisian)
  functionLocation: string;    // Deskripsi Fungsi & Lokasi Elemen (Context/System Note)
  orderIndex: number;          // Position index for reordering
  isActive: boolean;
}

/**
 * Level 4: Item (Field)
 */
export interface TaxonomyItem extends BaseTaxonomyElement {
  level: 'item';
  subcategoryId: string;
  categoryId: string;
  sectionId: string;
  folder_id?: string | null;   // Nullable: ID Folder Kategori. Jika null, berstatus Standalone
  parent_id?: string | null;   // Alias for relational schema parent
  isRequired: boolean;         // Sifat Mandatory: Wajib Diisi vs Opsional
  fieldType: FieldDataType;    // Jenis & Format Field
  formatConfig: FieldFormatConfig;
  scoringWeight?: number;      // Specific weight if field is of type 'scoring' (0-100%)
  scoringCategory?: 'appearance' | 'impression' | 'performance' | 'general';
}

/**
 * Level 3: Sub-kategori
 */
export interface TaxonomySubcategory extends BaseTaxonomyElement {
  level: 'subcategory';
  categoryId: string;
  sectionId: string;
  items: TaxonomyItem[];
}

/**
 * Level 2: Kategori
 */
export interface TaxonomyCategory extends BaseTaxonomyElement {
  level: 'category';
  sectionId: string;
  icon?: string;
  color?: string;
  subcategories: TaxonomySubcategory[];
}

/**
 * Level 1: Section
 */
export interface TaxonomySection extends BaseTaxonomyElement {
  level: 'section';
  icon?: string;
  badgeColor?: string;
  categories: TaxonomyCategory[];
}

/**
 * Rating Scale Threshold (e.g. S Tier: 90-100, A: 80-89)
 */
export interface RatingPredicateTier {
  id: string;
  grade: string;              // "S", "A", "B", "C", "D"
  minScore: number;           // 90
  maxScore: number;           // 100
  label: string;              // "Sempurna / Masterpiece"
  badgeColor: string;         // Hex or Tailwind class
  starCount: number;          // 1-5
}

/**
 * Scoring Indicator Weight Item
 */
export interface ScoringWeightItem {
  key: string;                // e.g. "face", "skin", "voice"
  name: string;               // e.g. "Wajah & Fitur Muka"
  category: 'appearance' | 'impression';
  weightPercent: number;      // e.g. 25 (%)
  description: string;
  guideline: string;
}

/**
 * Scoring & Rating System Configuration (Tab 2)
 */
export interface ScoringSystemConfig {
  id: string;
  minScale: number;           // 0
  maxScale: number;           // 100
  formulaExpression: string;  // e.g. "(Appearance * 0.5) + (Impression * 0.5)"
  formulaDescription: string;
  appearanceWeightTotal: number; // 50%
  impressionWeightTotal: number; // 50%
  appearanceWeights: ScoringWeightItem[];
  impressionWeights: ScoringWeightItem[];
  tiers: RatingPredicateTier[];
}

/**
 * Complete Master Taxonomy State
 */
export interface MasterTaxonomyData {
  version: number;
  lastUpdated: string;
  cacheStatus: 'ACTIVE' | 'SYNCED' | 'FLUSHED';
  sections: TaxonomySection[];
  scoringSystem: ScoringSystemConfig;
}

const STORAGE_KEY = 'applet_master_taxonomy_v3_4tier';
const CACHE_METADATA_KEY = 'applet_taxonomy_cache_meta_v3';

// ============================================================================
// INITIAL SEED DATA (4-LEVEL HIERARCHY ACCORDING TO SPECS)
// ============================================================================

export const initialMasterTaxonomy: MasterTaxonomyData = {
  version: 3,
  lastUpdated: new Date().toISOString(),
  cacheStatus: 'ACTIVE',

  sections: [
    // ------------------------------------------------------------------------
    // SECTION 1: ISIAN DATA POKOK (BIODATA & PROFIL)
    // ------------------------------------------------------------------------
    {
      id: 'sec_biodata',
      systemKey: 'sec_biodata',
      appLabel: 'Isian Data Pokok & Biodata',
      formLabel: '1. Isian Data Pokok & Identitas Artis',
      description: 'Kelompok data pokok meliputi nama, tanggal lahir, debut, asal negara, dan dimensi fisik dasar.',
      evaluationGuideline: 'Pastikan data nama dan tanggal lahir diverifikasi sesuai dokumen rujukan resmi atau agensi.',
      functionLocation: 'Halaman Detail Profil, Kartu Artis, Leaderboard, dan Form Tambah/Edit.',
      orderIndex: 0,
      isActive: true,
      icon: 'User',
      badgeColor: '#6366f1',
      level: 'section',
      categories: [
        {
          id: 'cat_identity',
          systemKey: 'cat_identity',
          sectionId: 'sec_biodata',
          appLabel: 'Identitas & Nama',
          formLabel: 'A. Identitas & Nama Artis',
          description: 'Nama depan, nama belakang, dan foto profil utama.',
          evaluationGuideline: 'Gunakan nama panggung utama pada Nama Depan jika artis hanya memiliki satu nama.',
          functionLocation: 'Header profil, kartu ringkasan artis, dan form input.',
          orderIndex: 0,
          isActive: true,
          level: 'category',
          icon: 'BadgeCheck',
          color: '#3b82f6',
          subcategories: [
            {
              id: 'sub_names',
              systemKey: 'sub_names',
              categoryId: 'cat_identity',
              sectionId: 'sec_biodata',
              appLabel: 'Data Nama',
              formLabel: 'Rincian Nama Artis',
              description: 'Komponen nama depan dan belakang.',
              evaluationGuideline: 'Isi nama depan dengan tepat.',
              functionLocation: 'Semua kartu dan profil.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_first_name',
                  systemKey: 'firstName',
                  subcategoryId: 'sub_names',
                  categoryId: 'cat_identity',
                  sectionId: 'sec_biodata',
                  appLabel: 'Nama Depan',
                  formLabel: 'Nama Depan Artis (Wajib)',
                  description: 'Nama depan atau nama panggung utama.',
                  evaluationGuideline: 'Wajib diisi dengan alfabet standar, huruf kapital di awal kata.',
                  functionLocation: 'Semua halaman aplikasi (Kartu, Header, Leaderboard, Form).',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'text',
                  level: 'item',
                  formatConfig: {
                    placeholder: 'contoh: Eimi, Yua, Karen',
                  },
                },
                {
                  id: 'item_last_name',
                  systemKey: 'lastName',
                  subcategoryId: 'sub_names',
                  categoryId: 'cat_identity',
                  sectionId: 'sec_biodata',
                  appLabel: 'Nama Belakang',
                  formLabel: 'Nama Belakang / Famili (Opsional)',
                  description: 'Nama belakang atau nama keluarga.',
                  evaluationGuideline: 'Kosongkan bila artis hanya menggunakan satu kata nama.',
                  functionLocation: 'Detail Profil, Kartu Artis, Form.',
                  orderIndex: 1,
                  isActive: true,
                  isRequired: false,
                  fieldType: 'text',
                  level: 'item',
                  formatConfig: {
                    placeholder: 'contoh: Fukada, Mikami',
                  },
                },
                {
                  id: 'item_avatar_url',
                  systemKey: 'avatarUrl',
                  subcategoryId: 'sub_names',
                  categoryId: 'cat_identity',
                  sectionId: 'sec_biodata',
                  appLabel: 'Foto Profil',
                  formLabel: 'URL Foto Profil Utama',
                  description: 'Tautan gambar avatar resolusi tinggi.',
                  evaluationGuideline: 'Gunakan URL HTTPS langsung dengan orientasi potret berkualitas baik.',
                  functionLocation: 'Kartu Artis, Detail Profil, Thumbnail Leaderboard.',
                  orderIndex: 2,
                  isActive: true,
                  isRequired: false,
                  fieldType: 'text',
                  level: 'item',
                  formatConfig: {
                    placeholder: 'https://images.unsplash.com/...',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'cat_demographics',
          systemKey: 'cat_demographics',
          sectionId: 'sec_biodata',
          appLabel: 'Asal & Tanggal',
          formLabel: 'B. Tanggal & Kewarganegaraan',
          description: 'Informasi tanggal lahir, tanggal debut, dan negara asal artis.',
          evaluationGuideline: 'Format tanggal harus YYYY-MM-DD untuk kalkulasi usia dan masa aktif otomatis.',
          functionLocation: 'Detail Profil, Leaderboard, Form.',
          orderIndex: 1,
          isActive: true,
          level: 'category',
          icon: 'Globe',
          color: '#10b981',
          subcategories: [
            {
              id: 'sub_chronology',
              systemKey: 'sub_chronology',
              categoryId: 'cat_demographics',
              sectionId: 'sec_biodata',
              appLabel: 'Kronologi Waktu',
              formLabel: 'Kronologi Kelahiran & Debut',
              description: 'Penanggalan lahir dan debut industri.',
              evaluationGuideline: 'Pastikan tanggal debut sesudah tanggal lahir.',
              functionLocation: 'Kalkulator usia, masa aktif, dan sorting kronologis.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_born_date',
                  systemKey: 'bornDate',
                  subcategoryId: 'sub_chronology',
                  categoryId: 'cat_demographics',
                  sectionId: 'sec_biodata',
                  appLabel: 'Tanggal Lahir',
                  formLabel: 'Tanggal Lahir (YYYY-MM-DD)',
                  description: 'Tanggal kelahiran artis untuk kalkulasi usia otomatis.',
                  evaluationGuideline: 'Format wajib YYYY-MM-DD. Menentukan badge usia dan kelompok generasi.',
                  functionLocation: 'Profil Artis, Ranking Usia, Form.',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'date',
                  level: 'item',
                  formatConfig: {
                    dateFormat: 'YYYY-MM-DD',
                    placeholder: 'YYYY-MM-DD',
                  },
                },
                {
                  id: 'item_debut_date',
                  systemKey: 'debutDate',
                  subcategoryId: 'sub_chronology',
                  categoryId: 'cat_demographics',
                  sectionId: 'sec_biodata',
                  appLabel: 'Tanggal Debut',
                  formLabel: 'Tanggal Debut (YYYY-MM-DD)',
                  description: 'Tanggal rilis karya pertama di industri.',
                  evaluationGuideline: 'Digunakan untuk menghitung masa aktif dan pengalaman di industri.',
                  functionLocation: 'Detail Profil, Form.',
                  orderIndex: 1,
                  isActive: true,
                  isRequired: false,
                  fieldType: 'date',
                  level: 'item',
                  formatConfig: {
                    dateFormat: 'YYYY-MM-DD',
                    placeholder: 'YYYY-MM-DD',
                  },
                },
                {
                  id: 'item_country',
                  systemKey: 'country',
                  subcategoryId: 'sub_chronology',
                  categoryId: 'cat_demographics',
                  sectionId: 'sec_biodata',
                  appLabel: 'Negara Asal',
                  formLabel: 'Negara / Wilayah Asal',
                  description: 'Negara asal atau kewarganegaraan artis.',
                  evaluationGuideline: 'Pilih dari daftar negara atau tambahkan negara baru.',
                  functionLocation: 'Bendera negara di semua kartu, filter leaderboard, profil.',
                  orderIndex: 2,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'single_select',
                  level: 'item',
                  formatConfig: {
                    options: [
                      { id: 'c_jp', systemValue: 'Japan', appLabel: 'Japan (JP)', formLabel: '🇯🇵 Japan', badgeColor: '#ef4444' },
                      { id: 'c_md', systemValue: 'Moldova', appLabel: 'Moldova (MD)', formLabel: '🇲🇩 Moldova', badgeColor: '#3b82f6' },
                      { id: 'c_us', systemValue: 'United States', appLabel: 'United States (US)', formLabel: '🇺🇸 United States', badgeColor: '#10b981' },
                      { id: 'c_kr', systemValue: 'South Korea', appLabel: 'South Korea (KR)', formLabel: '🇰🇷 South Korea', badgeColor: '#8b5cf6' },
                      { id: 'c_id', systemValue: 'Indonesia', appLabel: 'Indonesia (ID)', formLabel: '🇮🇩 Indonesia', badgeColor: '#f59e0b' },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ------------------------------------------------------------------------
    // SECTION 2: DIMENSI FISIK & UKURAN TUBUH (MEASUREMENTS)
    // ------------------------------------------------------------------------
    {
      id: 'sec_measurements',
      systemKey: 'sec_measurements',
      appLabel: 'Dimensi Fisik & Ukuran Tubuh',
      formLabel: '2. Dimensi Fisik, Tinggi, & Ukuran (BWH)',
      description: 'Pengukuran dimensi tubuh mencakup tinggi badan, ukuran cup, lingkar dada, pinggang, dan pinggul.',
      evaluationGuideline: 'Gunakan satuan centimeter (.cm) standar metrik untuk seluruh pengukuran tubuh.',
      functionLocation: 'Detail Profil, Kartu Ringkasan, Radar Chart Fisik, Form.',
      orderIndex: 1,
      isActive: true,
      icon: 'Ruler',
      badgeColor: '#ec4899',
      level: 'section',
      categories: [
        {
          id: 'cat_stature',
          systemKey: 'cat_stature',
          sectionId: 'sec_measurements',
          appLabel: 'Tinggi & Postur',
          formLabel: 'A. Tinggi Badan & Postur Dasar',
          description: 'Ukuran tinggi vertikal tubuh.',
          evaluationGuideline: 'Rentang realistis umumnya antara 140 cm hingga 190 cm.',
          functionLocation: 'Detail Profil, Kartu Artis, Leaderboard.',
          orderIndex: 0,
          isActive: true,
          level: 'category',
          icon: 'TrendingUp',
          color: '#ec4899',
          subcategories: [
            {
              id: 'sub_height',
              systemKey: 'sub_height',
              categoryId: 'cat_stature',
              sectionId: 'sec_measurements',
              appLabel: 'Tinggi Badan',
              formLabel: 'Tinggi Badan Metrik',
              description: 'Tinggi badan dalam satuan centimeter.',
              evaluationGuideline: 'Wajib diisi angka bilangan bulat positif.',
              functionLocation: 'Kalkulator BMI, tipe postur tubuh, profil.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_height_cm',
                  systemKey: 'heightCm',
                  subcategoryId: 'sub_height',
                  categoryId: 'cat_stature',
                  sectionId: 'sec_measurements',
                  appLabel: 'Tinggi Badan',
                  formLabel: 'Tinggi Badan (cm)',
                  description: 'Tinggi badan berdiri tegak tanpa alas kaki.',
                  evaluationGuideline: 'Gunakan nilai antara 140 s/d 200 cm.',
                  functionLocation: 'Semua kartu artis, detail spesifikasi, perbandingan.',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: {
                    unit: '.cm',
                    placeholder: '160',
                    min: 130,
                    max: 210,
                    step: 1,
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'cat_bwh',
          systemKey: 'cat_bwh',
          sectionId: 'sec_measurements',
          appLabel: 'Ukuran 3 Titik (B-W-H)',
          formLabel: 'B. Tiga Ukuran (Bust, Waist, Hip & Cup)',
          description: 'Ukuran lingkar dada, lingkar pinggang, lingkar pinggul, dan ukuran cup bra.',
          evaluationGuideline: 'Standar BWH model Jepang/Asia dalam centimeter.',
          functionLocation: 'Detail Profil, Radar Proporsi Tubuh, Form.',
          orderIndex: 1,
          isActive: true,
          level: 'category',
          icon: 'Layers',
          color: '#f43f5e',
          subcategories: [
            {
              id: 'sub_measurements_details',
              systemKey: 'sub_measurements_details',
              categoryId: 'cat_bwh',
              sectionId: 'sec_measurements',
              appLabel: 'Rincian BWH',
              formLabel: 'Pengukuran B-W-H Lengkap',
              description: 'Rincian 3 titik ukuran dan ukuran cup.',
              evaluationGuideline: 'Lengkapi seluruh 4 nilai untuk visualisasi proporsi akurat.',
              functionLocation: 'Card BWH stats, visual radar.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_cup_size',
                  systemKey: 'cupSize',
                  subcategoryId: 'sub_measurements_details',
                  categoryId: 'cat_bwh',
                  sectionId: 'sec_measurements',
                  appLabel: 'Ukuran Cup',
                  formLabel: 'Ukuran Cup Bra (B s/d K)',
                  description: 'Ukuran cup payudara standar internasional.',
                  evaluationGuideline: 'Pilih huruf cup dari B hingga K.',
                  functionLocation: 'Badge Cup di kartu artis, filter leaderboard, detail.',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'single_select',
                  level: 'item',
                  formatConfig: {
                    options: [
                      { id: 'cup_b', systemValue: 'B', appLabel: 'Cup B', formLabel: 'Cup B', badgeColor: '#60a5fa' },
                      { id: 'cup_c', systemValue: 'C', appLabel: 'Cup C', formLabel: 'Cup C', badgeColor: '#34d399' },
                      { id: 'cup_d', systemValue: 'D', appLabel: 'Cup D', formLabel: 'Cup D', badgeColor: '#a78bfa' },
                      { id: 'cup_e', systemValue: 'E', appLabel: 'Cup E', formLabel: 'Cup E', badgeColor: '#f472b6' },
                      { id: 'cup_f', systemValue: 'F', appLabel: 'Cup F', formLabel: 'Cup F', badgeColor: '#fb7185' },
                      { id: 'cup_g', systemValue: 'G', appLabel: 'Cup G', formLabel: 'Cup G', badgeColor: '#f59e0b' },
                      { id: 'cup_h', systemValue: 'H', appLabel: 'Cup H', formLabel: 'Cup H', badgeColor: '#ef4444' },
                      { id: 'cup_i', systemValue: 'I', appLabel: 'Cup I', formLabel: 'Cup I', badgeColor: '#dc2626' },
                      { id: 'cup_j', systemValue: 'J', appLabel: 'Cup J', formLabel: 'Cup J', badgeColor: '#b91c1c' },
                      { id: 'cup_k', systemValue: 'K', appLabel: 'Cup K', formLabel: 'Cup K', badgeColor: '#991b1b' },
                    ],
                  },
                },
                {
                  id: 'item_bust_cm',
                  systemKey: 'bustCm',
                  subcategoryId: 'sub_measurements_details',
                  categoryId: 'cat_bwh',
                  sectionId: 'sec_measurements',
                  appLabel: 'Lingkar Dada (Bust)',
                  formLabel: 'Lingkar Dada / Bust (cm)',
                  description: 'Lingkar dada terbesar melingkari puncak payudara.',
                  evaluationGuideline: 'Nilai centimeter (cm) bulat positif.',
                  functionLocation: 'BWH metric stats, perbandingan profil.',
                  orderIndex: 1,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: {
                    unit: '.cm',
                    placeholder: '88',
                    min: 60,
                    max: 130,
                    step: 1,
                  },
                },
                {
                  id: 'item_waist_cm',
                  systemKey: 'waistCm',
                  subcategoryId: 'sub_measurements_details',
                  categoryId: 'cat_bwh',
                  sectionId: 'sec_measurements',
                  appLabel: 'Lingkar Pinggang (Waist)',
                  formLabel: 'Lingkar Pinggang / Waist (cm)',
                  description: 'Lingkar pinggang terkecil di atas pusar.',
                  evaluationGuideline: 'Nilai centimeter (cm) bulat positif.',
                  functionLocation: 'BWH metric stats, kalkulator rasio pinggang-pinggul.',
                  orderIndex: 2,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: {
                    unit: '.cm',
                    placeholder: '58',
                    min: 45,
                    max: 100,
                    step: 1,
                  },
                },
                {
                  id: 'item_hip_cm',
                  systemKey: 'hipCm',
                  subcategoryId: 'sub_measurements_details',
                  categoryId: 'cat_bwh',
                  sectionId: 'sec_measurements',
                  appLabel: 'Lingkar Pinggul (Hip)',
                  formLabel: 'Lingkar Pinggul / Hip (cm)',
                  description: 'Lingkar pinggul terbesar melingkari bokong.',
                  evaluationGuideline: 'Nilai centimeter (cm) bulat positif.',
                  functionLocation: 'BWH metric stats, profil.',
                  orderIndex: 3,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: {
                    unit: '.cm',
                    placeholder: '86',
                    min: 65,
                    max: 130,
                    step: 1,
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ------------------------------------------------------------------------
    // SECTION 3: KARAKTER, PESONA, & STATUS (CHARACTER & APPEAL)
    // ------------------------------------------------------------------------
    {
      id: 'sec_appeal',
      systemKey: 'sec_appeal',
      appLabel: 'Dimensi Karakter, Pesona & Taksonomi',
      formLabel: '3. Dimensi Karakter, Pesona, & Status Keartisan',
      description: 'Pilihan taksonomi kualitatif meliputi maturity, vibe, style, body shape, status keartisan, dan tag specialty.',
      evaluationGuideline: 'Pilih opsi yang paling dominan menggambarkan persona visual dan citra artis.',
      functionLocation: 'Filter Taksonomi, Badge Profil, Mesin Rekomendasi, Form.',
      orderIndex: 2,
      isActive: true,
      icon: 'Sparkles',
      badgeColor: '#8b5cf6',
      level: 'section',
      categories: [
        {
          id: 'cat_status_type',
          systemKey: 'cat_status_type',
          sectionId: 'sec_appeal',
          appLabel: 'Status & Bentuk Tubuh',
          formLabel: 'A. Status Keartisan & Tipe Bentuk Tubuh',
          description: 'Klasifikasi profesionalitas dan bentuk perawakan fisik.',
          evaluationGuideline: 'Tentukan status kontrak dan perawakan tinggi-berat tubuh.',
          functionLocation: 'Badge utama kartu artis, filter leaderboard.',
          orderIndex: 0,
          isActive: true,
          level: 'category',
          icon: 'Award',
          color: '#8b5cf6',
          subcategories: [
            {
              id: 'sub_classifications',
              systemKey: 'sub_classifications',
              categoryId: 'cat_status_type',
              sectionId: 'sec_appeal',
              appLabel: 'Klasifikasi Artis',
              formLabel: 'Klasifikasi Kontrak & Bentuk Tubuh',
              description: 'Status kontrak kerja dan tipe kombinasi tinggi-berat.',
              evaluationGuideline: 'Pilih status yang sesuai.',
              functionLocation: 'Badge kartu dan header.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_artist_status',
                  systemKey: 'artistStatus',
                  subcategoryId: 'sub_classifications',
                  categoryId: 'cat_status_type',
                  sectionId: 'sec_appeal',
                  appLabel: 'Status Artis',
                  formLabel: 'Status Keartisan (Amatir / Pro / Eksklusif)',
                  description: 'Status keartisan resmi (Amatir, Profesional, Eksklusif Agensi).',
                  evaluationGuideline: 'Menentukan kategori liga dan filter ranking.',
                  functionLocation: 'Badge status di seluruh kartu, filter leaderboard.',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'single_select',
                  level: 'item',
                  formatConfig: {
                    options: [
                      { id: 'st_amatir', systemValue: 'Amatir', appLabel: 'Amatir / Indie', formLabel: '🔰 Amatir / Indie', badgeColor: '#10b981' },
                      { id: 'st_pro', systemValue: 'Profesional', appLabel: 'Profesional', formLabel: '⭐ Profesional', badgeColor: '#3b82f6' },
                      { id: 'st_exclusive', systemValue: 'Eksklusif', appLabel: 'Eksklusif Agensi', formLabel: '👑 Eksklusif Agensi', badgeColor: '#f59e0b' },
                    ],
                  },
                },
                {
                  id: 'item_type_code',
                  systemKey: 'typeCode',
                  subcategoryId: 'sub_classifications',
                  categoryId: 'cat_status_type',
                  sectionId: 'sec_appeal',
                  appLabel: 'Tipe Bentuk Tubuh',
                  formLabel: 'Kode Tipe Bentuk Tubuh (2 Karakter)',
                  description: 'Kombinasi tinggi & berat (misal: AK = Sedang Kurus, SL = Pendek Ramping).',
                  evaluationGuideline: 'Kombinasi S/A/T (Pendek/Sedang/Tinggi) + K/L/A/C/O (Kurus/Ramping/Sedang/Gemuk/Sangat Gemuk).',
                  functionLocation: 'Tag tipe tubuh pada kartu, detail profil.',
                  orderIndex: 1,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'single_select',
                  level: 'item',
                  formatConfig: {
                    options: [
                      { id: 'type_sk', systemValue: 'SK', appLabel: 'SK (Pendek Kurus)', formLabel: 'SK - Pendek Kurus', description: 'pendek kurus (short skinny)', badgeColor: '#64748b' },
                      { id: 'type_sl', systemValue: 'SL', appLabel: 'SL (Pendek Ramping)', formLabel: 'SL - Pendek Ramping', description: 'pendek ramping (short slim)', badgeColor: '#ec4899' },
                      { id: 'type_sa', systemValue: 'SA', appLabel: 'SA (Pendek Sedang)', formLabel: 'SA - Pendek Sedang', description: 'pendek sedang (short average)', badgeColor: '#06b6d4' },
                      { id: 'type_sc', systemValue: 'SC', appLabel: 'SC (Pendek Gemuk / Berisi)', formLabel: 'SC - Pendek Gemuk', description: 'pendek gemuk (short chubby)', badgeColor: '#f43f5e' },
                      { id: 'type_so', systemValue: 'SO', appLabel: 'SO (Pendek Sangat Gemuk)', formLabel: 'SO - Pendek Sangat Gemuk', description: 'pendek sangat gemuk (short overweight)', badgeColor: '#e11d48' },
                      { id: 'type_ak', systemValue: 'AK', appLabel: 'AK (Sedang Kurus)', formLabel: 'AK - Sedang Kurus', description: 'sedang kurus (average skinny)', badgeColor: '#6366f1' },
                      { id: 'type_al', systemValue: 'AL', appLabel: 'AL (Sedang Ramping)', formLabel: 'AL - Sedang Ramping', description: 'sedang ramping (average slim)', badgeColor: '#3b82f6' },
                      { id: 'type_aa', systemValue: 'AA', appLabel: 'AA (Sedang Standard)', formLabel: 'AA - Sedang Standard', description: 'sedang build normal (average)', badgeColor: '#10b981' },
                      { id: 'type_ac', systemValue: 'AC', appLabel: 'AC (Sedang Gemuk)', formLabel: 'AC - Sedang Gemuk', description: 'sedang gemuk (average chubby)', badgeColor: '#f97316' },
                      { id: 'type_ao', systemValue: 'AO', appLabel: 'AO (Sedang Sangat Gemuk)', formLabel: 'AO - Sedang Sangat Gemuk', description: 'sedang sangat gemuk (average overweight)', badgeColor: '#ea580c' },
                      { id: 'type_tk', systemValue: 'TK', appLabel: 'TK (Tinggi Kurus)', formLabel: 'TK - Tinggi Kurus', description: 'tinggi kurus (tall skinny)', badgeColor: '#8b5cf6' },
                      { id: 'type_tl', systemValue: 'TL', appLabel: 'TL (Tinggi Ramping)', formLabel: 'TL - Tinggi Ramping', description: 'tinggi ramping (tall slim)', badgeColor: '#f59e0b' },
                      { id: 'type_ta', systemValue: 'TA', appLabel: 'TA (Tinggi Sedang)', formLabel: 'TA - Tinggi Sedang', description: 'tinggi sedang (tall average)', badgeColor: '#14b8a6' },
                      { id: 'type_tc', systemValue: 'TC', appLabel: 'TC (Tinggi Gemuk)', formLabel: 'TC - Tinggi Gemuk', description: 'tinggi gemuk (tall chubby)', badgeColor: '#d97706' },
                      { id: 'type_to', systemValue: 'TO', appLabel: 'TO (Tinggi Sangat Gemuk)', formLabel: 'TO - Tinggi Sangat Gemuk', description: 'tinggi sangat gemuk (tall overweight)', badgeColor: '#b91c1c' },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'cat_appeal_dimensions',
          systemKey: 'cat_appeal_dimensions',
          sectionId: 'sec_appeal',
          appLabel: 'Dimensi Pesona (Appeal)',
          formLabel: 'B. 4 Dimensi Pesona Karakter (Maturity, Vibe, Style, Shape)',
          description: 'Kategori kepribadian, gaya visual, aura, dan usia pembawaan.',
          evaluationGuideline: 'Pilih persona yang paling konsisten dalam portofolio artis.',
          functionLocation: 'Radar Pesona, Filter Taksonomi, Profil.',
          orderIndex: 1,
          isActive: true,
          level: 'category',
          icon: 'Smile',
          color: '#a855f7',
          subcategories: [
            {
              id: 'sub_appeal_quad',
              systemKey: 'sub_appeal_quad',
              categoryId: 'cat_appeal_dimensions',
              sectionId: 'sec_appeal',
              appLabel: '4 Pilar Pesona',
              formLabel: '4 Pilar Dimensi Pesona Karakter',
              description: 'Maturity, Vibe, Style, dan Body Shape.',
              evaluationGuideline: 'Isi keempat pilar untuk membentuk persona lengkap.',
              functionLocation: 'Panel Pesona Artis di detail profil.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_appeal_maturity',
                  systemKey: 'appeal.maturity',
                  subcategoryId: 'sub_appeal_quad',
                  categoryId: 'cat_appeal_dimensions',
                  sectionId: 'sec_appeal',
                  appLabel: 'Tingkat Kematangan (Maturity)',
                  formLabel: 'Tingkat Kematangan / Usia Pembawaan',
                  description: 'Kesan usia visual dan kedewasaan aura artis.',
                  evaluationGuideline: 'Teen/Young (18-22), MILF/Mature (30-45), Cougar (35-50+).',
                  functionLocation: 'Kartu Artis, Detail Profil, Filter.',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'single_select',
                  level: 'item',
                  formatConfig: {
                    options: [
                      { id: 'mat_teen', systemValue: 'Teen / Young', appLabel: 'Teen / Young', formLabel: '🌸 Teen / Young (18-22)', badgeColor: '#ec4899', description: 'Penampilan muda, segar, lugu usia belasan hingga awal 20-an.' },
                      { id: 'mat_mature', systemValue: 'MILF / Mature', appLabel: 'MILF / Mature', formLabel: '🍷 MILF / Mature (30-45)', badgeColor: '#8b5cf6', description: 'Penampilan matang, percaya diri dengan tubuh berisi dan aura berpengalaman.' },
                      { id: 'mat_cougar', systemValue: 'Cougar', appLabel: 'Cougar', formLabel: '🔥 Cougar (35-50+)', badgeColor: '#ef4444', description: 'Penampilan matang dengan aura agresif, dominan, dan memikat.' },
                    ],
                  },
                },
                {
                  id: 'item_appeal_vibe',
                  systemKey: 'appeal.vibe',
                  subcategoryId: 'sub_appeal_quad',
                  categoryId: 'cat_appeal_dimensions',
                  sectionId: 'sec_appeal',
                  appLabel: 'Aura / Vibe Utama',
                  formLabel: 'Aura & Kesan Pembawaan (Vibe)',
                  description: 'Aura dominan yang terpancar saat berinteraksi.',
                  evaluationGuideline: 'Girl Next Door (ramah), Innocent (polos), Bad Girl (rebel), Girlfriend Experience (intim).',
                  functionLocation: 'Kartu Artis, Detail Profil, Filter.',
                  orderIndex: 1,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'single_select',
                  level: 'item',
                  formatConfig: {
                    options: [
                      { id: 'vibe_gnd', systemValue: 'Girl Next Door (GND)', appLabel: 'Girl Next Door (GND)', formLabel: '🏡 Girl Next Door (GND)', badgeColor: '#10b981', description: 'Ramah, hangat, dan mudah didekati seperti tetangga sebelah.' },
                      { id: 'vibe_innocent', systemValue: 'Innocent / Polos', appLabel: 'Innocent / Polos', formLabel: '🕊️ Innocent / Polos', badgeColor: '#38bdf8', description: 'Lugu dan menggemaskan dengan ekspresi manis natural.' },
                      { id: 'vibe_rebel', systemValue: 'Bad Girl / Rebel', appLabel: 'Bad Girl / Rebel', formLabel: '⚡ Bad Girl / Rebel', badgeColor: '#f43f5e', description: 'Berani, cuek, tatapan tajam, dan aura berbahaya.' },
                      { id: 'vibe_gfe', systemValue: 'Girlfriend Experience (GFE)', appLabel: 'Girlfriend Experience (GFE)', formLabel: '💖 Girlfriend Experience (GFE)', badgeColor: '#ec4899', description: 'Intim, penuh kasih sayang, dan perhatian seperti pacar sungguhan.' },
                    ],
                  },
                },
                {
                  id: 'item_appeal_style',
                  systemKey: 'appeal.style',
                  subcategoryId: 'sub_appeal_quad',
                  categoryId: 'cat_appeal_dimensions',
                  sectionId: 'sec_appeal',
                  appLabel: 'Gaya Berpakaian (Style)',
                  formLabel: 'Gaya & Estetika Visual (Style)',
                  description: 'Karakteristik busana dan konsep estetika yang sering digunakan.',
                  evaluationGuideline: 'Pilih style busana yang paling dominan.',
                  functionLocation: 'Detail Profil, Filter Style.',
                  orderIndex: 2,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'single_select',
                  level: 'item',
                  formatConfig: {
                    options: [
                      { id: 'sty_casual', systemValue: 'Casual / Natural', appLabel: 'Casual / Natural', formLabel: '👟 Casual / Natural', badgeColor: '#64748b' },
                      { id: 'sty_glam', systemValue: 'Glamour / Elegant', appLabel: 'Glamour / Elegant', formLabel: '💎 Glamour / Elegant', badgeColor: '#f59e0b' },
                      { id: 'sty_cosplay', systemValue: 'Cosplay / Thematic', appLabel: 'Cosplay / Thematic', formLabel: '🎭 Cosplay / Thematic', badgeColor: '#a855f7' },
                      { id: 'sty_gyaru', systemValue: 'Gyaru / Trendy', appLabel: 'Gyaru / Trendy', formLabel: '✨ Gyaru / Trendy', badgeColor: '#ec4899' },
                    ],
                  },
                },
                {
                  id: 'item_appeal_body_shape',
                  systemKey: 'appeal.bodyShape',
                  subcategoryId: 'sub_appeal_quad',
                  categoryId: 'cat_appeal_dimensions',
                  sectionId: 'sec_appeal',
                  appLabel: 'Bentuk Siluet Tubuh (Body Shape)',
                  formLabel: 'Siluet Bentuk Tubuh (Body Shape)',
                  description: 'Proporsi siluet tubuh (Slim, Hourglass, Petite, Curvy, Athletic).',
                  evaluationGuideline: 'Berdasarkan rasio lekuk tubuh dan lingkar pinggang-pinggul.',
                  functionLocation: 'Detail Profil, Filter Siluet.',
                  orderIndex: 3,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'single_select',
                  level: 'item',
                  formatConfig: {
                    options: [
                      { id: 'shp_slim', systemValue: 'Slim / Petite', appLabel: 'Slim / Petite', formLabel: '🌿 Slim / Petite', badgeColor: '#38bdf8' },
                      { id: 'shp_hourglass', systemValue: 'Hourglass / Berlekuk', appLabel: 'Hourglass / Berlekuk', formLabel: '⏳ Hourglass / Berlekuk', badgeColor: '#ec4899' },
                      { id: 'shp_curvy', systemValue: 'Curvy / Voluptuous', appLabel: 'Curvy / Voluptuous', formLabel: '🍑 Curvy / Voluptuous', badgeColor: '#f97316' },
                      { id: 'shp_athletic', systemValue: 'Athletic / Toned', appLabel: 'Athletic / Toned', formLabel: '💪 Athletic / Toned', badgeColor: '#10b981' },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'cat_tags_specialties',
          systemKey: 'cat_tags_specialties',
          sectionId: 'sec_appeal',
          appLabel: 'Tag Atribut & Keahlian Khusus',
          formLabel: 'C. Tag Karakteristik & Spesialisasi (Multi-Select)',
          description: 'Kumpulan tag keunikan visual, daya tarik khas, dan keahlian performa.',
          evaluationGuideline: 'Pilih beberapa tag yang relevan untuk memperkaya pencarian dan filter cerdas.',
          functionLocation: 'Tag Chips di semua kartu, pencarian multi-tag, profil.',
          orderIndex: 2,
          isActive: true,
          level: 'category',
          icon: 'Tag',
          color: '#06b6d4',
          subcategories: [
            {
              id: 'sub_tags_chips',
              systemKey: 'sub_tags_chips',
              categoryId: 'cat_tags_specialties',
              sectionId: 'sec_appeal',
              appLabel: 'Daftar Tag Khusus',
              formLabel: 'Tag Karakter & Keahlian Khusus',
              description: 'Atribut pesona dan keahlian akting/performa.',
              evaluationGuideline: 'Pilih minimal satu tag atribut.',
              functionLocation: 'Filter chip di halaman katalog.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_attributes_multi',
                  systemKey: 'attributes',
                  subcategoryId: 'sub_tags_chips',
                  categoryId: 'cat_tags_specialties',
                  sectionId: 'sec_appeal',
                  appLabel: 'Atribut Karakteristik',
                  formLabel: 'Tag Atribut Karakteristik (Multi-Pilih)',
                  description: 'Tag pesona fisik dan keunikan visual artis.',
                  evaluationGuideline: 'Pilih semua yang berlaku (misal: Mata Indah, Kulit Mulus, Senyum Menawan).',
                  functionLocation: 'Chips pada kartu artis, detail profil, modal filter.',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: false,
                  fieldType: 'multi_select',
                  level: 'item',
                  formatConfig: {
                    options: [
                      { id: 'attr_1', systemValue: 'Mata Indah', appLabel: 'Mata Indah', formLabel: '👁️ Mata Indah', badgeColor: '#38bdf8' },
                      { id: 'attr_2', systemValue: 'Kulit Mulus', appLabel: 'Kulit Mulus', formLabel: '✨ Kulit Mulus', badgeColor: '#f472b6' },
                      { id: 'attr_3', systemValue: 'Senyum Menawan', appLabel: 'Senyum Menawan', formLabel: '😊 Senyum Menawan', badgeColor: '#fbbf24' },
                      { id: 'attr_4', systemValue: 'Kaki Jenjang', appLabel: 'Kaki Jenjang', formLabel: '👠 Kaki Jenjang', badgeColor: '#a855f7' },
                      { id: 'attr_5', systemValue: 'Pinggang Ramping', appLabel: 'Pinggang Ramping', formLabel: '⏳ Pinggang Ramping', badgeColor: '#ec4899' },
                      { id: 'attr_6', systemValue: 'Rambut Panjang', appLabel: 'Rambut Panjang', formLabel: '💇 Rambut Panjang', badgeColor: '#64748b' },
                    ],
                  },
                },
                {
                  id: 'item_specialty_multi',
                  systemKey: 'specialty',
                  subcategoryId: 'sub_tags_chips',
                  categoryId: 'cat_tags_specialties',
                  sectionId: 'sec_appeal',
                  appLabel: 'Spesialisasi & Performa',
                  formLabel: 'Tag Spesialisasi Performa (Multi-Pilih)',
                  description: 'Genre dan keahlian peran khusus artis.',
                  evaluationGuideline: 'Pilih genre yang paling sering dibintangi artis.',
                  functionLocation: 'Chips keahlian di detail profil.',
                  orderIndex: 1,
                  isActive: true,
                  isRequired: false,
                  fieldType: 'multi_select',
                  level: 'item',
                  formatConfig: {
                    options: [
                      { id: 'spec_1', systemValue: 'Romance / Drama', appLabel: 'Romance / Drama', formLabel: '🌹 Romance / Drama', badgeColor: '#f43f5e' },
                      { id: 'spec_2', systemValue: 'Comedy / Energetic', appLabel: 'Comedy / Energetic', formLabel: '😄 Comedy / Energetic', badgeColor: '#f59e0b' },
                      { id: 'spec_3', systemValue: 'Intense / Passionate', appLabel: 'Intense / Passionate', formLabel: '🔥 Intense / Passionate', badgeColor: '#ef4444' },
                      { id: 'spec_4', systemValue: 'Sensual / Tease', appLabel: 'Sensual / Tease', formLabel: '💋 Sensual / Tease', badgeColor: '#ec4899' },
                      { id: 'spec_5', systemValue: 'Story-Driven', appLabel: 'Story-Driven', formLabel: '🎬 Story-Driven', badgeColor: '#6366f1' },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ------------------------------------------------------------------------
    // SECTION 4: TAUTAN EKSTERNAL & CATATAN (MEDIA LINKS & NOTES)
    // ------------------------------------------------------------------------
    {
      id: 'sec_media_links',
      systemKey: 'sec_media_links',
      appLabel: 'Tautan Eksternal & Catatan Khusus',
      formLabel: '4. Tautan Media Sosial, Website Resmi, & Catatan',
      description: 'Pengelolaan tautan tombol eksternal (Instagram, Twitter, Agensi, Fansly) dan catatan editorial.',
      evaluationGuideline: 'Pastikan seluruh link menggunakan URL valid dengan protokol HTTPS.',
      functionLocation: 'Tombol Sosial di Kartu Artis, Header Detail Profil, Form.',
      orderIndex: 3,
      isActive: true,
      icon: 'Link',
      badgeColor: '#10b981',
      level: 'section',
      categories: [
        {
          id: 'cat_social_media',
          systemKey: 'cat_social_media',
          sectionId: 'sec_media_links',
          appLabel: 'Media Sosial & Tautan Resmi',
          formLabel: 'A. Tautan Tombol Eksternal & Jejaring Sosial',
          description: 'Kumpulan tautan media sosial dan profil resmi agensi.',
          evaluationGuideline: 'Masukkan username atau tautan URL lengkap.',
          functionLocation: 'Tombol aksi cepat pada detail profil dan kartu.',
          orderIndex: 0,
          isActive: true,
          level: 'category',
          icon: 'Share2',
          color: '#10b981',
          subcategories: [
            {
              id: 'sub_social_buttons',
              systemKey: 'sub_social_buttons',
              categoryId: 'cat_social_media',
              sectionId: 'sec_media_links',
              appLabel: 'Daftar Link Tombol',
              formLabel: 'Tombol Link Eksternal',
              description: 'Tautan tombol interaktif.',
              evaluationGuideline: 'Pastikan URL dapat dibuka langsung oleh publik.',
              functionLocation: 'Profil dan kartu artis.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_link_instagram',
                  systemKey: 'links.instagram',
                  subcategoryId: 'sub_social_buttons',
                  categoryId: 'cat_social_media',
                  sectionId: 'sec_media_links',
                  appLabel: 'Instagram Official',
                  formLabel: 'URL Akun Instagram Official',
                  description: 'Tautan akun Instagram resmi artis.',
                  evaluationGuideline: 'Gunakan URL format https://instagram.com/username.',
                  functionLocation: 'Tombol Instagram di kartu dan header profil.',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: false,
                  fieldType: 'button_link',
                  level: 'item',
                  formatConfig: {
                    urlPrefix: 'https://instagram.com/',
                    placeholder: 'https://instagram.com/username_artis',
                  },
                },
                {
                  id: 'item_link_twitter',
                  systemKey: 'links.twitter',
                  subcategoryId: 'sub_social_buttons',
                  categoryId: 'cat_social_media',
                  sectionId: 'sec_media_links',
                  appLabel: 'Twitter / X',
                  formLabel: 'URL Akun Twitter / X',
                  description: 'Tautan akun Twitter / X resmi artis.',
                  evaluationGuideline: 'Gunakan URL format https://twitter.com/username atau https://x.com/username.',
                  functionLocation: 'Tombol Twitter di detail profil.',
                  orderIndex: 1,
                  isActive: true,
                  isRequired: false,
                  fieldType: 'button_link',
                  level: 'item',
                  formatConfig: {
                    urlPrefix: 'https://x.com/',
                    placeholder: 'https://x.com/username_artis',
                  },
                },
                {
                  id: 'item_link_website',
                  systemKey: 'links.website',
                  subcategoryId: 'sub_social_buttons',
                  categoryId: 'cat_social_media',
                  sectionId: 'sec_media_links',
                  appLabel: 'Website Agensi / Blog',
                  formLabel: 'URL Website Agensi / Blog Resmi',
                  description: 'Tautan laman agensi atau blog profil resmi.',
                  evaluationGuideline: 'Format URL lengkap dengan HTTPS.',
                  functionLocation: 'Tombol Website di detail profil.',
                  orderIndex: 2,
                  isActive: true,
                  isRequired: false,
                  fieldType: 'button_link',
                  level: 'item',
                  formatConfig: {
                    placeholder: 'https://agency.com/artist-profile',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'cat_editorial_notes',
          systemKey: 'cat_editorial_notes',
          sectionId: 'sec_media_links',
          appLabel: 'Catatan Editorial',
          formLabel: 'B. Catatan Khusus & Review Editor',
          description: 'Area penulisan catatan khusus, trivia, dan evaluasi editorial.',
          evaluationGuideline: 'Tuliskan catatan deskriptif objektif untuk referensi penonton.',
          functionLocation: 'Tab Catatan di detail profil artis.',
          orderIndex: 1,
          isActive: true,
          level: 'category',
          icon: 'FileText',
          color: '#64748b',
          subcategories: [
            {
              id: 'sub_editorial_text',
              systemKey: 'sub_editorial_text',
              categoryId: 'cat_editorial_notes',
              sectionId: 'sec_media_links',
              appLabel: 'Teks Catatan',
              formLabel: 'Isian Catatan Khusus',
              description: 'Paragraf catatan bebas.',
              evaluationGuideline: 'Deskripsi singkat dan informatif.',
              functionLocation: 'Profil artis.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_notes',
                  systemKey: 'notes',
                  subcategoryId: 'sub_editorial_text',
                  categoryId: 'cat_editorial_notes',
                  sectionId: 'sec_media_links',
                  appLabel: 'Catatan Khusus',
                  formLabel: 'Catatan Khusus & Ulasan Editorial',
                  description: 'Ringkasan performa, trivia, atau catatan penting.',
                  evaluationGuideline: 'Teks deskriptif dengan batas maksimal 1000 karakter.',
                  functionLocation: 'Tab Catatan Profil, Form.',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: false,
                  fieldType: 'text',
                  level: 'item',
                  formatConfig: {
                    placeholder: 'Tuliskan catatan khusus atau ulasan di sini...',
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ------------------------------------------------------------------------
    // SECTION 5: PENILAIAN APPEARANCE (TAMPILAN FISIK - 60%)
    // ------------------------------------------------------------------------
    {
      id: 'sec_appearance_scoring',
      systemKey: 'sec_appearance_scoring',
      appLabel: 'Penilaian Appearance (Tampilan Visual)',
      formLabel: '5. Indikator Penilaian Appearance / Fisik (60%)',
      description: 'Enam indikator dimensi visual fisik wajah, kulit, payudara, bokong, area intim, dan kaki.',
      evaluationGuideline: 'Rentang nilai 0 s/d 99 poin pada masing-masing indikator fisik.',
      functionLocation: 'Form Input Nilai, Kartu Penilaian, Radar Chart Fisik.',
      orderIndex: 4,
      isActive: true,
      icon: 'Smile',
      badgeColor: '#06b6d4',
      level: 'section',
      categories: [
        {
          id: 'cat_appearance_traits',
          systemKey: 'cat_appearance_traits',
          sectionId: 'sec_appearance_scoring',
          appLabel: 'Indikator Fisik Visual',
          formLabel: 'A. 6 Parameter Fisik Visual (0-99)',
          description: 'Parameter penilaian ketertarikan fisik estetis.',
          evaluationGuideline: 'Gunakan slider untuk menentukan skor tiap aspek.',
          functionLocation: 'Halaman Form Penilaian & Profil.',
          orderIndex: 0,
          isActive: true,
          level: 'category',
          icon: 'Sliders',
          color: '#06b6d4',
          subcategories: [
            {
              id: 'sub_appearance_sliders',
              systemKey: 'sub_appearance_sliders',
              categoryId: 'cat_appearance_traits',
              sectionId: 'sec_appearance_scoring',
              appLabel: 'Slider Penilaian Fisik',
              formLabel: 'Indikator Nilai Appearance',
              description: 'Pengaturan slider nilai fisik visual.',
              evaluationGuideline: 'Skor 0 s/d 99.',
              functionLocation: 'Form Nilai.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_score_face',
                  systemKey: 'face',
                  subcategoryId: 'sub_appearance_sliders',
                  categoryId: 'cat_appearance_traits',
                  sectionId: 'sec_appearance_scoring',
                  appLabel: 'Wajah & Fitur Muka',
                  formLabel: 'Face / Wajah (0-99)',
                  description: 'Struktur wajah, mata, hidung, bibir, senyuman, daya tarik visual.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi simetri dan pesona wajah.',
                  functionLocation: 'Form Nilai Appearance & Profil.',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
                {
                  id: 'item_score_skin',
                  systemKey: 'skin',
                  subcategoryId: 'sub_appearance_sliders',
                  categoryId: 'cat_appearance_traits',
                  sectionId: 'sec_appearance_scoring',
                  appLabel: 'Kualitas & Tekstur Kulit',
                  formLabel: 'Skin / Kulit (0-99)',
                  description: 'Kemulusan, kecerahan, tekstur, dan higienitas kulit.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi kehalusan dan kecerahan kulit.',
                  functionLocation: 'Form Nilai Appearance & Profil.',
                  orderIndex: 1,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
                {
                  id: 'item_score_breast',
                  systemKey: 'breast',
                  subcategoryId: 'sub_appearance_sliders',
                  categoryId: 'cat_appearance_traits',
                  sectionId: 'sec_appearance_scoring',
                  appLabel: 'Bentuk & Keindahan Dada',
                  formLabel: 'Breast / Payudara (0-99)',
                  description: 'Bentuk, kekenyalan, posisi, dan simetri payudara.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi estetika dan proporsi payudara.',
                  functionLocation: 'Form Nilai Appearance & Profil.',
                  orderIndex: 2,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
                {
                  id: 'item_score_butt',
                  systemKey: 'butt',
                  subcategoryId: 'sub_appearance_sliders',
                  categoryId: 'cat_appearance_traits',
                  sectionId: 'sec_appearance_scoring',
                  appLabel: 'Bentuk & Kekencangan Bokong',
                  formLabel: 'Butt / Bokong & Pinggul (0-99)',
                  description: 'Ketegangan, kelengkungan, dan proporsi gluteus.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi kelengkungan siluet bokong.',
                  functionLocation: 'Form Nilai Appearance & Profil.',
                  orderIndex: 3,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
                {
                  id: 'item_score_v',
                  systemKey: 'v',
                  subcategoryId: 'sub_appearance_sliders',
                  categoryId: 'cat_appearance_traits',
                  sectionId: 'sec_appearance_scoring',
                  appLabel: 'Estetika Titik Feminin (V)',
                  formLabel: 'V / Area Intim (0-99)',
                  description: 'Kerapian estetika, kebersihan, dan tone area intim.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi kerapian dan estetika feminin.',
                  functionLocation: 'Form Nilai Appearance & Profil.',
                  orderIndex: 4,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
                {
                  id: 'item_score_thigh_calve',
                  systemKey: 'thighCalve',
                  subcategoryId: 'sub_appearance_sliders',
                  categoryId: 'cat_appearance_traits',
                  sectionId: 'sec_appearance_scoring',
                  appLabel: 'Proporsi Kaki & Betis',
                  formLabel: 'Thigh & Calve / Paha & Betis (0-99)',
                  description: 'Kencang, garis kaki, jenjang, dan proporsional.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi kelangsingan dan proporsi kaki.',
                  functionLocation: 'Form Nilai Appearance & Profil.',
                  orderIndex: 5,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
              ],
            },
          ],
        },
      ],
    },

    // ------------------------------------------------------------------------
    // SECTION 6: PENILAIAN IMPRESSION (PERFORMA & KARISMA - 40%)
    // ------------------------------------------------------------------------
    {
      id: 'sec_impression_scoring',
      systemKey: 'sec_impression_scoring',
      appLabel: 'Penilaian Impression (Performa & Kesan)',
      formLabel: '6. Indikator Penilaian Impression / Performa (40%)',
      description: 'Enam indikator performa panggung, vokal, ekspresi, daya tarik, keaslian, chemistry, dan aura.',
      evaluationGuideline: 'Rentang nilai 0 s/d 99 poin pada masing-masing indikator performa.',
      functionLocation: 'Form Input Nilai, Kartu Penilaian, Radar Chart Kesan.',
      orderIndex: 5,
      isActive: true,
      icon: 'Eye',
      badgeColor: '#ec4899',
      level: 'section',
      categories: [
        {
          id: 'cat_impression_traits',
          systemKey: 'cat_impression_traits',
          sectionId: 'sec_impression_scoring',
          appLabel: 'Indikator Performa & Karisma',
          formLabel: 'A. 6 Parameter Impression (0-99)',
          description: 'Parameter penilaian performa dan daya tarik emosional.',
          evaluationGuideline: 'Gunakan slider untuk menentukan skor tiap aspek performa.',
          functionLocation: 'Halaman Form Penilaian & Profil.',
          orderIndex: 0,
          isActive: true,
          level: 'category',
          icon: 'Sliders',
          color: '#ec4899',
          subcategories: [
            {
              id: 'sub_impression_sliders',
              systemKey: 'sub_impression_sliders',
              categoryId: 'cat_impression_traits',
              sectionId: 'sec_impression_scoring',
              appLabel: 'Slider Penilaian Performa',
              formLabel: 'Indikator Nilai Impression',
              description: 'Pengaturan slider nilai performa dan vokal.',
              evaluationGuideline: 'Skor 0 s/d 99.',
              functionLocation: 'Form Nilai.',
              orderIndex: 0,
              isActive: true,
              level: 'subcategory',
              items: [
                {
                  id: 'item_score_voice',
                  systemKey: 'voice',
                  subcategoryId: 'sub_impression_sliders',
                  categoryId: 'cat_impression_traits',
                  sectionId: 'sec_impression_scoring',
                  appLabel: 'Nada & Daya Tarik Suara',
                  formLabel: 'Voice / Vokal & Suara (0-99)',
                  description: 'Desahan, intonasi, kemerduan, dan kejelasan suara.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi kemerduan dan daya pikat vokal.',
                  functionLocation: 'Form Nilai Impression & Profil.',
                  orderIndex: 0,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
                {
                  id: 'item_score_expression',
                  systemKey: 'expression',
                  subcategoryId: 'sub_impression_sliders',
                  categoryId: 'cat_impression_traits',
                  sectionId: 'sec_impression_scoring',
                  appLabel: 'Ekspresi Emosional & Tatapan',
                  formLabel: 'Expression / Ekspresi & Tatapan (0-99)',
                  description: 'Mimik wajah, kontak mata, dan penghayatan peran.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi kehangatan tatapan dan mimik wajah.',
                  functionLocation: 'Form Nilai Impression & Profil.',
                  orderIndex: 1,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
                {
                  id: 'item_score_sex_appeal',
                  systemKey: 'sexAppeal',
                  subcategoryId: 'sub_impression_sliders',
                  categoryId: 'cat_impression_traits',
                  sectionId: 'sec_impression_scoring',
                  appLabel: 'Daya Tarik Seksual (Sex Appeal)',
                  formLabel: 'Sex Appeal / Daya Tarik Sensual (0-99)',
                  description: 'Sensualitas alami dan karisma menggoda.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi magnetisme sensual.',
                  functionLocation: 'Form Nilai Impression & Profil.',
                  orderIndex: 2,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
                {
                  id: 'item_score_authenticity',
                  systemKey: 'authenticity',
                  subcategoryId: 'sub_impression_sliders',
                  categoryId: 'cat_impression_traits',
                  sectionId: 'sec_impression_scoring',
                  appLabel: 'Keaslian & Spontanitas',
                  formLabel: 'Authenticity / Keaslian Reaksi (0-99)',
                  description: 'Spontanitas dan ketulusan reaksi panggung.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi kejujuran dan naturalitas reaksi.',
                  functionLocation: 'Form Nilai Impression & Profil.',
                  orderIndex: 3,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
                {
                  id: 'item_score_chemistry',
                  systemKey: 'chemistry',
                  subcategoryId: 'sub_impression_sliders',
                  categoryId: 'cat_impression_traits',
                  sectionId: 'sec_impression_scoring',
                  appLabel: 'Chemistry & Interaksi',
                  formLabel: 'Chemistry / Kerjasama Lawan Main (0-99)',
                  description: 'Sinkronisasi dan kehangatan respon terhadap lawan main.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi koneksi dan keharmonisan akting.',
                  functionLocation: 'Form Nilai Impression & Profil.',
                  orderIndex: 4,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
                {
                  id: 'item_score_aura',
                  systemKey: 'aura',
                  subcategoryId: 'sub_impression_sliders',
                  categoryId: 'cat_impression_traits',
                  sectionId: 'sec_impression_scoring',
                  appLabel: 'Aura Karisma & Daya Ingat',
                  formLabel: 'Aura / Pesona Bintang (0-99)',
                  description: 'Pesona dominan dan impresi bintang yang tak terlupakan.',
                  evaluationGuideline: 'Skor 0-99. Evaluasi star quality dan daya ingat persona.',
                  functionLocation: 'Form Nilai Impression & Profil.',
                  orderIndex: 5,
                  isActive: true,
                  isRequired: true,
                  fieldType: 'number',
                  level: 'item',
                  formatConfig: { min: 0, max: 99, step: 1 },
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  // --------------------------------------------------------------------------
  // TAB 2: SISTEM PENILAIAN SCORING & FORMULA CONFIGURATION
  // --------------------------------------------------------------------------
  scoringSystem: {
    id: 'score_system_default',
    minScale: 0,
    maxScale: 100,
    formulaExpression: '(Appearance * 0.5) + (Impression * 0.5)',
    formulaDescription: 'Kalkulasi skor akhir dihitung dari rata-rata berbobot Appearance (50%) dan Impression (50%).',
    appearanceWeightTotal: 50,
    impressionWeightTotal: 50,
    appearanceWeights: [
      {
        key: 'face',
        name: 'Wajah & Fitur Muka',
        category: 'appearance',
        weightPercent: 25,
        description: 'Kesimetrisan, proporsi mata, hidung, bibir, dan daya tarik visual wajah.',
        guideline: 'Nilai 90-100: Wajah luar biasa memukau, tanpa cela di kamera berdefinisi tinggi.',
      },
      {
        key: 'skin',
        name: 'Kualitas & Tekstur Kulit',
        category: 'appearance',
        weightPercent: 15,
        description: 'Kehalusan, kecerahan, elastisitas, dan kebersihan kulit seluruh tubuh.',
        guideline: 'Nilai 90-100: Kulit porselen mulus bercahaya, sangat terawat dan elastis.',
      },
      {
        key: 'breast',
        name: 'Bentuk & Keindahan Dada',
        category: 'appearance',
        weightPercent: 15,
        description: 'Bentuk, kekencangan, kealamian, dan proporsi payudara terhadap postur tubuh.',
        guideline: 'Nilai 90-100: Bentuk sangat indah, simetris, dan proporsional terhadap lingkar dada.',
      },
      {
        key: 'butt',
        name: 'Bentuk & Kekencangan Bokong',
        category: 'appearance',
        weightPercent: 15,
        description: 'Kekencangan, lekukan siluet samping, dan volume bokong.',
        guideline: 'Nilai 90-100: Siluet berlekuk tegas, kencang dan proporsional.',
      },
      {
        key: 'v',
        name: 'Estetika Titik Feminin (V)',
        category: 'appearance',
        weightPercent: 10,
        description: 'Kebersihan, kerapian, dan estetika feminin.',
        guideline: 'Nilai 90-100: Sangat rapi, terawat prima, dan bersih tanpa cela.',
      },
      {
        key: 'thighCalve',
        name: 'Proporsi Kaki & Betis',
        category: 'appearance',
        weightPercent: 20,
        description: 'Kepanajangan kaki, keindahan bentuk betis, dan keanggunan siluet tungkai.',
        guideline: 'Nilai 90-100: Kaki jenjang langsing berlekuk elegan, sangat fotogenik.',
      },
    ],
    impressionWeights: [
      {
        key: 'voice',
        name: 'Nada & Daya Tarik Suara',
        category: 'impression',
        weightPercent: 15,
        description: 'Kemerduan, kelembutan intonasi, desahan, dan artikulasi suara.',
        guideline: 'Nilai 90-100: Suara sangat memikat, lembut, ekspresif, dan membangkitkan emosi.',
      },
      {
        key: 'expression',
        name: 'Ekspresi Emosional & Tatapan',
        category: 'impression',
        weightPercent: 20,
        description: 'Kontak mata, perubahan ekspresi wajah, senyuman, dan ekspresi spontan.',
        guideline: 'Nilai 90-100: Tatapan mata menghipnotis, ekspresi sangat hidup dan natural.',
      },
      {
        key: 'sexAppeal',
        name: 'Daya Tarik Seksual (Sex Appeal)',
        category: 'impression',
        weightPercent: 20,
        description: 'Aura magnetis, karisma sensual, dan daya pikat tak kasat mata.',
        guideline: 'Nilai 90-100: Karisma sensual sangat intens dan memikat seketika.',
      },
      {
        key: 'authenticity',
        name: 'Keaslian & Spontanitas (Authenticity)',
        category: 'impression',
        weightPercent: 15,
        description: 'Kesan reaksi tulus tanpa kepalsuan atau kepura-puraan yang kaku.',
        guideline: 'Nilai 90-100: Reaksi 100% natural, spontan, dan terasa personal.',
      },
      {
        key: 'chemistry',
        name: 'Chemistry & Interaksi',
        category: 'impression',
        weightPercent: 15,
        description: 'Kecocokan dan kehangatan koneksi saat berinteraksi dengan lawan peran.',
        guideline: 'Nilai 90-100: Koneksi luar biasa menyatu, antusiasme tinggi, dan harmonis.',
      },
      {
        key: 'aura',
        name: 'Aura Karisma & Daya Ingat',
        category: 'impression',
        weightPercent: 15,
        description: 'Kesan mendalam yang tertinggal di ingatan penonton (star quality).',
        guideline: 'Nilai 90-100: Star quality kelas atas yang langsung meninggalkan impresi tak terlupakan.',
      },
    ],
    tiers: [
      {
        id: 'tier_s',
        grade: 'S',
        minScore: 90,
        maxScore: 100,
        label: 'Legendaris / Masterpiece',
        badgeColor: '#f59e0b',
        starCount: 5,
      },
      {
        id: 'tier_a',
        grade: 'A',
        minScore: 80,
        maxScore: 89,
        label: 'Sangat Unggul / Elite',
        badgeColor: '#8b5cf6',
        starCount: 4,
      },
      {
        id: 'tier_b',
        grade: 'B',
        minScore: 70,
        maxScore: 79,
        label: 'Standar Bagus / Rekomendasi',
        badgeColor: '#3b82f6',
        starCount: 3,
      },
      {
        id: 'tier_c',
        grade: 'C',
        minScore: 60,
        maxScore: 69,
        label: 'Cukup / Rata-Rata',
        badgeColor: '#10b981',
        starCount: 2,
      },
      {
        id: 'tier_d',
        grade: 'D',
        minScore: 0,
        maxScore: 59,
        label: 'Perlu Peningkatan',
        badgeColor: '#64748b',
        starCount: 1,
      },
    ],
  },
};

// ============================================================================
// LOCAL STORAGE & SWR CLIENT CACHE ENGINE
// ============================================================================

let memoryTaxonomyCache: MasterTaxonomyData | null = null;

/**
 * Get the current master taxonomy with SWR-speed memory fallback
 */
export function getStoredMasterTaxonomy(): MasterTaxonomyData {
  if (memoryTaxonomyCache) {
    return memoryTaxonomyCache;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryTaxonomyCache = initialMasterTaxonomy;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMasterTaxonomy));
      return initialMasterTaxonomy;
    }
    const parsed = JSON.parse(raw) as MasterTaxonomyData;
    const typeCodeItem = getAllMasterTaxonomyItems(parsed).find(i => i.id === 'item_type_code' || i.systemKey === 'typeCode');
    const typeCodeOptionsCount = typeCodeItem?.formatConfig?.options?.length || 0;

    if (!parsed.sections || !parsed.scoringSystem || (parsed.version || 0) < 5 || parsed.sections.length < 6 || typeCodeOptionsCount < 15) {
      // Auto-migrate: merge any missing sections from initialMasterTaxonomy and update typeCode options
      const existingSectionIds = new Set((parsed.sections || []).map(s => s.id));
      const mergedSections = [...(parsed.sections || [])];
      for (const initSec of initialMasterTaxonomy.sections) {
        if (!existingSectionIds.has(initSec.id)) {
          mergedSections.push(initSec);
        }
      }

      // Ensure item_type_code has all 15 options
      mergedSections.forEach(sec => {
        sec.categories?.forEach(cat => {
          cat.subcategories?.forEach(sub => {
            sub.items?.forEach(item => {
              if (item.id === 'item_type_code' || item.systemKey === 'typeCode') {
                const initialTypeCodeItem = getAllMasterTaxonomyItems(initialMasterTaxonomy).find(i => i.id === 'item_type_code');
                if (initialTypeCodeItem?.formatConfig?.options) {
                  const existingMap = new Map((item.formatConfig?.options || []).map(o => [o.systemValue, o]));
                  const mergedOpts = initialTypeCodeItem.formatConfig.options.map(initOpt => {
                    return existingMap.get(initOpt.systemValue) || initOpt;
                  });
                  item.formatConfig = { ...item.formatConfig, options: mergedOpts };
                }
              }
            });
          });
        });
      });

      const migrated: MasterTaxonomyData = {
        ...initialMasterTaxonomy,
        ...parsed,
        version: 5,
        sections: mergedSections,
      };
      memoryTaxonomyCache = migrated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    memoryTaxonomyCache = parsed;
    return parsed;
  } catch (err) {
    console.error('Failed to parse master taxonomy from storage, falling back to seed:', err);
    memoryTaxonomyCache = initialMasterTaxonomy;
    return initialMasterTaxonomy;
  }
}

/**
 * Save updated master taxonomy with instant memory cache update and broadcast
 */
export function saveStoredMasterTaxonomy(data: MasterTaxonomyData): void {
  try {
    const payload: MasterTaxonomyData = {
      ...data,
      lastUpdated: new Date().toISOString(),
      cacheStatus: 'SYNCED',
    };
    memoryTaxonomyCache = payload;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(
      CACHE_METADATA_KEY,
      JSON.stringify({
        flushedAt: new Date().toISOString(),
        version: payload.version,
        sectionCount: payload.sections.length,
      })
    );

    // Broadcast custom event for zero-latency cross-component synchronization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('applet:taxonomy_updated', { detail: payload }));
    }
  } catch (err) {
    console.error('Failed to save master taxonomy to storage:', err);
  }
}

/**
 * Flush cache to force refresh across all views
 */
export function flushTaxonomyCache(): { success: boolean; flushedAt: string } {
  const current = getStoredMasterTaxonomy();
  const updated: MasterTaxonomyData = {
    ...current,
    lastUpdated: new Date().toISOString(),
    cacheStatus: 'FLUSHED',
  };
  saveStoredMasterTaxonomy(updated);
  return { success: true, flushedAt: updated.lastUpdated };
}

// ============================================================================
// 4-TIER HIERARCHY HELPER & MUTATION FUNCTIONS
// ============================================================================

/**
 * Find any element across all 4 levels by its ID
 */
export function findTaxonomyElement(
  data: MasterTaxonomyData,
  elementId: string
): { element: BaseTaxonomyElement; level: 'section' | 'category' | 'subcategory' | 'item' } | null {
  for (const sec of data.sections) {
    if (sec.id === elementId) return { element: sec, level: 'section' };
    for (const cat of sec.categories) {
      if (cat.id === elementId) return { element: cat, level: 'category' };
      for (const sub of cat.subcategories) {
        if (sub.id === elementId) return { element: sub, level: 'subcategory' };
        for (const item of sub.items) {
          if (item.id === elementId) return { element: item, level: 'item' };
        }
      }
    }
  }
  return null;
}

/**
 * Get Section by key or ID
 */
export function getMasterTaxonomySection(
  keyOrId: string,
  customTaxonomy?: MasterTaxonomyData
): TaxonomySection | null {
  const data = customTaxonomy || getStoredMasterTaxonomy();
  const norm = keyOrId.replace(/^sec_/, '');
  for (const sec of data.sections) {
    if (
      sec.id === keyOrId ||
      sec.systemKey === keyOrId ||
      sec.id === `sec_${norm}` ||
      sec.systemKey === `sec_${norm}`
    ) {
      return sec;
    }
  }
  return null;
}

/**
 * Get Category by key or ID
 */
export function getMasterTaxonomyCategory(
  keyOrId: string,
  customTaxonomy?: MasterTaxonomyData
): TaxonomyCategory | null {
  const data = customTaxonomy || getStoredMasterTaxonomy();
  for (const sec of data.sections) {
    for (const cat of sec.categories) {
      if (cat.id === keyOrId || cat.systemKey === keyOrId) {
        return cat;
      }
    }
  }
  return null;
}

/**
 * Cascade update an element's metadata at any of the 4 levels
 */
export function cascadeUpdateElement(
  data: MasterTaxonomyData,
  elementId: string,
  updates: Partial<BaseTaxonomyElement | TaxonomyItem>
): MasterTaxonomyData {
  const updatedSections = data.sections.map((sec) => {
    if (sec.id === elementId) {
      return { ...sec, ...updates } as TaxonomySection;
    }

    const updatedCategories = sec.categories.map((cat) => {
      if (cat.id === elementId) {
        return { ...cat, ...updates } as TaxonomyCategory;
      }

      const updatedSubcategories = cat.subcategories.map((sub) => {
        if (sub.id === elementId) {
          return { ...sub, ...updates } as TaxonomySubcategory;
        }

        const updatedItems = sub.items.map((item) => {
          if (item.id === elementId) {
            return { ...item, ...updates } as TaxonomyItem;
          }
          return item;
        });

        return { ...sub, items: updatedItems };
      });

      return { ...cat, subcategories: updatedSubcategories };
    });

    return { ...sec, categories: updatedCategories };
  });

  const nextState: MasterTaxonomyData = {
    ...data,
    sections: updatedSections,
  };
  saveStoredMasterTaxonomy(nextState);
  return nextState;
}

/**
 * Cascade delete an element at any of the 4 levels
 */
export function cascadeDeleteElement(
  data: MasterTaxonomyData,
  elementId: string
): MasterTaxonomyData {
  // If deleting a section
  let updatedSections = data.sections.filter((sec) => sec.id !== elementId);

  // If deleting inside categories, subcategories, or items
  updatedSections = updatedSections.map((sec) => {
    const updatedCategories = sec.categories
      .filter((cat) => cat.id !== elementId)
      .map((cat) => {
        const updatedSubcategories = cat.subcategories
          .filter((sub) => sub.id !== elementId)
          .map((sub) => {
            const updatedItems = sub.items.filter((item) => item.id !== elementId);
            return { ...sub, items: updatedItems };
          });
        return { ...cat, subcategories: updatedSubcategories };
      });
    return { ...sec, categories: updatedCategories };
  });

  const nextState: MasterTaxonomyData = {
    ...data,
    sections: updatedSections,
  };
  saveStoredMasterTaxonomy(nextState);
  return nextState;
}

/**
 * Reorder elements within a specific parent (Section, Category, Subcategory, Item)
 */
export function reorderElements(
  data: MasterTaxonomyData,
  level: 'section' | 'category' | 'subcategory' | 'item',
  parentId: string | null,
  sourceIndex: number,
  destinationIndex: number
): MasterTaxonomyData {
  const next = JSON.parse(JSON.stringify(data)) as MasterTaxonomyData;

  if (level === 'section') {
    const [moved] = next.sections.splice(sourceIndex, 1);
    next.sections.splice(destinationIndex, 0, moved);
    next.sections.forEach((s, idx) => (s.orderIndex = idx));
  } else if (level === 'category' && parentId) {
    const sec = next.sections.find((s) => s.id === parentId);
    if (sec) {
      const [moved] = sec.categories.splice(sourceIndex, 1);
      sec.categories.splice(destinationIndex, 0, moved);
      sec.categories.forEach((c, idx) => (c.orderIndex = idx));
    }
  } else if (level === 'subcategory' && parentId) {
    for (const sec of next.sections) {
      const cat = sec.categories.find((c) => c.id === parentId);
      if (cat) {
        const [moved] = cat.subcategories.splice(sourceIndex, 1);
        cat.subcategories.splice(destinationIndex, 0, moved);
        cat.subcategories.forEach((sub, idx) => (sub.orderIndex = idx));
        break;
      }
    }
  } else if (level === 'item' && parentId) {
    for (const sec of next.sections) {
      for (const cat of sec.categories) {
        const sub = cat.subcategories.find((sb) => sb.id === parentId);
        if (sub) {
          const [moved] = sub.items.splice(sourceIndex, 1);
          sub.items.splice(destinationIndex, 0, moved);
          sub.items.forEach((it, idx) => (it.orderIndex = idx));
          break;
        }
      }
    }
  }

  saveStoredMasterTaxonomy(next);
  return next;
}

/**
 * Add a new element to the master taxonomy at any of the 4 levels
 */
export function addElementToTaxonomy(
  data: MasterTaxonomyData,
  level: 'section' | 'category' | 'subcategory' | 'item',
  parentId: string | null,
  newElement: BaseTaxonomyElement | TaxonomyItem
): MasterTaxonomyData {
  const next = JSON.parse(JSON.stringify(data)) as MasterTaxonomyData;

  if (level === 'section') {
    const sec: TaxonomySection = {
      ...(newElement as BaseTaxonomyElement),
      level: 'section',
      icon: 'Layers',
      badgeColor: '#6366f1',
      categories: [],
    };
    next.sections.push(sec);
  } else if (level === 'category' && parentId) {
    const sec = next.sections.find((s) => s.id === parentId);
    if (sec) {
      const cat: TaxonomyCategory = {
        ...(newElement as BaseTaxonomyElement),
        level: 'category',
        sectionId: parentId,
        icon: 'Folder',
        color: '#3b82f6',
        subcategories: [],
      };
      sec.categories.push(cat);
    }
  } else if (level === 'subcategory' && parentId) {
    for (const sec of next.sections) {
      const cat = sec.categories.find((c) => c.id === parentId);
      if (cat) {
        const sub: TaxonomySubcategory = {
          ...(newElement as BaseTaxonomyElement),
          level: 'subcategory',
          categoryId: parentId,
          sectionId: sec.id,
          items: [],
        };
        cat.subcategories.push(sub);
        break;
      }
    }
  } else if (level === 'item' && parentId) {
    for (const sec of next.sections) {
      for (const cat of sec.categories) {
        const sub = cat.subcategories.find((sb) => sb.id === parentId);
        if (sub) {
          const item: TaxonomyItem = {
            ...(newElement as TaxonomyItem),
            level: 'item',
            subcategoryId: parentId,
            categoryId: cat.id,
            sectionId: sec.id,
            isRequired: (newElement as TaxonomyItem).isRequired ?? false,
            fieldType: (newElement as TaxonomyItem).fieldType ?? 'text',
            formatConfig: (newElement as TaxonomyItem).formatConfig ?? {},
          };
          sub.items.push(item);
          break;
        }
      }
    }
  }

  saveStoredMasterTaxonomy(next);
  return next;
}

/**
 * Update the Scoring System configuration (Tab 3)
 */
export function updateScoringConfig(
  data: MasterTaxonomyData,
  newScoring: ScoringSystemConfig
): MasterTaxonomyData {
  const next: MasterTaxonomyData = {
    ...data,
    scoringSystem: newScoring,
    lastUpdated: new Date().toISOString(),
  };
  saveStoredMasterTaxonomy(next);
  return next;
}

const ARTIST_FORM_ORDER_KEY = 'applet_artist_form_layout_order_v1';
const ARTIST_FORM_STRUCTURE_KEY = 'applet_artist_form_layout_structure_v2';

/**
 * Tab / Folder Group representation in Artist Form
 */
export interface FormTabGroup {
  id: string;                                    // e.g. 'custom_entry', 'folder_biodata', 'folder_measurements', 'folder_appeal', 'appearance', 'impression'
  type: 'system_custom_entry' | 'folder' | 'standalone';
  title: string;                                 // Display label on Tab
  icon?: string;                                 // Icon identifier
  orderIndex: number;                            // Top-level tab order (0-indexed)
  fieldKeys: string[];                           // List of field keys / systemKeys contained in this tab/folder
  isCustom?: boolean;                            // Whether created by user
  badge?: string;                                // Dynamic badge
}

/**
 * Standard Default Layout Structure (6 Items & Groups):
 * 1. Entri Kustom (system_custom_entry)
 * 2. Biodata (Folder Kategori)
 * 3. Measurements (Folder Kategori)
 * 4. Dimensi Karakter (Folder Kategori)
 * 5. Appearance (Standalone)
 * 6. Impression (Standalone)
 */
export const DEFAULT_FORM_LAYOUT_STRUCTURE: FormTabGroup[] = [
  {
    id: 'custom_entry',
    type: 'system_custom_entry',
    title: 'ENTRI CUSTOM',
    icon: 'Layers',
    orderIndex: 0,
    fieldKeys: ['custom_entry'],
  },
  {
    id: 'folder_biodata',
    type: 'folder',
    title: 'BIODATA',
    icon: 'User',
    orderIndex: 1,
    fieldKeys: [
      'avatarUrl',
      'firstName',
      'lastName',
      'country',
      'notes',
      'bornDate',
      'debutDate',
      'heightCm',
      'typeCode',
      'artistStatus',
      'links',
    ],
  },
  {
    id: 'folder_measurements',
    type: 'folder',
    title: 'MEASUREMENTS',
    icon: 'Ruler',
    orderIndex: 2,
    fieldKeys: ['cupSize', 'bustCm', 'waistCm', 'hipCm'],
  },
  {
    id: 'folder_appeal',
    type: 'folder',
    title: 'DIMENSI KARAKTER',
    icon: 'Sparkles',
    orderIndex: 3,
    fieldKeys: ['appeal', 'attributes', 'specialty'],
  },
  {
    id: 'appearance',
    type: 'standalone',
    title: 'APPEARANCE',
    icon: 'Smile',
    orderIndex: 4,
    fieldKeys: ['appearance', 'face', 'skin', 'breast', 'butt', 'v', 'thighCalve'],
  },
  {
    id: 'impression',
    type: 'standalone',
    title: 'IMPRESSION',
    icon: 'Eye',
    orderIndex: 5,
    fieldKeys: ['impression', 'voice', 'expression', 'sexAppeal', 'authenticity', 'chemistry', 'aura'],
  },
];

/**
 * Field metadata dictionary for display in Tab Reorder UI
 */
export const FORM_FIELD_DISPLAY_NAMES: Record<string, { label: string; sub: string; icon?: string }> = {
  custom_entry: { label: 'Entri Custom Template', sub: 'Hubungkan template kustom', icon: 'Layers' },
  avatarUrl: { label: 'Thumbnail / Avatar', sub: 'Foto profil artis', icon: 'Image' },
  firstName: { label: 'Nama Depan (First Name)', sub: 'Nama depan / alias', icon: 'User' },
  lastName: { label: 'Nama Belakang (Last Name)', sub: 'Nama keluarga', icon: 'User' },
  country: { label: 'Negara / Country', sub: 'Asal negara & bendera', icon: 'Globe' },
  notes: { label: 'Catatan Khusus / Note', sub: 'Ulasan & trivia editorial', icon: 'FileText' },
  bornDate: { label: 'Tanggal Lahir (Born Date)', sub: 'Kelahiran & usia otomatis', icon: 'Calendar' },
  debutDate: { label: 'Tanggal Debut (Debut Date)', sub: 'Awal karir industri', icon: 'Sparkles' },
  heightCm: { label: 'Tinggi Badan (Height)', sub: 'Tinggi dalam cm', icon: 'Ruler' },
  typeCode: { label: 'Tipe Tubuh (Body Type)', sub: 'Siluet & proporsi tubuh', icon: 'Tag' },
  artistStatus: { label: 'Status Artis', sub: 'Amatir / Profesional', icon: 'Award' },
  links: { label: 'Daftar Tautan (Links)', sub: 'Instagram, Twitter/X, Website', icon: 'Link' },
  cupSize: { label: 'Cup Size (Ukuran Cup)', sub: 'A s/d K Cup', icon: 'Ruler' },
  bustCm: { label: 'Bust Size (Lingkar Dada)', sub: 'Ukuran dada dalam cm', icon: 'Ruler' },
  waistCm: { label: 'Waist Size (Lingkar Pinggang)', sub: 'Ukuran pinggang dalam cm', icon: 'Ruler' },
  hipCm: { label: 'Hip Size (Lingkar Pinggul)', sub: 'Ukuran pinggul dalam cm', icon: 'Ruler' },
  appeal: { label: 'Parameter Daya Tarik (Appeal)', sub: 'Maturity, Vibe, Style, Shape', icon: 'Sparkles' },
  attributes: { label: 'Atribut Karakteristik (Attributes)', sub: 'Multi-select kategori sifat', icon: 'Tag' },
  specialty: { label: 'Spesialisasi & Aksi (Specialty)', sub: 'Multi-select kemampuan & gaya', icon: 'Zap' },
  appearance: { label: 'Indikator Appearance (Fisik 60%)', sub: '6 Slider Skor Visual', icon: 'Smile' },
  face: { label: 'Face / Wajah (0-99)', sub: 'Fitur wajah & pesona', icon: 'Smile' },
  skin: { label: 'Skin / Kulit (0-99)', sub: 'Tekstur & kemulusan kulit', icon: 'Smile' },
  breast: { label: 'Breast / Payudara (0-99)', sub: 'Bentuk & keindahan dada', icon: 'Smile' },
  butt: { label: 'Butt / Bokong (0-99)', sub: 'Bentuk & kekencangan bokong', icon: 'Smile' },
  v: { label: 'V / Area Intim (0-99)', sub: 'Kerapian & estetika feminin', icon: 'Smile' },
  thighCalve: { label: 'Thigh & Calve (0-99)', sub: 'Proporsi paha & betis', icon: 'Smile' },
  impression: { label: 'Indikator Impression (Performa 40%)', sub: '6 Slider Skor Karisma', icon: 'Eye' },
  voice: { label: 'Voice / Vokal (0-99)', sub: 'Daya tarik suara & nada', icon: 'Eye' },
  expression: { label: 'Expression / Ekspresi (0-99)', sub: 'Ekspresi emosional & tatapan', icon: 'Eye' },
  sexAppeal: { label: 'Sex Appeal / Daya Tarik (0-99)', sub: 'Magnetisme & aura sensual', icon: 'Eye' },
  authenticity: { label: 'Authenticity / Alami (0-99)', sub: 'Karakter natural & ketulusan', icon: 'Eye' },
  chemistry: { label: 'Chemistry / Keserasian (0-99)', sub: 'Interaksi & resonansi penonton', icon: 'Eye' },
  aura: { label: 'Aura / Karisma (0-99)', sub: 'Kehadiran panggung & bintang', icon: 'Eye' },
};

/**
 * Get the saved Artist Form layout structure, or return default
 */
export function getArtistFormLayoutStructure(): FormTabGroup[] {
  if (typeof window === 'undefined') return DEFAULT_FORM_LAYOUT_STRUCTURE;
  try {
    const raw = localStorage.getItem(ARTIST_FORM_STRUCTURE_KEY);
    if (!raw) return DEFAULT_FORM_LAYOUT_STRUCTURE;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    }
  } catch (e) {
    console.warn('Failed to parse saved layout structure, using default:', e);
  }
  return DEFAULT_FORM_LAYOUT_STRUCTURE;
}

/**
 * Save Artist Form layout structure to local storage and broadcast update
 */
export function saveArtistFormLayoutStructure(structure: FormTabGroup[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sorted = structure
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((item, idx) => ({ ...item, orderIndex: idx }));

    localStorage.setItem(ARTIST_FORM_STRUCTURE_KEY, JSON.stringify(sorted));

    // Also update legacy order map for backward compatibility
    const orderMap: Record<string, number> = {};
    sorted.forEach((group, gIdx) => {
      orderMap[group.id] = gIdx;
      group.fieldKeys.forEach((fk, fIdx) => {
        orderMap[fk] = gIdx * 100 + fIdx;
      });
    });
    localStorage.setItem(ARTIST_FORM_ORDER_KEY, JSON.stringify(orderMap));

    // Broadcast event
    window.dispatchEvent(
      new CustomEvent('applet:form_layout_reordered', {
        detail: { structure: sorted, orderMap },
      })
    );
  } catch (err) {
    console.error('Failed to save layout structure:', err);
  }
}

/**
 * Reset Artist Form layout structure to default
 */
export function resetArtistFormLayoutStructure(): FormTabGroup[] {
  saveArtistFormLayoutStructure(DEFAULT_FORM_LAYOUT_STRUCTURE);
  return DEFAULT_FORM_LAYOUT_STRUCTURE;
}

/**
 * Get the custom sort order for the Artist Form layout (Tab 2)
 */
export function getArtistFormCustomOrder(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ARTIST_FORM_ORDER_KEY);
    if (raw) return JSON.parse(raw);

    // Build from structure
    const structure = getArtistFormLayoutStructure();
    const orderMap: Record<string, number> = {};
    structure.forEach((group, gIdx) => {
      orderMap[group.id] = gIdx;
      group.fieldKeys.forEach((fk, fIdx) => {
        orderMap[fk] = gIdx * 100 + fIdx;
      });
    });
    return orderMap;
  } catch {
    return {};
  }
}

/**
 * Save custom sort order for Artist Form layout (Tab 2)
 * Specifically impacts only the Edit/Create Artist Form!
 */
export function saveArtistFormCustomOrder(orderMap: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARTIST_FORM_ORDER_KEY, JSON.stringify(orderMap));
    window.dispatchEvent(new CustomEvent('applet:form_layout_reordered', { detail: orderMap }));
  } catch (err) {
    console.error('Failed to save artist form order:', err);
  }
}

/**
 * Find a specific TaxonomyItem by its systemKey or ID
 */
export function getMasterTaxonomyItem(
  keyOrId: string,
  customTaxonomy?: MasterTaxonomyData
): TaxonomyItem | null {
  const data = customTaxonomy || getStoredMasterTaxonomy();
  for (const sec of data.sections) {
    for (const cat of sec.categories) {
      for (const sub of cat.subcategories) {
        for (const item of sub.items) {
          if (item.systemKey === keyOrId || item.id === keyOrId) {
            return item;
          }
        }
      }
    }
  }
  return null;
}

/**
 * Return all flat TaxonomyItems across all sections
 */
export function getAllMasterTaxonomyItems(
  customTaxonomy?: MasterTaxonomyData
): TaxonomyItem[] {
  const data = customTaxonomy || getStoredMasterTaxonomy();
  const list: TaxonomyItem[] = [];
  for (const sec of data.sections) {
    for (const cat of sec.categories) {
      for (const sub of cat.subcategories) {
        for (const item of sub.items) {
          list.push(item);
        }
      }
    }
  }
  return list;
}

/**
 * Return all flat TaxonomyItems within a specific Section
 */
export function getTaxonomySectionItems(
  sectionIdOrKey: string,
  customTaxonomy?: MasterTaxonomyData
): TaxonomyItem[] {
  const data = customTaxonomy || getStoredMasterTaxonomy();
  const sec = data.sections.find(
    (s) => s.id === sectionIdOrKey || s.systemKey === sectionIdOrKey
  );
  if (!sec) return [];

  const list: TaxonomyItem[] = [];
  for (const cat of sec.categories) {
    for (const sub of cat.subcategories) {
      for (const item of sub.items) {
        list.push(item);
      }
    }
  }
  return list;
}

/**
 * Return option list from a taxonomy item's formatConfig.options
 */
export function getTaxonomyOptionList(
  keyOrId: string,
  customTaxonomy?: MasterTaxonomyData
): TaxonomyChoiceItem[] {
  const item = getMasterTaxonomyItem(keyOrId, customTaxonomy);
  return item?.formatConfig?.options || [];
}

/**
 * Synchronize the current MasterTaxonomyData to DatabaseSchema
 * Ensures DatabaseSchema fields, descriptions, guidelines, appeal, attributes,
 * specialties, and scoring traits stay in exact sync with Master Taxonomy!
 */
export function syncMasterTaxonomyToDatabaseSchema(
  taxData?: MasterTaxonomyData,
  currentSchema?: DatabaseSchema
): DatabaseSchema {
  const data = taxData || getStoredMasterTaxonomy();
  const base = currentSchema || DEFAULT_DATABASE_SCHEMA;

  const nextSchema: DatabaseSchema = {
    ...base,
    fields: { ...base.fields },
    appealCategories: { ...base.appealCategories },
    attributeCategories: { ...base.attributeCategories },
    specialtyCategories: { ...base.specialtyCategories },
  };

  // 1. Sync Section Titles
  for (const sec of data.sections) {
    if (sec.systemKey === 'sec_biodata' || sec.id.includes('biodata')) {
      nextSchema.sectionTitles.biodata = sec.appLabel;
    } else if (sec.systemKey === 'sec_measurements' || sec.id.includes('measurements')) {
      nextSchema.sectionTitles.measurements = sec.appLabel;
    } else if (sec.systemKey === 'sec_appeal' || sec.id.includes('appeal')) {
      nextSchema.sectionTitles.appeal = sec.appLabel;
    } else if (sec.systemKey === 'sec_scoring' || sec.id.includes('scoring')) {
      nextSchema.sectionTitles.scoring = sec.appLabel;
    } else if (sec.systemKey === 'sec_attributes' || sec.id.includes('attributes')) {
      nextSchema.sectionTitles.attributes = sec.appLabel;
    } else if (sec.systemKey === 'sec_specialty' || sec.id.includes('specialty')) {
      nextSchema.sectionTitles.specialty = sec.appLabel;
    }
  }

  // 2. Sync all Items to fields metadata
  const allItems = getAllMasterTaxonomyItems(data);
  allItems.forEach((item) => {
    const key = item.systemKey;
    if (key) {
      const existing = nextSchema.fields[key] || {
        id: key,
        category: 'biodata',
        label: item.appLabel,
        shortDescription: item.description,
        editorGuidelines: item.evaluationGuideline,
      };

      nextSchema.fields[key] = {
        ...existing,
        id: key,
        label: item.appLabel,
        shortDescription: item.description,
        editorGuidelines: item.evaluationGuideline,
      };
    }
  });

  // 3. Sync Cup Sizes if defined in item_cup_size
  const cupItem = getMasterTaxonomyItem('cupSize', data) || getMasterTaxonomyItem('item_cup_size', data);
  if (cupItem?.formatConfig?.options && cupItem.formatConfig.options.length > 0) {
    nextSchema.cupSizes = cupItem.formatConfig.options.map((o) => o.appLabel || o.formLabel || o.systemValue);
  }

  // 4. Sync Countries if defined in item_country
  const countryItem = getMasterTaxonomyItem('country', data) || getMasterTaxonomyItem('item_country', data);
  if (countryItem?.formatConfig?.options && countryItem.formatConfig.options.length > 0) {
    nextSchema.countries = countryItem.formatConfig.options.map((o) => ({
      name: o.appLabel || o.formLabel || o.systemValue,
      code: (o.systemValue || o.appLabel || 'IDN').toUpperCase().slice(0, 3),
      flag: o.badgeColor || '🌐',
    }));
  }

  // 5. Sync Appeal Categories (maturity, vibe, style, bodyShape)
  const appealKeys = ['maturity', 'vibe', 'style', 'bodyShape'] as const;
  appealKeys.forEach((k) => {
    const itm = getMasterTaxonomyItem(`appeal.${k}`, data) || getMasterTaxonomyItem(k, data);
    if (itm?.formatConfig?.options && itm.formatConfig.options.length > 0 && nextSchema.appealCategories[k]) {
      nextSchema.appealCategories[k] = {
        ...nextSchema.appealCategories[k],
        title: itm.appLabel,
        options: itm.formatConfig.options.map((opt, idx) => ({
          id: opt.id || opt.systemValue || `${k}_${idx}`,
          name: opt.appLabel || opt.formLabel || opt.systemValue,
          description: opt.description || '',
          guidelines: opt.description || '',
        })),
      };
    }
  });

  // 6. Sync Artist Types (typeCode)
  const typeCodeTaxItem = getMasterTaxonomyItem('typeCode', data) || getMasterTaxonomyItem('item_type_code', data);
  if (typeCodeTaxItem?.formatConfig?.options && typeCodeTaxItem.formatConfig.options.length > 0) {
    nextSchema.artistTypes = typeCodeTaxItem.formatConfig.options.map((opt) => ({
      code: opt.systemValue || opt.id,
      indonesia: opt.appLabel || opt.formLabel || opt.systemValue,
      english: opt.description || opt.appLabel || opt.systemValue,
    }));
  }

  // 7. Sync Attribute Categories from sec_attributes
  const attrSec = data.sections.find((s) => s.systemKey === 'sec_attributes' || s.id.includes('attributes'));
  if (attrSec && attrSec.categories) {
    const syncedAttrCats: Record<string, { id: string; name: string; options: { id: string; name: string; description: string; guidelines: string }[] }> = {};
    const allPresetAttrs: string[] = [];

    attrSec.categories.forEach((cat) => {
      const catKey = cat.systemKey || cat.id;
      const opts: { id: string; name: string; description: string; guidelines: string }[] = [];

      cat.subcategories?.forEach((sub) => {
        sub.items?.forEach((item) => {
          if (item.formatConfig?.options && item.formatConfig.options.length > 0) {
            item.formatConfig.options.forEach((opt, idx) => {
              const optName = opt.appLabel || opt.formLabel || opt.systemValue;
              opts.push({
                id: opt.id || `${catKey}_${idx}`,
                name: optName,
                description: opt.description || '',
                guidelines: opt.description || '',
              });
              allPresetAttrs.push(optName);
            });
          } else {
            const optName = item.appLabel || item.formLabel;
            opts.push({
              id: item.id,
              name: optName,
              description: item.description || '',
              guidelines: item.evaluationGuideline || '',
            });
            allPresetAttrs.push(optName);
          }
        });
      });

      if (opts.length > 0 || cat.appLabel) {
        syncedAttrCats[catKey] = {
          id: cat.id,
          name: cat.appLabel,
          options: opts,
        };
      }
    });

    if (Object.keys(syncedAttrCats).length > 0) {
      nextSchema.attributeCategories = syncedAttrCats as any;
      nextSchema.presetAttributes = allPresetAttrs;
    }
  }

  // 8. Sync Specialty Categories from sec_specialty
  const specSec = data.sections.find((s) => s.systemKey === 'sec_specialty' || s.id.includes('specialty'));
  if (specSec && specSec.categories) {
    const syncedSpecCats: Record<string, { id: string; name: string; options: { id: string; name: string; description: string; guidelines: string }[] }> = {};
    const allPresetSpecs: string[] = [];

    specSec.categories.forEach((cat) => {
      const catKey = cat.systemKey || cat.id;
      const opts: { id: string; name: string; description: string; guidelines: string }[] = [];

      cat.subcategories?.forEach((sub) => {
        sub.items?.forEach((item) => {
          if (item.formatConfig?.options && item.formatConfig.options.length > 0) {
            item.formatConfig.options.forEach((opt, idx) => {
              const optName = opt.appLabel || opt.formLabel || opt.systemValue;
              opts.push({
                id: opt.id || `${catKey}_${idx}`,
                name: optName,
                description: opt.description || '',
                guidelines: opt.description || '',
              });
              allPresetSpecs.push(optName);
            });
          } else {
            const optName = item.appLabel || item.formLabel;
            opts.push({
              id: item.id,
              name: optName,
              description: item.description || '',
              guidelines: item.evaluationGuideline || '',
            });
            allPresetSpecs.push(optName);
          }
        });
      });

      if (opts.length > 0 || cat.appLabel) {
        syncedSpecCats[catKey] = {
          id: cat.id,
          name: cat.appLabel,
          options: opts,
        };
      }
    });

    if (Object.keys(syncedSpecCats).length > 0) {
      nextSchema.specialtyCategories = syncedSpecCats as any;
      nextSchema.presetSpecialties = allPresetSpecs;
    }
  }

  return nextSchema;
}

// ============================================================================
// SQL MIGRATION GENERATOR (POSTGRESQL / CLOUD SQL WITH ON DELETE CASCADE)
// ============================================================================

export function generate4TierSQLMigration(): string {
  return `-- ============================================================================
-- MASTER TAXONOMY & 4-TIER RELATIONAL SCHEMA MIGRATION SCRIPT (POSTGRESQL / CLOUD SQL)
-- Structure: Section -> Category -> Subcategory -> Item (Field)
-- Relational Integrity: FOREIGN KEY constraints with ON DELETE CASCADE
-- Performance: B-Tree Indexes & Realtime Notification Trigger
-- ============================================================================

BEGIN;

-- 1. LEVEL 1: TAXONOMY SECTIONS
CREATE TABLE IF NOT EXISTS taxonomy_sections (
    id VARCHAR(64) PRIMARY KEY,
    system_key VARCHAR(64) UNIQUE NOT NULL,
    app_label VARCHAR(128) NOT NULL,
    form_label VARCHAR(128) NOT NULL,
    description TEXT,
    evaluation_guideline TEXT,
    function_location VARCHAR(255),
    icon VARCHAR(64) DEFAULT 'Layers',
    badge_color VARCHAR(32) DEFAULT '#6366f1',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LEVEL 2: TAXONOMY CATEGORIES
CREATE TABLE IF NOT EXISTS taxonomy_categories (
    id VARCHAR(64) PRIMARY KEY,
    section_id VARCHAR(64) NOT NULL,
    system_key VARCHAR(64) NOT NULL,
    app_label VARCHAR(128) NOT NULL,
    form_label VARCHAR(128) NOT NULL,
    description TEXT,
    evaluation_guideline TEXT,
    function_location VARCHAR(255),
    icon VARCHAR(64) DEFAULT 'Folder',
    color VARCHAR(32) DEFAULT '#3b82f6',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_category_section FOREIGN KEY (section_id) REFERENCES taxonomy_sections(id) ON DELETE CASCADE,
    CONSTRAINT uq_category_key_per_section UNIQUE (section_id, system_key)
);

-- 3. LEVEL 3: TAXONOMY SUBCATEGORIES
CREATE TABLE IF NOT EXISTS taxonomy_subcategories (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) NOT NULL,
    section_id VARCHAR(64) NOT NULL,
    system_key VARCHAR(64) NOT NULL,
    app_label VARCHAR(128) NOT NULL,
    form_label VARCHAR(128) NOT NULL,
    description TEXT,
    evaluation_guideline TEXT,
    function_location VARCHAR(255),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_subcategory_category FOREIGN KEY (category_id) REFERENCES taxonomy_categories(id) ON DELETE CASCADE,
    CONSTRAINT fk_subcategory_section FOREIGN KEY (section_id) REFERENCES taxonomy_sections(id) ON DELETE CASCADE,
    CONSTRAINT uq_subcategory_key_per_cat UNIQUE (category_id, system_key)
);

-- 4. LEVEL 4: TAXONOMY ITEMS (FIELDS)
CREATE TABLE IF NOT EXISTS taxonomy_items (
    id VARCHAR(64) PRIMARY KEY,
    subcategory_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(64) NOT NULL,
    section_id VARCHAR(64) NOT NULL,
    folder_id VARCHAR(64) DEFAULT NULL, -- Nullable folder ID: If NULL, field is standalone
    parent_id VARCHAR(64) DEFAULT NULL,
    system_key VARCHAR(64) NOT NULL,
    app_label VARCHAR(128) NOT NULL,
    form_label VARCHAR(128) NOT NULL,
    description TEXT,
    evaluation_guideline TEXT,
    function_location VARCHAR(255),
    is_required BOOLEAN DEFAULT FALSE,
    field_type VARCHAR(32) NOT NULL, -- 'text', 'number', 'date', 'button_link', 'single_select', 'multi_select', 'scoring'
    format_config JSONB DEFAULT '{}'::jsonb,
    scoring_weight NUMERIC(5,2) DEFAULT NULL,
    scoring_category VARCHAR(32) DEFAULT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_item_subcategory FOREIGN KEY (subcategory_id) REFERENCES taxonomy_subcategories(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_category FOREIGN KEY (category_id) REFERENCES taxonomy_categories(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_section FOREIGN KEY (section_id) REFERENCES taxonomy_sections(id) ON DELETE CASCADE,
    CONSTRAINT uq_item_key_per_subcat UNIQUE (subcategory_id, system_key)
);

-- 5. TAB 2: SCORING SYSTEM, FORMULAS & TIERS
CREATE TABLE IF NOT EXISTS scoring_system_config (
    id VARCHAR(64) PRIMARY KEY,
    min_scale NUMERIC(5,2) DEFAULT 0,
    max_scale NUMERIC(5,2) DEFAULT 100,
    formula_expression TEXT NOT NULL DEFAULT '(Appearance * 0.5) + (Impression * 0.5)',
    formula_description TEXT,
    appearance_weight_total NUMERIC(5,2) DEFAULT 50.00,
    impression_weight_total NUMERIC(5,2) DEFAULT 50.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scoring_indicators (
    id VARCHAR(64) PRIMARY KEY,
    config_id VARCHAR(64) NOT NULL,
    indicator_key VARCHAR(64) NOT NULL,
    indicator_name VARCHAR(128) NOT NULL,
    category VARCHAR(32) NOT NULL, -- 'appearance' | 'impression'
    weight_percent NUMERIC(5,2) NOT NULL,
    description TEXT,
    guideline TEXT,
    order_index INTEGER DEFAULT 0,
    CONSTRAINT fk_indicator_config FOREIGN KEY (config_id) REFERENCES scoring_system_config(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scoring_predicate_tiers (
    id VARCHAR(64) PRIMARY KEY,
    config_id VARCHAR(64) NOT NULL,
    grade VARCHAR(8) NOT NULL, -- 'S', 'A', 'B', 'C', 'D'
    min_score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL,
    label VARCHAR(128) NOT NULL,
    badge_color VARCHAR(32) DEFAULT '#f59e0b',
    star_count INTEGER DEFAULT 5,
    order_index INTEGER DEFAULT 0,
    CONSTRAINT fk_tier_config FOREIGN KEY (config_id) REFERENCES scoring_system_config(id) ON DELETE CASCADE
);

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_cat_section_order ON taxonomy_categories(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_sub_category_order ON taxonomy_subcategories(category_id, order_index);
CREATE INDEX IF NOT EXISTS idx_item_subcat_order ON taxonomy_items(subcategory_id, order_index);
CREATE INDEX IF NOT EXISTS idx_item_type ON taxonomy_items(field_type);
CREATE INDEX IF NOT EXISTS idx_item_system_key ON taxonomy_items(system_key);

-- 7. CACHE NOTIFICATION TRIGGER
CREATE OR REPLACE FUNCTION notify_taxonomy_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('master_taxonomy_cache_flush', json_build_object(
        'table', TG_TABLE_NAME,
        'action', TG_OP,
        'timestamp', NOW()
    )::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_taxonomy_items_change ON taxonomy_items;
CREATE TRIGGER trg_taxonomy_items_change
AFTER INSERT OR UPDATE OR DELETE ON taxonomy_items
FOR EACH ROW EXECUTE FUNCTION notify_taxonomy_change();

COMMIT;
`;
}

// ============================================================================
// REST API & GRAPHQL SPECIFICATION GENERATOR
// ============================================================================

export function generate4TierRESTAPISpec(): string {
  return `### MASTER TAXONOMY 4-TIER REST & GRAPHQL API SPECIFICATION

#### Base URL: \`/api/v3/taxonomy\`

---

#### 1. GET /api/v3/taxonomy/hierarchy
Mengembalikan pohon hirarki 4 tingkat lengkap (Section -> Category -> Subcategory -> Item) beserta konfigurasi scoring.
- **Cache Header**: \`Cache-Control: s-maxage=300, stale-while-revalidate=86400\`
- **Redis Key**: \`cache:master_taxonomy:tree:v3\`
- **Response**: \`200 OK\`

---

#### 2. PATCH /api/v3/taxonomy/element/:id
Mengubah metadata (6 atribut) atau pengaturan field pada elemen hirarki.

---

#### 3. POST /api/v3/taxonomy/reorder
Menyesuaikan urutan posisi elemen (khusus tersinkron ke Halaman Edit/Buat Artis).

---

#### 4. POST /api/v3/taxonomy/cache/flush
Memaksa pembersihan cache Redis dan Local Storage.
- **Response**: \`{ "success": true, "flushedAt": "2026-09-01T12:00:00Z" }\`
`;
}

// ============================================================================
// CSV EXPORT & IMPORT ENGINE FOR MASTER TAXONOMY (4-TIER SCHEMA)
// Attributes: Section, Kategori, Sub-kategori, System Key, Teks UI,
//             Teks Form Artis, Deskripsi, Panduan Penilaian, Format Field,
//             Status Wajib Diisi
// ============================================================================

export function exportTaxonomyToCSV(data: MasterTaxonomyData): string {
  const headers = [
    'Section',
    'Kategori',
    'Sub-kategori',
    'System Key',
    'Teks UI',
    'Teks Form Artis',
    'Deskripsi',
    'Panduan Penilaian',
    'Format Field',
    'Status Wajib Diisi',
  ];

  const escapeCSV = (str: string = '') => {
    if (str === null || str === undefined) return '""';
    const s = String(str);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const rows: string[] = [];
  rows.push(headers.join(','));

  data.sections.forEach((sec) => {
    sec.categories.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        sub.items.forEach((item) => {
          const row = [
            escapeCSV(sec.appLabel || sec.systemKey),
            escapeCSV(cat.appLabel || cat.systemKey),
            escapeCSV(sub.appLabel || sub.systemKey),
            escapeCSV(item.systemKey),
            escapeCSV(item.appLabel),
            escapeCSV(item.formLabel),
            escapeCSV(item.description || ''),
            escapeCSV(item.evaluationGuideline || ''),
            escapeCSV(item.fieldType || 'text'),
            escapeCSV(item.isRequired ? 'Wajib' : 'Opsional'),
          ];
          rows.push(row.join(','));
        });
      });
    });
  });

  return rows.join('\r\n');
}

/**
 * Robust CSV parser that handles quotes, multiline values, and commas.
 */
function parseCSVRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuotes = false;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentVal.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export interface TaxonomyImportResult {
  success: boolean;
  data: MasterTaxonomyData;
  stats: {
    added: number;
    updated: number;
    total: number;
    errors: string[];
  };
}

export function importTaxonomyFromCSV(
  csvContent: string,
  currentData: MasterTaxonomyData
): TaxonomyImportResult {
  const rows = parseCSVRows(csvContent);
  const errors: string[] = [];

  if (rows.length < 2) {
    return {
      success: false,
      data: currentData,
      stats: { added: 0, updated: 0, total: 0, errors: ['Berkas CSV kosong atau tidak memiliki baris data.'] },
    };
  }

  // Header detection & column index mapping
  const headerRow = rows[0].map(h => h.toLowerCase().replace(/[-_\s]/g, ''));

  const findColIndex = (candidates: string[]): number => {
    for (const c of candidates) {
      const idx = headerRow.findIndex(h => h === c || h.includes(c));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const secIdx = findColIndex(['section', 'seksi', 'bagian']);
  const catIdx = findColIndex(['kategori', 'category']);
  const subIdx = findColIndex(['subkategori', 'subcategory', 'subkat']);
  const keyIdx = findColIndex(['systemkey', 'system_key', 'key', 'kuncisistem', 'namaasli']);
  const appLabelIdx = findColIndex(['teksui', 'applabel', 'labelui', 'ui']);
  const formLabelIdx = findColIndex(['teksformartis', 'formlabel', 'labelform', 'form']);
  const descIdx = findColIndex(['deskripsi', 'description', 'desc']);
  const guideIdx = findColIndex(['panduanpenilaian', 'guideline', 'evaluationguideline', 'panduan']);
  const typeIdx = findColIndex(['formatfield', 'fieldtype', 'type', 'format']);
  const reqIdx = findColIndex(['statuswajibdiisi', 'isrequired', 'wajib', 'required', 'mandatory']);

  if (keyIdx === -1) {
    return {
      success: false,
      data: currentData,
      stats: { added: 0, updated: 0, total: 0, errors: ['Header CSV wajib memiliki kolom "System Key".'] },
    };
  }

  // Deep clone data to modify
  const nextData: MasterTaxonomyData = JSON.parse(JSON.stringify(currentData));
  let addedCount = 0;
  let updatedCount = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const systemKey = row[keyIdx]?.trim();
    if (!systemKey) {
      errors.push(`Baris ${r + 1}: System Key kosong, dilewati.`);
      continue;
    }

    const secName = (secIdx !== -1 && row[secIdx]) ? row[secIdx].trim() : 'Data Pokok';
    const catName = (catIdx !== -1 && row[catIdx]) ? row[catIdx].trim() : 'Identitas';
    const subName = (subIdx !== -1 && row[subIdx]) ? row[subIdx].trim() : 'Umum';
    const appLabel = (appLabelIdx !== -1 && row[appLabelIdx]) ? row[appLabelIdx].trim() : systemKey;
    const formLabel = (formLabelIdx !== -1 && row[formLabelIdx]) ? row[formLabelIdx].trim() : appLabel;
    const description = (descIdx !== -1 && row[descIdx]) ? row[descIdx].trim() : '';
    const evaluationGuideline = (guideIdx !== -1 && row[guideIdx]) ? row[guideIdx].trim() : '';

    // Field type normalization
    const rawType = (typeIdx !== -1 && row[typeIdx]) ? row[typeIdx].toLowerCase().trim() : 'text';
    let fieldType: FieldDataType = 'text';
    if (rawType.includes('num') || rawType.includes('angka')) fieldType = 'number';
    else if (rawType.includes('date') || rawType.includes('tanggal')) fieldType = 'date';
    else if (rawType.includes('button') || rawType.includes('link') || rawType.includes('tautan')) fieldType = 'button_link';
    else if (rawType.includes('multi')) fieldType = 'multi_select';
    else if (rawType.includes('select') || rawType.includes('pilihan')) fieldType = 'single_select';
    else if (rawType.includes('score') || rawType.includes('rating') || rawType.includes('skor')) fieldType = 'scoring';
    else fieldType = 'text';

    // Required status normalization
    const rawReq = (reqIdx !== -1 && row[reqIdx]) ? row[reqIdx].toLowerCase().trim() : 'false';
    const isRequired = rawReq === 'true' || rawReq === 'wajib' || rawReq === 'ya' || rawReq === '1' || rawReq === 'yes';

    // Check if item exists anywhere in taxonomy (Upsert - Update)
    let existingItem: TaxonomyItem | null = null;
    for (const s of nextData.sections) {
      for (const c of s.categories) {
        for (const sb of c.subcategories) {
          const itm = sb.items.find(i => i.systemKey.toLowerCase() === systemKey.toLowerCase());
          if (itm) {
            existingItem = itm;
            break;
          }
        }
        if (existingItem) break;
      }
      if (existingItem) break;
    }

    if (existingItem) {
      // Update existing item
      existingItem.appLabel = appLabel;
      existingItem.formLabel = formLabel;
      existingItem.description = description;
      existingItem.evaluationGuideline = evaluationGuideline;
      existingItem.fieldType = fieldType;
      existingItem.isRequired = isRequired;
      updatedCount++;
    } else {
      // Insert into target Section -> Category -> Subcategory
      // 1. Find or create Section
      let targetSec = nextData.sections.find(
        s => s.systemKey.toLowerCase() === secName.toLowerCase() || s.appLabel.toLowerCase() === secName.toLowerCase()
      );
      if (!targetSec) {
        targetSec = {
          id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          level: 'section',
          systemKey: secName.toLowerCase().replace(/\s+/g, '_'),
          appLabel: secName,
          formLabel: secName,
          description: `Seksi ${secName}`,
          evaluationGuideline: '',
          functionLocation: 'Form Artis & Profil',
          orderIndex: nextData.sections.length,
          isActive: true,
          categories: [],
        };
        nextData.sections.push(targetSec);
      }

      // 2. Find or create Category
      let targetCat = targetSec.categories.find(
        c => c.systemKey.toLowerCase() === catName.toLowerCase() || c.appLabel.toLowerCase() === catName.toLowerCase()
      );
      if (!targetCat) {
        targetCat = {
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          level: 'category',
          sectionId: targetSec.id,
          systemKey: catName.toLowerCase().replace(/\s+/g, '_'),
          appLabel: catName,
          formLabel: catName,
          description: `Kategori ${catName}`,
          evaluationGuideline: '',
          functionLocation: 'Form Artis & Profil',
          orderIndex: targetSec.categories.length,
          isActive: true,
          subcategories: [],
        };
        targetSec.categories.push(targetCat);
      }

      // 3. Find or create Subcategory
      let targetSub = targetCat.subcategories.find(
        sb => sb.systemKey.toLowerCase() === subName.toLowerCase() || sb.appLabel.toLowerCase() === subName.toLowerCase()
      );
      if (!targetSub) {
        targetSub = {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          level: 'subcategory',
          sectionId: targetSec.id,
          categoryId: targetCat.id,
          systemKey: subName.toLowerCase().replace(/\s+/g, '_'),
          appLabel: subName,
          formLabel: subName,
          description: `Sub-kategori ${subName}`,
          evaluationGuideline: '',
          functionLocation: 'Form Artis & Profil',
          orderIndex: targetCat.subcategories.length,
          isActive: true,
          items: [],
        };
        targetCat.subcategories.push(targetSub);
      }

      // 4. Create new Item
      const newItem: TaxonomyItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        level: 'item',
        sectionId: targetSec.id,
        categoryId: targetCat.id,
        subcategoryId: targetSub.id,
        systemKey,
        appLabel,
        formLabel,
        description,
        evaluationGuideline,
        functionLocation: 'Halaman Detail Profil, Kartu Artis, Form',
        orderIndex: targetSub.items.length,
        isActive: true,
        isRequired,
        fieldType,
        formatConfig: {},
      };

      targetSub.items.push(newItem);
      addedCount++;
    }
  }

  // Update metadata timestamp & save
  nextData.version = (nextData.version || 1) + 1;
  nextData.lastUpdated = new Date().toISOString();
  saveStoredMasterTaxonomy(nextData);
  flushTaxonomyCache();

  return {
    success: true,
    data: nextData,
    stats: {
      added: addedCount,
      updated: updatedCount,
      total: addedCount + updatedCount,
      errors,
    },
  };
}
