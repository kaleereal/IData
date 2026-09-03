import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UITextRecord, UITextType, UITextLocation } from '../../types';
import {
  Copy,
  Check,
  Info,
  RotateCcw,
  Sparkles,
  Search,
  SlidersHorizontal,
  Eye,
  FileText,
  AlertCircle,
  Clock,
  Tag,
  Edit3,
  CornerDownLeft,
  X,
  Layers,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface TextDataGridProps {
  records: UITextRecord[];
  onUpdateRecord: (key: string, value: string, locale: string) => void;
  activeLocale: string;
  isDark?: boolean;
}

export const TextDataGrid: React.FC<TextDataGridProps> = ({
  records,
  onUpdateRecord,
  activeLocale,
  isDark = true,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Virtualized Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50); // 50 items per page for instantaneous render
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  // Reset page to 1 when filtered records change
  useEffect(() => {
    setCurrentPage(1);
    setJumpPageInput('1');
  }, [records.length, activeLocale]);

  // Total pages calculation
  const totalPages = useMemo(() => {
    if (pageSize === 0) return 1;
    return Math.max(1, Math.ceil(records.length / pageSize));
  }, [records.length, pageSize]);

  // Sliced records for instantaneous 60fps rendering without DOM congestion
  const paginatedRecords = useMemo(() => {
    if (pageSize === 0) return records;
    const startIndex = (currentPage - 1) * pageSize;
    return records.slice(startIndex, startIndex + pageSize);
  }, [records, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    setJumpPageInput(String(validPage));
  };
  
  // Modal & Live Editor State
  const [activePreviewRecord, setActivePreviewRecord] = useState<UITextRecord | null>(null);
  const [modalDraftValue, setModalDraftValue] = useState<string>('');
  const [modalSaveToast, setModalSaveToast] = useState<boolean>(false);
  
  // Ref for auto-expanding textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // When a record is selected for preview/edit, initialize the draft value and focus textarea
  useEffect(() => {
    if (activePreviewRecord) {
      setModalDraftValue(activePreviewRecord.text_value);
      setModalSaveToast(false);
      
      // Auto-focus and adjust height on next tick
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            textareaRef.current.value.length,
            textareaRef.current.value.length
          );
          adjustTextareaHeight();
        }
      }, 100);
    }
  }, [activePreviewRecord]);

  // Adjust textarea height dynamically based on scrollHeight
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const nextHeight = Math.max(90, textareaRef.current.scrollHeight);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  };

  const handleCopyKey = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Open the Live Editor modal when clicking the Current Value or row
  const handleOpenEditModal = (record: UITextRecord) => {
    setActivePreviewRecord(record);
  };

  // Save changes from the Live Editor Modal
  const handleSaveModal = () => {
    if (!activePreviewRecord) return;
    
    // Trigger update in main state & cache
    onUpdateRecord(activePreviewRecord.text_key, modalDraftValue, activePreviewRecord.locale);
    
    // Show brief feedback and close
    setModalSaveToast(true);
    setTimeout(() => {
      setActivePreviewRecord(null);
      setModalSaveToast(false);
    }, 450);
  };

  // Reset modal draft to default value
  const handleResetModalDefault = () => {
    if (!activePreviewRecord) return;
    setModalDraftValue(activePreviewRecord.default_value);
    setTimeout(() => adjustTextareaHeight(), 50);
  };

  // Close modal without saving
  const handleCloseModal = () => {
    setActivePreviewRecord(null);
    setModalDraftValue('');
  };

  // Keyboard shortcut inside modal: Ctrl+Enter or Cmd+Enter to Save, Escape to Close
  const handleKeyDownInModal = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveModal();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCloseModal();
    }
  };

  const getTypeBadgeStyle = (type: UITextType) => {
    switch (type) {
      case 'Title':
        return isDark
          ? 'bg-purple-950/70 text-purple-300 border-purple-800'
          : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Description':
        return isDark
          ? 'bg-stone-800 text-stone-300 border-stone-700'
          : 'bg-stone-100 text-stone-700 border-stone-200';
      case 'Placeholder':
        return isDark
          ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
          : 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Button':
        return isDark
          ? 'bg-amber-950/70 text-amber-300 border-amber-800'
          : 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Label':
        return isDark
          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Tooltip':
        return isDark
          ? 'bg-blue-950/70 text-blue-300 border-blue-800'
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Notification':
        return isDark
          ? 'bg-rose-950/70 text-rose-300 border-rose-800'
          : 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Pagination & Stats Header */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 flex-wrap text-xs ${
        isDark ? 'bg-stone-900/90 border-stone-800 text-stone-300' : 'bg-white border-stone-200 text-stone-700'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold">
            Menampilkan {records.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {pageSize === 0 ? records.length : Math.min(currentPage * pageSize, records.length)} dari {records.length} kunci
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-bold">
            Halaman {currentPage} / {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-400">Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isDark ? 'bg-stone-950 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-300 text-stone-900'
              }`}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={0}>Semua ({records.length})</option>
            </select>
          </div>

          {/* Quick Pagination Buttons (min 44px touch-friendly) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(1)}
              className={`min-w-[36px] min-h-[36px] p-1.5 rounded-xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none ${
                isDark ? 'bg-stone-950 border-stone-800 hover:bg-stone-800 text-stone-300' : 'bg-stone-50 border-stone-300 hover:bg-stone-100 text-stone-700'
              }`}
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`min-w-[36px] min-h-[36px] p-1.5 rounded-xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none ${
                isDark ? 'bg-stone-950 border-stone-800 hover:bg-stone-800 text-stone-300' : 'bg-stone-50 border-stone-300 hover:bg-stone-100 text-stone-700'
              }`}
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono px-2 font-bold text-xs">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`min-w-[36px] min-h-[36px] p-1.5 rounded-xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none ${
                isDark ? 'bg-stone-950 border-stone-800 hover:bg-stone-800 text-stone-300' : 'bg-stone-50 border-stone-300 hover:bg-stone-100 text-stone-700'
              }`}
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(totalPages)}
              className={`min-w-[36px] min-h-[36px] p-1.5 rounded-xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none ${
                isDark ? 'bg-stone-950 border-stone-800 hover:bg-stone-800 text-stone-300' : 'bg-stone-50 border-stone-300 hover:bg-stone-100 text-stone-700'
              }`}
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Mobile Cards View (Hidden on Tablet/Desktop, Touch-First on Smartphone) */}
      <div className="block md:hidden space-y-3">
        {paginatedRecords.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center space-y-2 ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <Search className={`w-8 h-8 mx-auto ${isDark ? 'text-stone-600' : 'text-stone-400'}`} />
            <p className={`font-semibold text-sm ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
              Tidak ada kunci teks yang cocok.
            </p>
            <p className="text-xs text-stone-500">
              Coba sesuaikan kata kunci atau bersihkan filter pencarian.
            </p>
          </div>
        ) : (
          paginatedRecords.map((record) => {
            const isModified = record.text_value !== record.default_value;

            return (
              <div
                key={`mobile_${record.id || `${record.locale}_${record.text_key}`}`}
                onClick={() => handleOpenEditModal(record)}
                className={`virtual-row-item p-4 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] shadow-sm ${
                  isDark
                    ? 'bg-stone-900 border-stone-800 hover:border-indigo-500/50 hover:bg-stone-850'
                    : 'bg-white border-stone-200 hover:border-indigo-400 hover:bg-stone-50'
                } ${isModified ? (isDark ? 'border-amber-500/30 bg-amber-950/5' : 'border-amber-300 bg-amber-50/30') : ''}`}
              >
                {/* Header: Key & Badges */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded border font-semibold truncate max-w-[200px] ${
                      isDark
                        ? 'bg-stone-950 text-indigo-300 border-indigo-900/60'
                        : 'bg-stone-100 text-indigo-900 border-indigo-200'
                    }`}>
                      {record.text_key}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getTypeBadgeStyle(record.type)}`}>
                      {record.type}
                    </span>
                    {isModified && (
                      <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Custom
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleCopyKey(e, record.text_key)}
                    className={`min-w-[36px] min-h-[36px] p-2 rounded-xl flex items-center justify-center transition-colors text-stone-400 hover:text-stone-200 ${
                      isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-100'
                    }`}
                    title="Salin Key ID"
                    aria-label="Salin Key ID"
                  >
                    {copiedKey === record.text_key ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Location & Context */}
                <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-2">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    {record.category}
                  </span>
                  {record.description && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[180px]">{record.description}</span>
                    </>
                  )}
                </div>

                {/* Clickable Value Box (Touch target >= 44px) */}
                <div
                  className={`min-h-[48px] p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    isDark
                      ? 'bg-stone-950/80 border-stone-800 hover:border-indigo-500/40 text-stone-100'
                      : 'bg-stone-50 border-stone-200 hover:border-indigo-400 text-stone-900'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed flex-1">
                    {record.text_value}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 shrink-0">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop & Tablet Table View (Hidden on Mobile) */}
      <div className={`hidden md:block overflow-x-auto rounded-2xl border shadow-sm ${
        isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200'
      }`}>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
              isDark ? 'bg-stone-800/80 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}>
              <th className="py-3.5 px-4 w-[260px]">Key ID (Unique Key)</th>
              <th className="py-3.5 px-3 w-[110px]">Tipe Elemen</th>
              <th className="py-3.5 px-3 w-[150px]">Lokasi / Halaman</th>
              <th className="py-3.5 px-4">Current Value (Klik untuk Edit di Pratinjau)</th>
              <th className="py-3.5 px-3 w-[90px] text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-stone-800/80' : 'divide-stone-100'}`}>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Search className={`w-8 h-8 ${isDark ? 'text-stone-600' : 'text-stone-300'}`} />
                    <p className={`font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                      Tidak ada kunci teks yang cocok dengan kriteria filter.
                    </p>
                    <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Coba ganti kata kunci pencarian atau reset filter kategori/tipe.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => {
                const isModified = record.text_value !== record.default_value;

                return (
                  <tr
                    key={record.id || `${record.locale}_${record.text_key}`}
                    className={`virtual-row-item transition-colors group ${
                      isDark ? 'hover:bg-stone-800/40' : 'hover:bg-stone-50/80'
                    } ${isModified ? (isDark ? 'bg-amber-950/10' : 'bg-amber-50/30') : ''}`}
                  >
                    {/* 1. Key ID */}
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-mono text-xs px-2 py-0.5 rounded border select-all truncate max-w-[190px] font-semibold ${
                              isDark
                                ? 'bg-stone-950 text-indigo-300 border-indigo-900/60'
                                : 'bg-stone-100 text-indigo-900 border-indigo-200'
                            }`} title={record.text_key}>
                              {record.text_key}
                            </span>
                            {isModified && (
                              <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-medium rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30" title="Nilai telah dimodifikasi dari bawaan">
                                Custom
                              </span>
                            )}
                          </div>
                          {record.description && (
                            <p className={`text-[11px] line-clamp-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`} title={record.description}>
                              {record.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyKey(e, record.text_key)}
                          className={`p-1.5 rounded-lg transition-colors text-stone-400 hover:text-stone-600 ${
                            isDark ? 'hover:bg-stone-800 hover:text-stone-200' : 'hover:bg-stone-200'
                          }`}
                          title="Salin Key ID"
                          aria-label="Salin Key ID"
                        >
                          {copiedKey === record.text_key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 2. Tipe Elemen */}
                    <td className="py-3 px-3 align-top">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getTypeBadgeStyle(record.type)}`}>
                        {record.type}
                      </span>
                    </td>

                    {/* 3. Lokasi / Halaman */}
                    <td className="py-3 px-3 align-top">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        isDark ? 'text-stone-300' : 'text-stone-700'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                        {record.category}
                      </span>
                    </td>

                    {/* 4. Current Value (CLICKABLE TO OPEN LIVE PREVIEW & EDITOR) */}
                    <td className="py-2.5 px-4 align-top">
                      <div
                        onClick={() => handleOpenEditModal(record)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenEditModal(record);
                          }
                        }}
                        className={`group/val cursor-pointer p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isDark
                            ? 'bg-stone-950/70 border-stone-800 hover:border-indigo-500/60 hover:bg-stone-950 text-stone-100'
                            : 'bg-stone-50/70 border-stone-200 hover:border-indigo-400 hover:bg-white text-stone-900 shadow-sm'
                        }`}
                        title="Klik untuk membuka Pratinjau & Edit Teks"
                      >
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed break-words">
                            {record.text_value}
                          </p>
                          <span className={`text-[10px] block ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                            {record.text_value.length} karakter
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover/val:bg-indigo-600 group-hover/val:text-white transition-all shrink-0">
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </div>
                      </div>
                    </td>

                    {/* 5. Action / Info Icon */}
                    <td className="py-3 px-3 align-top text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(record)}
                        className={`p-2 rounded-xl border transition-all ${
                          isDark
                            ? 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-500'
                            : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-500'
                        }`}
                        title="Buka Pratinjau Lokasi & Edit Teks"
                        aria-label="Buka Pratinjau Lokasi & Edit Teks"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination Controls Bar */}
      {totalPages > 1 && (
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 flex-wrap text-xs ${
          isDark ? 'bg-stone-900/90 border-stone-800 text-stone-300' : 'bg-white border-stone-200 text-stone-700'
        }`}>
          <div className="flex items-center gap-2">
            <span>
              Menampilkan {Math.min(paginatedRecords.length, pageSize)} item dari {records.length} total
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(1)}
              className={`min-w-[40px] min-h-[40px] px-2.5 py-1.5 rounded-xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none ${
                isDark ? 'bg-stone-950 border-stone-800 hover:bg-stone-800 text-stone-300' : 'bg-stone-50 border-stone-300 hover:bg-stone-100 text-stone-700'
              }`}
              title="Awal"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`min-w-[40px] min-h-[40px] px-3 py-1.5 rounded-xl border flex items-center justify-center gap-1 font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none ${
                isDark ? 'bg-stone-950 border-stone-800 hover:bg-stone-800 text-stone-300' : 'bg-stone-50 border-stone-300 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="font-mono px-3 font-bold text-xs">
              Hal {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`min-w-[40px] min-h-[40px] px-3 py-1.5 rounded-xl border flex items-center justify-center gap-1 font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none ${
                isDark ? 'bg-stone-950 border-stone-800 hover:bg-stone-800 text-stone-300' : 'bg-stone-50 border-stone-300 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(totalPages)}
              className={`min-w-[40px] min-h-[40px] px-2.5 py-1.5 rounded-xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none ${
                isDark ? 'bg-stone-950 border-stone-800 hover:bg-stone-800 text-stone-300' : 'bg-stone-50 border-stone-300 hover:bg-stone-100 text-stone-700'
              }`}
              title="Akhir"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Live Editor & Text Location Preview Modal */}
      {activePreviewRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div
            className={`border rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
              isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800/60 pb-3.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    Pratinjau Lokasi Teks UI & Live Editor
                  </h3>
                  <p className="text-xs text-indigo-400 font-mono font-semibold truncate max-w-[260px] sm:max-w-md">
                    {activePreviewRecord.text_key}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className={`min-w-[36px] min-h-[36px] p-2 rounded-xl transition-colors flex items-center justify-center ${
                  isDark ? 'hover:bg-stone-800 text-stone-400 hover:text-white' : 'hover:bg-stone-100 text-stone-600'
                }`}
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="space-y-4 text-xs sm:text-sm overflow-y-auto flex-1 pr-1">
              {/* Context Badges */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                  <span className="text-stone-400 block text-[11px] mb-1 font-semibold">Tipe Komponen</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getTypeBadgeStyle(activePreviewRecord.type)}`}>
                    {activePreviewRecord.type}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                  <span className="text-stone-400 block text-[11px] mb-1 font-semibold">Halaman / Lokasi</span>
                  <span className="font-semibold text-xs text-indigo-300 block truncate">
                    {activePreviewRecord.category}
                  </span>
                </div>
              </div>

              {/* Description / Context Note */}
              <div className={`p-3 rounded-xl border space-y-1 ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-stone-400 block text-[11px] font-semibold">Konteks & Fungsi UI:</span>
                <p className="font-medium text-xs leading-relaxed text-stone-300">
                  {activePreviewRecord.description || 'Elemen teks standar pada antarmuka aplikasi.'}
                </p>
              </div>

              {/* LIVE EDITABLE TEXT FIELD (Auto-expanding, Auto-focus, No Cutoff) */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-stone-950 border-indigo-500/40 ring-1 ring-indigo-500/20' : 'bg-indigo-50/40 border-indigo-200 ring-1 ring-indigo-500/10'
              }`}>
                <div className="flex items-center justify-between">
                  <label htmlFor="live-text-editor-input" className="font-bold text-xs sm:text-sm text-indigo-400 flex items-center gap-1.5 cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5" />
                    Teks Saat Ini (LIVE Editor)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {modalDraftValue.length} karakter
                    </span>
                    {modalDraftValue !== activePreviewRecord.default_value && (
                      <button
                        type="button"
                        onClick={handleResetModalDefault}
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-0.5 cursor-pointer"
                        title="Kembalikan ke nilai default awal"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Reset Default
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    id="live-text-editor-input"
                    ref={textareaRef}
                    value={modalDraftValue}
                    onChange={(e) => {
                      setModalDraftValue(e.target.value);
                      adjustTextareaHeight();
                    }}
                    onKeyDown={handleKeyDownInModal}
                    placeholder="Ketik teks antarmuka yang diinginkan di sini..."
                    rows={3}
                    className={`w-full p-3.5 rounded-xl border text-sm font-medium leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden resize-none ${
                      isDark
                        ? 'bg-stone-900 border-stone-700 text-white placeholder-stone-600 focus:bg-stone-900'
                        : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:bg-white shadow-inner'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-stone-400 italic">
                  Tip: Tekan <kbd className="px-1 py-0.5 bg-stone-800 rounded text-[9px] font-mono">Ctrl+Enter</kbd> untuk menyimpan seketika.
                </p>
              </div>

              {/* Default Value Comparison */}
              <div className={`p-3 rounded-xl border space-y-1 ${isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-stone-400 block text-[11px] font-semibold">Teks Bawaan Sistem (Default):</span>
                <p className="text-stone-400 font-mono text-xs italic break-words">
                  "{activePreviewRecord.default_value}"
                </p>
              </div>

              {/* Success Toast inside modal */}
              {modalSaveToast && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                  <Check className="w-4 h-4" />
                  Perubahan teks berhasil disimpan dan aktif seketika!
                </div>
              )}
            </div>

            {/* Modal Footer Actions (Save & Close/Cancel) */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-800/60 shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <X className="w-4 h-4" />
                Tutup Pratinjau
              </button>

              <button
                type="button"
                onClick={handleSaveModal}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

