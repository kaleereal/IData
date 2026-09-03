export interface Measurements {
  cupSize: string; // e.g. "B", "C", "D", "E", "F", "G", "H"
  bustCm: number;
  waistCm: number;
  hipCm: number;
}

export interface AppearanceScores {
  face: number; // Bobot 25%
  skin: number; // Bobot 15%
  breast: number; // Bobot 15%
  butt: number; // Bobot 15%
  v: number; // Bobot 10%
  thighCalve: number; // Bobot 20%
}

export interface ImpressionScores {
  voice: number; // Bobot 15%
  expression: number; // Bobot 20%
  sexAppeal: number; // Bobot 20%
  authenticity: number; // Bobot 15%
  chemistry: number; // Bobot 15%
  aura: number; // Bobot 15%
}

export interface AppealData {
  maturity: string;
  vibe: string;
  style: string;
  bodyShape: string;
  [key: string]: string | undefined;
}

export interface ArtistLink {
  id: string;
  name: string; // Nama tombol link (contoh: Instagram, Website, Twitter, Fansly, dll)
  url: string;  // Tautan URL eksternal
}

export interface Artist {
  id: string;
  firstName: string;
  lastName: string; // empty if single name
  avatarUrl: string;
  country: string;
  countryCode: string; // e.g. "MD", "JP", "US", "KR", "ID"
  bornDate: string; // YYYY-MM-DD
  debutDate: string; // YYYY-MM-DD
  heightCm: number;
  typeCode: string; // e.g. "AK", "SL"
  artistStatus?: string; // 'Amatir' | 'Profesional' (Single select)
  measurements: Measurements;
  attributes: string[]; // if length > 0 => Special, else Standard
  appeal: AppealData;
  specialty: string[];
  appearanceScores: AppearanceScores;
  impressionScores: ImpressionScores;
  links?: ArtistLink[]; // Daftar link/tautan tak terbatas
  externalUrl?: string; // Legacy fallback
  notes?: string;
  customFields?: Record<string, any>; // Dynamic custom taxonomy fields
  createdAt: string;
  updatedAt: string;
}

export interface ArtistTypeInfo {
  code: string;
  indonesia: string;
  english: string;
}

export interface CountryOption {
  name: string;
  code: string;
}

export interface AppealOptionItem {
  id: string;
  name: string;
  description: string;
  guidelines: string;
}

export interface AppealCategoryDefinition {
  title: string;
  icon: string;
  shortDescription: string;
  options: AppealOptionItem[];
}

export interface FieldMetadata {
  id: string;
  category: 'biodata' | 'measurements' | 'appeal' | 'scoring' | 'attributes';
  label: string;
  shortDescription: string; // Ringkasan singkat untuk Mode Tampilan (Viewer Mode)
  editorGuidelines?: string; // Panduan detail untuk Mode Editor / Pengisian
}

export interface ScoringTraitMetadata {
  key: string;
  label: string;
  category: 'appearance' | 'impression';
  weight: number;
  weightLabel: string;
  shortDescription: string;
  rubricGuide: {
    sTier: string; // 90-99
    aTier: string; // 80-89
    bTier: string; // 70-79
    cTier: string; // <70
  };
}

export interface PageTextDefinition {
  title?: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  logoIcon?: string;
  bannerImage?: string;
  buttons?: Record<string, string>;
  labels?: Record<string, string>;
  sections?: Record<string, string>;
  placeholders?: Record<string, string>;
  hints?: Record<string, string>;
  links?: Record<string, string>;
  images?: Record<string, string>;
  [key: string]: any;
}

export type RankingFilterDimension =
  | 'ALL'
  | 'STATUS'
  | 'COUNTRY'
  | 'BODY_TYPE'
  | 'BODY_SHAPES'
  | 'MATURITY'
  | 'CUP_SIZE'
  | 'BUST_SIZE'
  | 'WAIST_SIZE'
  | 'HIP_SIZE'
  | 'AGE'
  | 'HEIGHT'
  | 'ATTRIBUTES'
  | 'APPEAL'
  | 'SPECIALTY';

export interface DatabaseSchema {
  version: number;
  sectionTitles: {
    biodata: string;
    measurements: string;
    appeal: string;
    scoring: string;
    attributes: string;
    specialty: string;
    appearance?: string;
    impression?: string;
    [key: string]: string | undefined;
  };
  fields: Record<string, FieldMetadata>;
  countries: CountryOption[];
  artistTypes: ArtistTypeInfo[];
  artistStatusCategory?: AppealCategoryDefinition;
  appealCategories: {
    maturity: AppealCategoryDefinition;
    vibe: AppealCategoryDefinition;
    style: AppealCategoryDefinition;
    bodyShape: AppealCategoryDefinition;
    [key: string]: AppealCategoryDefinition;
  };
  attributeCategories?: {
    primaryTrait: AppealCategoryDefinition;
    bodyTrait: AppealCategoryDefinition;
    charmPoint: AppealCategoryDefinition;
    [key: string]: AppealCategoryDefinition;
  };
  specialtyCategories?: {
    mainSpecialty: AppealCategoryDefinition;
    performanceGenre: AppealCategoryDefinition;
    visualTheme: AppealCategoryDefinition;
    [key: string]: AppealCategoryDefinition;
  };
  cupSizes: string[];
  presetAttributes: string[];
  presetSpecialties: string[];
  scoringTraits: {
    appearance: ScoringTraitMetadata[];
    impression: ScoringTraitMetadata[];
  };
  scoringWeights?: {
    appearanceWeight: number;
    impressionWeight: number;
  };
  pageTexts?: {
    home?: PageTextDefinition;
    artistList?: PageTextDefinition;
    artistDetail?: PageTextDefinition;
    ranking?: PageTextDefinition;
    compare?: PageTextDefinition;
    create?: PageTextDefinition;
    edit?: PageTextDefinition;
  };
}

export const ARTIST_TYPES: ArtistTypeInfo[] = [
  { code: 'SK', indonesia: 'pendek kurus', english: 'short skinny' },
  { code: 'SL', indonesia: 'pendek ramping', english: 'short slim' },
  { code: 'SA', indonesia: 'pendek sedang', english: 'short average' },
  { code: 'SC', indonesia: 'pendek gemuk', english: 'short chubby' },
  { code: 'SO', indonesia: 'pendek sangat gemuk', english: 'short overweight' },
  { code: 'AK', indonesia: 'sedang kurus', english: 'average skinny' },
  { code: 'AL', indonesia: 'sedang ramping', english: 'average slim' },
  { code: 'AA', indonesia: 'sedang', english: 'average average / average build' },
  { code: 'AC', indonesia: 'sedang gemuk', english: 'average chubby' },
  { code: 'AO', indonesia: 'sedang sangat gemuk', english: 'average overweight' },
  { code: 'TK', indonesia: 'tinggi kurus', english: 'tall skinny' },
  { code: 'TL', indonesia: 'tinggi ramping', english: 'tall slim' },
  { code: 'TA', indonesia: 'tinggi sedang', english: 'tall average' },
  { code: 'TC', indonesia: 'tinggi gemuk', english: 'tall chubby' },
  { code: 'TO', indonesia: 'tinggi sangat gemuk', english: 'tall overweight' },
];

export const APPEAL_DEFINITIONS = {
  maturity: {
    title: 'Maturity',
    icon: '🧬',
    options: [
      {
        name: 'Teen / Young',
        description: 'Penampilan muda, segar, dan lugu dengan kesan usia belasan hingga awal 20-an.',
        guidelines: 'Wajah bulat/oval dengan pipi berisi, kulit sangat mulus tanpa kerutan, mata besar dan polos, tubuh mungil/ramping, aura lugu dan segar, kesan usia 18–22 tahun.'
      },
      {
        name: 'MILF / Mature',
        description: 'Penampilan matang dan percaya diri dengan tubuh berisi dan aura berpengalaman.',
        guidelines: 'Garis rahang tegas, bibir penuh, kulit kencang tapi terlihat matang, tubuh berisi/berlekuk (pinggul lebar, payudara terisi), aura percaya diri dan berpengalaman, kesan usia 30–45 tahun.'
      },
      {
        name: 'Cougar',
        description: 'Penampilan matang dengan aura agresif, dominan, dan "memburu".',
        guidelines: 'Mirip MILF tapi aura lebih agresif dan predator, makeup lebih tajam, gaya berpakaian lebih terbuka dan berani, kesan usia 35–50 tahun.'
      }
    ]
  },
  vibe: {
    title: 'Vibe',
    icon: '🎭',
    options: [
      {
        name: 'Girl Next Door (GND)',
        description: 'Penampilan ramah, hangat, dan mudah didekati seperti tetangga sebelah.',
        guidelines: 'Senyuman ramah dan hangat, ekspresi terbuka/tidak dibuat-buat, tatapan lembut, gaya natural tanpa makeup berlebihan, terasa dikenal dan mudah didekati.'
      },
      {
        name: 'Innocent / Polos',
        description: 'Penampilan lugu dan menggemaskan dengan ekspresi malu atau bingung.',
        guidelines: 'Mata lebar dengan alis terangkat sedikit, ekspresi sedikit bingung atau malu, sering menunduk atau tersenyum tipis, terlihat "tidak tahu apa-apa" dengan cara menggemaskan.'
      },
      {
        name: 'Bad Girl / Rebel',
        description: 'Penampilan berani dan cuek dengan tatapan tajam dan aura berbahaya.',
        guidelines: 'Tatapan tajam dan meremehkan, sering menyeringai atau ekspresi berani, gaya rambut berantakan atau warna mencolok, aura cuek dan sedikit berbahaya.'
      },
      {
        name: 'Girlfriend Experience (GFE)',
        description: 'Penampilan intim dan penuh kasih seperti pacar sungguhan.',
        guidelines: 'Tatapan penuh kasih dan perhatian, senyuman manis yang terasa personal, ekspresi intim seolah mengenal penonton secara pribadi, aura pacar sungguhan.'
      }
    ]
  },
  style: {
    title: 'Style',
    icon: '👗',
    options: [
      {
        name: 'Elegant / Glamour',
        description: 'Penampilan mewah dan berkelas dengan makeup tegas, rambut tertata, dan kesan premium.',
        guidelines: 'Rambut tertata rapi (bergelombang/sanggul), makeup tegas (bibir merah, smokey eye), aksesoris mewah, aura kelas atas.'
      },
      {
        name: 'Gothic / Alt',
        description: 'Penampilan gelap dan edgy dengan tato, tindik, dan gaya alternatif yang berani.',
        guidelines: 'Rambut gelap/neon, tato terlihat jelas di lengan/dada, tindik (hidung/alis/bibir), makeup hitam tebal di mata, aura gelap dan misterius.'
      },
      {
        name: 'Sporty / Active',
        description: 'Penampilan aktif dan sehat, minim makeup, dengan tubuh bugar dan energik.',
        guidelines: 'Rambut diikat ponytail, sedikit/tanpa makeup, kulit segar berkilau, tubuh kencang/berotot, aura aktif dan penuh energi.'
      },
      {
        name: 'Bohemian / Natural',
        description: 'Penampilan alami dan santai, makeup minimalis, dengan gaya bebas dan mengalir.',
        guidelines: 'Rambut alami bergelombang/keriting tanpa styling berat, makeup earthy tone minimal, gaya berpakaian mengalir santai, aura bebas dan tidak terikat aturan.'
      }
    ]
  },
  bodyShape: {
    title: 'Body Shape',
    icon: '🏋️',
    options: [
      {
        name: 'Petite / Mungil',
        description: 'Perawakan kecil dan mungil dengan rangka tulang halus.',
        guidelines: 'Tinggi biasanya < 155cm, bahu sempit, tulang kecil, terlihat ringan dan mudah diatur secara visual.'
      },
      {
        name: 'Slim / Langsing',
        description: 'Tubuh ramping dan proporsional dengan kesan ringan dan elegan.',
        guidelines: 'Lemak tubuh rendah tanpa definisi otot mencolok, pinggang terlihat jelas, anggota tubuh jenjang, tinggi badan bervariasi.'
      },
      {
        name: 'Athletic / Berotot',
        description: 'Tubuh kencang dan berotot dengan kesan kuat dan terlatih.',
        guidelines: 'Otot perut terlihat jelas (sixpack), lengan dan paha berotot/kencang, tidak ada lemak berlebih, aura kuat dan padat.'
      },
      {
        name: 'Curvy / Jam Pasir',
        description: 'Siluet angka 8 dengan lekukan tegas antara pinggang, pinggul, dan dada.',
        guidelines: 'Pinggang jauh lebih kecil dibanding pinggul dan dada, lekukan sangat tegas dan proporsional.'
      },
      {
        name: 'Thick / Padat Berisi',
        description: 'Tubuh padat dan berisi dengan kesan berat tapi kencang.',
        guidelines: 'Paha besar dan padat, bokong sangat padat, pinggang masih ramping, terasa berat tapi padat, bukan lemak longgar.'
      },
      {
        name: 'Voluptuous / Berisi',
        description: 'Tubuh montok dan penuh dengan lekukan lembut.',
        guidelines: 'Payudara dan bokong besar, paha berisi, pinggang masih terlihat tapi tidak kecil, aura montok dan lembut.'
      }
    ]
  }
};

export const SCORE_TRAIT_INFO = {
  appearance: [
    { key: 'face', label: 'FACE', weight: 0.25, weightLabel: '25%', description: 'Struktur, simetri, ekspresi wajah' },
    { key: 'skin', label: 'SKIN', weight: 0.15, weightLabel: '15%', description: 'Tekstur, warna, kesehatan kulit' },
    { key: 'breast', label: 'BREAST', weight: 0.15, weightLabel: '15%', description: 'Bentuk, proporsi, tampilan payudara' },
    { key: 'butt', label: 'BUTT', weight: 0.15, weightLabel: '15%', description: 'Bentuk, proporsi, tampilan bokong' },
    { key: 'v', label: 'V', weight: 0.10, weightLabel: '10%', description: 'Penampilan area intim' },
    { key: 'thighCalve', label: 'THIGH & CALVE', weight: 0.20, weightLabel: '20%', description: 'Bentuk, proporsi kaki (paha & betis)' },
  ],
  impression: [
    { key: 'voice', label: 'VOICE', weight: 0.15, weightLabel: '15%', description: 'Kualitas vokal, desahan, nada bicara, daya tarik audio' },
    { key: 'expression', label: 'EXPRESSION', weight: 0.20, weightLabel: '20%', description: 'Mimik wajah, emosi, kenikmatan yang terlihat natural' },
    { key: 'sexAppeal', label: 'SEX APPEAL', weight: 0.20, weightLabel: '20%', description: 'Daya tarik seksual keseluruhan & kemampuan membangkitkan hasrat' },
    { key: 'authenticity', label: 'AUTHENTICITY', weight: 0.15, weightLabel: '15%', description: 'Seberapa natural, kesan tidak dibuat-buat, terasa genuine' },
    { key: 'chemistry', label: 'CHEMISTRY', weight: 0.15, weightLabel: '15%', description: 'Koneksi dengan lawan main, interaksi yang terasa autentik' },
    { key: 'aura', label: 'AURA', weight: 0.15, weightLabel: '15%', description: 'Magnetisme/karisma di depan kamera, "X-factor", daya tarik khas' },
  ]
};

export type ActiveTab =
  | 'home'
  | 'rank'
  | 'compare'
  | 'detail'
  | 'export_studio'
  | 'create'
  | 'edit'
  | 'dynamic_schema'
  | 'db_editor'
  | 'settings'
  | 'layout_score_settings'
  | 'card_theme_studio'
  | 'custom_pages'
  | 'custom_page_create'
  | 'custom_page_edit'
  | 'custom_page_view';

export type ExportPageRatio = 'card' | 'story' | 'a4' | 'letter';
export type ExportTheme = 'dark_modern' | 'clean_light' | 'amber_gold' | 'classic_monochrome';
export type ExportPadding = 'compact' | 'normal' | 'spacious';
export type ExportFontScale = 'small' | 'normal' | 'large' | 'xlarge';

export interface ExportVisibleFields {
  avatar: boolean;
  biodata: boolean;
  measurements: boolean;
  rankingRating: boolean;
  attributes: boolean;
  specialty: boolean;
  appeal: boolean;
  appearance: boolean;
  impression: boolean;
  footerNotes: boolean;
}

export interface ExportStudioPreferences {
  ratio: ExportPageRatio;
  theme: ExportTheme;
  padding: ExportPadding;
  fontScale: ExportFontScale;
  fields: ExportVisibleFields;
}

export type CustomPageImageLayout = 'slide_bar' | 'grid_2' | 'grid_3' | 'grid_4';

export interface CustomPageImage {
  id: string;
  url: string;
  caption?: string;
}

export interface CustomPageButton {
  id: string;
  label: string;
  url: string;
  layoutRule?: 'default' | 'pill' | 'outline' | 'gradient';
}

export type CustomPageButtonGroupLayout = 'vertical' | 'horizontal_wrap' | 'grid_2' | 'grid_3';

export type CustomPageBlock =
  | {
      id: string;
      type: 'image_category';
      title?: string;
      layout: CustomPageImageLayout;
      images: CustomPageImage[];
    }
  | {
      id: string;
      type: 'buttons_group';
      title?: string;
      layout: CustomPageButtonGroupLayout;
      buttons: CustomPageButton[];
    };

export interface CustomPageEntry {
  id: string;
  title: string;
  description?: string;
  linkedArtistId?: string; // Reference to Artist ID (max 1 artist per custom page)
  blocks: CustomPageBlock[];
  createdAt: string; // ISO String
  updatedAt: string; // ISO String (used for sorting latest on top)
}

export type AppTheme = 'dark' | 'light' | 'midnight' | 'slate' | 'sepia' | 'forest';
export type AppFontFamily = 'Plus Jakarta Sans' | 'Roboto' | 'Open Sans' | 'Helvetica' | 'Inter' | 'Lato';
export type AppFontSize = 'xsmall' | 'small' | 'normal' | 'medium' | 'large' | 'xlarge';
export type AppLanguage = 'default' | 'id' | 'en';

export type CardTheme =
  | 'default'
  | 'split_banner'
  | 'side_spec'
  | 'frame_crest'
  | 'compact_badge'
  | 'cyber_hud'
  | 'neo_brutalist'
  | 'editorial_inset'
  | 'bottom_sheet'
  | 'circular_focus'
  | 'vintage_polaroid'
  | 'aurora_crystal'
  | 'obsidian_gold'
  | 'neon_synthwave'
  | (string & {});

export interface GraphicAssetConfig {
  url?: string; // Direct HTTPS URL or Base64 Data URI (image/png, image/svg+xml, etc.)
  scale?: number; // Relative scale (e.g. 0.2 to 2.5, default 1.0)
  opacity?: number; // Opacity 0.0 to 1.0 (default 1.0)
  position?:
    | 'top'
    | 'bottom'
    | 'top_left'
    | 'top_right'
    | 'top_center'
    | 'center'
    | 'bottom_left'
    | 'bottom_right'
    | 'bottom_center'
    | 'behind_name'
    | 'behind_header'
    | 'repeat'
    | (string & {});
  offsetX?: number; // Horizontal offset in px or % (clamped safely)
  offsetY?: number; // Vertical offset in px or % (clamped safely)
  rotation?: number; // Rotation in degrees (-180 to 180)
  blendMode?:
    | 'normal'
    | 'overlay'
    | 'screen'
    | 'multiply'
    | 'color-dodge'
    | 'soft-light'
    | 'luminosity'
    | (string & {});
  zIndex?: number;
  fit?: 'contain' | 'cover' | 'fill' | 'auto';
  inset?: number; // Frame inset margin in px
}

export interface CardThemeAssets {
  // 1. Texture / Background Pattern Overlay
  textureUrl?: string;
  textureConfig?: GraphicAssetConfig;

  // 2. Center or Corner Graphic Symbol / Crest / Watermark
  symbolUrl?: string;
  symbolConfig?: GraphicAssetConfig;

  // 3. Header / Footer Ribbon / Decorative Name Banner
  bannerUrl?: string;
  bannerConfig?: GraphicAssetConfig;

  // 4. Secondary Graphic Emblem / Medal / Seal
  emblemUrl?: string;
  emblemConfig?: GraphicAssetConfig;

  // 5. Custom Graphic Frame Border (PNG / SVG decorative borders)
  borderFrameUrl?: string;
  borderFrameConfig?: GraphicAssetConfig;

  // Backwards compatibility fields
  backgroundImageUrl?: string;
  overlayPatternUrl?: string;
  customBadgeIconUrl?: string;
  frameMaskUrl?: string;
  watermarkUrl?: string;
  [key: string]: any;
}

export interface LayoutOffsetCoord {
  x?: number;
  y?: number;
}

export interface CardThemeLayoutOffsets {
  ratingOffset?: LayoutOffsetCoord;
  nameOffset?: LayoutOffsetCoord;
  badgeOffset?: LayoutOffsetCoord;
  specsOffset?: LayoutOffsetCoord;
  thumbnailOffset?: LayoutOffsetCoord;
  ornamentOffset?: LayoutOffsetCoord;
  [key: string]: LayoutOffsetCoord | undefined;
}

export interface CardThemeTypography {
  nameFontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | (string & {});
  nameFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black' | (string & {});
  primaryTextColor?: string; // Hex color for main text / artist name
  secondaryTextColor?: string; // Hex color for secondary text / badges / specs
  scoreTextColor?: string; // Hex color for score numbers
  fontFamily?: string;
  [key: string]: any;
}

export type UniversalCardElementId =
  | 'thumbnail'
  | 'firstName'
  | 'lastName'
  | 'overallRating'
  | 'appearanceScore'
  | 'impressionScore'
  | 'artistStatus'
  | 'maturity'
  | 'bodyTypeCode'
  | 'bodyType'
  | 'countryFlag'
  | 'country'
  | 'cupSize'
  | 'measurementsBWH'
  | 'bwh'
  | 'age'
  | 'ageHeight'
  | 'customLogoBadge'
  | (string & {});

export interface CardCustomImageAsset {
  id: string;
  name: string;
  url: string;
  position?:
    | 'top_left'
    | 'top_center'
    | 'top_right'
    | 'center_left'
    | 'center'
    | 'center_right'
    | 'bottom_left'
    | 'bottom_center'
    | 'bottom_right'
    | 'free_absolute'
    | (string & {});
  offsetX?: number; // -100 to 100 (px or %)
  offsetY?: number; // -100 to 100 (px or %)
  scale?: number; // 0 to 100 or relative scale
  opacity?: number; // 0 to 100
  rotation?: number; // 0 to 360
  filter?: 'none' | 'drop_shadow' | 'glow' | 'invert' | 'grayscale' | 'blur' | 'brightness' | 'contrast' | 'sepia' | (string & {});
  filterValue?: number;
  zIndex?: number;
  visible?: boolean;
}

export interface CardCustomTextAsset {
  id: string;
  name: string;
  text: string;
  position?:
    | 'top_left'
    | 'top_center'
    | 'top_right'
    | 'center_left'
    | 'center'
    | 'center_right'
    | 'bottom_left'
    | 'bottom_center'
    | 'bottom_right'
    | 'free_absolute'
    | (string & {});
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  opacity?: number;
  rotation?: number;
  fontSize?: number | string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  fontFamily?: string;
  color?: string;
  showBackground?: boolean;
  backgroundColor?: string;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  cornerRadii?: { topLeft?: number; topRight?: number; bottomRight?: number; bottomLeft?: number };
  padding?: number;
  filter?: 'none' | 'drop_shadow' | 'glow' | 'invert' | 'grayscale' | 'blur' | 'brightness' | 'contrast' | 'sepia' | (string & {});
  filterValue?: number;
  zIndex?: number;
  visible?: boolean;
}

export interface CardElementPropertyConfig {
  visible?: boolean;
  position?:
    | 'top_left'
    | 'top_center'
    | 'top_right'
    | 'center_left'
    | 'center'
    | 'center_right'
    | 'bottom_left'
    | 'bottom_center'
    | 'bottom_right'
    | 'center'
    | 'free_absolute'
    | 'with_name'
    | 'with_score'
    | 'side_rail'
    | 'hidden'
    | (string & {});
  offsetX?: number; // Free X coordinate offset in px (-100 to 100)
  offsetY?: number; // Free Y coordinate offset in px (-100 to 100)
  scale?: number; // Relative scale % (0.1 to 2.5 or 0 to 100)
  fontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | (string & {});
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  padding?: number; // Padding in px (0 to 32)
  iconSize?: number; // Icon dimension in px (10 to 48)
  color?: string; // Custom text color override
  showBackground?: boolean;
  backgroundColor?: string;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  cornerRadii?: { topLeft?: number; topRight?: number; bottomRight?: number; bottomLeft?: number };
  displayFormat?: string; // e.g. "integer" | "decimal" | "flag_only" | "full_name" | etc.
  showLabel?: boolean; // e.g. show "APP" or "IMP" label
  zIndex?: number; // Layer order: stack order on canvas
  rotation?: number; // -180 to 180 degrees
  opacity?: number; // 0 to 100 (or 0 to 1)
  filter?: 'none' | 'drop_shadow' | 'glow' | 'invert' | 'grayscale' | 'blur' | 'brightness' | 'contrast' | 'sepia' | (string & {});
  filterValue?: number;
  customAssetUrl?: string;
  customBadgeText?: string;
  [key: string]: any;
}

export interface CardThemeLayoutConfig {
  // Layer hierarchy & dynamic ordering (top-to-bottom stack order for Drag-and-Drop)
  layerOrder?: string[];
  // Unlimited custom uploaded images (logos, frames, watermarks, badges)
  customImages?: CardCustomImageAsset[];
  // Unlimited custom user text assets
  customTexts?: CardCustomTextAsset[];

  // Universal Element Registry (Single Reactive Engine for Granular Objects)
  elements?: Partial<Record<UniversalCardElementId, CardElementPropertyConfig>>;
  elementRegistry?: Partial<Record<UniversalCardElementId, CardElementPropertyConfig>>;

  // Shape & Structure
  cardShape?: 'standard' | 'rounded' | 'square' | 'pill' | 'asymmetric' | 'chamfer' | 'arch' | (string & {});
  thumbnailShape?: 'full_bleed' | 'inset' | 'circular' | 'arch' | 'squircle' | 'diamond' | 'polaroid' | (string & {});
  thumbnailScale?: 'cover' | 'contain' | 'zoom' | 'fit' | (string & {});
  thumbnailPosition?: 'top' | 'center' | 'bottom' | (string & {});
  informationLayout?: 'overlay' | 'split' | 'floating' | 'bottom_sheet' | 'side_by_side' | (string & {});

  // Asset Handling & Custom Imagery
  assets?: CardThemeAssets;
  aspectRatio?: 'auto' | '3:4' | '1:1' | '16:9' | '2:3' | '4:5' | '9:16' | (string & {});
  frameMaskUrl?: string;
  maskShape?: 'none' | 'shield' | 'arch' | 'circle' | 'squircle' | 'diamond' | 'custom' | (string & {});

  // Advanced Layout Offsets (Coordinate Grid)
  layoutOffsets?: CardThemeLayoutOffsets;

  // Custom Typography & Text Styling
  typography?: CardThemeTypography;

  // Position Matrix
  ratingPosition?: 'top_right' | 'top_left' | 'top_center' | 'bottom_right' | 'bottom_left' | 'bottom_center' | 'center' | 'header' | 'with_score' | 'hidden' | (string & {});
  namePosition?: 'bottom_center' | 'bottom_left' | 'bottom_right' | 'top_left' | 'top_center' | 'top_right' | 'middle' | 'footer' | (string & {});
  bodyTypePosition?: 'top_right' | 'top_left' | 'top_center' | 'bottom_right' | 'bottom_left' | 'bottom_center' | 'with_name' | 'with_specs' | 'badge_pill' | 'header' | 'hidden' | (string & {});
  countryPosition?: 'top_left' | 'top_right' | 'top_center' | 'bottom_left' | 'bottom_right' | 'with_name' | 'with_rating' | 'header' | 'hidden' | (string & {});
  measurementPosition?: 'bottom_center' | 'bottom_left' | 'bottom_right' | 'side_rail' | 'with_name' | 'footer' | 'top_left' | 'hidden' | (string & {});
  ornamentPosition?: 'corners' | 'top' | 'border' | 'background' | 'center' | 'none' | (string & {});
  sectionDivider?: 'none' | 'subtle_line' | 'glowing' | 'dashed' | 'pill_border' | (string & {});

  // Section Macros & Display Modes
  headerPosition?: 'top_left' | 'top_right' | 'top_center' | 'split_top' | 'floating_pills' | 'minimal_top' | 'none' | (string & {});
  footerPosition?: 'bottom_center' | 'bottom_full' | 'bottom_left' | 'pill_center' | 'bottom_simple' | 'bottom_right' | 'none' | (string & {});
  scoreDisplay?: 'compact' | 'prominent' | 'hud_rail' | 'pill' | 'crest' | 'badge' | 'minimal' | 'hidden' | (string & {});
  nameAlignment?: 'center' | 'left' | 'right' | (string & {});
  nameStyle?: 'stacked' | 'inline' | 'hero' | 'modern_compact' | 'badge' | (string & {});

  // Visibility Toggles
  showBwh?: boolean;
  showAge?: boolean;
  showMaturity?: boolean;
  showRankBadge?: boolean;
  showAppImpScore?: boolean;
  showHeight?: boolean;
  showCupSize?: boolean;

  // Visual Effects & Framing
  ornamentStyle?: 'none' | 'geometric_corners' | 'crest_shield' | 'laser_hud' | 'ambient_glow' | 'cyberpunk_bracket' | 'double_ring' | (string & {});
  borderWidth?: number;
  borderRadius?: number | string;
  cornerRadii?: {
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
    linked?: boolean;
  };
  cardBgOpacity?: number; // 0 - 100 percentage
  cardBackdropBlur?: number; // 0 - 32 px
  glassmorphism?: boolean;
  themeColorMode?: 'type_based' | 'custom' | (string & {});
  customBorderColor?: string;
  gradientOverlay?: 'dark_top_bottom' | 'bottom_only' | 'radial_subtle' | 'none' | 'vignette' | 'top_only' | (string & {});

  // Allow extensible properties from future JSON definitions
  [key: string]: any;
}

export interface CardThemeDefinition {
  type: 'talent_rating_card_theme';
  version: string;
  id: CardTheme;
  name: string;
  badge?: string;
  description: string;
  category?: string;
  accentColor?: string;
  icon?: string;
  aspectRatio?: string;
  assets?: CardThemeAssets;
  layoutOffsets?: CardThemeLayoutOffsets;
  typography?: CardThemeTypography;
  layoutConfig?: CardThemeLayoutConfig;
  layout?: CardThemeLayoutConfig;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CardThemeMetadata = CardThemeDefinition;

export const CARD_THEMES: CardThemeDefinition[] = [
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'default',
    name: 'Classic Modern',
    badge: 'DEFAULT',
    description: 'Tata letak poster modern seimbang dengan rating terpusat di sudut atas dan plat nama proporsional di bawah.',
    category: 'Standard Balance',
    accentColor: '#FE9900',
    icon: 'LayoutGrid',
    aspectRatio: '3:4',
    layoutConfig: {
      cardShape: 'standard',
      thumbnailShape: 'full_bleed',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'overlay',
      aspectRatio: '3:4',
      ratingPosition: 'top_right',
      namePosition: 'bottom_center',
      bodyTypePosition: 'top_right',
      countryPosition: 'top_right',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'none',
      sectionDivider: 'none',
      headerPosition: 'top_right',
      footerPosition: 'bottom_center',
      scoreDisplay: 'prominent',
      nameAlignment: 'center',
      nameStyle: 'stacked',
      showBwh: false,
      showAge: false,
      showMaturity: false,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'ambient_glow',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'type_based',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'dragon_sovereign',
    name: 'Mythic Dragon Gold',
    badge: 'MYTHIC',
    description:
      'Tema legendaris bertabur ornamen emas 24K dengan tekstur sisik naga halus, lencana simbol naga kekaisaran, dan bingkai klasik.',
    category: 'Mythic Royalty',
    accentColor: '#F59E0B',
    icon: 'Crown',
    aspectRatio: '3:4',
    assets: {
      textureUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cGF0aCBkPSJNMCAxMEwxMCAwTDIwIDEwTDEwIDIwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRjU5RTBCIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMTUiLz48L3N2Zz4=',
      textureConfig: {
        opacity: 0.35,
        blendMode: 'overlay',
        position: 'repeat',
      },
      symbolUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRjU5RTBCIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWRhc2hhcnJheT0iMiAyIiBzdHJva2Utb3BhY2l0eT0iMC44Ii8+PHBhdGggZD0iTTMwIDhMMzYgMjBMMzAgMjRMMjQgMjBaTTMwIDUyTDM2IDQwTDMwIDM2TDI0IDQwWiIgZmlsbD0iI0Y1OUUwQiIgZmlsbC1vcGFjaXR5PSIwLjg1Ii8+PHBhdGggZD0iTTggMzBMMjAgMzZMMjQgMzBMMjAgMjRaTTUyIDMwTDQwIDM2TDM2IDMwTDQwIDI0WiIgZmlsbD0iI0Y1OUUwQiIgZmlsbC1vcGFjaXR5PSIwLjg1Ii8+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNiIgZmlsbD0iI0ZCN0UwIi8+PC9zdmc+',
      symbolConfig: {
        position: 'top_left',
        scale: 0.85,
        opacity: 0.8,
        offsetX: 4,
        offsetY: 4,
      },
      borderFrameUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHBhdGggZD0iTTIgMkwxNCAyTDIgMTRaTTk4IDJMODYgMkw5OCAxNFpNMiA5OEwxNCA5OEwyIDg2Wk05OCA5OEw4NiA5OEw5OCA4NloiIGZpbGw9IiNGNTlFMEIiIGZpbGwtb3BhY2l0eT0iMC45Ii8+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9Ijk0IiBoZWlnaHQ9Ijk0IiBmaWxsPSJub25lIiBzdHJva2U9IiNGNTlFMEIiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==',
      borderFrameConfig: {
        opacity: 0.9,
        fit: 'fill',
      },
    },
    typography: {
      nameFontSize: 'lg',
      nameFontWeight: 'bold',
      primaryTextColor: '#FEF3C7',
      secondaryTextColor: '#FDE68A',
      scoreTextColor: '#F59E0B',
    },
    layoutConfig: {
      cardShape: 'chamfer',
      thumbnailShape: 'full_bleed',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'overlay',
      aspectRatio: '3:4',
      ratingPosition: 'top_right',
      namePosition: 'bottom_center',
      bodyTypePosition: 'top_left',
      countryPosition: 'top_right',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'corners',
      sectionDivider: 'glowing',
      headerPosition: 'split_top',
      footerPosition: 'bottom_center',
      scoreDisplay: 'prominent',
      nameAlignment: 'center',
      nameStyle: 'stacked',
      showBwh: true,
      showAge: true,
      showMaturity: true,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'geometric_corners',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'custom',
      customBorderColor: '#F59E0B',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'cyber_phantom',
    name: 'Cyber Matrix Phantom',
    badge: 'CYBER MATRIX',
    description:
      'Antarmuka sci-fi beraksen kisi matrix neon cyan, emblem radar holografik, dan rel telemetri status presisi.',
    category: 'Futuristic Sci-Fi',
    accentColor: '#00F0FF',
    icon: 'Terminal',
    aspectRatio: '3:4',
    assets: {
      textureUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgdmlld0JveD0iMCAwIDE1IDE1Ij48cGF0aCBkPSJNMCAxNUwxNSAwTTAgMEwxNSAxNSIgc3Ryb2tlPSIjMDBGMEZGIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiLz48L3N2Zz4=',
      textureConfig: {
        opacity: 0.3,
        blendMode: 'screen',
        position: 'repeat',
      },
      symbolUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRjBGRiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMC43Ii8+PHBhdGggZD0iTTAgMjVMMTUgMjVNMzUgMjVMNTAgMjVNMjUgMEwyNSAxNU0yNSAzNUwyNSA1MCIgc3Ryb2tlPSIjMDBGMEZGIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuOSIvPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjMiIGZpbGw9IiMwMEYwRkYiLz48L3N2Zz4=',
      symbolConfig: {
        position: 'top_left',
        scale: 0.7,
        opacity: 0.85,
        offsetX: 2,
        offsetY: 2,
      },
      borderFrameUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHBhdGggZD0iTTAgMTVMMTUgMEg4NUwxMDAgMTVWMThMMTggMThMMTggMTAwSDVMNSAxNUgwWiIgZmlsbD0iIzAwRjBGRiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PHBhdGggZD0iTTIgMTBMMTAgMk05OCAxMEw5MCAyTTIgOTBMMTAgOThNOTggOTBMOTAgOTgiIHN0cm9rZT0iIzAwRjBGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2Utb3BhY2l0eT0iMC45Ii8+PC9zdmc+',
      borderFrameConfig: {
        opacity: 0.9,
        fit: 'fill',
      },
    },
    typography: {
      nameFontSize: 'md',
      nameFontWeight: 'bold',
      primaryTextColor: '#E0F2FE',
      secondaryTextColor: '#7DD3FC',
      scoreTextColor: '#00F0FF',
    },
    layoutConfig: {
      cardShape: 'chamfer',
      thumbnailShape: 'full_bleed',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'side_by_side',
      aspectRatio: '3:4',
      ratingPosition: 'top_right',
      namePosition: 'bottom_left',
      bodyTypePosition: 'top_left',
      countryPosition: 'top_right',
      measurementPosition: 'side_rail',
      ornamentPosition: 'corners',
      sectionDivider: 'dashed',
      headerPosition: 'top_left',
      footerPosition: 'bottom_left',
      scoreDisplay: 'hud_rail',
      nameAlignment: 'left',
      nameStyle: 'stacked',
      showBwh: true,
      showAge: true,
      showMaturity: true,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'cyberpunk_bracket',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'custom',
      customBorderColor: '#00F0FF',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'valkyrie_wings',
    name: 'Valkyrie Platinum Wing',
    badge: 'PLATINUM',
    description:
      'Gaya anggun platinum bernuansa sayap malaikat perak dengan tekstur stardust kosmik dan bingkai kubah mewah.',
    category: 'Celestial Luxury',
    accentColor: '#E0E7FF',
    icon: 'Sparkles',
    aspectRatio: '2:3',
    assets: {
      textureUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDMwIDMwIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxIiBmaWxsPSIjRjFGNUZGIiBmaWxsLW9wYWNpdHk9IjAuMjUiLz48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMC41IiBmaWxsPSIjRjFGNUZGIiBmaWxsLW9wYWNpdHk9IjAuMTUiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSIwLjUiIGZpbGw9IiNGMUY1RkYiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==',
      textureConfig: {
        opacity: 0.4,
        blendMode: 'screen',
        position: 'repeat',
      },
      symbolUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDYwIDQwIj48cGF0aCBkPSJNMzAgMjBDMjAgNSAxMCAxMCAwIDIwQzEwIDMwIDIwIDM1IDMwIDIwQzQwIDM1IDUwIDMwIDYwIDIwQzUwIDEwIDQwIDUgMzAgMjBaIiBmaWxsPSJub25lIiBzdHJva2U9IiNFMUU3RkYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0iMC45Ii8+PGNpcmNsZSBjeD0iMzAiIGN5PSIyMCIgcj0iMyIgZmlsbD0iI0VFRjJGRiIvPjwvc3ZnPg==',
      symbolConfig: {
        position: 'top_center',
        scale: 0.8,
        opacity: 0.85,
        offsetY: 2,
      },
      borderFrameUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHBhdGggZD0iTTUwIDJDNjUgMiA5OCAyMCA5OCA1MFY5OEgyVjUwQzIgMjAgMzUgMiA1MCAyWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRTBFN0ZGIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==',
      borderFrameConfig: {
        opacity: 0.8,
        fit: 'fill',
      },
    },
    typography: {
      nameFontSize: 'lg',
      nameFontWeight: 'bold',
      primaryTextColor: '#FFFFFF',
      secondaryTextColor: '#C7D2FE',
      scoreTextColor: '#E0E7FF',
    },
    layoutConfig: {
      cardShape: 'arch',
      thumbnailShape: 'arch',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'overlay',
      aspectRatio: '2:3',
      ratingPosition: 'top_center',
      namePosition: 'bottom_center',
      bodyTypePosition: 'bottom_center',
      countryPosition: 'top_left',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'top',
      sectionDivider: 'glowing',
      headerPosition: 'top_center',
      footerPosition: 'bottom_full',
      scoreDisplay: 'crest',
      nameAlignment: 'center',
      nameStyle: 'hero',
      showBwh: false,
      showAge: true,
      showMaturity: true,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'crest_shield',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'custom',
      customBorderColor: '#E0E7FF',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'obsidian_gold',
    name: 'Obsidian Royal Gold',
    badge: 'ROYAL VIP',
    description:
      'Kubah lengkung emas murni 24K berlatar hitam obsidian onyx pekat dengan emblem perisai crest mewah dan tipografi eksklusif.',
    category: 'Ultra Luxury Gold',
    accentColor: '#EAB308',
    icon: 'Crown',
    aspectRatio: '2:3',
    layoutConfig: {
      cardShape: 'arch',
      thumbnailShape: 'arch',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'overlay',
      aspectRatio: '2:3',
      ratingPosition: 'top_center',
      namePosition: 'bottom_center',
      bodyTypePosition: 'bottom_center',
      countryPosition: 'top_left',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'top',
      sectionDivider: 'glowing',
      headerPosition: 'top_center',
      footerPosition: 'bottom_full',
      scoreDisplay: 'crest',
      nameAlignment: 'center',
      nameStyle: 'stacked',
      showBwh: false,
      showAge: true,
      showMaturity: true,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'crest_shield',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'custom',
      customBorderColor: '#EAB308',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'neon_synthwave',
    name: 'Neon Synthwave 80s',
    badge: 'SYNTHWAVE',
    description:
      'Estetika outrun retro 80-an dengan pendaran laser magenta-rose elektrik, indikator telemetri vertikal neon, dan sudut chamfer tajam.',
    category: 'Retro Neon Wave',
    accentColor: '#F43F5E',
    icon: 'Zap',
    aspectRatio: '3:4',
    layoutConfig: {
      cardShape: 'chamfer',
      thumbnailShape: 'full_bleed',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'side_by_side',
      aspectRatio: '3:4',
      ratingPosition: 'top_right',
      namePosition: 'bottom_left',
      bodyTypePosition: 'top_left',
      countryPosition: 'top_right',
      measurementPosition: 'side_rail',
      ornamentPosition: 'corners',
      sectionDivider: 'dashed',
      headerPosition: 'top_left',
      footerPosition: 'bottom_left',
      scoreDisplay: 'hud_rail',
      nameAlignment: 'left',
      nameStyle: 'stacked',
      showBwh: true,
      showAge: true,
      showMaturity: true,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'laser_hud',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'custom',
      customBorderColor: '#F43F5E',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'diamond_hologram_glass',
    name: 'Diamond Hologram Glass',
    badge: 'HOLO DIAMOND',
    description: 'Siluet foto belah ketupat modern berlatar kaca kristal holografik dengan pendaran ambient cyan.',
    category: 'Holographic Glass',
    accentColor: '#06B6D4',
    icon: 'Sparkles',
    aspectRatio: '2:3',
    typography: {
      nameFontSize: 'md',
      nameFontWeight: 'semibold',
      primaryTextColor: '#E0F2FE',
      secondaryTextColor: '#BAE6FD',
      scoreTextColor: '#06B6D4',
    },
    layoutConfig: {
      cardShape: 'rounded',
      thumbnailShape: 'diamond',
      thumbnailScale: 'cover',
      thumbnailPosition: 'center',
      informationLayout: 'floating',
      aspectRatio: '2:3',
      ratingPosition: 'top_right',
      namePosition: 'bottom_center',
      bodyTypePosition: 'top_left',
      countryPosition: 'top_left',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'corners',
      sectionDivider: 'pill_border',
      headerPosition: 'floating_pills',
      footerPosition: 'pill_center',
      scoreDisplay: 'pill',
      nameAlignment: 'center',
      nameStyle: 'inline',
      showBwh: false,
      showAge: false,
      showMaturity: false,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'ambient_glow',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'custom',
      customBorderColor: '#06B6D4',
      gradientOverlay: 'radial_subtle',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'split_banner',
    name: 'Split Banner Modern',
    badge: 'SPLIT',
    description: 'Struktur dual-section dengan header kapsul status kaca di atas serta panel spesifikasi lebar di bawah.',
    category: 'Dual Section',
    accentColor: '#3B82F6',
    icon: 'Layers',
    aspectRatio: '3:4',
    layoutConfig: {
      cardShape: 'standard',
      thumbnailShape: 'full_bleed',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'split',
      aspectRatio: '3:4',
      ratingPosition: 'top_right',
      namePosition: 'bottom_center',
      bodyTypePosition: 'top_left',
      countryPosition: 'top_left',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'none',
      sectionDivider: 'subtle_line',
      headerPosition: 'split_top',
      footerPosition: 'bottom_full',
      scoreDisplay: 'compact',
      nameAlignment: 'center',
      nameStyle: 'stacked',
      showBwh: true,
      showAge: false,
      showMaturity: false,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'none',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'type_based',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'editorial_inset',
    name: 'Editorial Inset Poster',
    badge: 'EDITORIAL',
    description: 'Foto potret berbingkai (inset) artistik dengan kartu elegan, tipografi editorial mewah, dan divider garis halus.',
    category: 'Luxury Editorial',
    accentColor: '#E2E8F0',
    icon: 'Feather',
    aspectRatio: '3:4',
    layoutConfig: {
      cardShape: 'standard',
      thumbnailShape: 'inset',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'overlay',
      aspectRatio: '3:4',
      ratingPosition: 'top_right',
      namePosition: 'bottom_center',
      bodyTypePosition: 'top_left',
      countryPosition: 'top_left',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'none',
      sectionDivider: 'subtle_line',
      headerPosition: 'top_right',
      footerPosition: 'bottom_center',
      scoreDisplay: 'compact',
      nameAlignment: 'center',
      nameStyle: 'stacked',
      showBwh: false,
      showAge: false,
      showMaturity: false,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'none',
      borderWidth: 1,
      glassmorphism: true,
      themeColorMode: 'type_based',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'bottom_sheet',
    name: 'Modern Bottom Sheet',
    badge: 'BOTTOM SHEET',
    description: 'Struktur laci bawah melengkung elegan di atas foto potret, menyatukan nama artis dan nilai rating secara berdampingan.',
    category: 'Drawer Style',
    accentColor: '#8B5CF6',
    icon: 'LayoutGrid',
    aspectRatio: '3:4',
    layoutConfig: {
      cardShape: 'rounded',
      thumbnailShape: 'full_bleed',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'bottom_sheet',
      aspectRatio: '3:4',
      ratingPosition: 'bottom_right',
      namePosition: 'bottom_left',
      bodyTypePosition: 'top_right',
      countryPosition: 'top_left',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'none',
      sectionDivider: 'subtle_line',
      headerPosition: 'top_left',
      footerPosition: 'bottom_full',
      scoreDisplay: 'compact',
      nameAlignment: 'left',
      nameStyle: 'stacked',
      showBwh: false,
      showAge: true,
      showMaturity: true,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'ambient_glow',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'type_based',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'circular_focus',
    name: 'Circular Portrait Focus',
    badge: 'CIRCULAR',
    description: 'Fokus potret lingkaran avatar di tengah kartu dengan ornamen cincin rating dan kapsul spesifikasi terpusat di bawah.',
    category: 'Avatar Focus',
    accentColor: '#06B6D4',
    icon: 'Crown',
    aspectRatio: '2:3',
    layoutConfig: {
      cardShape: 'rounded',
      thumbnailShape: 'circular',
      thumbnailScale: 'cover',
      thumbnailPosition: 'center',
      informationLayout: 'floating',
      aspectRatio: '2:3',
      ratingPosition: 'top_right',
      namePosition: 'bottom_center',
      bodyTypePosition: 'top_left',
      countryPosition: 'top_left',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'corners',
      sectionDivider: 'pill_border',
      headerPosition: 'floating_pills',
      footerPosition: 'pill_center',
      scoreDisplay: 'crest',
      nameAlignment: 'center',
      nameStyle: 'inline',
      showBwh: false,
      showAge: false,
      showMaturity: false,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'geometric_corners',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'type_based',
      gradientOverlay: 'radial_subtle',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'vintage_polaroid',
    name: 'Vintage Polaroid Film',
    badge: 'POLAROID',
    description:
      'Gaya cetak instan film retro dengan border bawah tebal khas polaroid, vignette hangat, dan estetika nostalgia.',
    category: 'Retro Nostalgia',
    accentColor: '#D97706',
    icon: 'Camera',
    aspectRatio: '3:4',
    layoutConfig: {
      cardShape: 'square',
      thumbnailShape: 'polaroid',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'split',
      aspectRatio: '3:4',
      ratingPosition: 'top_right',
      namePosition: 'bottom_center',
      bodyTypePosition: 'top_left',
      countryPosition: 'top_left',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'none',
      sectionDivider: 'subtle_line',
      headerPosition: 'split_top',
      footerPosition: 'bottom_center',
      scoreDisplay: 'compact',
      nameAlignment: 'center',
      nameStyle: 'stacked',
      showBwh: false,
      showAge: true,
      showMaturity: true,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'none',
      borderWidth: 2,
      glassmorphism: false,
      themeColorMode: 'custom',
      customBorderColor: '#D97706',
      gradientOverlay: 'vignette',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'emerald_minimal_square',
    name: 'Emerald Minimal Square',
    badge: '1:1 SQUARE',
    description: 'Rasio bujur sangkar 1:1 ultra-bersih dengan rel spesifikasi kompak dan border emerald tajam.',
    category: 'Minimal Square',
    accentColor: '#10B981',
    icon: 'LayoutGrid',
    aspectRatio: '1:1',
    typography: {
      nameFontSize: 'sm',
      nameFontWeight: 'bold',
      primaryTextColor: '#ECFDF5',
      secondaryTextColor: '#A7F3D0',
      scoreTextColor: '#10B981',
    },
    layoutConfig: {
      cardShape: 'square',
      thumbnailShape: 'inset',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'overlay',
      aspectRatio: '1:1',
      ratingPosition: 'top_right',
      namePosition: 'bottom_center',
      bodyTypePosition: 'top_left',
      countryPosition: 'top_left',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'none',
      sectionDivider: 'subtle_line',
      headerPosition: 'top_right',
      footerPosition: 'bottom_center',
      scoreDisplay: 'compact',
      nameAlignment: 'center',
      nameStyle: 'stacked',
      showBwh: false,
      showAge: false,
      showMaturity: false,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'none',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'custom',
      customBorderColor: '#10B981',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'neo_brutalist',
    name: 'Neo-Brutalist Hard Edge',
    badge: 'BRUTALIST',
    description: 'Gaya brutalist kontras tinggi dengan sudut 90 derajat tajam, border 3px tegas, tag rating blok di kiri atas, dan banner bawah solid.',
    category: 'Brutalist High Contrast',
    accentColor: '#FACC15',
    icon: 'Layers',
    aspectRatio: '3:4',
    layoutConfig: {
      cardShape: 'square',
      thumbnailShape: 'full_bleed',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'split',
      aspectRatio: '3:4',
      ratingPosition: 'top_left',
      namePosition: 'bottom_center',
      bodyTypePosition: 'top_right',
      countryPosition: 'top_right',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'border',
      sectionDivider: 'pill_border',
      headerPosition: 'split_top',
      footerPosition: 'bottom_full',
      scoreDisplay: 'compact',
      nameAlignment: 'center',
      nameStyle: 'hero',
      showBwh: false,
      showAge: true,
      showMaturity: true,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'none',
      borderWidth: 3,
      glassmorphism: false,
      themeColorMode: 'type_based',
      gradientOverlay: 'dark_top_bottom',
    },
  },
  {
    type: 'talent_rating_card_theme',
    version: '1.0.0',
    id: 'aurora_crystal',
    name: 'Prismatic Aurora Crystal',
    badge: 'CRYSTAL',
    description:
      'Bentuk kristal prisma berlian asimetris dengan kilau aurora cyan-ungu, ornamen sudut geometris, dan pembatas bercahaya prismatik.',
    category: 'Prismatic Luxury',
    accentColor: '#06B6D4',
    icon: 'Sparkles',
    aspectRatio: '2:3',
    layoutConfig: {
      cardShape: 'asymmetric',
      thumbnailShape: 'full_bleed',
      thumbnailScale: 'cover',
      thumbnailPosition: 'top',
      informationLayout: 'overlay',
      aspectRatio: '2:3',
      ratingPosition: 'top_center',
      namePosition: 'bottom_center',
      bodyTypePosition: 'top_left',
      countryPosition: 'top_right',
      measurementPosition: 'bottom_center',
      ornamentPosition: 'corners',
      sectionDivider: 'glowing',
      headerPosition: 'top_center',
      footerPosition: 'bottom_center',
      scoreDisplay: 'crest',
      nameAlignment: 'center',
      nameStyle: 'stacked',
      showBwh: true,
      showAge: true,
      showMaturity: true,
      showRankBadge: true,
      showAppImpScore: true,
      showHeight: true,
      showCupSize: true,
      ornamentStyle: 'geometric_corners',
      borderWidth: 2,
      glassmorphism: true,
      themeColorMode: 'custom',
      customBorderColor: '#06B6D4',
      gradientOverlay: 'radial_subtle',
    },
  },
];

export interface UIThemeTokens {
  colors?: {
    primary?: string;
    primaryHover?: string;
    accent?: string;
    background?: string;
    surface?: string;
    secondarySurface?: string;
    surfaceElevated?: string;
    primaryText?: string;
    secondaryText?: string;
    mutedText?: string;
    border?: string;
    borderActive?: string;
    divider?: string;
    glow?: string;
    [key: string]: any;
  };
  typography?: {
    fontFamily?: string;
    displayFont?: string;
    headingFont?: string;
    fontScale?: 'compact' | 'normal' | 'large' | 'dramatic' | (string & {});
    headingWeight?: 'normal' | 'semibold' | 'bold' | 'black' | (string & {});
    bodyWeight?: 'normal' | 'medium' | (string & {});
    letterSpacing?: 'tight' | 'normal' | 'wide' | 'widest' | (string & {});
    uppercaseHeadings?: boolean;
    [key: string]: any;
  };
  spacing?: {
    pagePadding?: 'compact' | 'normal' | 'spacious' | 'dramatic' | (string & {});
    sectionGap?: 'compact' | 'normal' | 'spacious' | 'relaxed' | (string & {});
    cardGap?: 'tight' | 'normal' | 'relaxed' | 'spacious' | (string & {});
    itemPadding?: 'compact' | 'normal' | 'spacious' | (string & {});
    [key: string]: any;
  };
  radius?: {
    base?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | (string & {});
    card?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | (string & {});
    button?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | (string & {});
    badge?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | (string & {});
    inner?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | (string & {});
    [key: string]: any;
  };
  borders?: {
    width?: number | string;
    style?: 'solid' | 'dashed' | 'dotted' | 'chamfer' | 'glow' | 'double_hairline' | 'hard_offset' | (string & {});
    color?: string;
    opacity?: number;
    [key: string]: any;
  };
  shadows?: {
    elevation?: 'none' | 'subtle' | 'medium' | 'high' | 'glowing' | 'hard_offset' | 'neon_laser' | (string & {});
    glowSpread?: number | string;
    glowColor?: string;
    [key: string]: any;
  };
  opacity?: {
    surface?: number;
    backdrop?: number;
    overlay?: number;
    muted?: number;
    [key: string]: any;
  };
  animation?: {
    speed?: 'fast' | 'normal' | 'slow' | 'none' | (string & {});
    hoverScale?: boolean;
    pageTransitions?: boolean;
    [key: string]: any;
  };
  icons?: {
    style?: 'thin_line' | 'solid' | 'duotone' | 'neon_glow' | 'premium_detail' | 'compact_functional' | (string & {});
    strokeWidth?: number;
    glow?: boolean;
    shape?: 'circle' | 'square' | 'chamfer' | 'rounded' | 'none' | (string & {});
    [key: string]: any;
  };
  shape?: 'rounded' | 'pill' | 'chamfer' | 'square' | 'sharp' | (string & {});
  surface?: 'solid' | 'glass' | 'translucent' | 'hud' | 'flat' | 'matrix_mesh' | 'obsidian_velvet' | (string & {});
  density?: 'compact' | 'normal' | 'comfortable' | (string & {});
  layoutGap?: 'tight' | 'normal' | 'relaxed' | 'spacious' | (string & {});
  contentWidth?: 'narrow' | 'normal' | 'wide' | 'full' | (string & {});
  panelWidth?: 'compact' | 'medium' | 'wide' | (string & {});
  thumbnailScale?: 'cover' | 'contain' | 'zoom' | 'fit' | (string & {});
  backgroundTexture?: 'none' | 'blueprint_grid' | 'dot_matrix' | 'scanlines' | 'isometric_mesh' | 'stripes_hazard' | 'stardust_dots' | (string & {});
  ambientGlowEffect?: 'none' | 'top_spotlight' | 'dual_corner_glow' | 'center_diffuse' | 'cyber_neon_glow' | (string & {});
  [key: string]: any;
}

export interface UIThemeShapeSystem {
  containerStyle?: 'rounded' | 'chamfer' | 'flat' | 'floating' | 'bordered_box' | 'editorial_split' | 'neo_brutalist' | (string & {});
  containerCutStyle?: 'rounded' | 'chamfer' | 'flat' | 'floating' | 'bordered_box' | 'editorial_split' | 'neo_brutalist' | (string & {});
  badgeStyle?: 'pill' | 'chamfer' | 'square' | 'neon_tag' | 'circle' | 'minimal_text' | 'hard_box' | (string & {});
  cardStyle?: 'elevated' | 'flat_stroke' | 'glassmorphic' | 'hud_panel' | 'editorial_line' | 'bento' | 'hard_offset' | (string & {});
  elevationStyle?: 'none' | 'subtle' | 'medium' | 'high' | 'glowing' | 'hard_offset' | 'neon_laser' | (string & {});
  [key: string]: any;
}

export interface UIThemeDecorationSystem {
  showCornerBrackets?: boolean;
  showGridBackground?: boolean;
  showGeometricLines?: boolean;
  showRadialGlows?: boolean;
  accentBarPosition?: 'none' | 'top' | 'left' | 'bottom' | 'glow_border' | (string & {});
  ornamentStyle?: 'none' | 'dots' | 'crosshairs' | 'stripes' | 'brackets' | 'magazine_stamp' | 'gold_diamonds' | 'code_slash' | (string & {});
  headingDecorator?: 'none' | 'code_slash' | 'bracketed' | 'roman_numerals' | 'gold_diamonds' | 'subtle_pill_tag' | (string & {});
  sectionDividerStyle?: 'hairline_solid' | 'gradient_fade' | 'dots_row' | 'glow_bar' | 'dashed' | 'none' | (string & {});
  [key: string]: any;
}

export interface UIThemeGlobalConfig {
  primaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  secondarySurfaceColor?: string;
  primaryTextColor?: string;
  secondaryTextColor?: string;
  dividerColor?: string;
  borderColor?: string;
  accentColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | (string & {});
  spacing?: 'compact' | 'normal' | 'spacious' | 'relaxed' | (string & {});
  uiDensity?: 'compact' | 'normal' | 'comfortable' | (string & {});
  elevation?: 'none' | 'subtle' | 'medium' | 'high' | 'glowing' | 'hard_offset' | 'neon_laser' | (string & {});
  navigationStyle?: 'floating_pill' | 'docked_bottom' | 'glass_bar' | 'compact_hud' | 'minimal_icons' | 'editorial_rail' | 'bottom_navigation' | 'top_navigation' | 'side_rail' | 'compact_tabs' | 'neo_brutalist_dock' | (string & {});
  buttonStyle?: 'filled' | 'pill' | 'chamfer' | 'ghost' | 'glow_outline' | 'neomorphic' | 'magazine_flat' | 'hard_square' | 'swiss_punch' | (string & {});
  inputStyle?: 'bordered' | 'filled_pill' | 'minimal_underline' | 'flush_hud' | 'terminal_prompt' | 'floating_glass' | 'solid_block' | (string & {});
  inputVariant?: 'terminal_prompt' | 'floating_glass' | 'classic_underline' | 'solid_block' | 'bordered' | (string & {});
  tabStyle?: 'segmented' | 'pills' | 'underline' | 'cards' | 'chamfer' | 'editorial_links' | 'solid_punch' | 'bracket_active' | (string & {});
  tabSelectorStyle?: 'segmented_slider' | 'underlined_tabs' | 'bracket_active' | 'solid_punch' | 'pills' | 'chamfer' | (string & {});
  sliderStyle?: 'pill_scroll' | 'compact_chips' | 'segmented_bar' | 'mono_ticks' | (string & {});
  toggleStyle?: 'pill_toggle' | 'switch' | 'chip_active' | 'square_checkbox' | (string & {});
  iconStyle?: 'thin_line' | 'solid' | 'duotone' | 'neon_glow' | 'premium_detail' | 'compact_functional' | (string & {});
  iconStrokeWidth?: number;
  glassmorphism?: boolean;
  [key: string]: any;
}

export interface UIThemeCollectionConfig {
  type?: 'grid' | 'list' | 'compact_list' | 'roster' | 'table' | 'masonry' | 'asymmetric_grid' | 'split' | string;
  orientation?: 'vertical' | 'horizontal' | string;
  columns?: 1 | 2 | 3 | 4 | number;
  gap?: 'tight' | 'normal' | 'relaxed' | 'spacious' | 'compact' | string;
  itemHeight?: 'auto' | 'compact' | 'fixed' | string | number;
  thumbnailPosition?: 'left' | 'right' | 'top' | 'bottom' | 'full' | string;
  thumbnailSize?: 'tiny' | 'small' | 'medium' | 'large' | string;
  contentAlignment?: 'top' | 'center' | 'bottom' | string;
  ratingPosition?: 'left' | 'inline' | 'right' | 'overlay' | string;
  divider?: boolean;
  alternatingRows?: boolean;
  [key: string]: any;
}

export interface UIThemeResponsiveCollection {
  mobile?: Partial<UIThemeCollectionConfig>;
  tablet?: Partial<UIThemeCollectionConfig>;
  desktop?: Partial<UIThemeCollectionConfig>;
  [key: string]: any;
}

export interface UIThemeHomeSectionsConfig {
  order?: ('header' | 'search' | 'search_filter' | 'type_tabs' | 'sort' | 'card_density' | 'grid' | 'artist_collection' | 'hero' | 'stats' | 'shelves' | (string & {}))[];
  spacing?: 'compact' | 'normal' | 'spacious' | 'relaxed' | (string & {});
  dividers?: boolean;
  [key: string]: any;
}

export interface UIThemeListItemConfig {
  layout?: 'horizontal' | 'vertical' | 'split' | 'compact' | 'table_row' | 'roster_slot' | string;
  thumbnail?: {
    position?: 'left' | 'right' | 'top' | 'bottom' | 'full' | string;
    size?: 'tiny' | 'small' | 'medium' | 'large' | string;
    shape?: 'rounded' | 'square' | 'circle' | 'chamfer' | 'arch' | string;
    aspectRatio?: 'square' | 'portrait' | 'wide' | 'natural' | string;
    [key: string]: any;
  };
  identity?: {
    position?: 'left' | 'center' | 'right' | string;
    alignment?: 'left' | 'center' | 'right' | string;
    [key: string]: any;
  };
  metadata?: {
    position?: 'below_identity' | 'inline' | 'side' | 'hidden' | string;
    layout?: 'inline' | 'stacked' | 'badges' | string;
    [key: string]: any;
  };
  rating?: {
    position?: 'right' | 'left' | 'inline' | 'overlay' | string;
    style?: 'large' | 'score_badge' | 'giant_number' | 'compact' | 'stars' | 'pill' | string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface UIThemeFieldPresentation {
  overall?: {
    style?: 'giant_number' | 'score_badge' | 'progress_bar' | 'compact_tag' | 'stars' | 'crest' | string;
    position?: 'right' | 'left' | 'inline' | 'header' | 'overlay' | string;
    [key: string]: any;
  };
  appearance?: {
    style?: 'score_badge' | 'compact_tag' | 'pill' | 'bar' | 'hidden' | string;
    [key: string]: any;
  };
  impression?: {
    style?: 'score_badge' | 'compact_tag' | 'pill' | 'bar' | 'hidden' | string;
    [key: string]: any;
  };
  bodyType?: {
    style?: 'compact_label' | 'pill_badge' | 'code_only' | 'full_label' | 'hidden' | string;
    [key: string]: any;
  };
  country?: {
    style?: 'flag_only' | 'flag_and_code' | 'full_name' | 'badge' | 'hidden' | string;
    [key: string]: any;
  };
  measurements?: {
    style?: 'bwh_compact' | 'cup_only' | 'detailed' | 'hidden' | string;
    [key: string]: any;
  };
  age?: {
    style?: 'number_years' | 'compact_pill' | 'hidden' | string;
    [key: string]: any;
  };
  maturity?: {
    style?: 'pill_badge' | 'text_only' | 'hidden' | string;
    [key: string]: any;
  };
  attributes?: {
    style?: 'colored_tags' | 'compact_dots' | 'glowing_pills' | 'hidden' | string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface UIThemeContainerSystem {
  direction?: 'row' | 'column' | 'stack' | (string & {});
  gap?: 'compact' | 'normal' | 'relaxed' | 'spacious' | (string & {});
  padding?: 'compact' | 'normal' | 'spacious' | (string & {});
  alignment?: 'start' | 'center' | 'end' | 'stretch' | (string & {});
  maxWidth?: 'narrow' | 'normal' | 'wide' | 'full' | (string & {});
  aspectRatio?: 'auto' | 'poster' | 'square' | 'video' | (string & {});
  overflow?: 'hidden' | 'visible' | 'auto' | (string & {});
  [key: string]: any;
}

export interface UIThemeStickyConfig {
  enabled?: boolean;
  position?: 'top' | 'bottom' | (string & {});
  offset?: number;
  elevation?: 'none' | 'subtle' | 'medium' | 'high' | 'glowing' | (string & {});
  [key: string]: any;
}

export interface UIThemeNavigationConfig {
  style?:
    | 'bottom_navigation'
    | 'top_navigation'
    | 'floating_navigation'
    | 'side_rail'
    | 'compact_tabs'
    | 'floating_pill'
    | 'docked_bottom'
    | 'glass_bar'
    | 'compact_hud'
    | 'minimal_icons'
    | 'editorial_rail'
    | 'neo_brutalist_dock'
    | (string & {});
  orientation?: 'horizontal' | 'vertical' | (string & {});
  position?: 'bottom' | 'top' | 'side_left' | 'floating_bottom' | (string & {});
  spacing?: 'compact' | 'normal' | 'relaxed' | (string & {});
  iconPosition?: 'top' | 'left' | 'icon_only' | (string & {});
  labelVisibility?: 'always' | 'active_only' | 'hidden' | (string & {});
  activeIndicator?: 'background_fill' | 'pill_glow' | 'top_line' | 'bottom_line' | 'dot' | (string & {});
  shape?: 'rounded' | 'pill' | 'chamfer' | 'flat' | (string & {});
  [key: string]: any;
}

export interface UIThemeHomeComposition {
  direction?: 'vertical' | 'horizontal' | (string & {});
  heroSection?: {
    enabled?: boolean;
    style?: 'spotlight_card' | 'wide_banner' | 'magazine_cover' | 'stat_split' | (string & {});
    showStats?: boolean;
    [key: string]: any;
  };
  sectionsOrder?: ('hero' | 'stats' | 'search_filter' | 'shelves' | 'grid' | 'header' | 'search' | 'type_tabs' | 'sort' | 'card_density' | 'artist_collection' | (string & {}))[];
  shelves?: {
    enabled?: boolean;
    categoryBased?: boolean;
    [key: string]: any;
  };
  grid?: {
    columns?: number;
    gap?: 'tight' | 'normal' | 'relaxed' | 'spacious' | (string & {});
    asymmetric?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface UIThemeHomeConfig {
  layout?:
    | 'grid'
    | 'list'
    | 'compact_list'
    | 'roster'
    | 'table'
    | 'split'
    | 'masonry'
    | 'asymmetric_grid'
    | 'featured'
    | 'dashboard'
    | 'compact_grid'
    | 'featured_hero'
    | 'split_dashboard'
    | 'horizontal_shelf'
    | 'magazine_bento'
    | 'minimalist_gallery'
    | 'feed_flow'
    | 'showcase_banner'
    | (string & {});
  composition?: UIThemeHomeComposition;
  collection?: UIThemeCollectionConfig;
  responsiveCollection?: UIThemeResponsiveCollection;
  sections?: UIThemeHomeSectionsConfig;
  item?: UIThemeListItemConfig;
  fieldPresentation?: UIThemeFieldPresentation;
  stickySearch?: UIThemeStickyConfig;
  header?: 'large' | 'compact' | 'banner' | 'minimal' | 'hidden' | (string & {});
  searchBar?: 'floating' | 'integrated' | 'minimal_inline' | 'expandable_pill' | (string & {});
  typeTabs?: 'segmented' | 'pills' | 'chips' | 'chamfer_tabs' | 'subtle_bar' | 'editorial_links' | (string & {});
  sortBar?: 'horizontal_slider' | 'compact_pills' | 'grid_select' | 'floating_chips' | (string & {});
  cardDensityControl?: 'segmented' | 'pills' | 'icons_only' | 'buttons' | 'hidden' | (string & {});
  gridGap?: 'tight' | 'normal' | 'relaxed' | 'spacious' | (string & {});
  emptyStateStyle?: 'card_box' | 'minimal_text' | 'hud_radar' | (string & {});
  sectionDivider?: 'line' | 'subtle' | 'dashed' | 'glowing' | 'none' | (string & {});
  [key: string]: any;
}

export interface UIThemeArtistDetailComposition {
  heroDirection?: 'row' | 'row_reverse' | 'column' | 'stacked_overlay' | (string & {});
  ratio?: [number, number];
  avatarPosition?: 'left' | 'right' | 'center' | 'top' | 'background_banner' | (string & {});
  telemetryRails?: boolean;
  biodataLayout?: 'grid' | 'table' | 'rows' | 'chips' | 'two_column' | 'cards' | (string & {});
  [key: string]: any;
}

export interface UIThemeArtistDetailConfig {
  layout?:
    | 'split'
    | 'split_hero'
    | 'reverse_split'
    | 'profile'
    | 'profile_hero'
    | 'banner'
    | 'banner_hero'
    | 'matrix'
    | 'hud'
    | 'hud_cockpit'
    | 'tabbed'
    | 'tabbed_panels'
    | 'centered_profile'
    | 'overlay_profile'
    | 'card_banner'
    | 'compact_bar'
    | (string & {});
  composition?: UIThemeArtistDetailComposition;
  profile?: {
    position?: 'left' | 'right' | 'center' | 'top' | (string & {});
    alignment?: 'center' | 'left' | 'right' | (string & {});
    [key: string]: any;
  };
  biodata?: {
    layout?: 'two_column' | 'grid' | 'table' | 'cards' | 'chips' | 'rows' | (string & {});
    [key: string]: any;
  };
  scoring?: {
    layout?: 'matrix' | 'progress_bars' | 'circular_gauges' | 'score_cards' | 'radar_matrix' | 'minimal_numbers' | (string & {});
    [key: string]: any;
  };
  sections?: {
    order?: ('hero' | 'biodata' | 'scoring' | 'attributes' | 'specialty' | 'links' | 'similar' | (string & {}))[];
    spacing?: 'compact' | 'normal' | 'spacious' | 'relaxed' | (string & {});
    dividers?: boolean;
    [key: string]: any;
  };
  stickyProfile?: UIThemeStickyConfig;
  avatarStyle?: 'circle' | 'rounded_square' | 'chamfer' | 'full_portrait' | 'hexagon' | (string & {});
  avatarSize?: 'medium' | 'large' | 'giant' | 'compact' | (string & {});
  overallRatingStyle?: 'giant_badge' | 'hud_ring' | 'star_banner' | 'pill_prominent' | 'compact_tag' | 'editorial_stamp' | (string & {});
  biodataStyle?: 'card_grid' | 'list_specs' | 'table_hud' | 'floating_chips' | 'minimal_rows' | (string & {});
  attributeStyle?: 'colored_tags' | 'pill_badges' | 'glowing_chips' | 'compact_dots' | (string & {});
  scoringDisplay?: 'progress_bars' | 'circular_gauges' | 'score_cards' | 'minimal_numbers' | 'radar_matrix' | (string & {});
  panelStyle?: 'cards' | 'flat_divided' | 'glass_panels' | 'chamfer_boxes' | 'editorial_lines' | (string & {});
  sectionDivider?: 'line' | 'subtle' | 'glowing' | 'dashed' | 'none' | (string & {});
  stickyProfileBar?: boolean;
  [key: string]: any;
}

export interface UIThemeRankingComposition {
  podiumType?: 'centered_olympic' | 'step_horizontal' | 'vertical_stack' | 'winner_spotlight' | 'league_top' | 'hidden' | (string & {});
  listType?: 'cards' | 'alternating_rows' | 'compact_table' | 'chamfer_slots' | 'rank_list' | 'league_table' | (string & {});
  showLiveTelemetry?: boolean;
  [key: string]: any;
}

export interface UIThemeRankingConfig {
  layout?:
    | 'podium'
    | 'podium_focus'
    | 'step_podium'
    | 'vertical_podium'
    | 'league_table'
    | 'rank_list'
    | 'winner_hero'
    | 'winner_spotlight'
    | 'leaderboard_stream'
    | 'compact_table'
    | 'grid_cards'
    | 'cards'
    | 'championship_tiers'
    | (string & {});
  composition?: UIThemeRankingComposition;
  podium?: {
    layout?: 'centered_olympic' | 'step_horizontal' | 'vertical_stack' | 'winner_spotlight' | 'league_top' | 'hidden' | 'none' | string;
    arrangement?: '1st_center' | 'order_123' | 'stacked_hero' | (string & {});
    height?: 'compact' | 'normal' | 'tall' | (string & {});
    [key: string]: any;
  };
  list?: {
    rankPosition?: 'left' | 'badge' | 'inline' | 'overlay' | (string & {});
    artistIdentity?: 'name_and_country' | 'name_only' | 'full_meta' | (string & {});
    thumbnail?: 'left' | 'circle' | 'hidden' | 'rounded' | (string & {});
    score?: 'large' | 'pill' | 'matrix' | 'simple' | (string & {});
    badge?: 'trophy_crown' | 'circle_rank' | 'square_neon' | 'pill_rank' | 'text_only' | (string & {});
    rowHeight?: 'compact' | 'normal' | 'comfortable' | (string & {});
    spacing?: 'tight' | 'normal' | 'relaxed' | (string & {});
    winnerStyling?: 'gold_glow' | 'crown_badge' | 'highlight_row' | 'subtle' | (string & {});
    alternatingRows?: boolean;
    [key: string]: any;
  };
  stickyPodium?: UIThemeStickyConfig;
  podiumStyle?: 'step_podium' | 'cards_row' | 'banner_podium' | 'floating_circles' | 'minimal_top3' | 'hidden' | (string & {});
  podiumArrangement?: '1st_center' | 'order_123' | 'stacked_hero' | (string & {});
  listItemStyle?: 'numbered_card' | 'leaderboard_row' | 'glass_strip' | 'compact_table_row' | 'chamfer_slot' | (string & {});
  positionBadgeStyle?: 'trophy_crown' | 'circle_rank' | 'square_neon' | 'pill_rank' | 'text_only' | (string & {});
  scoreDisplay?: 'full_badges' | 'simple_number' | 'progress_mini' | 'tier_label' | (string & {});
  dimensionFilterStyle?: 'pill_slider' | 'segmented_bar' | 'compact_chips' | 'dropdown' | (string & {});
  sectionDivider?: 'line' | 'subtle' | 'glowing' | 'dashed' | 'none' | (string & {});
  [key: string]: any;
}

export interface UIThemeCompareComposition {
  duelOrientation?: 'horizontal' | 'vertical' | (string & {});
  vsBadgePosition?: 'center_floating' | 'between_cards' | 'top_banner' | 'embedded_matrix' | (string & {});
  statLayout?: 'matrix_rows' | 'split_bars' | 'dual_cards' | 'radar_diff' | 'table_rows' | (string & {});
  [key: string]: any;
}

export interface UIThemeCompareConfig {
  layout?:
    | 'head_to_head'
    | 'side_by_side_cards'
    | 'center_vs'
    | 'vertical_duel'
    | 'horizontal_duel'
    | 'comparison_matrix'
    | 'matrix'
    | 'split_duel'
    | 'split'
    | 'diff_table'
    | 'table'
    | 'stat_clash'
    | 'compact_radar'
    | (string & {});
  composition?: UIThemeCompareComposition;
  fields?: {
    layout?: 'rows' | 'columns' | 'cards' | 'table' | (string & {});
    labelPosition?: 'center' | 'sides' | 'top' | (string & {});
    valuePosition?: 'sides' | 'inline' | 'matrix' | (string & {});
    [key: string]: any;
  };
  winnerIndicator?: {
    enabled?: boolean;
    position?: 'value' | 'card' | 'badge' | 'banner' | (string & {});
    style?: 'highlight' | 'glow_border' | 'badge_crown' | 'color_tint' | 'bold_text' | (string & {});
    [key: string]: any;
  };
  stickyHeaderConfig?: UIThemeStickyConfig;
  headerStyle?: 'duel_vs_banner' | 'sticky_strip' | 'minimal_header' | 'floating_cards' | 'epic_clash' | (string & {});
  pickerStyle?: 'horizontal_shelf' | 'bottom_sheet_pills' | 'grid_selector' | 'search_compact' | (string & {});
  statRowStyle?: 'split_bars' | 'diff_table' | 'radar_chips' | 'side_by_side_badges' | 'gauges' | (string & {});
  winnerHighlight?: 'glow_border' | 'badge_crown' | 'color_tint' | 'bold_text' | (string & {});
  stickyHeader?: boolean;
  sectionDivider?: 'line' | 'subtle' | 'glowing' | 'dashed' | 'none' | (string & {});
  [key: string]: any;
}

export interface UIThemeSectionCustomization {
  biodata?: {
    layout?: 'two_column' | 'grid' | 'table' | 'cards' | 'chips' | 'rows' | string;
    style?: 'card_grid' | 'list_specs' | 'table_hud' | 'floating_chips' | 'minimal_rows' | string;
    showBorn?: boolean;
    showHeight?: boolean;
    showAge?: boolean;
    showDebut?: boolean;
    showBwh?: boolean;
    showCupSize?: boolean;
    borderRadius?: string;
    padding?: string;
    backgroundStyle?: 'solid' | 'glass' | 'translucent' | 'hud' | 'none' | string;
  };
  spek?: Partial<SpekLayoutConfig>;
  score?: Partial<ScoreLayoutConfig>;
  links?: {
    style?: 'pills' | 'cards' | 'minimal_icons' | 'list' | string;
    visible?: boolean;
  };
  similar?: {
    layout?: 'grid' | 'carousel' | 'compact_list' | string;
    cardStyle?: 'portrait' | 'compact' | 'mini_chip' | string;
    columns?: number;
    visible?: boolean;
  };
}

export interface UIThemeFieldCustomization {
  labels?: {
    fontScale?: 'compact' | 'normal' | 'large' | string;
    uppercase?: boolean;
    color?: string;
  };
  values?: {
    fontFamily?: 'sans' | 'serif' | 'mono' | string;
    fontWeight?: 'normal' | 'semibold' | 'bold' | 'black' | string;
    color?: string;
  };
  badges?: {
    style?: 'pill' | 'chamfer' | 'square' | 'neon_tag' | 'minimal' | string;
    borderRadius?: string;
  };
}

export interface UIThemeDefinition {
  type: 'talent_rating_ui_theme';
  version: '3.0.0' | '2.0.0' | string;
  id: string;
  name: string;
  badge?: string;
  description: string;
  category: string;
  subCategory?: string;
  packageCategory?: string;
  accentColor: string;
  icon?: string;
  tokens?: UIThemeTokens;
  shapeSystem?: UIThemeShapeSystem;
  decorationSystem?: UIThemeDecorationSystem;
  navigation?: UIThemeNavigationConfig;
  global: UIThemeGlobalConfig;
  home: UIThemeHomeConfig;
  artistDetail: UIThemeArtistDetailConfig;
  ranking: UIThemeRankingConfig;
  compare: UIThemeCompareConfig;
  sectionsConfig?: UIThemeSectionCustomization;
  fieldsConfig?: UIThemeFieldCustomization;
  scoreSpecDefaults?: {
    spek?: Partial<SpekLayoutConfig>;
    score?: Partial<ScoreLayoutConfig>;
  };
  isCustom?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export type SpekLayoutStyle =
  | 'three_columns'
  | 'two_columns'
  | 'single_column'
  | 'bento_grid'
  | 'horizontal_cards'
  | 'tabbed_categories'
  | 'accordion_drawer'
  | 'matrix_hud'
  | 'tag_cloud'
  | (string & {});

export type SpekVisualStyle =
  | 'bordered_cards'
  | 'pill_tags'
  | 'glowing_chips'
  | 'compact_dots'
  | 'minimal_list'
  | 'matrix_boxes'
  | 'glassmorphism'
  | 'striped_accent'
  | 'gradient_outline'
  | 'terminal_cli'
  | 'colored_chips'
  | 'matrix_hud'
  | (string & {});

export interface SpekLayoutConfig {
  visualStyle: SpekVisualStyle;
  layout: SpekLayoutStyle;
  layoutStyle?: SpekLayoutStyle;
  showIcons: boolean;
  showCategoryHeaders: boolean;
  showCountBadges: boolean;
  showHelpButtons: boolean;
  itemSpacing?: 'compact' | 'normal' | 'relaxed';
  spacing: number; // 1 (tightest) to 5 (spacious)
  cardBackground: 'subtle_dark' | 'glass_transparent' | 'solid_elevated' | 'neon_bordered' | 'transparent' | 'bordered' | (string & {});
  attributesColor?: string;
  appealColor?: string;
  specialtyColor?: string;
  [key: string]: any;
}

export type ScoreLayoutStyle =
  | 'two_columns'
  | 'stacked_rows'
  | 'tabbed_panels'
  | 'compact_matrix'
  | 'split_master'
  | 'bento_scores'
  | 'timeline_steps'
  | 'hud_dashboard'
  | (string & {});

export type ScoreVisualStyle =
  | 'progress_bars'
  | 'circular_gauges'
  | 'score_cards'
  | 'radar_matrix'
  | 'minimal_numbers'
  | 'pill_badges'
  | 'arcade_neon'
  | 'equalizer_bars'
  | 'equalizer_hud'
  | 'hexagon_meters'
  | 'clean_table'
  | (string & {});

export interface ScoreLayoutConfig {
  visualStyle: ScoreVisualStyle;
  layout: ScoreLayoutStyle;
  layoutStyle?: ScoreLayoutStyle;
  colorScheme: 'neon_cyan_pink' | 'amber_gold' | 'emerald_teal' | 'violet_magenta' | 'monochrome_slate' | 'cyber_matrix' | 'custom_duo' | (string & {});
  showWeightBadges: boolean;
  showPercentFillBar: boolean;
  showHelpButtons: boolean;
  showScoreScale: boolean;
  numberPrecision: 'integer' | 'decimal_1' | (string & {});
  density?: 'compact' | 'normal' | 'spacious';
  spacing: number; // 1 (compact) to 5 (spacious)
  headerStyle: 'modern_banner' | 'simple_clean' | 'badge_prominent' | 'hud_header' | 'minimal_inline' | (string & {});
  appearanceColor?: string;
  impressionColor?: string;
  overallColor?: string;
  [key: string]: any;
}

export interface LayoutScoreConfig {
  useThemeDefaults?: boolean;
  spek: SpekLayoutConfig;
  score: ScoreLayoutConfig;
}

export const DEFAULT_LAYOUT_SCORE_CONFIG: LayoutScoreConfig = {
  useThemeDefaults: true,
  spek: {
    visualStyle: 'bordered_cards',
    layout: 'three_columns',
    showIcons: true,
    showCategoryHeaders: true,
    showCountBadges: true,
    showHelpButtons: true,
    itemSpacing: 'normal',
    spacing: 3,
    cardBackground: 'subtle_dark',
    attributesColor: '#00E5FF',
    appealColor: '#F59E0B',
    specialtyColor: '#10B981',
  },
  score: {
    visualStyle: 'progress_bars',
    layout: 'two_columns',
    colorScheme: 'neon_cyan_pink',
    showWeightBadges: true,
    showPercentFillBar: true,
    showHelpButtons: true,
    showScoreScale: true,
    numberPrecision: 'integer',
    density: 'normal',
    spacing: 3,
    headerStyle: 'modern_banner',
    appearanceColor: '#06B6D4',
    impressionColor: '#EC4899',
    overallColor: '#F59E0B',
  },
};

export interface AppSettings {
  theme: AppTheme;
  fontFamily: AppFontFamily;
  fontSize: AppFontSize;
  language: AppLanguage;
  cardTheme: CardTheme;
  customCardThemes?: CardThemeDefinition[];
  selectedUITheme: string; // 'minimal_modern' | 'cyberpunk_hud' | 'neo_brutalist' | 'classic_editorial' | 'smooth_glassmorphic'
  selectedColorTheme: string; // 'midnight_gold' | 'cyber_neon_blue' | 'dark_emerald' | 'crimson_velvet' | 'deep_amethyst' | 'obsidian_monochrome'
  uiTheme?: string;
  customUIThemes?: UIThemeDefinition[];
  primaryColor: string;
  colorPresets: string[];
  customColorPresets?: any[];
  cardDensity: 2 | 3 | 4;
  layoutScoreConfig?: LayoutScoreConfig;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'dark',
  fontFamily: 'Plus Jakarta Sans',
  fontSize: 'normal',
  language: 'default',
  cardTheme: 'default',
  customCardThemes: [],
  selectedUITheme: 'minimal_modern',
  selectedColorTheme: 'midnight_gold',
  uiTheme: 'minimal_modern',
  customUIThemes: [],
  primaryColor: '#d97706',
  colorPresets: [
    '#d97706',
    '#2563eb',
    '#059669',
    '#e11d48',
    '#7c3aed',
    '#3f3f46',
  ],
  cardDensity: 2,
  layoutScoreConfig: DEFAULT_LAYOUT_SCORE_CONFIG,
};

// ============================================================================
// DYNAMIC LOCALIZATION & UI_TEXT DATABASE SCHEMA TYPES
// ============================================================================

export type UITextType =
  | 'Title'
  | 'Description'
  | 'Placeholder'
  | 'Button'
  | 'Label'
  | 'Tooltip'
  | 'Notification'
  | 'Badge';

export type UITextLocation =
  | 'Global / Navbar'
  | 'Home / Catalog'
  | 'Detail Profil'
  | 'Ranking & Leaderboard'
  | 'Compare Artis'
  | 'Form Tambah / Edit'
  | 'Settings & Preferensi'
  | 'Pengaturan & Preferensi'
  | 'Database Editor'
  | 'Notifikasi & Dialog'
  | 'Custom Pages'
  | 'Halaman Kustom'
  | 'Modal & Dialog'
  | 'Footer & Navigasi'
  | 'Floating Action Button';

export interface UITextRecord {
  id: string;                 // unique uuid (e.g. 'uitext_app_header_title_id')
  text_key: string;           // unique dot notation key (e.g. 'app.header.title', 'home.search.placeholder')
  locale: string;             // 'id' | 'en' | 'default'
  category: UITextLocation;   // page or component location
  type: UITextType;           // Title, Description, Placeholder, Button, Label, Tooltip, Notification
  text_value: string;         // editable current value
  default_value: string;      // original default value
  description?: string;       // preview context description / where it appears
  last_updated: string;       // ISO timestamp
}

export interface UITextChangeLog {
  id: string;
  timestamp: string;
  text_key: string;
  locale: string;
  old_value: string;
  new_value: string;
  note?: string;
}

export interface DynamicLocalizationState {
  records: UITextRecord[];
  locale: string;
  last_synced: string;
}
