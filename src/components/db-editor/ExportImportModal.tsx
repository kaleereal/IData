import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, Check, AlertCircle, X, Sparkles } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'json' | 'csv', localeFilter?: string) => void;
  onImport: (content: string, format: 'json' | 'csv', mode: 'merge' | 'replace') => { success: boolean; count: number; error?: string };
  activeLocale: string;
  isDark?: boolean;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  activeLocale,
  isDark = false,
}) => {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportLocale, setExportLocale] = useState<string>('all');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportClick = () => {
    onExport(exportFormat, exportLocale);
  };

  const processFile = (file: File) => {
    const isJson = file.name.endsWith('.json');
    const isCsv = file.name.endsWith('.csv');

    if (!isJson && !isCsv) {
      setImportStatus({ success: false, message: 'Format berkas harus .json atau .csv' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        setImportStatus({ success: false, message: 'Gagal membaca berkas' });
        return;
      }

      const result = onImport(content, isJson ? 'json' : 'csv', importMode);
      if (result.success) {
        setImportStatus({
          success: true,
          message: `Berhasil mengimpor ${result.count} kunci teks ke kamus lokalisasi!`,
        });
      } else {
        setImportStatus({
          success: false,
          message: result.error || 'Gagal mengimpor data',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl ${
        isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Ekspor & Impor Kamus Teks (i18n)</h3>
              <p className="text-xs text-stone-400">Unduh atau unggah file JSON / CSV untuk kolaborasi spreadsheet massal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl p-1 bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-semibold">
          <button
            onClick={() => { setTab('export'); setImportStatus(null); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              tab === 'export'
                ? 'bg-white dark:bg-stone-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Download className="w-4 h-4" /> Ekspor File
          </button>
          <button
            onClick={() => { setTab('import'); setImportStatus(null); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              tab === 'import'
                ? 'bg-white dark:bg-stone-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Upload className="w-4 h-4" /> Impor File
          </button>
        </div>

        {/* Tab: Export */}
        {tab === 'export' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-2">
              <label className="font-semibold block text-stone-400">Pilih Format Berkas:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportFormat('json')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    exportFormat === 'json'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold'
                      : (isDark ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-stone-50')
                  }`}
                >
                  <span className="text-lg">📦</span>
                  <div className="text-left">
                    <span className="block font-semibold">JSON Format</span>
                    <span className="text-[10px] opacity-70">Struktur objek lengkap</span>
                  </div>
                </button>

                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    exportFormat === 'csv'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold'
                      : (isDark ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-stone-50')
                  }`}
                >
                  <span className="text-lg">📊</span>
                  <div className="text-left">
                    <span className="block font-semibold">CSV Spreadsheet</span>
                    <span className="text-[10px] opacity-70">Cocok untuk Excel & Sheets</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold block text-stone-400">Bahasa yang Diekspor:</label>
              <select
                value={exportLocale}
                onChange={(e) => setExportLocale(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              >
                <option value="all">Semua Bahasa (Global Kamus)</option>
                <option value="id">Bahasa Indonesia (id)</option>
                <option value="en">English (en)</option>
                <option value="default">Default / Bawaan</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={handleExportClick}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 text-xs sm:text-sm"
              >
                <Download className="w-4 h-4" />
                Unduh Berkas {exportFormat.toUpperCase()} Sekarang
              </button>
            </div>
          </div>
        )}

        {/* Tab: Import */}
        {tab === 'import' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <label className="font-semibold block text-stone-400">Metode Penggabungan Data:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setImportMode('merge')}
                  className={`p-2.5 rounded-xl border text-left text-xs ${
                    importMode === 'merge'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold'
                      : (isDark ? 'border-stone-800 bg-stone-950 text-stone-400' : 'border-stone-200 bg-stone-50 text-stone-700')
                  }`}
                >
                  <strong className="block">Gabungkan (Merge)</strong>
                  <span className="text-[10px] opacity-70">Perbarui kunci yang ada tanpa hapus</span>
                </button>
                <button
                  onClick={() => setImportMode('replace')}
                  className={`p-2.5 rounded-xl border text-left text-xs ${
                    importMode === 'replace'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500 font-bold'
                      : (isDark ? 'border-stone-800 bg-stone-950 text-stone-400' : 'border-stone-200 bg-stone-50 text-stone-700')
                  }`}
                >
                  <strong className="block">Timpa Semua (Replace)</strong>
                  <span className="text-[10px] opacity-70">Ganti seluruh isi basis data</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : isDark
                  ? 'border-stone-800 hover:border-stone-700 bg-stone-950'
                  : 'border-stone-300 hover:border-stone-400 bg-stone-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
              <p className="font-semibold text-xs sm:text-sm">Klik atau seret file JSON / CSV ke sini</p>
              <p className="text-[11px] text-stone-400 mt-1">Mendukung format ekspor aplikasi (.json dan .csv)</p>
            </div>

            {importStatus && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 font-medium ${
                importStatus.success
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-rose-500/20 border-rose-500 text-rose-400'
              }`}>
                {importStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {importStatus.message}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-xl text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
