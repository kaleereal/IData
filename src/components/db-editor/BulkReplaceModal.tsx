import React, { useState, useMemo } from 'react';
import { UITextRecord, UITextLocation } from '../../types';
import { ArrowRightLeft, Sparkles, Check, AlertCircle, RefreshCw, X } from 'lucide-react';

interface BulkReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: UITextRecord[];
  onApplyReplace: (findText: string, replaceText: string, locale?: string, category?: string) => number;
  activeLocale: string;
  isDark?: boolean;
}

export const BulkReplaceModal: React.FC<BulkReplaceModalProps> = ({
  isOpen,
  onClose,
  records,
  onApplyReplace,
  activeLocale,
  isDark = false,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [targetLocale, setTargetLocale] = useState(activeLocale);
  const [targetCategory, setTargetCategory] = useState<string>('ALL');
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // Calculate live matching count
  const matchingRecords = useMemo(() => {
    if (!findText.trim()) return [];
    return records.filter(r => {
      const matchLocale = targetLocale === 'all' || r.locale === targetLocale;
      const matchCategory = targetCategory === 'ALL' || r.category === targetCategory;
      return matchLocale && matchCategory && r.text_value.includes(findText);
    });
  }, [records, findText, targetLocale, targetCategory]);

  if (!isOpen) return null;

  const handleExecute = () => {
    if (!findText.trim()) return;
    const count = onApplyReplace(findText, replaceText, targetLocale, targetCategory);
    setResultMessage(`Berhasil mengganti ${count} teks yang cocok!`);
    setTimeout(() => {
      setResultMessage(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`border rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl ${
        isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Cari & Ganti Teks Massal (Bulk Replace)</h3>
              <p className="text-xs text-stone-400">Ganti teks berulang di seluruh antarmuka secara terpusat dalam satu klik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Find */}
          <div className="space-y-1.5">
            <label className="font-semibold block text-stone-400">Teks yang Ingin Dicari:</label>
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Contoh: Artis, Skor, Profil..."
              className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
              }`}
            />
          </div>

          {/* Replace With */}
          <div className="space-y-1.5">
            <label className="font-semibold block text-stone-400">Ganti Menjadi Teks Baru:</label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Contoh: Talent, Nilai, Biodata..."
              className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
              }`}
            />
          </div>

          {/* Scope Filters */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="font-semibold block text-stone-400">Bahasa / Locale:</label>
              <select
                value={targetLocale}
                onChange={(e) => setTargetLocale(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              >
                <option value={activeLocale}>Bahasa Aktif Saat Ini ({activeLocale})</option>
                <option value="id">Bahasa Indonesia (id)</option>
                <option value="en">English (en)</option>
                <option value="default">Bawaan (default)</option>
                <option value="all">Semua Bahasa (Global)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold block text-stone-400">Cakupan Lokasi:</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              >
                <option value="ALL">Semua Halaman & Komponen</option>
                <option value="Global / Navbar">Global / Navbar</option>
                <option value="Home / Catalog">Home / Catalog</option>
                <option value="Detail Profil">Detail Profil</option>
                <option value="Ranking & Leaderboard">Ranking & Leaderboard</option>
                <option value="Compare Artis">Compare Artis</option>
                <option value="Form Tambah / Edit">Form Tambah / Edit</option>
                <option value="Settings & Preferensi">Settings & Preferensi</option>
                <option value="Notifikasi & Dialog">Notifikasi & Dialog</option>
              </select>
            </div>
          </div>

          {/* Real-time Match Preview */}
          {findText.trim() && (
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              matchingRecords.length > 0
                ? (isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900')
                : (isDark ? 'bg-stone-950 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600')
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <span>Pratinjau Hasil Pencarian:</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20">
                  {matchingRecords.length} teks ditemukan
                </span>
              </div>
              {matchingRecords.length > 0 ? (
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {matchingRecords.slice(0, 5).map(r => (
                    <div key={r.id} className="p-1.5 rounded bg-black/10 flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] truncate max-w-[160px] opacity-80">{r.text_key}</span>
                      <span className="truncate flex-1 text-right">
                        "{r.text_value}" ➔ <strong className="text-amber-400">"{r.text_value.replaceAll(findText, replaceText)}"</strong>
                      </span>
                    </div>
                  ))}
                  {matchingRecords.length > 5 && (
                    <p className="text-[10px] text-center opacity-70 italic">
                      + {matchingRecords.length - 5} teks lainnya akan ikut diperbarui
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs">Tidak ada teks yang cocok dengan kata kunci "{findText}".</p>
              )}
            </div>
          )}

          {resultMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4" />
              {resultMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold ${
              isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            Batal
          </button>
          <button
            onClick={handleExecute}
            disabled={!findText.trim() || matchingRecords.length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              !findText.trim() || matchingRecords.length === 0
                ? 'opacity-50 cursor-not-allowed bg-stone-700 text-stone-400'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Terapkan Ganti Massal ({matchingRecords.length})
          </button>
        </div>
      </div>
    </div>
  );
};
