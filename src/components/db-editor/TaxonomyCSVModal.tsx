import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, Check, AlertCircle, X, Sparkles, RefreshCw, FileText } from 'lucide-react';
import {
  MasterTaxonomyData,
  exportTaxonomyToCSV,
  importTaxonomyFromCSV,
  TaxonomyImportResult,
} from '../../utils/taxonomyManager';

interface TaxonomyCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxonomyData: MasterTaxonomyData;
  onTaxonomyUpdated: (newData: MasterTaxonomyData) => void;
  isDark?: boolean;
}

export const TaxonomyCSVModal: React.FC<TaxonomyCSVModalProps> = ({
  isOpen,
  onClose,
  taxonomyData,
  onTaxonomyUpdated,
  isDark = true,
}) => {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [importStatus, setImportStatus] = useState<TaxonomyImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    try {
      const csv = exportTaxonomyToCSV(taxonomyData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `master_taksonomi_metadata_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export taxonomy CSV:', e);
      setErrorMessage('Gagal mengekspor data taksonomi ke CSV.');
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Format berkas harus berakhiran .csv');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          setErrorMessage('Gagal membaca isi berkas CSV.');
          setIsProcessing(false);
          return;
        }

        const result = importTaxonomyFromCSV(content, taxonomyData);
        setIsProcessing(false);

        if (result.success) {
          setImportStatus(result);
          onTaxonomyUpdated(result.data);
        } else {
          setErrorMessage(result.stats.errors[0] || 'Validasi CSV gagal.');
        }
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMessage(err.message || 'Terjadi kesalahan saat memproses CSV.');
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('Gagal membaca file dari disk.');
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

  // Count total fields in taxonomy
  let totalItemsCount = 0;
  taxonomyData.sections.forEach(s =>
    s.categories.forEach(c =>
      c.subcategories.forEach(sub => {
        totalItemsCount += sub.items.length;
      })
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`border rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl ${
          isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight">
                Ekspor & Impor CSV Master Taksonomi
              </h3>
              <p className="text-xs text-stone-400">
                Kelola 10 kolom metadata lengkap untuk kolaborasi massal spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl p-1 bg-stone-950 border border-stone-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('export');
              setImportStatus(null);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'export'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('import');
              setImportStatus(null);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'import'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Impor CSV (Upsert)</span>
          </button>
        </div>

        {/* TAB 1: EXPORT CSV */}
        {tab === 'export' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-300">Format Kolom Metadata (10 Kolom):</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {totalItemsCount} Field Terdaftar
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>1. Section</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>2. Kategori</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>3. Sub-kategori</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>4. System Key</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>5. Teks UI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>6. Teks Form Artis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>7. Deskripsi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>8. Panduan Penilaian</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>9. Format Field</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>10. Status Wajib Diisi</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-400">
              Berkas CSV kompatibel dengan Microsoft Excel, Google Sheets, LibreOffice Calc, dan database importer.
            </p>

            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas CSV Sekarang ({totalItemsCount} Field)</span>
            </button>
          </div>
        )}

        {/* TAB 2: IMPORT CSV */}
        {tab === 'import' && (
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-stone-700 bg-stone-950/60 hover:border-emerald-500/60 hover:bg-stone-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-stone-200 block text-xs sm:text-sm">
                  Klik untuk memilih file CSV atau tarik ke sini
                </span>
                <span className="text-[11px] text-stone-500">
                  Format berkas .csv dengan kolom wajib: System Key, Teks UI, Teks Form Artis
                </span>
              </div>
            </div>

            {/* Validation & Import Results */}
            {isProcessing && (
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center gap-2 text-stone-300 text-xs">
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Memvalidasi dan memproses skema taksonomi...</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Gagal Memproses CSV:</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {importStatus && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Impor CSV Berhasil & Cache Telah Di-Flush!</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block">Total Diproses</span>
                    <span className="text-sm font-bold text-white">{importStatus.stats.total}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-emerald-400 block">Diperbarui</span>
                    <span className="text-sm font-bold text-emerald-400">{importStatus.stats.updated}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-cyan-400 block">Baru Ditambahkan</span>
                    <span className="text-sm font-bold text-cyan-400">{importStatus.stats.added}</span>
                  </div>
                </div>
                {importStatus.stats.errors.length > 0 && (
                  <div className="text-[11px] text-amber-400/90 pt-1">
                    Catatan: {importStatus.stats.errors.length} peringatan saat parsing baris.
                  </div>
                )}
              </div>
            )}

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 text-[11px] text-stone-400 space-y-1">
              <span className="font-bold text-stone-300 block">Mekanisme Upsert & Auto-Flush:</span>
              <ul className="list-disc list-inside space-y-0.5 text-stone-400">
                <li>Jika <b>System Key</b> sudah ada, data label, deskripsi, panduan, dan format akan langsung di-update.</li>
                <li>Jika <b>System Key</b> belum ada, item baru akan dibuat dan dimasukkan ke Section/Kategori terkait.</li>
                <li>Setelah impor berhasil, sistem memicu <b>Auto-Flush Cache</b> agar UI Halaman Artis tersinkron seketika.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
