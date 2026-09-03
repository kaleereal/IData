import React, { useState } from 'react';
import { UITextChangeLog } from '../../types';
import { History, RotateCcw, Clock, Check, X, AlertCircle, Search } from 'lucide-react';

interface HistoryRollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: UITextChangeLog[];
  onRollback: (logId: string) => boolean;
  isDark?: boolean;
}

export const HistoryRollbackModal: React.FC<HistoryRollbackModalProps> = ({
  isOpen,
  onClose,
  history,
  onRollback,
  isDark = false,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter(h =>
    h.text_key.toLowerCase().includes(searchFilter.toLowerCase()) ||
    h.old_value.toLowerCase().includes(searchFilter.toLowerCase()) ||
    h.new_value.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (h.note && h.note.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const handleRollbackItem = (logId: string) => {
    const success = onRollback(logId);
    if (success) {
      setSuccessId(logId);
      setTimeout(() => setSuccessId(null), 2000);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`border rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh] ${
        isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Riwayat Perubahan & Rollback Teks</h3>
              <p className="text-xs text-stone-400">Audit trail log revisi teks UI dengan kemampuan pemulihan satu-klik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cari riwayat berdasarkan kunci, teks lama, teks baru, atau catatan..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
              isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
            }`}
          />
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Clock className={`w-8 h-8 mx-auto ${isDark ? 'text-stone-600' : 'text-stone-300'}`} />
              <p className={`font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Belum ada riwayat perubahan yang tercatat.
              </p>
              <p className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                Setiap kali Anda mengedit teks atau melakukan bulk replace, log revisi akan otomatis tersimpan di sini.
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50/70 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[11px]">
                      {item.text_key}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-stone-500/20 text-stone-400 text-[10px] uppercase font-bold">
                      {item.locale}
                    </span>
                    <span className="text-stone-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRollbackItem(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                      successId === item.id
                        ? 'bg-emerald-600 text-white'
                        : isDark
                        ? 'bg-stone-800 hover:bg-purple-900/60 hover:text-purple-300 text-stone-300'
                        : 'bg-stone-200 hover:bg-purple-100 hover:text-purple-900 text-stone-700'
                    }`}
                  >
                    {successId === item.id ? (
                      <>
                        <Check className="w-3 h-3" /> Dipulihkan!
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3" /> Rollback
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`p-2 rounded-lg border ${isDark ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                    <span className="block text-[10px] opacity-70 font-semibold mb-0.5">Teks Sebelum (Old):</span>
                    <p className="line-clamp-2">{item.old_value || '<Kosong>'}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                    <span className="block text-[10px] opacity-70 font-semibold mb-0.5">Teks Sesudah (New):</span>
                    <p className="line-clamp-2">{item.new_value || '<Kosong>'}</p>
                  </div>
                </div>

                {item.note && (
                  <p className="text-[10px] text-stone-400 mt-2 italic">
                    Catatan: {item.note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t shrink-0">
          <span className="text-xs text-stone-400">
            Total {filteredHistory.length} entri riwayat
          </span>
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
