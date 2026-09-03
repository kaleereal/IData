import { AppLanguage, DatabaseSchema, FieldMetadata, ScoringTraitMetadata, AppealCategoryDefinition } from '../types';
import { DEFAULT_DATABASE_SCHEMA } from '../data/defaultSchema';
import { localizationCache } from './dynamicLocalization';

export interface TranslationDictionary {
  // Navigation & General
  home: string;
  rank: string;
  compare: string;
  settings: string;
  dbEditor: string;
  addArtist: string;
  search: string;
  guide: string;
  back: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  close: string;
  reset: string;
  export: string;
  import: string;
  all: string;
  special: string;
  standard: string;
  similarArtists: string;
  fullProfile: string;
  overview: string;
  metrics: string;

  // App Title & Taglines
  appTitle: string;
  appSubtitle: string;
  appBadge: string;
  searchPlaceholder: string;

  // Exit & Notifications
  pressAgainToExit: string;
  dataSaved: string;
  dataReset: string;
  copiedToClipboard: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
  deleteButton: string;

  // Section Titles
  sectionBiodata: string;
  sectionMeasurements: string;
  sectionAppeal: string;
  sectionScoring: string;
  sectionAttributes: string;
  sectionSpecialty: string;
  sectionAppearance: string;
  sectionImpression: string;
  sectionLinks: string;
  sectionNotes: string;

  // Field Labels
  fieldName: string;
  fieldRank: string;
  fieldCountry: string;
  fieldBornDate: string;
  fieldDebutDate: string;
  fieldHeight: string;
  fieldType: string;
  fieldCupSize: string;
  fieldBust: string;
  fieldWaist: string;
  fieldHip: string;
  fieldProportional: string;
  fieldAttributes: string;
  fieldSpecialty: string;
  fieldMaturity: string;
  fieldVibe: string;
  fieldStyle: string;
  fieldBodyShape: string;
  fieldAppearanceScore: string;
  fieldImpressionScore: string;
  fieldOverallRating: string;

  // Sorting & Filtering
  sortNewest: string;
  sortOverallTop: string;
  sortOverallLow: string;
  sortAppearance: string;
  sortImpression: string;
  sortProportional: string;
  sortYoungest: string;
  sortOldest: string;
  sortTallest: string;
  sortNewDebut: string;
  sortNameAsc: string;
  filterBy: string;
  clearFilter: string;
  noArtistsFound: string;
  noArtistsDesc: string;

  // Ranking Page
  rankingTitle: string;
  rankingSubtitle: string;
  rankOverall: string;
  rankAppearance: string;
  rankImpression: string;
  rankProportional: string;
  allCategories: string;
  leaderboardRank: string;
  leaderboardTalent: string;
  leaderboardOverall: string;
  leaderboardAppearance: string;
  leaderboardImpression: string;
  leaderboardProp: string;
  leaderboardType: string;
  leaderboardAge: string;
  leaderboardHeight: string;

  // Compare Page
  compareTitle: string;
  compareSubtitle: string;
  primaryTalent: string;
  opponentTalent: string;
  selectTalent: string;
  metricComparison: string;
  scoreDifference: string;
  higherScore: string;
  tieScore: string;

  // Form Page
  createTitle: string;
  createSubtitle: string;
  editTitle: string;
  editSubtitle: string;
  stepBiodata: string;
  stepMeasurements: string;
  stepAppeal: string;
  stepScoring: string;
  stepAttributes: string;
  nextStep: string;
  prevStep: string;
  saveArtist: string;
  firstNameLabel: string;
  lastNameLabel: string;
  avatarUrlLabel: string;
  linksLabel: string;
  addLink: string;
  linkNamePlaceholder: string;
  linkUrlPlaceholder: string;

  // Settings Page
  settingsTitle: string;
  settingsSubtitle: string;
  cardThemeSection: string;
  cardThemeDesc: string;
  cardThemeSlideHint: string;
  cardThemePreviewTitle: string;
  cardThemeSelect: string;
  cardThemeActive: string;
  themeSection: string;
  themeDesc: string;
  themeDark: string;
  themeLight: string;
  fontSection: string;
  fontDesc: string;
  fontFamilyLabel: string;
  fontSizeLabel: string;
  fontSizeXSmall: string;
  fontSizeSmall: string;
  fontSizeNormal: string;
  fontSizeMedium: string;
  fontSizeLarge: string;
  fontSizeXLarge: string;
  languageSection: string;
  languageDesc: string;
  langDefault: string;
  langId: string;
  langEn: string;
  previewSection: string;
  dbEditorSection: string;
  dbEditorDesc: string;
  openDbEditor: string;
  backupSection: string;
  backupDesc: string;
  exportJson: string;
  exportHtml: string;
  exportMarkdown: string;
  importTitle: string;
  importSubtitle: string;
  dropzoneText: string;
  importModeOverwrite: string;
  importModeMerge: string;
  importSuccess: string;
  importInvalid: string;

  // Scoring Guide Modal
  guideTitle: string;
  guideSubtitle: string;
  appearanceBreakdown: string;
  impressionBreakdown: string;
  rubricGuide: string;
  weightLabel: string;
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  default: {
    // Navigation & General
    home: 'Home',
    rank: 'Rank',
    compare: 'Compare',
    settings: 'Pengaturan',
    dbEditor: 'DB Editor',
    addArtist: 'Tambah Artis',
    search: 'Cari',
    guide: 'Panduan',
    back: 'Kembali',
    save: 'Simpan',
    cancel: 'Batal',
    edit: 'Edit',
    delete: 'Hapus',
    close: 'Tutup',
    reset: 'Reset',
    export: 'Ekspor',
    import: 'Impor',
    all: 'Semua',
    special: 'Special',
    standard: 'Standard',
    similarArtists: 'Artis Serupa',
    fullProfile: 'Profil Lengkap',
    overview: 'Ringkasan',
    metrics: 'Metrik',

    // App Title & Taglines
    appTitle: 'TALENT RATING',
    appSubtitle: 'Database & Sistem Penilaian Artis Terstruktur',
    appBadge: 'PRO',
    searchPlaceholder: 'Cari nama artis, negara, tipe, atau tag...',

    // Exit & Notifications
    pressAgainToExit: 'Tekan tombol Back sekali lagi untuk keluar dari aplikasi',
    dataSaved: 'Data berhasil disimpan!',
    dataReset: 'Pengaturan dikembalikan ke bawaan!',
    copiedToClipboard: 'Disalin ke papan klip!',
    deleteConfirmTitle: 'Hapus Entri Artis?',
    deleteConfirmDesc: 'Apakah Anda yakin ingin menghapus data profil artis ini? Tindakan ini tidak dapat dibatalkan.',
    deleteButton: 'Ya, Hapus Artis',

    // Section Titles
    sectionBiodata: 'BIODATA',
    sectionMeasurements: 'MEASUREMENTS',
    sectionAppeal: 'APPEAL',
    sectionScoring: 'SCORE',
    sectionAttributes: 'ATTRIBUTES',
    sectionSpecialty: 'SPECIALTY',
    sectionAppearance: 'APPEARANCE',
    sectionImpression: 'IMPRESSION',
    sectionLinks: 'TAUTAN RESMI',
    sectionNotes: 'CATATAN KHUSUS',

    // Field Labels
    fieldName: 'FULL NAME',
    fieldRank: 'RANK',
    fieldCountry: 'COUNTRY',
    fieldBornDate: 'BORN',
    fieldDebutDate: 'DEBUT',
    fieldHeight: 'HEIGHT',
    fieldType: 'BODY TYPE',
    fieldCupSize: 'CUP SIZE',
    fieldBust: 'BUST SIZE',
    fieldWaist: 'WAIST SIZE',
    fieldHip: 'HIP SIZE',
    fieldProportional: 'PROPORTIONAL RATING',
    fieldAttributes: 'ATTRIBUTES',
    fieldSpecialty: 'SPECIALTY',
    fieldMaturity: 'MATURITY',
    fieldVibe: 'VIBE',
    fieldStyle: 'STYLE',
    fieldBodyShape: 'BODY SHAPE',
    fieldAppearanceScore: 'APPEARANCE SCORE',
    fieldImpressionScore: 'IMPRESSION SCORE',
    fieldOverallRating: 'OVERALL RATING',

    // Sorting & Filtering
    sortNewest: '✨ Entri Terbaru',
    sortOverallTop: '🏆 Overall (Top)',
    sortOverallLow: 'Overall (Low)',
    sortAppearance: '✨ Appearance',
    sortImpression: '💖 Impression',
    sortProportional: '📐 Proportional',
    sortYoungest: '🌱 Termuda',
    sortOldest: '👑 Tertua',
    sortTallest: '📏 Tertinggi',
    sortNewDebut: '🎬 Debut Baru',
    sortNameAsc: '🔤 Nama (A-Z)',
    filterBy: 'Filter:',
    clearFilter: 'Hapus Filter',
    noArtistsFound: 'Tidak ada artis yang cocok',
    noArtistsDesc: 'Coba ubah kata kunci pencarian atau bersihkan filter aktif.',

    // Ranking Page
    rankingTitle: 'LEADERBOARD ARTIS',
    rankingSubtitle: 'Peringkat komprehensif berdasarkan Overall Rating, Appearance, Impression, dan Proporsi Fisik',
    rankOverall: 'Overall Top',
    rankAppearance: 'Appearance Top',
    rankImpression: 'Impression Top',
    rankProportional: 'Proportional Top',
    allCategories: '🌟 Semua Kategori',
    leaderboardRank: 'RANK',
    leaderboardTalent: 'ARTIS / TALENT',
    leaderboardOverall: 'OVERALL',
    leaderboardAppearance: 'APPEARANCE',
    leaderboardImpression: 'IMPRESSION',
    leaderboardProp: 'PROP.',
    leaderboardType: 'TIPE',
    leaderboardAge: 'USIA',
    leaderboardHeight: 'TINGGI',

    // Compare Page
    compareTitle: 'KOMPARASI ARTIS',
    compareSubtitle: 'Bandingkan metrik dua artis secara langsung: Overall, Atribut Fisik, Impresi, dan Siluet',
    primaryTalent: 'Artis Utama',
    opponentTalent: 'Artis Pembanding',
    selectTalent: 'Pilih Artis...',
    metricComparison: 'Perbandingan Metrik',
    scoreDifference: 'Selisih Skor',
    higherScore: 'Unggul',
    tieScore: 'Imbang',

    // Form Page
    createTitle: 'TAMBAH ENTRI ARTIS BARU',
    createSubtitle: 'Lengkapi biodata, ukuran tubuh, kategori daya tarik, dan skor penilaian terstruktur',
    editTitle: 'EDIT PROFIL ARTIS',
    editSubtitle: 'Perbarui parameter biodata, ukuran fisik, rubrik skor, dan tautan profil',
    stepBiodata: '1. Biodata',
    stepMeasurements: '2. Fisik & Ukuran',
    stepAppeal: '3. Daya Tarik',
    stepScoring: '4. Penilaian Skor',
    stepAttributes: '5. Atribut & Link',
    nextStep: 'Lanjut',
    prevStep: 'Kembali',
    saveArtist: 'Simpan Data Artis',
    firstNameLabel: 'Nama Depan (First Name)',
    lastNameLabel: 'Nama Belakang (Last Name - Opsional)',
    avatarUrlLabel: 'URL Foto Profil (Avatar)',
    linksLabel: 'Tautan Profil Eksternal',
    addLink: '+ Tambah Tautan Baru',
    linkNamePlaceholder: 'Misal: Instagram, Fansly, Website',
    linkUrlPlaceholder: 'https://...',

    // Settings Page
    settingsTitle: 'PENGATURAN APLIKASI',
    settingsSubtitle: 'Kelola preferensi visual antarmuka, tipografi, bahasa, dan manajemen data lokal',
    cardThemeSection: 'Tema Visual Card Artis',
    cardThemeDesc: 'Pilih tema artistik kartu untuk seluruh entri artis di katalog, ranking, dan pratinjau',
    cardThemeSlideHint: 'Geser pilihan tema di bawah untuk melihat variasi visual',
    cardThemePreviewTitle: 'Pratinjau Langsung Card Terpilih',
    cardThemeSelect: 'Gunakan Tema Ini',
    cardThemeActive: 'Tema Aktif',
    themeSection: 'Tema Tampilan',
    themeDesc: 'Ubah tampilan antarmuka antara tema gelap dan terang',
    themeDark: 'Gelap (Bawaan)',
    themeLight: 'Terang',
    fontSection: 'Font & Ukuran Teks',
    fontDesc: 'Pilih jenis tipografi dan atur skala ukuran huruf untuk kenyamanan membaca',
    fontFamilyLabel: 'Jenis Font Aplikasi',
    fontSizeLabel: 'Skala Ukuran Teks',
    fontSizeXSmall: 'Sangat Kecil (80%)',
    fontSizeSmall: 'Kecil (90%)',
    fontSizeNormal: 'Normal (100%)',
    fontSizeMedium: 'Sedang (110%)',
    fontSizeLarge: 'Besar (125%)',
    fontSizeXLarge: 'Sangat Besar (140%)',
    languageSection: 'Bahasa Antarmuka',
    languageDesc: 'Pilih bahasa teks antarmuka dan terminologi aplikasi',
    langDefault: 'Bawaan (Campuran ID/EN)',
    langId: 'Bahasa Indonesia',
    langEn: 'English',
    previewSection: 'Preview Keterbacaan Section',
    dbEditorSection: 'Database Editor & Kustomisasi Skema',
    dbEditorDesc: 'Kustomisasi struktur field, taksonomi tipe tubuh, opsi appeal, rubrik skor, dan teks antarmuka secara visual',
    openDbEditor: 'Buka Database Editor',
    backupSection: 'Backup & Restore Database',
    backupDesc: 'Cadangkan semua entri artis dan skema kustom dalam format JSON, HTML, atau Markdown secara offline',
    exportJson: 'Unduh JSON',
    exportHtml: 'Unduh HTML',
    exportMarkdown: 'Unduh Markdown',
    importTitle: 'Restore & Impor Database',
    importSubtitle: 'Unggah file cadangan (.json, .html, .md) untuk memulihkan atau menambahkan entri',
    dropzoneText: 'Klik atau seret file JSON / HTML / Markdown ke sini',
    importModeOverwrite: 'Ganti Seluruh Data (Overwrite)',
    importModeMerge: 'Gabungkan dengan Data yang Ada (Merge)',
    importSuccess: 'Data berhasil dipulihkan!',
    importInvalid: 'Format file tidak valid atau rusak.',

    // Scoring Guide Modal
    guideTitle: 'PANDUAN SISTEM PENILAIAN & RUBRIK',
    guideSubtitle: 'Formula terbobot standar untuk menghitung Appearance, Impression, dan Overall Rating',
    appearanceBreakdown: 'Penilaian Appearance (Bobot 60%)',
    impressionBreakdown: 'Penilaian Impression (Bobot 40%)',
    rubricGuide: 'Panduan Rubrik Skor',
    weightLabel: 'Bobot:',
  },
  id: {
    // Navigation & General
    home: 'Beranda',
    rank: 'Peringkat',
    compare: 'Bandingkan',
    settings: 'Pengaturan',
    dbEditor: 'Editor Database',
    addArtist: 'Tambah Artis',
    search: 'Cari',
    guide: 'Panduan',
    back: 'Kembali',
    save: 'Simpan',
    cancel: 'Batal',
    edit: 'Ubah',
    delete: 'Hapus',
    close: 'Tutup',
    reset: 'Atur Ulang',
    export: 'Ekspor',
    import: 'Impor',
    all: 'Semua',
    special: 'Spesial',
    standard: 'Standar',
    similarArtists: 'Artis Serupa',
    fullProfile: 'Profil Lengkap',
    overview: 'Ringkasan',
    metrics: 'Metrik',

    // App Title & Taglines
    appTitle: 'PERINGKAT TALENT',
    appSubtitle: 'Basis Data & Sistem Penilaian Terstruktur Artis',
    appBadge: 'PRO',
    searchPlaceholder: 'Cari nama artis, negara, tipe tubuh, atau tag...',

    // Exit & Notifications
    pressAgainToExit: 'Tekan tombol Back sekali lagi untuk keluar dari aplikasi',
    dataSaved: 'Data berhasil disimpan!',
    dataReset: 'Pengaturan dikembalikan ke bawaan!',
    copiedToClipboard: 'Disalin ke papan klip!',
    deleteConfirmTitle: 'Hapus Entri Artis?',
    deleteConfirmDesc: 'Apakah Anda yakin ingin menghapus data profil artis ini? Tindakan ini tidak dapat dibatalkan.',
    deleteButton: 'Ya, Hapus Artis',

    // Section Titles
    sectionBiodata: 'BIODATA DIRI',
    sectionMeasurements: 'PENGUKURAN TUBUH',
    sectionAppeal: 'DAYA TARIK (APPEAL)',
    sectionScoring: 'PENILAIAN (SKOR)',
    sectionAttributes: 'ATRIBUT KHUSUS',
    sectionSpecialty: 'KEAHLIAN KHUSUS',
    sectionAppearance: 'PENAMPILAN (APPEARANCE)',
    sectionImpression: 'KESAN & AURA (IMPRESSION)',
    sectionLinks: 'TAUTAN RESMI',
    sectionNotes: 'CATATAN PROFIL',

    // Field Labels
    fieldName: 'NAMA LENGKAP',
    fieldRank: 'PERINGKAT',
    fieldCountry: 'NEGARA ASAL',
    fieldBornDate: 'TANGGAL LAHIR',
    fieldDebutDate: 'TANGGAL DEBUT',
    fieldHeight: 'TINGGI BADAN',
    fieldType: 'TIPE TUBUH',
    fieldCupSize: 'UKURAN CUP',
    fieldBust: 'LINGKAR DADA',
    fieldWaist: 'LINGKAR PINGGANG',
    fieldHip: 'LINGKAR PINGGUL',
    fieldProportional: 'RATING PROPORSI',
    fieldAttributes: 'ATRIBUT KHUSUS',
    fieldSpecialty: 'KEAHLIAN KHUSUS',
    fieldMaturity: 'KEMATANGAN (MATURITY)',
    fieldVibe: 'ENERGI (VIBE)',
    fieldStyle: 'GAYA (STYLE)',
    fieldBodyShape: 'BENTUK TUBUH',
    fieldAppearanceScore: 'SKOR PENAMPILAN',
    fieldImpressionScore: 'SKOR IMPRESI',
    fieldOverallRating: 'RATING KESELURUHAN',

    // Sorting & Filtering
    sortNewest: '✨ Entri Terbaru',
    sortOverallTop: '🏆 Overall Tertinggi',
    sortOverallLow: 'Overall Terendah',
    sortAppearance: '✨ Penampilan',
    sortImpression: '💖 Impresi',
    sortProportional: '📐 Proporsi',
    sortYoungest: '🌱 Termuda',
    sortOldest: '👑 Tertua',
    sortTallest: '📏 Tertinggi',
    sortNewDebut: '🎬 Debut Baru',
    sortNameAsc: '🔤 Nama (A-Z)',
    filterBy: 'Saring:',
    clearFilter: 'Hapus Saringan',
    noArtistsFound: 'Tidak ada artis yang cocok',
    noArtistsDesc: 'Coba ubah kata kunci pencarian atau bersihkan saringan aktif.',

    // Ranking Page
    rankingTitle: 'PAPAN PERINGKAT ARTIS',
    rankingSubtitle: 'Peringkat komprehensif berdasarkan Nilai Keseluruhan, Penampilan, Impresi, dan Proporsi',
    rankOverall: 'Peringkat Keseluruhan',
    rankAppearance: 'Peringkat Penampilan',
    rankImpression: 'Peringkat Impresi',
    rankProportional: 'Peringkat Proporsi',
    allCategories: '🌟 Semua Kategori',
    leaderboardRank: 'PERINGKAT',
    leaderboardTalent: 'ARTIS / TALENT',
    leaderboardOverall: 'KESELURUHAN',
    leaderboardAppearance: 'PENAMPILAN',
    leaderboardImpression: 'IMPRESI',
    leaderboardProp: 'PROPORSI',
    leaderboardType: 'TIPE',
    leaderboardAge: 'USIA',
    leaderboardHeight: 'TINGGI',

    // Compare Page
    compareTitle: 'PERBANDINGAN ARTIS',
    compareSubtitle: 'Bandingkan metrik dua artis secara berdampingan: Skor, Ukuran Fisik, Impresi, dan Siluet',
    primaryTalent: 'Artis Utama',
    opponentTalent: 'Artis Pembanding',
    selectTalent: 'Pilih Artis...',
    metricComparison: 'Perbandingan Metrik',
    scoreDifference: 'Selisih Skor',
    higherScore: 'Unggul',
    tieScore: 'Imbang',

    // Form Page
    createTitle: 'TAMBAH ENTRI ARTIS BARU',
    createSubtitle: 'Lengkapi biodata, pengukuran tubuh, kategori daya tarik, dan skor penilaian terstruktur',
    editTitle: 'UBAH PROFIL ARTIS',
    editSubtitle: 'Perbarui biodata, ukuran fisik, rubrik penilaian, dan tautan profil',
    stepBiodata: '1. Biodata',
    stepMeasurements: '2. Fisik & Ukuran',
    stepAppeal: '3. Daya Tarik',
    stepScoring: '4. Penilaian Skor',
    stepAttributes: '5. Atribut & Tautan',
    nextStep: 'Lanjut',
    prevStep: 'Kembali',
    saveArtist: 'Simpan Data Artis',
    firstNameLabel: 'Nama Depan (First Name)',
    lastNameLabel: 'Nama Belakang (Last Name - Opsional)',
    avatarUrlLabel: 'Tautan Foto Profil (Avatar)',
    linksLabel: 'Tautan Profil Eksternal',
    addLink: '+ Tambah Tautan Baru',
    linkNamePlaceholder: 'Contoh: Instagram, Fansly, Website',
    linkUrlPlaceholder: 'https://...',

    // Settings Page
    settingsTitle: 'PENGATURAN APLIKASI',
    settingsSubtitle: 'Kelola preferensi visual antarmuka, tipografi, bahasa, dan manajemen data lokal',
    cardThemeSection: 'Tema Visual Kartu Artis',
    cardThemeDesc: 'Pilih tema artistik kartu untuk seluruh entri artis di katalog, peringkat, dan pratinjau',
    cardThemeSlideHint: 'Geser pilihan tema di bawah untuk melihat variasi visual',
    cardThemePreviewTitle: 'Pratinjau Langsung Kartu Terpilih',
    cardThemeSelect: 'Gunakan Tema Ini',
    cardThemeActive: 'Tema Aktif',
    themeSection: 'Tema Tampilan',
    themeDesc: 'Ubah tampilan antarmuka antara tema gelap dan terang',
    themeDark: 'Gelap (Bawaan)',
    themeLight: 'Terang',
    fontSection: 'Font & Ukuran Teks',
    fontDesc: 'Pilih jenis tipografi dan atur skala ukuran huruf untuk kenyamanan membaca',
    fontFamilyLabel: 'Jenis Font Aplikasi',
    fontSizeLabel: 'Skala Ukuran Teks',
    fontSizeXSmall: 'Sangat Kecil (80%)',
    fontSizeSmall: 'Kecil (90%)',
    fontSizeNormal: 'Normal (100%)',
    fontSizeMedium: 'Sedang (110%)',
    fontSizeLarge: 'Besar (125%)',
    fontSizeXLarge: 'Sangat Besar (140%)',
    languageSection: 'Bahasa Antarmuka',
    languageDesc: 'Pilih bahasa teks antarmuka dan terminologi aplikasi',
    langDefault: 'Bawaan (Campuran ID/EN)',
    langId: 'Bahasa Indonesia',
    langEn: 'English',
    previewSection: 'Pratinjau Keterbacaan Bagian',
    dbEditorSection: 'Editor Database & Kustomisasi Skema',
    dbEditorDesc: 'Kustomisasi struktur bidang data, taksonomi tipe tubuh, opsi daya tarik, rubrik skor, dan teks antarmuka secara visual',
    openDbEditor: 'Buka Editor Database',
    backupSection: 'Cadangan & Pemulihan Basis Data',
    backupDesc: 'Cadangkan semua entri artis dan skema kustom dalam format JSON, HTML, atau Markdown secara offline',
    exportJson: 'Unduh JSON',
    exportHtml: 'Unduh HTML',
    exportMarkdown: 'Unduh Markdown',
    importTitle: 'Pulihkan & Impor Basis Data',
    importSubtitle: 'Unggah berkas cadangan (.json, .html, .md) untuk memulihkan atau menambahkan entri',
    dropzoneText: 'Klik atau seret berkas JSON / HTML / Markdown ke sini',
    importModeOverwrite: 'Ganti Seluruh Data (Timpa)',
    importModeMerge: 'Gabungkan dengan Data yang Ada (Gabung)',
    importSuccess: 'Data berhasil dipulihkan!',
    importInvalid: 'Format berkas tidak valid atau rusak.',

    // Scoring Guide Modal
    guideTitle: 'PANDUAN SISTEM PENILAIAN & RUBRIK',
    guideSubtitle: 'Formula terbobot standar untuk menghitung Nilai Penampilan, Impresi, dan Peringkat Keseluruhan',
    appearanceBreakdown: 'Penilaian Penampilan (Bobot 60%)',
    impressionBreakdown: 'Penilaian Impresi (Bobot 40%)',
    rubricGuide: 'Panduan Rubrik Skor',
    weightLabel: 'Bobot:',
  },
  en: {
    // Navigation & General
    home: 'Home',
    rank: 'Ranking',
    compare: 'Compare',
    settings: 'Settings',
    dbEditor: 'DB Editor',
    addArtist: 'Add Artist',
    search: 'Search',
    guide: 'Guidelines',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    reset: 'Reset',
    export: 'Export',
    import: 'Import',
    all: 'All',
    special: 'Special',
    standard: 'Standard',
    similarArtists: 'Similar Artists',
    fullProfile: 'Full Profile',
    overview: 'Overview',
    metrics: 'Metrics',

    // App Title & Taglines
    appTitle: 'TALENT RATING',
    appSubtitle: 'Structured Database & Scoring System for Talents',
    appBadge: 'PRO',
    searchPlaceholder: 'Search by talent name, country, body type, or tags...',

    // Exit & Notifications
    pressAgainToExit: 'Press back button once more to exit the application',
    dataSaved: 'Data saved successfully!',
    dataReset: 'Settings restored to defaults!',
    copiedToClipboard: 'Copied to clipboard!',
    deleteConfirmTitle: 'Delete Artist Record?',
    deleteConfirmDesc: 'Are you sure you want to delete this artist profile? This action cannot be undone.',
    deleteButton: 'Yes, Delete Artist',

    // Section Titles
    sectionBiodata: 'BIODATA',
    sectionMeasurements: 'BODY MEASUREMENTS',
    sectionAppeal: 'APPEAL CATEGORIES',
    sectionScoring: 'SCORING (SCORE)',
    sectionAttributes: 'SPECIAL ATTRIBUTES',
    sectionSpecialty: 'SPECIALTY / TALENT',
    sectionAppearance: 'APPEARANCE',
    sectionImpression: 'IMPRESSION',
    sectionLinks: 'OFFICIAL LINKS',
    sectionNotes: 'PROFILE NOTES',

    // Field Labels
    fieldName: 'FULL NAME',
    fieldRank: 'RANK',
    fieldCountry: 'COUNTRY',
    fieldBornDate: 'BORN DATE',
    fieldDebutDate: 'DEBUT DATE',
    fieldHeight: 'HEIGHT',
    fieldType: 'BODY TYPE',
    fieldCupSize: 'CUP SIZE',
    fieldBust: 'BUST SIZE',
    fieldWaist: 'WAIST SIZE',
    fieldHip: 'HIP SIZE',
    fieldProportional: 'PROPORTIONAL RATING',
    fieldAttributes: 'ATTRIBUTES',
    fieldSpecialty: 'SPECIALTY',
    fieldMaturity: 'MATURITY',
    fieldVibe: 'VIBE',
    fieldStyle: 'STYLE',
    fieldBodyShape: 'BODY SHAPE',
    fieldAppearanceScore: 'APPEARANCE SCORE',
    fieldImpressionScore: 'IMPRESSION SCORE',
    fieldOverallRating: 'OVERALL RATING',

    // Sorting & Filtering
    sortNewest: '✨ Newest Entry',
    sortOverallTop: '🏆 Overall (Top)',
    sortOverallLow: 'Overall (Low)',
    sortAppearance: '✨ Appearance',
    sortImpression: '💖 Impression',
    sortProportional: '📐 Proportional',
    sortYoungest: '🌱 Youngest',
    sortOldest: '👑 Oldest',
    sortTallest: '📏 Tallest',
    sortNewDebut: '🎬 New Debut',
    sortNameAsc: '🔤 Name (A-Z)',
    filterBy: 'Filter:',
    clearFilter: 'Clear Filter',
    noArtistsFound: 'No matching artists found',
    noArtistsDesc: 'Try changing your search query or clear the active filter.',

    // Ranking Page
    rankingTitle: 'TALENT LEADERBOARD',
    rankingSubtitle: 'Comprehensive rankings by Overall Rating, Appearance, Impression, and Body Proportions',
    rankOverall: 'Overall Top',
    rankAppearance: 'Appearance Top',
    rankImpression: 'Impression Top',
    rankProportional: 'Proportional Top',
    allCategories: '🌟 All Categories',
    leaderboardRank: 'RANK',
    leaderboardTalent: 'TALENT / ARTIST',
    leaderboardOverall: 'OVERALL',
    leaderboardAppearance: 'APPEARANCE',
    leaderboardImpression: 'IMPRESSION',
    leaderboardProp: 'PROP.',
    leaderboardType: 'TYPE',
    leaderboardAge: 'AGE',
    leaderboardHeight: 'HEIGHT',

    // Compare Page
    compareTitle: 'TALENT COMPARISON',
    compareSubtitle: 'Compare metrics of two talents side-by-side: Scores, Measurements, Impression, and Silhouette',
    primaryTalent: 'Primary Talent',
    opponentTalent: 'Comparison Talent',
    selectTalent: 'Select Talent...',
    metricComparison: 'Metric Comparison',
    scoreDifference: 'Score Difference',
    higherScore: 'Higher',
    tieScore: 'Tie',

    // Form Page
    createTitle: 'ADD NEW ARTIST ENTRY',
    createSubtitle: 'Complete biodata, measurements, appeal categories, and structured scoring attributes',
    editTitle: 'EDIT ARTIST PROFILE',
    editSubtitle: 'Update biodata parameters, body measurements, scoring rubrics, and profile links',
    stepBiodata: '1. Biodata',
    stepMeasurements: '2. Measurements',
    stepAppeal: '3. Appeal',
    stepScoring: '4. Scoring Rubric',
    stepAttributes: '5. Attributes & Links',
    nextStep: 'Next',
    prevStep: 'Back',
    saveArtist: 'Save Artist Record',
    firstNameLabel: 'First Name',
    lastNameLabel: 'Last Name (Optional)',
    avatarUrlLabel: 'Profile Photo URL (Avatar)',
    linksLabel: 'External Profile Links',
    addLink: '+ Add New Link',
    linkNamePlaceholder: 'e.g. Instagram, Fansly, Website',
    linkUrlPlaceholder: 'https://...',

    // Settings Page
    settingsTitle: 'APP SETTINGS',
    settingsSubtitle: 'Manage UI visual appearance, typography, language, and local offline data management',
    cardThemeSection: 'Artist Card Visual Theme',
    cardThemeDesc: 'Choose global artistic card styling for all artist entries across catalog, ranking, and preview',
    cardThemeSlideHint: 'Slide through the theme options below to preview visual variations',
    cardThemePreviewTitle: 'Live Preview of Selected Card',
    cardThemeSelect: 'Apply Theme',
    cardThemeActive: 'Active Theme',
    themeSection: 'Visual Theme',
    themeDesc: 'Switch interface appearance between dark and light themes',
    themeDark: 'Dark (Default)',
    themeLight: 'Light',
    fontSection: 'Font & Text Size',
    fontDesc: 'Choose typography family and adjust text scale for optimal readability',
    fontFamilyLabel: 'App Font Family',
    fontSizeLabel: 'Text Size Scale',
    fontSizeXSmall: 'Extra Small (80%)',
    fontSizeSmall: 'Small (90%)',
    fontSizeNormal: 'Normal (100%)',
    fontSizeMedium: 'Medium (110%)',
    fontSizeLarge: 'Large (125%)',
    fontSizeXLarge: 'Extra Large (140%)',
    languageSection: 'Interface Language',
    languageDesc: 'Choose interface language and system terminology',
    langDefault: 'Default (Mixed ID/EN)',
    langId: 'Bahasa Indonesia',
    langEn: 'English',
    previewSection: 'Section Readability Preview',
    dbEditorSection: 'Database Editor & Schema Customization',
    dbEditorDesc: 'Visually customize field structures, body type taxonomy, appeal options, scoring rubrics, and UI text',
    openDbEditor: 'Open Database Editor',
    backupSection: 'Database Backup & Restore',
    backupDesc: 'Backup all artist entries and custom schemas in JSON, HTML, or Markdown offline',
    exportJson: 'Download JSON',
    exportHtml: 'Download HTML',
    exportMarkdown: 'Download Markdown',
    importTitle: 'Restore & Import Database',
    importSubtitle: 'Upload a backup file (.json, .html, .md) to restore or add artist records',
    dropzoneText: 'Click or drag a JSON / HTML / Markdown file here',
    importModeOverwrite: 'Overwrite All Existing Data',
    importModeMerge: 'Merge with Existing Records',
    importSuccess: 'Data restored successfully!',
    importInvalid: 'File format is invalid or corrupted.',

    // Scoring Guide Modal
    guideTitle: 'SCORING SYSTEM & RUBRIC GUIDELINES',
    guideSubtitle: 'Standardized weighted formulas to compute Appearance, Impression, and Overall Rating',
    appearanceBreakdown: 'Appearance Scoring (60% Weight)',
    impressionBreakdown: 'Impression Scoring (40% Weight)',
    rubricGuide: 'Scoring Rubric Table',
    weightLabel: 'Weight:',
  },
};

const PROP_TO_UI_KEY_MAP: Record<string, string> = {
  appTitle: 'app.header.title',
  appSubtitle: 'app.header.subtitle',
  appBadge: 'app.header.badge',
  searchPlaceholder: 'app.header.search.placeholder',
  home: 'app.nav.home',
  rank: 'app.nav.rank',
  compare: 'app.nav.compare',
  settings: 'app.nav.settings',
  dbEditor: 'app.nav.db_editor',
  addArtist: 'app.nav.add_artist',
  sectionBiodata: 'detail.section.biodata',
  sectionMeasurements: 'detail.section.measurements',
  sectionAppeal: 'detail.section.appeal',
  sectionScoring: 'detail.section.scoring',
  sectionAttributes: 'detail.section.attributes',
  sectionSpecialty: 'detail.section.specialty',
  sectionAppearance: 'detail.section.appearance',
  sectionImpression: 'detail.section.impression',
  sectionLinks: 'detail.section.links',
  sectionNotes: 'detail.section.notes',
  fieldName: 'field.name.label',
  fieldRank: 'field.rank.label',
  fieldCountry: 'field.country.label',
  fieldBornDate: 'field.born.label',
  fieldDebutDate: 'field.debut.label',
  fieldHeight: 'field.height.label',
  fieldType: 'field.type.label',
  fieldCupSize: 'field.cup.label',
  fieldBust: 'field.bust.label',
  fieldWaist: 'field.waist.label',
  fieldHip: 'field.hip.label',
  fieldProportional: 'field.prop.label',
  fieldAppearanceScore: 'field.appearance.label',
  fieldImpressionScore: 'field.impression.label',
  fieldOverallRating: 'field.overall.label',
  rankingTitle: 'rank.title',
  rankingSubtitle: 'rank.subtitle',
  rankOverall: 'rank.tab.overall',
  rankAppearance: 'rank.tab.appearance',
  rankImpression: 'rank.tab.impression',
  rankProportional: 'rank.tab.proportional',
  compareTitle: 'compare.title',
  compareSubtitle: 'compare.subtitle',
  dataSaved: 'notify.saved',
  dataReset: 'notify.reset',
  copiedToClipboard: 'notify.copied',
  deleteConfirmTitle: 'notify.delete.title',
  deleteConfirmDesc: 'notify.delete.desc',
  deleteButton: 'notify.delete.btn',
  pressAgainToExit: 'notify.exit.press_again',
  all: 'home.filter.all',
  special: 'home.filter.special',
  standard: 'home.filter.standard',
  sortNewest: 'home.sort.newest',
  sortOverallTop: 'home.sort.overall_top',
  sortOverallLow: 'home.sort.overall_low',
  sortAppearance: 'home.sort.appearance',
  sortImpression: 'home.sort.impression',
  sortProportional: 'home.sort.proportional',
  noArtistsFound: 'home.empty.title',
  noArtistsDesc: 'home.empty.desc',
};

export function getTranslation(lang: AppLanguage = 'default'): TranslationDictionary {
  const base = TRANSLATIONS[lang] || TRANSLATIONS.default;

  // Use Proxy to dynamically prioritize live edited UI_TEXT from cache
  return new Proxy(base, {
    get(target, prop: string) {
      if (typeof prop === 'string' && PROP_TO_UI_KEY_MAP[prop]) {
        const dynamicVal = localizationCache.get(PROP_TO_UI_KEY_MAP[prop]);
        if (dynamicVal && dynamicVal.trim().length > 0) {
          return dynamicVal;
        }
      }
      return (target as any)[prop];
    },
  });
}

/**
 * Resolves a DatabaseSchema with language translations while strictly preserving
 * any field, section title, or page text that has been custom-edited in DB Editor
 * (i.e. different from DEFAULT_DATABASE_SCHEMA).
 */
export function resolveLocalizedSchema(
  schema: DatabaseSchema,
  language: AppLanguage = 'default'
): DatabaseSchema {
  if (language === 'default') {
    return schema;
  }

  const t = getTranslation(language);
  const defaultSchema = DEFAULT_DATABASE_SCHEMA;

  // 1. Resolve Section Titles (Preserve user dynamic schema sectionTitles customizations)
  const resolvedSectionTitles = {
    biodata: schema.sectionTitles?.biodata ?? t.sectionBiodata ?? 'BIODATA',
    measurements: schema.sectionTitles?.measurements ?? t.sectionMeasurements ?? 'MEASUREMENTS',
    appeal: schema.sectionTitles?.appeal ?? t.sectionAppeal ?? 'APPEAL',
    scoring: schema.sectionTitles?.scoring ?? t.sectionScoring ?? 'SCORE',
    attributes: schema.sectionTitles?.attributes ?? t.sectionAttributes ?? 'ATTRIBUTES',
    specialty: schema.sectionTitles?.specialty ?? t.sectionSpecialty ?? 'SPECIALTY',
    appearance: schema.sectionTitles?.appearance ?? t.sectionAppearance ?? 'APPEARANCE',
    impression: schema.sectionTitles?.impression ?? t.sectionImpression ?? 'IMPRESSION',
  };

  // 2. Resolve Field Labels (Preserve user DB edits)
  const resolvedFields: Record<string, FieldMetadata> = {};
  const fieldKeyToTransKey: Record<string, keyof TranslationDictionary> = {
    name: 'fieldName',
    rank: 'fieldRank',
    country: 'fieldCountry',
    bornDate: 'fieldBornDate',
    debutDate: 'fieldDebutDate',
    heightCm: 'fieldHeight',
    typeCode: 'fieldType',
    cupSize: 'fieldCupSize',
    bustCm: 'fieldBust',
    waistCm: 'fieldWaist',
    hipCm: 'fieldHip',
    proportionalRating: 'fieldProportional',
    attributes: 'fieldAttributes',
    specialty: 'fieldSpecialty',
    maturity: 'fieldMaturity',
    vibe: 'fieldVibe',
    style: 'fieldStyle',
    bodyShape: 'fieldBodyShape',
    appearanceScore: 'fieldAppearanceScore',
    impressionScore: 'fieldImpressionScore',
    overallRating: 'fieldOverallRating',
  };

  Object.entries(schema.fields || {}).forEach(([key, field]) => {
    const defaultField = defaultSchema.fields?.[key];
    const transKey = fieldKeyToTransKey[key];

    // Check if label was customized by user
    const isLabelCustom = defaultField && field.label !== defaultField.label;
    const resolvedLabel = isLabelCustom
      ? field.label
      : (transKey && t[transKey] ? (t[transKey] as string) : field.label);

    resolvedFields[key] = {
      ...field,
      label: resolvedLabel,
    };
  });

  // 3. Resolve Page Texts
  const resolvedPageTexts = {
    ...schema.pageTexts,
    home: {
      ...schema.pageTexts?.home,
      labels: {
        ...schema.pageTexts?.home?.labels,
        appTitle:
          schema.pageTexts?.home?.labels?.appTitle &&
          schema.pageTexts.home.labels.appTitle !== defaultSchema.pageTexts?.home?.labels?.appTitle
            ? schema.pageTexts.home.labels.appTitle
            : t.appTitle,
      },
      subtitle:
        schema.pageTexts?.home?.subtitle &&
        schema.pageTexts.home.subtitle !== defaultSchema.pageTexts?.home?.subtitle
          ? schema.pageTexts.home.subtitle
          : t.appSubtitle,
      buttons: {
        ...schema.pageTexts?.home?.buttons,
        searchPlaceholder:
          schema.pageTexts?.home?.buttons?.searchPlaceholder &&
          schema.pageTexts.home.buttons.searchPlaceholder !==
            defaultSchema.pageTexts?.home?.buttons?.searchPlaceholder
            ? schema.pageTexts.home.buttons.searchPlaceholder
            : t.searchPlaceholder,
      },
    },
  };

  return {
    ...schema,
    sectionTitles: resolvedSectionTitles,
    fields: resolvedFields,
    pageTexts: resolvedPageTexts,
  };
}
