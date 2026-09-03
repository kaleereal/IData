import { UITextRecord, UITextChangeLog, UITextType, UITextLocation } from '../types';

export const UI_TEXT_STORAGE_KEY = 'talent_rating_ui_text_records_v1';
export const UI_TEXT_HISTORY_KEY = 'talent_rating_ui_text_history_v1';

// ============================================================================
// INITIAL SEED DATA FOR UI_TEXT TABLE
// ============================================================================

interface RawSeedEntry {
  key: string;
  type: UITextType;
  category: UITextLocation;
  desc: string;
  id_val: string;
  en_val: string;
  def_val: string;
}

const RAW_SEEDS: RawSeedEntry[] = [
  // 1. GLOBAL / NAVBAR
  {
    key: 'app.header.title',
    type: 'Title',
    category: 'Global / Navbar',
    desc: 'Judul utama merek aplikasi di bagian atas navbar',
    id_val: 'PERINGKAT TALENT',
    en_val: 'TALENT RATING',
    def_val: 'TALENT RATING',
  },
  {
    key: 'app.header.subtitle',
    type: 'Description',
    category: 'Global / Navbar',
    desc: 'Subtitle atau slogan penjelasan di bawah judul header',
    id_val: 'Basis Data & Sistem Penilaian Terstruktur Artis',
    en_val: 'Structured Database & Scoring System for Talents',
    def_val: 'Database & Sistem Penilaian Artis Terstruktur',
  },
  {
    key: 'app.header.badge',
    type: 'Label',
    category: 'Global / Navbar',
    desc: 'Label badge versi di samping logo aplikasi',
    id_val: 'PRO',
    en_val: 'PRO',
    def_val: 'PRO',
  },
  {
    key: 'app.header.search.placeholder',
    type: 'Placeholder',
    category: 'Global / Navbar',
    desc: 'Placeholder kolom pencarian cepat di bilah navigasi atas',
    id_val: 'Cari nama artis, negara, tipe tubuh, atau tag...',
    en_val: 'Search by talent name, country, body type, or tags...',
    def_val: 'Cari nama artis, negara, tipe, atau tag...',
  },
  {
    key: 'app.nav.home',
    type: 'Button',
    category: 'Global / Navbar',
    desc: 'Teks tombol navigasi ke halaman Beranda / Katalog',
    id_val: 'Beranda',
    en_val: 'Home',
    def_val: 'Home',
  },
  {
    key: 'app.nav.rank',
    type: 'Button',
    category: 'Global / Navbar',
    desc: 'Teks tombol navigasi ke Leaderboard / Peringkat',
    id_val: 'Peringkat',
    en_val: 'Ranking',
    def_val: 'Rank',
  },
  {
    key: 'app.nav.compare',
    type: 'Button',
    category: 'Global / Navbar',
    desc: 'Teks tombol navigasi ke Komparasi Artis',
    id_val: 'Bandingkan',
    en_val: 'Compare',
    def_val: 'Compare',
  },
  {
    key: 'app.nav.add_artist',
    type: 'Button',
    category: 'Global / Navbar',
    desc: 'Teks tombol navigasi untuk menambah entri artis baru',
    id_val: 'Tambah Artis',
    en_val: 'Add Artist',
    def_val: 'Tambah Artis',
  },
  {
    key: 'app.nav.settings',
    type: 'Button',
    category: 'Global / Navbar',
    desc: 'Teks tombol navigasi ke Pengaturan Sistem',
    id_val: 'Pengaturan',
    en_val: 'Settings',
    def_val: 'Pengaturan',
  },
  {
    key: 'app.nav.db_editor',
    type: 'Button',
    category: 'Global / Navbar',
    desc: 'Teks tombol navigasi ke Editor Database Teks & Skema',
    id_val: 'Editor Database',
    en_val: 'Database Editor',
    def_val: 'DB Editor',
  },

  // 2. HOME / CATALOG
  {
    key: 'home.catalog.title',
    type: 'Title',
    category: 'Home / Catalog',
    desc: 'Judul utama bagian katalog artis pada halaman utama',
    id_val: 'Katalog Profil Artis',
    en_val: 'Talent Profile Catalog',
    def_val: 'Katalog Profil Artis',
  },
  {
    key: 'home.catalog.subtitle',
    type: 'Description',
    category: 'Home / Catalog',
    desc: 'Deskripsi singkat di bawah judul katalog artis',
    id_val: 'Jelajahi dan filter profil artis berdasarkan atribut fisik, impresi, dan skor terbobot',
    en_val: 'Explore and filter artist profiles by measurements, impression, and weighted ratings',
    def_val: 'Jelajahi dan saring profil artis berdasarkan atribut fisik, impresi, dan skor terbobot',
  },
  {
    key: 'home.filter.all',
    type: 'Button',
    category: 'Home / Catalog',
    desc: 'Label tombol tab filter Semua Artis',
    id_val: 'Semua',
    en_val: 'All',
    def_val: 'Semua',
  },
  {
    key: 'home.filter.special',
    type: 'Button',
    category: 'Home / Catalog',
    desc: 'Label tombol tab filter Artis Spesial',
    id_val: 'Spesial',
    en_val: 'Special',
    def_val: 'Special',
  },
  {
    key: 'home.filter.standard',
    type: 'Button',
    category: 'Home / Catalog',
    desc: 'Label tombol tab filter Artis Standar',
    id_val: 'Standar',
    en_val: 'Standard',
    def_val: 'Standard',
  },
  {
    key: 'home.sort.label',
    type: 'Label',
    category: 'Home / Catalog',
    desc: 'Label dropdown pengurutan kartu artis',
    id_val: 'Urutkan:',
    en_val: 'Sort by:',
    def_val: 'Urutkan:',
  },
  {
    key: 'home.sort.newest',
    type: 'Label',
    category: 'Home / Catalog',
    desc: 'Opsi urutan entri terbaru',
    id_val: '✨ Entri Terbaru',
    en_val: '✨ Newest Entry',
    def_val: '✨ Entri Terbaru',
  },
  {
    key: 'home.sort.overall_top',
    type: 'Label',
    category: 'Home / Catalog',
    desc: 'Opsi urutan skor overall tertinggi',
    id_val: '🏆 Overall Tertinggi',
    en_val: '🏆 Overall (Top)',
    def_val: '🏆 Overall (Top)',
  },
  {
    key: 'home.sort.overall_low',
    type: 'Label',
    category: 'Home / Catalog',
    desc: 'Opsi urutan skor overall terendah',
    id_val: 'Overall Terendah',
    en_val: 'Overall (Low)',
    def_val: 'Overall (Low)',
  },
  {
    key: 'home.sort.appearance',
    type: 'Label',
    category: 'Home / Catalog',
    desc: 'Opsi urutan skor penampilan tertinggi',
    id_val: '✨ Penampilan Tertinggi',
    en_val: '✨ Appearance Top',
    def_val: '✨ Appearance',
  },
  {
    key: 'home.sort.impression',
    type: 'Label',
    category: 'Home / Catalog',
    desc: 'Opsi urutan skor impresi tertinggi',
    id_val: '💖 Impresi Tertinggi',
    en_val: '💖 Impression Top',
    def_val: '💖 Impression',
  },
  {
    key: 'home.sort.proportional',
    type: 'Label',
    category: 'Home / Catalog',
    desc: 'Opsi urutan skor proporsi fisik terbaik',
    id_val: '📐 Proporsi Tertinggi',
    en_val: '📐 Proportional Top',
    def_val: '📐 Proportional',
  },
  {
    key: 'home.empty.title',
    type: 'Title',
    category: 'Home / Catalog',
    desc: 'Judul saat hasil pencarian atau filter katalog tidak ditemukan',
    id_val: 'Tidak Ada Artis Ditemukan',
    en_val: 'No Matching Talents Found',
    def_val: 'Tidak ada artis yang cocok',
  },
  {
    key: 'home.empty.desc',
    type: 'Description',
    category: 'Home / Catalog',
    desc: 'Penjelasan saran saat daftar pencarian kosong',
    id_val: 'Coba ubah kata kunci pencarian atau bersihkan saringan yang aktif.',
    en_val: 'Try modifying your search keywords or clear active filters.',
    def_val: 'Coba ubah kata kunci pencarian atau bersihkan filter aktif.',
  },

  // 3. DETAIL PROFIL
  {
    key: 'detail.section.biodata',
    type: 'Title',
    category: 'Detail Profil',
    desc: 'Judul seksi Biodata Diri pada detail profil artis',
    id_val: 'BIODATA DIRI',
    en_val: 'BIODATA',
    def_val: 'BIODATA',
  },
  {
    key: 'detail.section.measurements',
    type: 'Title',
    category: 'Detail Profil',
    desc: 'Judul seksi Pengukuran Tubuh (B-W-H) pada detail profil',
    id_val: 'PENGUKURAN TUBUH',
    en_val: 'BODY MEASUREMENTS',
    def_val: 'MEASUREMENTS',
  },
  {
    key: 'detail.section.appeal',
    type: 'Title',
    category: 'Detail Profil',
    desc: 'Judul seksi Kategori Daya Tarik pada detail profil',
    id_val: 'DAYA TARIK (APPEAL)',
    en_val: 'APPEAL CATEGORIES',
    def_val: 'APPEAL',
  },
  {
    key: 'detail.section.scoring',
    type: 'Title',
    category: 'Detail Profil',
    desc: 'Judul seksi Penilaian Skor & Rubrik pada detail profil',
    id_val: 'PENILAIAN (SKOR)',
    en_val: 'SCORING (SCORE)',
    def_val: 'SCORE',
  },
  {
    key: 'detail.section.attributes',
    type: 'Title',
    category: 'Detail Profil',
    desc: 'Judul seksi Atribut Khusus pada detail profil',
    id_val: 'ATRIBUT KHUSUS',
    en_val: 'SPECIAL ATTRIBUTES',
    def_val: 'ATTRIBUTES',
  },
  {
    key: 'detail.section.specialty',
    type: 'Title',
    category: 'Detail Profil',
    desc: 'Judul seksi Keahlian / Specialty pada detail profil',
    id_val: 'KEAHLIAN KHUSUS',
    en_val: 'SPECIALTY / TALENT',
    def_val: 'SPECIALTY',
  },
  {
    key: 'detail.section.links',
    type: 'Title',
    category: 'Detail Profil',
    desc: 'Judul seksi Tautan Profil Resmi pada detail profil',
    id_val: 'TAUTAN RESMI',
    en_val: 'OFFICIAL LINKS',
    def_val: 'TAUTAN RESMI',
  },
  {
    key: 'detail.section.notes',
    type: 'Title',
    category: 'Detail Profil',
    desc: 'Judul seksi Catatan Profil Tambahan',
    id_val: 'CATATAN PROFIL',
    en_val: 'PROFILE NOTES',
    def_val: 'CATATAN KHUSUS',
  },
  {
    key: 'detail.similar_artists',
    type: 'Title',
    category: 'Detail Profil',
    desc: 'Judul bagian rekomendasi artis serupa di bagian bawah profil',
    id_val: 'Artis Serupa',
    en_val: 'Similar Artists',
    def_val: 'Artis Serupa',
  },
  {
    key: 'detail.score.weight.appearance',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label bobot kontribusi skor penampilan fisik terhadap rating keseluruhan',
    id_val: 'BOBOT KONTRIBUSI: 60%',
    en_val: 'CONTRIBUTION WEIGHT: 60%',
    def_val: 'BOBOT KONTRIBUSI: 60%',
  },
  {
    key: 'detail.score.weight.impression',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label bobot kontribusi skor impresi dan pesona terhadap rating keseluruhan',
    id_val: 'BOBOT KONTRIBUSI: 40%',
    en_val: 'CONTRIBUTION WEIGHT: 40%',
    def_val: 'BOBOT KONTRIBUSI: 40%',
  },
  {
    key: 'detail.score.weight.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label bobot item parameter penilaian',
    id_val: 'Bobot',
    en_val: 'Weight',
    def_val: 'Bobot',
  },
  {
    key: 'detail.score.overall.formula',
    type: 'Description',
    category: 'Detail Profil',
    desc: 'Deskripsi formula bobot total perhitungan rating keseluruhan',
    id_val: 'Perhitungan Formula Bobot (60% + 40%)',
    en_val: 'Weighted Formula Calculation (60% + 40%)',
    def_val: 'Perhitungan Formula Bobot (60% + 40%)',
  },
  {
    key: 'detail.btn.edit',
    type: 'Button',
    category: 'Detail Profil',
    desc: 'Tombol untuk membuka form edit artis',
    id_val: 'Edit Profil',
    en_val: 'Edit Profile',
    def_val: 'Edit',
  },
  {
    key: 'detail.btn.delete',
    type: 'Button',
    category: 'Detail Profil',
    desc: 'Tombol untuk menghapus profil artis',
    id_val: 'Hapus Entri',
    en_val: 'Delete Profile',
    def_val: 'Hapus',
  },

  // 4. FIELD LABELS (MASTER DATA & PROFIL)
  {
    key: 'field.name.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Nama Lengkap artis',
    id_val: 'NAMA LENGKAP',
    en_val: 'FULL NAME',
    def_val: 'FULL NAME',
  },
  {
    key: 'field.rank.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Peringkat / Rank artis',
    id_val: 'PERINGKAT',
    en_val: 'RANK',
    def_val: 'RANK',
  },
  {
    key: 'field.country.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Negara Asal artis',
    id_val: 'NEGARA ASAL',
    en_val: 'COUNTRY',
    def_val: 'COUNTRY',
  },
  {
    key: 'field.born.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Tanggal Lahir artis',
    id_val: 'TANGGAL LAHIR',
    en_val: 'BORN DATE',
    def_val: 'BORN',
  },
  {
    key: 'field.debut.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Tanggal Debut artis',
    id_val: 'TANGGAL DEBUT',
    en_val: 'DEBUT DATE',
    def_val: 'DEBUT',
  },
  {
    key: 'field.height.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Tinggi Badan artis',
    id_val: 'TINGGI BADAN',
    en_val: 'HEIGHT',
    def_val: 'HEIGHT',
  },
  {
    key: 'field.type.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Tipe Tubuh artis',
    id_val: 'TIPE TUBUH',
    en_val: 'BODY TYPE',
    def_val: 'BODY TYPE',
  },
  {
    key: 'field.cup.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Ukuran Cup artis',
    id_val: 'UKURAN CUP',
    en_val: 'CUP SIZE',
    def_val: 'CUP SIZE',
  },
  {
    key: 'field.bust.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Lingkar Dada artis',
    id_val: 'LINGKAR DADA',
    en_val: 'BUST SIZE',
    def_val: 'BUST SIZE',
  },
  {
    key: 'field.waist.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Lingkar Pinggang artis',
    id_val: 'LINGKAR PINGGANG',
    en_val: 'WAIST SIZE',
    def_val: 'WAIST SIZE',
  },
  {
    key: 'field.hip.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Lingkar Pinggul artis',
    id_val: 'LINGKAR PINGGUL',
    en_val: 'HIP SIZE',
    def_val: 'HIP SIZE',
  },
  {
    key: 'field.prop.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Rating Proporsi artis',
    id_val: 'RATING PROPORSI',
    en_val: 'PROPORTIONAL RATING',
    def_val: 'PROPORTIONAL RATING',
  },
  {
    key: 'field.appearance.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Skor Penampilan artis',
    id_val: 'SKOR PENAMPILAN',
    en_val: 'APPEARANCE SCORE',
    def_val: 'APPEARANCE SCORE',
  },
  {
    key: 'field.impression.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Skor Impresi artis',
    id_val: 'SKOR IMPRESI',
    en_val: 'IMPRESSION SCORE',
    def_val: 'IMPRESSION SCORE',
  },
  {
    key: 'field.overall.label',
    type: 'Label',
    category: 'Detail Profil',
    desc: 'Label kolom Rating Keseluruhan (Overall)',
    id_val: 'RATING KESELURUHAN',
    en_val: 'OVERALL RATING',
    def_val: 'OVERALL RATING',
  },

  // 5. RANKING & LEADERBOARD
  {
    key: 'rank.title',
    type: 'Title',
    category: 'Ranking & Leaderboard',
    desc: 'Judul utama halaman Leaderboard / Ranking',
    id_val: 'PAPAN PERINGKAT ARTIS',
    en_val: 'TALENT LEADERBOARD',
    def_val: 'LEADERBOARD ARTIS',
  },
  {
    key: 'rank.subtitle',
    type: 'Description',
    category: 'Ranking & Leaderboard',
    desc: 'Subtitle penjelasan formula peringkat pada leaderboard',
    id_val: 'Peringkat komprehensif berdasarkan Nilai Keseluruhan, Penampilan, Impresi, dan Proporsi Fisik',
    en_val: 'Comprehensive rankings by Overall Rating, Appearance, Impression, and Body Proportions',
    def_val: 'Peringkat komprehensif berdasarkan Overall Rating, Appearance, Impression, dan Proporsi Fisik',
  },
  {
    key: 'rank.tab.overall',
    type: 'Button',
    category: 'Ranking & Leaderboard',
    desc: 'Tab filter peringkat Overall Rating',
    id_val: 'Peringkat Keseluruhan',
    en_val: 'Overall Top',
    def_val: 'Overall Top',
  },
  {
    key: 'rank.tab.appearance',
    type: 'Button',
    category: 'Ranking & Leaderboard',
    desc: 'Tab filter peringkat Appearance Top',
    id_val: 'Peringkat Penampilan',
    en_val: 'Appearance Top',
    def_val: 'Appearance Top',
  },
  {
    key: 'rank.tab.impression',
    type: 'Button',
    category: 'Ranking & Leaderboard',
    desc: 'Tab filter peringkat Impression Top',
    id_val: 'Peringkat Impresi',
    en_val: 'Impression Top',
    def_val: 'Impression Top',
  },
  {
    key: 'rank.tab.proportional',
    type: 'Button',
    category: 'Ranking & Leaderboard',
    desc: 'Tab filter peringkat Proporsi Fisik',
    id_val: 'Peringkat Proporsi',
    en_val: 'Proportional Top',
    def_val: 'Proportional Top',
  },
  {
    key: 'rank.table.rank',
    type: 'Label',
    category: 'Ranking & Leaderboard',
    desc: 'Header kolom Peringkat pada tabel leaderboard',
    id_val: 'PERINGKAT',
    en_val: 'RANK',
    def_val: 'RANK',
  },
  {
    key: 'rank.table.talent',
    type: 'Label',
    category: 'Ranking & Leaderboard',
    desc: 'Header kolom Nama Talent pada tabel leaderboard',
    id_val: 'ARTIS / TALENT',
    en_val: 'TALENT / ARTIST',
    def_val: 'ARTIS / TALENT',
  },
  {
    key: 'rank.table.overall',
    type: 'Label',
    category: 'Ranking & Leaderboard',
    desc: 'Header kolom Skor Overall pada tabel leaderboard',
    id_val: 'KESELURUHAN',
    en_val: 'OVERALL',
    def_val: 'OVERALL',
  },

  // 6. COMPARE ARTIS
  {
    key: 'compare.title',
    type: 'Title',
    category: 'Compare Artis',
    desc: 'Judul utama halaman Komparasi Artis',
    id_val: 'PERBANDINGAN ARTIS',
    en_val: 'TALENT COMPARISON',
    def_val: 'KOMPARASI ARTIS',
  },
  {
    key: 'compare.subtitle',
    type: 'Description',
    category: 'Compare Artis',
    desc: 'Subtitle penjelasan fitur komparasi metrik head-to-head',
    id_val: 'Bandingkan metrik dua artis secara berdampingan: Skor, Ukuran Fisik, Impresi, dan Siluet',
    en_val: 'Compare metrics of two talents side-by-side: Scores, Measurements, Impression, and Silhouette',
    def_val: 'Bandingkan metrik dua artis secara langsung: Overall, Atribut Fisik, Impresi, dan Siluet',
  },
  {
    key: 'compare.select.primary',
    type: 'Placeholder',
    category: 'Compare Artis',
    desc: 'Label / placeholder pemilihan artis pertama',
    id_val: 'Pilih Artis Utama...',
    en_val: 'Select Primary Talent...',
    def_val: 'Artis Utama',
  },
  {
    key: 'compare.select.opponent',
    type: 'Placeholder',
    category: 'Compare Artis',
    desc: 'Label / placeholder pemilihan artis pembanding',
    id_val: 'Pilih Artis Pembanding...',
    en_val: 'Select Comparison Talent...',
    def_val: 'Artis Pembanding',
  },
  {
    key: 'compare.metric.difference',
    type: 'Label',
    category: 'Compare Artis',
    desc: 'Label untuk indikator selisih skor perbandingan',
    id_val: 'Selisih Skor',
    en_val: 'Score Difference',
    def_val: 'Selisih Skor',
  },
  {
    key: 'compare.higher',
    type: 'Label',
    category: 'Compare Artis',
    desc: 'Badge penanda nilai lebih tinggi pada perbandingan',
    id_val: 'Unggul',
    en_val: 'Higher',
    def_val: 'Unggul',
  },
  {
    key: 'compare.tie',
    type: 'Label',
    category: 'Compare Artis',
    desc: 'Badge penanda nilai seri / imbang pada perbandingan',
    id_val: 'Imbang',
    en_val: 'Tie',
    def_val: 'Imbang',
  },

  // 7. FORM TAMBAH / EDIT
  {
    key: 'form.create.title',
    type: 'Title',
    category: 'Form Tambah / Edit',
    desc: 'Judul halaman form tambah artis baru',
    id_val: 'TAMBAH ENTRI ARTIS BARU',
    en_val: 'ADD NEW ARTIST ENTRY',
    def_val: 'TAMBAH ENTRI ARTIS BARU',
  },
  {
    key: 'form.create.subtitle',
    type: 'Description',
    category: 'Form Tambah / Edit',
    desc: 'Deskripsi langkah pengisian form tambah profil artis',
    id_val: 'Lengkapi biodata, pengukuran tubuh, kategori daya tarik, dan skor penilaian terstruktur',
    en_val: 'Complete biodata, measurements, appeal categories, and structured scoring attributes',
    def_val: 'Lengkapi biodata, ukuran tubuh, kategori daya tarik, dan skor penilaian terstruktur',
  },
  {
    key: 'form.edit.title',
    type: 'Title',
    category: 'Form Tambah / Edit',
    desc: 'Judul halaman form edit profil artis',
    id_val: 'UBAH PROFIL ARTIS',
    en_val: 'EDIT ARTIST PROFILE',
    def_val: 'EDIT PROFIL ARTIS',
  },
  {
    key: 'form.edit.subtitle',
    type: 'Description',
    category: 'Form Tambah / Edit',
    desc: 'Deskripsi form edit saat memperbarui entri artis',
    id_val: 'Perbarui biodata, ukuran fisik, rubrik penilaian, dan tautan profil',
    en_val: 'Update biodata parameters, body measurements, scoring rubrics, and profile links',
    def_val: 'Perbarui parameter biodata, ukuran fisik, rubrik skor, dan tautan profil',
  },
  {
    key: 'form.step.biodata',
    type: 'Label',
    category: 'Form Tambah / Edit',
    desc: 'Label langkah 1: Biodata pada wizard form',
    id_val: '1. Biodata',
    en_val: '1. Biodata',
    def_val: '1. Biodata',
  },
  {
    key: 'form.step.measurements',
    type: 'Label',
    category: 'Form Tambah / Edit',
    desc: 'Label langkah 2: Fisik & Ukuran Tubuh',
    id_val: '2. Fisik & Ukuran',
    en_val: '2. Measurements',
    def_val: '2. Fisik & Ukuran',
  },
  {
    key: 'form.step.appeal',
    type: 'Label',
    category: 'Form Tambah / Edit',
    desc: 'Label langkah 3: Daya Tarik (Appeal)',
    id_val: '3. Daya Tarik',
    en_val: '3. Appeal',
    def_val: '3. Daya Tarik',
  },
  {
    key: 'form.step.scoring',
    type: 'Label',
    category: 'Form Tambah / Edit',
    desc: 'Label langkah 4: Penilaian Skor & Rubrik',
    id_val: '4. Penilaian Skor',
    en_val: '4. Scoring Rubric',
    def_val: '4. Penilaian Skor',
  },
  {
    key: 'form.step.attributes',
    type: 'Label',
    category: 'Form Tambah / Edit',
    desc: 'Label langkah 5: Atribut Khusus & Tautan',
    id_val: '5. Atribut & Tautan',
    en_val: '5. Attributes & Links',
    def_val: '5. Atribut & Link',
  },
  {
    key: 'form.btn.next',
    type: 'Button',
    category: 'Form Tambah / Edit',
    desc: 'Tombol untuk menuju ke langkah form berikutnya',
    id_val: 'Lanjut',
    en_val: 'Next',
    def_val: 'Lanjut',
  },
  {
    key: 'form.btn.prev',
    type: 'Button',
    category: 'Form Tambah / Edit',
    desc: 'Tombol untuk kembali ke langkah form sebelumnya',
    id_val: 'Kembali',
    en_val: 'Back',
    def_val: 'Kembali',
  },
  {
    key: 'form.btn.save',
    type: 'Button',
    category: 'Form Tambah / Edit',
    desc: 'Tombol utama untuk menyimpan data profil artis',
    id_val: 'Simpan Data Artis',
    en_val: 'Save Artist Record',
    def_val: 'Simpan Data Artis',
  },

  // 8. SETTINGS & PREFERENSI
  {
    key: 'settings.title',
    type: 'Title',
    category: 'Settings & Preferensi',
    desc: 'Judul utama halaman Pengaturan Aplikasi',
    id_val: 'PENGATURAN APLIKASI',
    en_val: 'APP SETTINGS',
    def_val: 'PENGATURAN APLIKASI',
  },
  {
    key: 'settings.subtitle',
    type: 'Description',
    category: 'Settings & Preferensi',
    desc: 'Subtitle penjelasan fitur personalisasi dan pengelolaan data di halaman Pengaturan',
    id_val: 'Kelola preferensi visual antarmuka, tipografi, bahasa, dan manajemen data lokal',
    en_val: 'Manage UI visual appearance, typography, language, and local offline data management',
    def_val: 'Kelola preferensi visual antarmuka, tipografi, bahasa, dan manajemen data lokal',
  },
  {
    key: 'settings.theme.title',
    type: 'Title',
    category: 'Settings & Preferensi',
    desc: 'Judul seksi tema visual kartu dan tampilan',
    id_val: 'Tema Visual Kartu Artis',
    en_val: 'Artist Card Visual Theme',
    def_val: 'Tema Visual Card Artis',
  },
  {
    key: 'settings.theme.desc',
    type: 'Description',
    category: 'Settings & Preferensi',
    desc: 'Deskripsi seksi pemilihan tema kartu visual',
    id_val: 'Pilih tema artistik kartu untuk seluruh entri artis di katalog, peringkat, dan pratinjau',
    en_val: 'Choose global artistic card styling for all artist entries across catalog, ranking, and preview',
    def_val: 'Pilih tema artistik kartu untuk seluruh entri artis di katalog, ranking, dan pratinjau',
  },
  {
    key: 'settings.font.title',
    type: 'Title',
    category: 'Settings & Preferensi',
    desc: 'Judul seksi Pengaturan Tipografi & Skala Teks',
    id_val: 'Font & Ukuran Teks',
    en_val: 'Font & Text Size',
    def_val: 'Font & Ukuran Teks',
  },
  {
    key: 'settings.font.desc',
    type: 'Description',
    category: 'Settings & Preferensi',
    desc: 'Deskripsi pengaturan ukuran huruf dan jenis font',
    id_val: 'Pilih jenis tipografi dan atur skala ukuran huruf untuk kenyamanan membaca',
    en_val: 'Choose typography family and adjust text scale for optimal readability',
    def_val: 'Pilih jenis tipografi dan atur skala ukuran huruf untuk kenyamanan membaca',
  },
  {
    key: 'settings.lang.title',
    type: 'Title',
    category: 'Settings & Preferensi',
    desc: 'Judul seksi Bahasa Antarmuka',
    id_val: 'Bahasa Antarmuka',
    en_val: 'Interface Language',
    def_val: 'Bahasa Antarmuka',
  },
  {
    key: 'settings.lang.desc',
    type: 'Description',
    category: 'Settings & Preferensi',
    desc: 'Deskripsi seksi pilihan bahasa sistem',
    id_val: 'Pilih bahasa teks antarmuka dan terminologi aplikasi',
    en_val: 'Choose interface language and system terminology',
    def_val: 'Pilih bahasa teks antarmuka dan terminologi aplikasi',
  },
  {
    key: 'settings.db.title',
    type: 'Title',
    category: 'Settings & Preferensi',
    desc: 'Judul seksi Database & Lokalisasi Dinamis',
    id_val: 'Database Editor & Kustomisasi Skema',
    en_val: 'Database Editor & Schema Customization',
    def_val: 'Database Editor & Kustomisasi Skema',
  },
  {
    key: 'settings.db.desc',
    type: 'Description',
    category: 'Settings & Preferensi',
    desc: 'Deskripsi pembuka modul Database Editor',
    id_val: 'Kustomisasi struktur bidang data, taksonomi tipe tubuh, opsi daya tarik, dan semua teks UI terpusat',
    en_val: 'Visually customize field structures, body type taxonomy, appeal options, and all centralized UI texts',
    def_val: 'Kustomisasi struktur field, taksonomi tipe tubuh, opsi appeal, rubrik skor, dan teks antarmuka secara visual',
  },
  {
    key: 'settings.backup.title',
    type: 'Title',
    category: 'Settings & Preferensi',
    desc: 'Judul seksi Cadangan & Pemulihan Basis Data',
    id_val: 'Cadangan & Pemulihan Basis Data',
    en_val: 'Database Backup & Restore',
    def_val: 'Backup & Restore Database',
  },

  // 9. DATABASE EDITOR SPECIFIC
  {
    key: 'dbeditor.hero.title',
    type: 'Title',
    category: 'Database Editor',
    desc: 'Judul header halaman Database Editor',
    id_val: 'DATABASE & TRANSLATION DICTIONARY EDITOR',
    en_val: 'DATABASE & TRANSLATION DICTIONARY EDITOR',
    def_val: 'DATABASE & TRANSLATION DICTIONARY EDITOR',
  },
  {
    key: 'dbeditor.hero.subtitle',
    type: 'Description',
    category: 'Database Editor',
    desc: 'Deskripsi fungsi Database Editor untuk pengeditan teks UI secara dinamis & realtime',
    id_val: 'Kelola seluruh teks antarmuka aplikasi secara terpusat (Key-Value), dukung multi-bahasa, bulk replace, dan sinkronisasi instan.',
    en_val: 'Centrally manage all application UI strings (Key-Value), multi-language support, bulk replace, and instant cache synchronization.',
    def_val: 'Kelola seluruh teks antarmuka aplikasi secara terpusat (Key-Value), dukung multi-bahasa, bulk replace, dan sinkronisasi instan.',
  },
  {
    key: 'dbeditor.btn.flush_cache',
    type: 'Button',
    category: 'Database Editor',
    desc: 'Tombol untuk membersihkan cache teks UI secara langsung',
    id_val: 'Bersihkan Cache (Flush)',
    en_val: 'Flush UI Cache',
    def_val: 'Bersihkan Cache (Flush)',
  },
  {
    key: 'dbeditor.btn.bulk_replace',
    type: 'Button',
    category: 'Database Editor',
    desc: 'Tombol untuk membuka tool Cari & Ganti Teks Massal',
    id_val: 'Cari & Ganti Massal',
    en_val: 'Find & Replace',
    def_val: 'Cari & Ganti Massal',
  },
  {
    key: 'dbeditor.btn.export',
    type: 'Button',
    category: 'Database Editor',
    desc: 'Tombol untuk mengekspor data teks ke JSON/CSV',
    id_val: 'Ekspor Kamus Teks',
    en_val: 'Export Dictionary',
    def_val: 'Ekspor Kamus Teks',
  },
  {
    key: 'dbeditor.btn.import',
    type: 'Button',
    category: 'Database Editor',
    desc: 'Tombol untuk mengimpor berkas kamus terjemahan',
    id_val: 'Impor Berkas',
    en_val: 'Import File',
    def_val: 'Impor Berkas',
  },
  {
    key: 'dbeditor.btn.history',
    type: 'Button',
    category: 'Database Editor',
    desc: 'Tombol untuk melihat riwayat log perubahan dan rollback',
    id_val: 'Riwayat & Rollback',
    en_val: 'History & Rollback',
    def_val: 'Riwayat & Rollback',
  },
  {
    key: 'dbeditor.btn.export_import',
    type: 'Button',
    category: 'Database Editor',
    desc: 'Tombol modal untuk ekspor dan impor kamus teks',
    id_val: 'Ekspor / Impor',
    en_val: 'Export / Import',
    def_val: 'Ekspor / Impor',
  },

  // 10. NOTIFIKASI & DIALOG
  {
    key: 'notify.saved',
    type: 'Notification',
    category: 'Notifikasi & Dialog',
    desc: 'Pesan notifikasi ketika data berhasil disimpan',
    id_val: 'Data berhasil disimpan!',
    en_val: 'Data saved successfully!',
    def_val: 'Data berhasil disimpan!',
  },
  {
    key: 'notify.reset',
    type: 'Notification',
    category: 'Notifikasi & Dialog',
    desc: 'Pesan notifikasi saat pengaturan dikembalikan ke bawaan',
    id_val: 'Pengaturan dikembalikan ke bawaan!',
    en_val: 'Settings restored to defaults!',
    def_val: 'Pengaturan dikembalikan ke bawaan!',
  },
  {
    key: 'notify.copied',
    type: 'Notification',
    category: 'Notifikasi & Dialog',
    desc: 'Pesan notifikasi saat teks disalin ke clipboard',
    id_val: 'Disalin ke papan klip!',
    en_val: 'Copied to clipboard!',
    def_val: 'Disalin ke papan klip!',
  },
  {
    key: 'notify.cache_flushed',
    type: 'Notification',
    category: 'Notifikasi & Dialog',
    desc: 'Pesan notifikasi saat cache teks UI dibersihkan dan disinkronkan',
    id_val: 'Cache UI Text dibersihkan! Tampilan langsung diperbarui seketika.',
    en_val: 'UI Text cache flushed! Changes applied live across the entire app.',
    def_val: 'Cache UI Text dibersihkan! Tampilan langsung diperbarui seketika.',
  },
  {
    key: 'notify.bulk_updated',
    type: 'Notification',
    category: 'Notifikasi & Dialog',
    desc: 'Pesan notifikasi saat fitur ganti massal berhasil dijalankan',
    id_val: 'Penggantian teks massal berhasil diterapkan!',
    en_val: 'Bulk text replacement successfully applied!',
    def_val: 'Penggantian teks massal berhasil diterapkan!',
  },
  {
    key: 'notify.delete.title',
    type: 'Title',
    category: 'Notifikasi & Dialog',
    desc: 'Judul dialog konfirmasi penghapusan entri artis',
    id_val: 'Hapus Entri Artis?',
    en_val: 'Delete Artist Record?',
    def_val: 'Hapus Entri Artis?',
  },
  {
    key: 'notify.delete.desc',
    type: 'Description',
    category: 'Notifikasi & Dialog',
    desc: 'Deskripsi peringatan pada dialog konfirmasi penghapusan',
    id_val: 'Apakah Anda yakin ingin menghapus data profil artis ini? Tindakan ini tidak dapat dibatalkan.',
    en_val: 'Are you sure you want to delete this artist profile? This action cannot be undone.',
    def_val: 'Apakah Anda yakin ingin menghapus data profil artis ini? Tindakan ini tidak dapat dibatalkan.',
  },
  {
    key: 'notify.delete.btn',
    type: 'Button',
    category: 'Notifikasi & Dialog',
    desc: 'Teks tombol konfirmasi hapus permanen',
    id_val: 'Ya, Hapus Artis',
    en_val: 'Yes, Delete Artist',
    def_val: 'Ya, Hapus Artis',
  },
  {
    key: 'notify.exit.press_again',
    type: 'Notification',
    category: 'Notifikasi & Dialog',
    desc: 'Pesan toast saat menekan tombol kembali untuk keluar',
    id_val: 'Tekan tombol Back sekali lagi untuk keluar dari aplikasi',
    en_val: 'Press back button once more to exit the application',
    def_val: 'Tekan tombol Back sekali lagi untuk keluar dari aplikasi',
  },

  // 11. PENGATURAN & PREFERENSI (SETTINGS)
  {
    key: 'settings.tab.theme',
    type: 'Button',
    category: 'Pengaturan & Preferensi',
    desc: 'Tab navigasi untuk Pengaturan Tema Visual',
    id_val: 'Tema Aplikasi',
    en_val: 'App Theme',
    def_val: 'Tema Aplikasi',
  },
  {
    key: 'settings.tab.card_theme',
    type: 'Button',
    category: 'Pengaturan & Preferensi',
    desc: 'Tab navigasi untuk Pengaturan Tema Kartu Artis',
    id_val: 'Tema Kartu Artis',
    en_val: 'Artist Card Theme',
    def_val: 'Tema Kartu Artis',
  },
  {
    key: 'settings.tab.typography',
    type: 'Button',
    category: 'Pengaturan & Preferensi',
    desc: 'Tab navigasi untuk Pengaturan Tipografi & Font',
    id_val: 'Tipografi & Font',
    en_val: 'Typography & Fonts',
    def_val: 'Tipografi & Font',
  },
  {
    key: 'settings.tab.backup',
    type: 'Button',
    category: 'Pengaturan & Preferensi',
    desc: 'Tab navigasi untuk Cadangan & Pemulihan Data',
    id_val: 'Cadangan & Pemulihan',
    en_val: 'Backup & Restore',
    def_val: 'Cadangan & Pemulihan',
  },
  {
    key: 'settings.theme.mini_preview_title',
    type: 'Title',
    category: 'Pengaturan & Preferensi',
    desc: 'Judul header pada komponen Mini Preview Sticky',
    id_val: 'Mini Preview Real-Time',
    en_val: 'Real-Time Mini Preview',
    def_val: 'Mini Preview Real-Time',
  },
  {
    key: 'settings.theme.color_slider_mode',
    type: 'Label',
    category: 'Pengaturan & Preferensi',
    desc: 'Label pilihan mode slider warna (HSL / RGB)',
    id_val: 'Mode Slider Warna',
    en_val: 'Color Slider Mode',
    def_val: 'Mode Slider Warna',
  },
  {
    key: 'settings.backup.export_json',
    type: 'Button',
    category: 'Pengaturan & Preferensi',
    desc: 'Tombol untuk mengekspor cadangan database format JSON',
    id_val: 'Ekspor Cadangan JSON',
    en_val: 'Export JSON Backup',
    def_val: 'Ekspor Cadangan JSON',
  },
  {
    key: 'settings.backup.import_file',
    type: 'Button',
    category: 'Pengaturan & Preferensi',
    desc: 'Tombol untuk mengimpor file cadangan database',
    id_val: 'Impor & Pulihkan Data',
    en_val: 'Import & Restore Data',
    def_val: 'Impor & Pulihkan Data',
  },

  // 12. HALAMAN KUSTOM (CUSTOM PAGES)
  {
    key: 'custom_pages.title',
    type: 'Title',
    category: 'Halaman Kustom',
    desc: 'Judul utama pengelola Halaman Kustom',
    id_val: 'MANAJEMEN HALAMAN KUSTOM',
    en_val: 'CUSTOM PAGES MANAGEMENT',
    def_val: 'MANAJEMEN HALAMAN KUSTOM',
  },
  {
    key: 'custom_pages.subtitle',
    type: 'Description',
    category: 'Halaman Kustom',
    desc: 'Deskripsi pengelola Halaman Kustom',
    id_val: 'Buat, edit, dan kelola halaman informasi tambahan dengan format Markdown kaya fitur.',
    en_val: 'Create, edit, and manage additional informational pages with rich Markdown formatting.',
    def_val: 'Buat, edit, dan kelola halaman informasi tambahan dengan format Markdown kaya fitur.',
  },
  {
    key: 'custom_pages.btn.create',
    type: 'Button',
    category: 'Halaman Kustom',
    desc: 'Tombol untuk membuat halaman kustom baru',
    id_val: '+ Buat Halaman Baru',
    en_val: '+ Create New Page',
    def_val: '+ Buat Halaman Baru',
  },
  {
    key: 'custom_pages.badge.published',
    type: 'Badge',
    category: 'Halaman Kustom',
    desc: 'Status lencana untuk halaman yang sudah dipublikasikan',
    id_val: 'Dipublikasikan',
    en_val: 'Published',
    def_val: 'Dipublikasikan',
  },
  {
    key: 'custom_pages.badge.draft',
    type: 'Badge',
    category: 'Halaman Kustom',
    desc: 'Status lencana untuk halaman berstatus draf',
    id_val: 'Draf',
    en_val: 'Draft',
    def_val: 'Draf',
  },
  {
    key: 'custom_pages.empty_state',
    type: 'Description',
    category: 'Halaman Kustom',
    desc: 'Pesan ketika belum ada halaman kustom yang dibuat',
    id_val: 'Belum ada halaman kustom. Klik tombol di atas untuk membuat halaman pertama Anda.',
    en_val: 'No custom pages yet. Click the button above to create your first page.',
    def_val: 'Belum ada halaman kustom. Klik tombol di atas untuk membuat halaman pertama Anda.',
  },

  // 13. MODAL, DIALOG & TOAST
  {
    key: 'modal.btn.close',
    type: 'Button',
    category: 'Modal & Dialog',
    desc: 'Tombol umum untuk menutup jendela modal',
    id_val: 'Tutup',
    en_val: 'Close',
    def_val: 'Tutup',
  },
  {
    key: 'modal.btn.cancel',
    type: 'Button',
    category: 'Modal & Dialog',
    desc: 'Tombol umum untuk membatalkan aksi dialog',
    id_val: 'Batal',
    en_val: 'Cancel',
    def_val: 'Batal',
  },
  {
    key: 'modal.btn.save',
    type: 'Button',
    category: 'Modal & Dialog',
    desc: 'Tombol umum untuk menyimpan perubahan pada modal',
    id_val: 'Simpan Perubahan',
    en_val: 'Save Changes',
    def_val: 'Simpan Perubahan',
  },
  {
    key: 'modal.btn.confirm',
    type: 'Button',
    category: 'Modal & Dialog',
    desc: 'Tombol umum untuk mengonfirmasi aksi penting',
    id_val: 'Konfirmasi',
    en_val: 'Confirm',
    def_val: 'Konfirmasi',
  },

  // 14. FOOTER & FLOATING ACTIONS
  {
    key: 'footer.copyright',
    type: 'Label',
    category: 'Footer & Navigasi',
    desc: 'Teks hak cipta pada footer aplikasi',
    id_val: 'Sistem Penilaian & Database Artis Premium',
    en_val: 'Premium Artist Database & Rating System',
    def_val: 'Sistem Penilaian & Database Artis Premium',
  },
  {
    key: 'footer.version_badge',
    type: 'Badge',
    category: 'Footer & Navigasi',
    desc: 'Label versi rilis sistem pada footer',
    id_val: 'v3.5 Enterprise Engine',
    en_val: 'v3.5 Enterprise Engine',
    def_val: 'v3.5 Enterprise Engine',
  },
  {
    key: 'footer.cache_status',
    type: 'Label',
    category: 'Footer & Navigasi',
    desc: 'Indikator status sinkronisasi memori cache UI',
    id_val: 'Sinkronisasi Cache Real-Time Aktif',
    en_val: 'Real-Time Cache Sync Active',
    def_val: 'Sinkronisasi Cache Real-Time Aktif',
  },
  {
    key: 'fab.scroll_top',
    type: 'Button',
    category: 'Floating Action Button',
    desc: 'Tombol mengambang untuk kembali ke bagian atas halaman',
    id_val: 'Kembali ke Atas',
    en_val: 'Scroll to Top',
    def_val: 'Kembali ke Atas',
  },
  {
    key: 'fab.quick_add',
    type: 'Button',
    category: 'Floating Action Button',
    desc: 'Tombol mengambang untuk menambah artis baru dengan cepat',
    id_val: 'Tambah Artis Baru',
    en_val: 'Add New Artist',
    def_val: 'Tambah Artis Baru',
  },
  {
    key: 'fab.compare_drawer',
    type: 'Button',
    category: 'Floating Action Button',
    desc: 'Tombol mengambang untuk membuka perbandingan artis terpilih',
    id_val: 'Bandingkan Artis Terpilih',
    en_val: 'Compare Selected Artists',
    def_val: 'Bandingkan Artis Terpilih',
  },
];

/**
 * Builds the complete list of initial UITextRecord instances for all locales.
 */
export function buildInitialUITextRecords(): UITextRecord[] {
  const records: UITextRecord[] = [];
  const now = new Date().toISOString();

  RAW_SEEDS.forEach((seed, index) => {
    // 1. Indonesian (id)
    records.push({
      id: `uitext_${seed.key.replace(/\./g, '_')}_id`,
      text_key: seed.key,
      locale: 'id',
      category: seed.category,
      type: seed.type,
      text_value: seed.id_val,
      default_value: seed.id_val,
      description: seed.desc,
      last_updated: now,
    });

    // 2. English (en)
    records.push({
      id: `uitext_${seed.key.replace(/\./g, '_')}_en`,
      text_key: seed.key,
      locale: 'en',
      category: seed.category,
      type: seed.type,
      text_value: seed.en_val,
      default_value: seed.en_val,
      description: seed.desc,
      last_updated: now,
    });

    // 3. Default (default)
    records.push({
      id: `uitext_${seed.key.replace(/\./g, '_')}_def`,
      text_key: seed.key,
      locale: 'default',
      category: seed.category,
      type: seed.type,
      text_value: seed.def_val,
      default_value: seed.def_val,
      description: seed.desc,
      last_updated: now,
    });
  });

  return records;
}

// ============================================================================
// IN-MEMORY CACHE LAYER (O(1) Ultra-Fast Lookup)
// ============================================================================

class LocalizationCacheManager {
  private cache: Map<string, string> = new Map();
  private records: UITextRecord[] = [];
  private history: UITextChangeLog[] = [];
  private currentLocale: string = 'default';
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  public loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(UI_TEXT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Deduplicate any duplicates in stored data
          const seenKeys = new Set<string>();
          const uniqueParsed: UITextRecord[] = [];
          for (const r of parsed) {
            const compositeKey = `${r.locale}:${r.text_key}`;
            if (!seenKeys.has(compositeKey)) {
              seenKeys.add(compositeKey);
              uniqueParsed.push(r);
            }
          }

          // Merge missing seeds if new keys were added
          const initial = buildInitialUITextRecords();
          const missing = initial.filter(r => !seenKeys.has(`${r.locale}:${r.text_key}`));
          this.records = [...uniqueParsed, ...missing];

          if (uniqueParsed.length !== parsed.length) {
            this.saveToStorage();
          }
        } else {
          this.records = buildInitialUITextRecords();
        }
      } else {
        this.records = buildInitialUITextRecords();
        this.saveToStorage();
      }

      const savedHistory = localStorage.getItem(UI_TEXT_HISTORY_KEY);
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }
    } catch (e) {
      console.error('Failed to load UI_TEXT from storage:', e);
      this.records = buildInitialUITextRecords();
    }

    this.rebuildCache();
  }

  public saveToStorage(): void {
    try {
      localStorage.setItem(UI_TEXT_STORAGE_KEY, JSON.stringify(this.records));
      localStorage.setItem(UI_TEXT_HISTORY_KEY, JSON.stringify(this.history.slice(0, 100))); // keep last 100
    } catch (e) {
      console.error('Failed to save UI_TEXT to storage:', e);
    }
  }

  public setLocale(locale: string): void {
    if (this.currentLocale !== locale) {
      this.currentLocale = locale;
      this.rebuildCache();
      this.notify();
    }
  }

  public getLocale(): string {
    return this.currentLocale;
  }

  public rebuildCache(): void {
    this.cache.clear();
    const activeLocale = this.currentLocale;

    // First populate active locale records
    for (const record of this.records) {
      if (record.locale === activeLocale) {
        this.cache.set(record.text_key, record.text_value);
      }
    }

    // Fallback to default or any available value if key is missing in active locale
    for (const record of this.records) {
      if (!this.cache.has(record.text_key)) {
        this.cache.set(record.text_key, record.text_value);
      }
    }
  }

  public get(key: string, fallback?: string): string {
    const val = this.cache.get(key);
    if (val !== undefined && val !== null) {
      return val;
    }
    return fallback ?? key;
  }

  public getAllRecords(): UITextRecord[] {
    return [...this.records];
  }

  public getHistory(): UITextChangeLog[] {
    return [...this.history];
  }

  public updateKey(key: string, newValue: string, locale?: string, note?: string): void {
    const targetLocale = locale || this.currentLocale;
    const now = new Date().toISOString();

    let found = false;
    let oldValue = '';

    this.records = this.records.map(record => {
      if (record.text_key === key && record.locale === targetLocale) {
        oldValue = record.text_value;
        found = true;
        return {
          ...record,
          text_value: newValue,
          last_updated: now,
        };
      }
      return record;
    });

    if (!found) {
      // Create new record
      this.records.push({
        id: `uitext_${key.replace(/\./g, '_')}_${targetLocale}`,
        text_key: key,
        locale: targetLocale,
        category: 'Global / Navbar',
        type: 'Label',
        text_value: newValue,
        default_value: newValue,
        last_updated: now,
      });
    }

    // Add to change log
    if (oldValue !== newValue) {
      this.history.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: now,
        text_key: key,
        locale: targetLocale,
        old_value: oldValue,
        new_value: newValue,
        note: note || 'Perubahan langsung melalui Database Editor',
      });
    }

    this.rebuildCache();
    this.saveToStorage();
    this.notify();
  }

  public bulkUpdate(updates: { text_key: string; text_value: string; locale?: string }[], note?: string): void {
    const now = new Date().toISOString();
    const updateMap = new Map<string, string>();
    updates.forEach(u => {
      const loc = u.locale || this.currentLocale;
      updateMap.set(`${loc}:${u.text_key}`, u.text_value);
    });

    this.records = this.records.map(record => {
      const lookup = `${record.locale}:${record.text_key}`;
      if (updateMap.has(lookup)) {
        const newVal = updateMap.get(lookup)!;
        if (record.text_value !== newVal) {
          this.history.unshift({
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            timestamp: now,
            text_key: record.text_key,
            locale: record.locale,
            old_value: record.text_value,
            new_value: newVal,
            note: note || 'Bulk Update',
          });
        }
        return {
          ...record,
          text_value: newVal,
          last_updated: now,
        };
      }
      return record;
    });

    this.rebuildCache();
    this.saveToStorage();
    this.notify();
  }

  public findAndReplace(
    findText: string,
    replaceText: string,
    targetLocale?: string,
    locationFilter?: string
  ): number {
    if (!findText) return 0;
    const now = new Date().toISOString();
    const loc = targetLocale || this.currentLocale;
    let matchCount = 0;

    this.records = this.records.map(record => {
      if (
        (loc === 'all' || record.locale === loc) &&
        (!locationFilter || locationFilter === 'ALL' || record.category === locationFilter)
      ) {
        if (record.text_value.includes(findText)) {
          const oldVal = record.text_value;
          const newVal = record.text_value.replaceAll(findText, replaceText);
          matchCount++;

          this.history.unshift({
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            timestamp: now,
            text_key: record.text_key,
            locale: record.locale,
            old_value: oldVal,
            new_value: newVal,
            note: `Mass Replace: "${findText}" ➔ "${replaceText}"`,
          });

          return {
            ...record,
            text_value: newVal,
            last_updated: now,
          };
        }
      }
      return record;
    });

    if (matchCount > 0) {
      this.rebuildCache();
      this.saveToStorage();
      this.notify();
    }

    return matchCount;
  }

  public rollback(logId: string): boolean {
    const logItem = this.history.find(h => h.id === logId);
    if (!logItem) return false;

    this.updateKey(
      logItem.text_key,
      logItem.old_value,
      logItem.locale,
      `Rollback dari revisi ${logItem.timestamp}`
    );
    return true;
  }

  /**
   * Pindai dan sinkronkan seluruh cakupan aplikasi (Taksonomi, Form Artis, Halaman Kustom, Kategori Skor, Tema)
   * secara otomatis mendaftarkan kunci teks baru ke Kamus UI.
   */
  public scanAndRegisterDynamicAppContent(): { addedCount: number; scannedCategories: string[]; newKeys: string[] } {
    const existingKeyLocales = new Set(this.records.map(r => `${r.locale}:${r.text_key}`));
    const newRecordsToAdd: UITextRecord[] = [];
    const scannedCategories = new Set<string>();
    const newKeys: string[] = [];
    const now = new Date().toISOString();

    const registerKeyIfMissing = (
      key: string,
      category: UITextLocation,
      type: UITextType,
      idVal: string,
      enVal: string,
      defVal: string,
      desc: string
    ) => {
      scannedCategories.add(category);
      const locales = [
        { loc: 'id', val: idVal },
        { loc: 'en', val: enVal },
        { loc: 'default', val: defVal },
      ];

      let isNew = false;
      for (const { loc, val } of locales) {
        const lookup = `${loc}:${key}`;
        if (!existingKeyLocales.has(lookup)) {
          existingKeyLocales.add(lookup);
          isNew = true;
          newRecordsToAdd.push({
            id: `uitext_${key.replace(/[^a-zA-Z0-9_]/g, '_')}_${loc}`,
            text_key: key,
            locale: loc,
            category,
            type,
            text_value: val,
            default_value: val,
            description: desc,
            last_updated: now,
          });
        }
      }
      if (isNew) {
        newKeys.push(key);
      }
    };

    // 1. Scan Taxonomy & Custom Attributes Schema
    try {
      const taxonomyRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('APP_TAXONOMY_SCHEMA_V1') : null;
      if (taxonomyRaw) {
        const taxonomyData = JSON.parse(taxonomyRaw);
        if (Array.isArray(taxonomyData)) {
          taxonomyData.forEach((tax: any) => {
            if (tax && tax.id) {
              const label = tax.name || tax.label || tax.id;
              registerKeyIfMissing(
                `taxonomy.field.${tax.id}.label`,
                'Database Editor',
                'Label',
                label,
                tax.enLabel || label,
                label,
                `Label kolom taksonomi: ${label}`
              );
              if (tax.description) {
                registerKeyIfMissing(
                  `taxonomy.field.${tax.id}.desc`,
                  'Database Editor',
                  'Description',
                  tax.description,
                  tax.enDescription || tax.description,
                  tax.description,
                  `Deskripsi kolom taksonomi: ${label}`
                );
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error scanning taxonomy schema:', e);
    }

    // 2. Scan Artist Form Layout & Folder Tabs
    try {
      const formLayoutRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('ARTIST_FORM_LAYOUT_STRUCTURE_V1') : null;
      if (formLayoutRaw) {
        const formLayout = JSON.parse(formLayoutRaw);
        if (Array.isArray(formLayout)) {
          formLayout.forEach((folder: any) => {
            if (folder && folder.id) {
              const title = folder.title || folder.name || folder.id;
              registerKeyIfMissing(
                `artist_form.folder.${folder.id}.title`,
                'Form Tambah / Edit',
                'Title',
                title,
                folder.enTitle || title,
                title,
                `Judul tab/folder formulir artis: ${title}`
              );
              if (folder.description) {
                registerKeyIfMissing(
                  `artist_form.folder.${folder.id}.desc`,
                  'Form Tambah / Edit',
                  'Description',
                  folder.description,
                  folder.enDescription || folder.description,
                  folder.description,
                  `Deskripsi folder formulir artis: ${title}`
                );
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error scanning artist form layout:', e);
    }

    // 3. Scan Custom Dynamic Pages
    try {
      const customPagesRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('APP_CUSTOM_PAGES_STORAGE_KEY') : null;
      if (customPagesRaw) {
        const customPages = JSON.parse(customPagesRaw);
        if (Array.isArray(customPages)) {
          customPages.forEach((page: any) => {
            if (page && page.id) {
              const title = page.title || page.name || page.id;
              registerKeyIfMissing(
                `page.custom.${page.id}.title`,
                'Global / Navbar',
                'Title',
                title,
                page.enTitle || title,
                title,
                `Judul halaman kustom dinamis: ${title}`
              );
              if (page.description) {
                registerKeyIfMissing(
                  `page.custom.${page.id}.desc`,
                  'Global / Navbar',
                  'Description',
                  page.description,
                  page.enDescription || page.description,
                  page.description,
                  `Deskripsi halaman kustom: ${title}`
                );
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error scanning custom pages:', e);
    }

    // 4. Scan Card Themes & UI Color Presets in Settings
    try {
      const appSettingsRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('app_settings') : null;
      if (appSettingsRaw) {
        const settingsObj = JSON.parse(appSettingsRaw);
        if (settingsObj.customColorPresets && Array.isArray(settingsObj.customColorPresets)) {
          settingsObj.customColorPresets.forEach((preset: any) => {
            if (preset && preset.id) {
              registerKeyIfMissing(
                `color_theme.${preset.id}.name`,
                'Settings & Preferensi',
                'Label',
                preset.name || preset.id,
                preset.name || preset.id,
                preset.name || preset.id,
                `Nama preset warna kustom: ${preset.name || preset.id}`
              );
            }
          });
        }
        if (settingsObj.customCardThemes && Array.isArray(settingsObj.customCardThemes)) {
          settingsObj.customCardThemes.forEach((cardTheme: any) => {
            if (cardTheme && cardTheme.id) {
              registerKeyIfMissing(
                `card_theme.${cardTheme.id}.name`,
                'Settings & Preferensi',
                'Label',
                cardTheme.name || cardTheme.id,
                cardTheme.name || cardTheme.id,
                cardTheme.name || cardTheme.id,
                `Nama preset tema card kustom: ${cardTheme.name || cardTheme.id}`
              );
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error scanning settings custom themes:', e);
    }

    // If new keys were discovered, append them, save, rebuild cache, and notify UI
    if (newRecordsToAdd.length > 0) {
      this.records = [...this.records, ...newRecordsToAdd];
      this.rebuildCache();
      this.saveToStorage();
      this.notify();
    }

    return {
      addedCount: newKeys.length,
      scannedCategories: Array.from(scannedCategories),
      newKeys,
    };
  }

  public flushCache(): void {
    this.rebuildCache();
    this.notify();
  }

  public resetAllToDefault(): void {
    this.records = buildInitialUITextRecords();
    this.history = [];
    this.rebuildCache();
    this.saveToStorage();
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ui_text_cache_updated'));
    }
  }
}

export const localizationCache = new LocalizationCacheManager();

// Helper hook / function for functional components
export function getUIText(key: string, fallback?: string): string {
  return localizationCache.get(key, fallback);
}

/**
 * Scan all dynamic app structures and synchronize missing keys to UI Dictionary
 */
export function scanAndSyncUIText(): { addedCount: number; scannedCategories: string[]; newKeys: string[] } {
  return localizationCache.scanAndRegisterDynamicAppContent();
}

// ============================================================================
// SQL SCHEMA & MIGRATION SCRIPT GENERATOR
// ============================================================================

export function generateSQLMigration(): string {
  return `-- ============================================================================
-- SQL SCHEMA MIGRATION: DYNAMIC LOCALIZATION TABLE (UI_TEXT)
-- Engine: PostgreSQL 14+ / Supabase / Cloud SQL / MySQL 8+ Compatible
-- ============================================================================

-- 1. Create Table UI_TEXT
CREATE TABLE IF NOT EXISTS ui_text (
    id VARCHAR(128) PRIMARY KEY,
    text_key VARCHAR(128) NOT NULL,
    locale VARCHAR(16) NOT NULL DEFAULT 'id',
    category VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL,
    text_value TEXT NOT NULL,
    default_value TEXT NOT NULL,
    description TEXT,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ui_text_key_locale UNIQUE (text_key, locale)
);

-- 2. Indexes for Ultra-Fast Cached Queries
CREATE INDEX IF NOT EXISTS idx_ui_text_lookup ON ui_text (locale, text_key);
CREATE INDEX IF NOT EXISTS idx_ui_text_category ON ui_text (category);
CREATE INDEX IF NOT EXISTS idx_ui_text_updated ON ui_text (last_updated DESC);

-- 3. Audit Log Table for Rollback & History
CREATE TABLE IF NOT EXISTS ui_text_history (
    id VARCHAR(64) PRIMARY KEY,
    text_key VARCHAR(128) NOT NULL,
    locale VARCHAR(16) NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    changed_by VARCHAR(64) DEFAULT 'admin',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Sample Seed Data (DML)
INSERT INTO ui_text (id, text_key, locale, category, type, text_value, default_value, description)
VALUES
  ('uitext_app_header_title_id', 'app.header.title', 'id', 'Global / Navbar', 'Title', 'PERINGKAT TALENT', 'PERINGKAT TALENT', 'Judul merek header navbar'),
  ('uitext_app_header_title_en', 'app.header.title', 'en', 'Global / Navbar', 'Title', 'TALENT RATING', 'TALENT RATING', 'Header navbar brand title'),
  ('uitext_home_catalog_title_id', 'home.catalog.title', 'id', 'Home / Catalog', 'Title', 'Katalog Profil Artis', 'Katalog Profil Artis', 'Judul halaman katalog')
ON CONFLICT (text_key, locale)
DO UPDATE SET
  text_value = EXCLUDED.text_value,
  last_updated = NOW();
`;
}

// ============================================================================
// REST API SPECIFICATION CODE SAMPLES
// ============================================================================

export function generateRESTAPISpec(): string {
  return `/**
 * ============================================================================
 * EXPRESS.JS REST API ENDPOINTS: DYNAMIC LOCALIZATION
 * Zero-Downtime UI Updates with In-Memory / Redis Caching
 * ============================================================================
 */

import express, { Request, Response } from 'express';
// import Redis from 'ioredis'; // Optional Redis caching layer

const router = express.Router();

/**
 * GET /api/v1/translations
 * Mengambil seluruh kamus terjemahan berdasarkan locale
 */
router.get('/api/v1/translations', async (req: Request, res: Response) => {
  try {
    const locale = (req.query.locale as string) || 'id';

    // In-memory or Redis fast cache retrieval
    // const cached = await redis.get(\`translations:\${locale}\`);
    // if (cached) return res.json(JSON.parse(cached));

    // Fallback query database:
    // const rows = await db.query('SELECT text_key, text_value FROM ui_text WHERE locale = $1', [locale]);
    // const dictionary = Object.fromEntries(rows.map(r => [r.text_key, r.text_value]));

    res.json({
      success: true,
      locale,
      count: 140,
      translations: { /* Key-Value Map */ }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch translations' });
  }
});

/**
 * PUT /api/v1/translations/:key
 * Memperbarui nilai satu kunci teks dan menginvalidasi cache seketika
 */
router.put('/api/v1/translations/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { text_value, locale = 'id', note } = req.body;

    // 1. Update Database (Postgres/Supabase)
    // 2. Insert into ui_text_history table
    // 3. Flush & update Cache (Redis / In-memory)
    // 4. Broadcast WebSocket event (optional) for real-time client reload

    res.json({ success: true, message: \`Text key \${key} updated successfully\` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

/**
 * POST /api/v1/translations/bulk
 * Pembaruan massal (Batch Update / Find & Replace)
 */
router.post('/api/v1/translations/bulk', async (req: Request, res: Response) => {
  try {
    const { updates, note } = req.body; // Array of { text_key, text_value, locale }
    // Run batch transaction...
    res.json({ success: true, updated_count: updates?.length || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Bulk update failed' });
  }
});

export default router;
`;
}
