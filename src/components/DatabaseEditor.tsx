import React, { useState, useMemo, useEffect } from 'react';
import { DatabaseSchema, UITextRecord, UITextLocation, UITextType } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { TextDataGrid } from './db-editor/TextDataGrid';
import { BulkReplaceModal } from './db-editor/BulkReplaceModal';
import { HistoryRollbackModal } from './db-editor/HistoryRollbackModal';
import { ExportImportModal } from './db-editor/ExportImportModal';
import { DeveloperSpecModal } from './db-editor/DeveloperSpecModal';
import {
  Database,
  Search,
  ArrowRightLeft,
  RefreshCw,
  Download,
  Upload,
  History,
  Terminal,
  Layers,
  Sparkles,
  Check,
  Globe,
  SlidersHorizontal,
  FileCode,
  ArrowLeft,
  X,
  Sliders,
  Filter,
} from 'lucide-react';

interface DatabaseEditorProps {
  schema: DatabaseSchema;
  onSaveSchema: (newSchema: DatabaseSchema) => void;
  onResetSchema: () => void;
  onBack?: () => void;
  onBackToViewer?: () => void;
  onOpenCustomPages?: () => void;
  onOpenDynamicSchema?: () => void;
}

export const DatabaseEditor: React.FC<DatabaseEditorProps> = ({
  schema,
  onSaveSchema,
  onResetSchema,
  onBack,
  onBackToViewer,
  onOpenCustomPages,
  onOpenDynamicSchema,
}) => {
  const {
    currentLocale,
    setLocale,
    records,
    history,
    updateKey,
    bulkUpdate,
    findAndReplace,
    rollback,
    flushCache,
    addNewKey,
    exportData,
    importData,
    scanAndSyncScope,
  } = useLocalization();

  // Search & Filter state for the Data Grid
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [modifiedOnlyFilter, setModifiedOnlyFilter] = useState(false);

  // Modals state
  const [isBulkReplaceOpen, setIsBulkReplaceOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isDevSpecOpen, setIsDevSpecOpen] = useState(false);
  const [isScanningScope, setIsScanningScope] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'info' } | null>(null);
  const [isFlushing, setIsFlushing] = useState(false);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Scan & Sync Application Scope
  const handleScanAndSyncScope = () => {
    setIsScanningScope(true);
    try {
      const result = scanAndSyncScope();
      if (result.addedCount > 0) {
        showToast(
          `✨ Ditemukan & didaftarkan ${result.addedCount} kunci teks baru dari Taksonomi, Form Artis & Halaman Kustom!`,
          'success'
        );
      } else {
        showToast(
          `✅ Seluruh elemen aplikasi (${records.length / 3} entri) sudah tersinkronisasi lengkap dengan Kamus UI.`,
          'info'
        );
      }
    } catch (err) {
      showToast('Gagal memindai elemen aplikasi', 'info');
    } finally {
      setTimeout(() => setIsScanningScope(false), 400);
    }
  };

  // Handle Manual Flush Cache
  const handleFlushCache = () => {
    setIsFlushing(true);
    flushCache();
    setTimeout(() => {
      setIsFlushing(false);
      showToast('Cache UI Text berhasil dibersihkan! Seluruh antarmuka langsung disinkronkan.', 'success');
    }, 400);
  };

  // Filtered records based on active locale, search query, category, and type
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // 1. Locale matching
      if (record.locale !== currentLocale) return false;

      // 2. Category matching
      if (categoryFilter !== 'ALL' && record.category !== categoryFilter) return false;

      // 3. Type matching
      if (typeFilter !== 'ALL' && record.type !== typeFilter) return false;

      // 4. Modified only filter
      if (modifiedOnlyFilter && record.text_value === record.default_value) return false;

      // 5. Search query matching (matches text_key, current value, or description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKey = record.text_key.toLowerCase().includes(q);
        const matchVal = record.text_value.toLowerCase().includes(q);
        const matchDesc = (record.description || '').toLowerCase().includes(q);
        if (!matchKey && !matchVal && !matchDesc) return false;
      }

      return true;
    });
  }, [records, currentLocale, categoryFilter, typeFilter, modifiedOnlyFilter, searchQuery]);

  // Statistics calculation
  const totalKeysInLocale = useMemo(() => {
    return records.filter(r => r.locale === currentLocale).length;
  }, [records, currentLocale]);

  const modifiedKeysInLocale = useMemo(() => {
    return records.filter(r => r.locale === currentLocale && r.text_value !== r.default_value).length;
  }, [records, currentLocale]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. Header Zone & Main Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-300"
              title="Kembali ke Pengaturan"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-white uppercase font-display">
                DATABASE & I18N TEXT EDITOR
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-500 border border-indigo-500/30">
                DYNAMIC KEY-VALUE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Ubah seluruh teks UI (judul, label, placeholder, tooltip, pesan) secara terpusat dengan update seketika (zero downtime).
            </p>
          </div>
        </div>

        {/* Quick Navigation / Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenDynamicSchema && (
            <button
              onClick={onOpenDynamicSchema}
              className="px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/20 text-amber-500 dark:text-amber-400 transition-colors cursor-pointer"
              title="Buka Pengaturan Skema Dinamis (Kategori, Opsi, Traits, CSV)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Skema Dinamis</span>
            </button>
          )}
          <button
            onClick={() => setIsDevSpecOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
            title="Lihat Spesifikasi Skema SQL & API"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
            <span>SQL / API Docs</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content for Localization Grid */}
      <div className="space-y-4">
          {/* Header Controls & Filter Bar (Sticky on scroll for easy searching & filtering) */}
          <div className="sticky top-0 z-20 p-3 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-md space-y-3">
            {/* Top Row: Global Search, Locale Selector, & Action Buttons */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Global Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kata kunci teks, nama text_key (misal: app.header.title)..."
                  className="w-full min-h-[44px] pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-stone-950 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Language / Locale Selector & Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex-1 sm:flex-initial flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs font-semibold">
                  <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="text-stone-400 shrink-0">Bahasa:</span>
                  <select
                    value={currentLocale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-stone-900 dark:text-white font-bold cursor-pointer w-full text-xs sm:text-sm"
                  >
                    <option value="id" className="dark:bg-stone-900 text-stone-900 dark:text-white">🇮🇩 Indonesia (id)</option>
                    <option value="en" className="dark:bg-stone-900 text-stone-900 dark:text-white">🇬🇧 English (en)</option>
                    <option value="default" className="dark:bg-stone-900 text-stone-900 dark:text-white">⚙️ Default System</option>
                  </select>
                </div>

                {/* Scan & Sync Application Scope Button */}
                <button
                  type="button"
                  id="btn-scan-sync-ui-dictionary"
                  onClick={handleScanAndSyncScope}
                  disabled={isScanningScope}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                    isScanningScope
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 animate-pulse'
                      : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 border-indigo-500/40 hover:border-indigo-400'
                  }`}
                  title="Pindai seluruh elemen, tab form artis, taksonomi, dan halaman kustom untuk mendaftarkan kunci baru secara otomatis"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanningScope ? 'animate-spin' : ''}`} />
                  <span>Pindai Cakupan</span>
                </button>

                {/* Bulk Actions Button */}
                <button
                  type="button"
                  onClick={() => setIsBulkReplaceOpen(true)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  title="Cari & Ganti Teks Massal"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ganti Massal</span>
                </button>

                {/* Export & Import Button */}
                <button
                  type="button"
                  onClick={() => setIsExportImportOpen(true)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  title="Ekspor & Impor Kamus Teks (JSON / CSV)"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor / Impor</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Filters (Category, Type, Modified Only) & Result Count */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Dropdown */}
                <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                  <span className="text-stone-400 text-[11px] font-semibold hidden xs:inline">Halaman:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white text-xs focus:outline-none w-full sm:w-auto"
                  >
                    <option value="ALL">Semua Halaman (All)</option>
                    <option value="Global / Navbar">Global / Navbar</option>
                    <option value="Home / Catalog">Home / Catalog</option>
                    <option value="Detail Profil">Detail Profil</option>
                    <option value="Ranking & Leaderboard">Ranking & Leaderboard</option>
                    <option value="Compare Artis">Compare Artis</option>
                    <option value="Form Tambah / Edit">Form Tambah / Edit</option>
                    <option value="Settings & Preferensi">Settings & Preferensi</option>
                    <option value="Database Editor">Database Editor</option>
                    <option value="Notifikasi & Dialog">Notifikasi & Dialog</option>
                  </select>
                </div>

                {/* Type Dropdown */}
                <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                  <span className="text-stone-400 text-[11px] font-semibold hidden xs:inline">Tipe:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white text-xs focus:outline-none w-full sm:w-auto"
                  >
                    <option value="ALL">Semua Tipe (All)</option>
                    <option value="Title">Title (Judul)</option>
                    <option value="Description">Description (Deskripsi)</option>
                    <option value="Placeholder">Placeholder (Input)</option>
                    <option value="Button">Button (Tombol)</option>
                    <option value="Label">Label (Kolom)</option>
                    <option value="Tooltip">Tooltip (Bantuan)</option>
                    <option value="Notification">Notification (Pesan)</option>
                  </select>
                </div>

                {/* Modified Only Toggle */}
                <button
                  type="button"
                  onClick={() => setModifiedOnlyFilter(!modifiedOnlyFilter)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                    modifiedOnlyFilter
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-400 hover:text-white'
                  }`}
                >
                  <span>⚡ Dimodifikasi ({modifiedKeysInLocale})</span>
                </button>
              </div>

              {/* Counter status */}
              <div className="text-[11px] text-stone-400 text-right sm:text-left self-end sm:self-center">
                Menampilkan <strong className="text-indigo-400">{filteredRecords.length}</strong> dari {totalKeysInLocale} kunci teks
              </div>
            </div>
          </div>

          {/* Interactive Data Grid (Mobile Cards + Desktop Table with Click-to-Preview/Edit) */}
          <TextDataGrid
            records={filteredRecords}
            onUpdateRecord={(key, val, loc) => updateKey(key, val, loc)}
            activeLocale={currentLocale}
            isDark={true}
          />

          {/* 3. Footer / Action Bar */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Left: Quick Stats & Zero Downtime Indicator */}
            <div className="flex items-center gap-2.5 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-stone-800 dark:text-stone-200">Cache Active</span>
              </div>
              <span className="text-stone-700">•</span>
              <span className="text-stone-400">
                {modifiedKeysInLocale} teks dikustomisasi
              </span>
              <span className="text-stone-700">•</span>
              <span className="text-stone-400">
                Zero-Downtime Live Sync
              </span>
            </div>

            {/* Right: Flush Cache, Export/Import, History & Rollback Buttons */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Sync / Flush Cache Button */}
              <button
                type="button"
                onClick={handleFlushCache}
                disabled={isFlushing}
                className="min-h-[44px] flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                title="Segarkan dan sinkronkan cache UI seketika"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFlushing ? 'animate-spin' : ''}`} />
                <span>Bersihkan Cache</span>
              </button>

              {/* Export & Import */}
              <button
                type="button"
                onClick={() => setIsExportImportOpen(true)}
                className="min-h-[44px] flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-stone-400" />
                <span>Ekspor / Impor</span>
              </button>

              {/* History & Rollback */}
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="min-h-[44px] flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span>Riwayat ({history.length})</span>
              </button>
            </div>
          </div>
      </div>

      {/* Modals */}
      <BulkReplaceModal
        isOpen={isBulkReplaceOpen}
        onClose={() => setIsBulkReplaceOpen(false)}
        records={records}
        onApplyReplace={(f, r, l, c) => findAndReplace(f, r, l, c)}
        activeLocale={currentLocale}
        isDark={true}
      />

      <HistoryRollbackModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRollback={(id) => rollback(id)}
        isDark={true}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        onExport={(fmt, loc) => exportData(fmt, loc)}
        onImport={(content, fmt, mode) => importData(content, fmt, mode)}
        activeLocale={currentLocale}
        isDark={true}
      />

      <DeveloperSpecModal
        isOpen={isDevSpecOpen}
        onClose={() => setIsDevSpecOpen(false)}
        isDark={true}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-2xl animate-in slide-in-from-bottom border border-indigo-400">
          <Check className="w-4 h-4 text-emerald-300" />
          {toastMessage.text}
        </div>
      )}
    </div>
  );
};
