import React, { useState, useEffect } from 'react';
import {
  BaseTaxonomyElement,
  TaxonomyItem,
  TaxonomyChoiceItem,
  FieldDataType,
} from '../../utils/taxonomyManager';
import {
  X,
  Save,
  Trash2,
  AlertTriangle,
  Plus,
  Tag,
  HelpCircle,
  Layers,
  Folder,
  Sliders,
  Type,
  Hash,
  Calendar,
  Link,
  List,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export interface TaxonomyModalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  element: (BaseTaxonomyElement | TaxonomyItem) | null;
  level: 'section' | 'category' | 'subcategory' | 'item';
  onSave: (elementId: string, updates: Partial<BaseTaxonomyElement | TaxonomyItem>) => void;
  onDelete?: (elementId: string, level: string, systemKey: string) => void;
  isDark?: boolean;
}

export const TaxonomyModalEditor: React.FC<TaxonomyModalEditorProps> = ({
  isOpen,
  onClose,
  element,
  level,
  onSave,
  onDelete,
  isDark = true,
}) => {
  const isItem = level === 'item';
  const itemElement = isItem && element ? (element as TaxonomyItem) : null;

  // Metadata States
  const [systemKey, setSystemKey] = useState(element?.systemKey || '');
  const [appLabel, setAppLabel] = useState(element?.appLabel || '');
  const [formLabel, setFormLabel] = useState(element?.formLabel || '');
  const [description, setDescription] = useState(element?.description || '');
  const [evaluationGuideline, setEvaluationGuideline] = useState(element?.evaluationGuideline || '');
  const [functionLocation, setFunctionLocation] = useState(element?.functionLocation || '');

  // Field Specific States (Level 4: Item)
  const [isRequired, setIsRequired] = useState(itemElement ? itemElement.isRequired : false);
  const [fieldType, setFieldType] = useState<FieldDataType>(itemElement ? itemElement.fieldType : 'text');
  const [unit, setUnit] = useState(itemElement?.formatConfig?.unit || '');
  const [placeholder, setPlaceholder] = useState(itemElement?.formatConfig?.placeholder || '');
  const [urlPrefix, setUrlPrefix] = useState(itemElement?.formatConfig?.urlPrefix || '');
  const [options, setOptions] = useState<TaxonomyChoiceItem[]>(itemElement?.formatConfig?.options || []);

  // UI States
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when element prop changes
  useEffect(() => {
    if (element) {
      setSystemKey(element.systemKey || '');
      setAppLabel(element.appLabel || '');
      setFormLabel(element.formLabel || '');
      setDescription(element.description || '');
      setEvaluationGuideline(element.evaluationGuideline || '');
      setFunctionLocation(element.functionLocation || '');

      if (level === 'item') {
        const it = element as TaxonomyItem;
        setIsRequired(it.isRequired ?? false);
        setFieldType(it.fieldType || 'text');
        setUnit(it.formatConfig?.unit || '');
        setPlaceholder(it.formatConfig?.placeholder || '');
        setUrlPrefix(it.formatConfig?.urlPrefix || '');
        setOptions(it.formatConfig?.options || []);
      }
      setConfirmDelete(false);
      setSaveSuccess(false);
    }
  }, [element, level]);

  if (!isOpen || !element) return null;

  const handleAddOption = () => {
    const newId = `opt_${Date.now()}`;
    const newOpt: TaxonomyChoiceItem = {
      id: newId,
      systemValue: `val_${options.length + 1}`,
      appLabel: `Opsi ${options.length + 1}`,
      formLabel: `Pilihan ${options.length + 1}`,
      badgeColor: '#6366f1',
    };
    setOptions([...options, newOpt]);
  };

  const handleUpdateOption = (optId: string, updates: Partial<TaxonomyChoiceItem>) => {
    setOptions(options.map((o) => (o.id === optId ? { ...o, ...updates } : o)));
  };

  const handleRemoveOption = (optId: string) => {
    setOptions(options.filter((o) => o.id !== optId));
  };

  const handleSave = () => {
    const updates: any = {
      systemKey: systemKey.trim() || element.systemKey,
      appLabel: appLabel.trim() || systemKey,
      formLabel: formLabel.trim() || appLabel || systemKey,
      description: description.trim(),
      evaluationGuideline: evaluationGuideline.trim(),
      functionLocation: functionLocation.trim(),
    };

    if (isItem) {
      updates.isRequired = isRequired;
      updates.fieldType = fieldType;
      updates.formatConfig = {
        unit: unit.trim() || undefined,
        placeholder: placeholder.trim() || undefined,
        urlPrefix: urlPrefix.trim() || undefined,
        options: ['single_select', 'multi_select'].includes(fieldType) ? options : undefined,
      };
    }

    onSave(element.id, updates);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 350);
  };

  const getLevelBadge = () => {
    switch (level) {
      case 'section':
        return { label: 'Section (Tingkat 1)', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
      case 'category':
        return { label: 'Kategori (Tingkat 2)', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'subcategory':
        return { label: 'Sub-kategori (Tingkat 3)', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'item':
        return { label: 'Item Field (Tingkat 4)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
  };

  const badgeInfo = getLevelBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 animate-in zoom-in-95 duration-150">
        
        {/* ================================================================= */}
        {/* 1. STICKY MODAL HEADER (Judul Singkat & Padat Sesuai Nama Asli)    */}
        {/* ================================================================= */}
        <div className="sticky top-0 z-20 px-4 py-3 sm:px-5 sm:py-3.5 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              {level === 'section' && <Layers className="w-4 h-4" />}
              {level === 'category' && <Folder className="w-4 h-4" />}
              {level === 'subcategory' && <Tag className="w-4 h-4" />}
              {level === 'item' && <Sliders className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate font-mono">
                  Edit: {element.systemKey}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeInfo.color}`}>
                  {badgeInfo.label}
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate">
                {element.appLabel || element.formLabel || 'Pengaturan metadata & format'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors shrink-0"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* 2. SCROLLABLE FORM BODY (Focus-Driven Input Fields)                */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* A. System Key & Identification */}
          <div className="space-y-3.5 p-4 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                Teks Asli (System Key)
              </label>
              <span className="text-[10px] font-mono text-stone-400">Database ID</span>
            </div>
            <input
              type="text"
              value={systemKey}
              onChange={(e) => setSystemKey(e.target.value)}
              placeholder="e.g. firstName, heightCm, bustCm"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm font-mono text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <p className="text-[11px] text-stone-400">
              Kunci identitas database &amp; API (tanpa spasi).
            </p>
          </div>

          {/* B. UI Labels (App Label & Form Label) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Teks UI Aplikasi */}
            <div className="space-y-2 p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-400" />
                Teks UI Aplikasi
              </label>
              <input
                type="text"
                value={appLabel}
                onChange={(e) => setAppLabel(e.target.value)}
                placeholder="e.g. Nama Depan, Tinggi Badan"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="text-[10px] text-stone-400">Tampilan pada Kartu &amp; Detail Publik.</p>
            </div>

            {/* Teks Form Artis */}
            <div className="space-y-2 p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                Teks Form Artis
              </label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="e.g. Nama Depan Artis (Wajib)"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <p className="text-[10px] text-stone-400">Label kolom di Halaman Edit/Buat Artis.</p>
            </div>
          </div>

          {/* C. Deskripsi & Panduan Penilaian (Tooltip / Guideline) */}
          <div className="space-y-3.5 p-4 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Deskripsi &amp; Panduan Penilaian (Tooltip)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ringkasan fungsi data atau panduan ringkas..."
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-300">
                Pedoman Pengisian Mendalam (Rubrik Penilaian)
              </label>
              <textarea
                rows={2}
                value={evaluationGuideline}
                onChange={(e) => setEvaluationGuideline(e.target.value)}
                placeholder="Instruksi verifikasi, format standar input, batas toleransi..."
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>
          </div>

          {/* D. Fungsi & Lokasi Halaman */}
          <div className="space-y-2 p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-purple-400" />
              Deskripsi Fungsi &amp; Lokasi Halaman
            </label>
            <input
              type="text"
              value={functionLocation}
              onChange={(e) => setFunctionLocation(e.target.value)}
              placeholder="e.g. Halaman Detail Profil, Kartu Artis, Leaderboard, Form Edit/Buat"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* E. PENGATURAN FIELD & FORMAT (KHUSUS LEVEL 4 ITEM) */}
          {isItem && (
            <div className="space-y-4 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Format &amp; Sifat Field Input
                </span>

                {/* Sifat Mandatory Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-semibold text-stone-300">
                    {isRequired ? (
                      <span className="text-emerald-400 font-bold">Wajib Diisi</span>
                    ) : (
                      <span className="text-stone-400">Opsional</span>
                    )}
                  </span>
                  <div
                    onClick={() => setIsRequired(!isRequired)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      isRequired ? 'bg-emerald-600' : 'bg-stone-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isRequired ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* Data Type Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-300 mb-1 block">
                    Jenis Tipe Data
                  </label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as FieldDataType)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                  >
                    <option value="text">Teks Singkat (Text)</option>
                    <option value="number">Angka Numerik (Number)</option>
                    <option value="date">Format Tanggal (Date)</option>
                    <option value="button_link">Tautan Tombol Eksternal (URL)</option>
                    <option value="single_select">Pilihan Tunggal (Single Select)</option>
                    <option value="multi_select">Pilihan Ganda (Multi-Select Tags)</option>
                    <option value="scoring">Skor Penilaian (Scoring)</option>
                  </select>
                </div>

                {/* Unit / Suffix */}
                <div>
                  <label className="text-[11px] font-semibold text-stone-300 mb-1 block">
                    Satuan / Suffix Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="contoh: .cm, kg, pts, th"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              {/* Placeholder & URL Prefix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-300 mb-1 block">
                    Placeholder Form
                  </label>
                  <input
                    type="text"
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                    placeholder="contoh: Masukkan nama..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {fieldType === 'button_link' && (
                  <div>
                    <label className="text-[11px] font-semibold text-stone-300 mb-1 block">
                      URL Prefix
                    </label>
                    <input
                      type="text"
                      value={urlPrefix}
                      onChange={(e) => setUrlPrefix(e.target.value)}
                      placeholder="https://..."
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                )}
              </div>

              {/* Choices Manager for Select Fields */}
              {['single_select', 'multi_select'].includes(fieldType) && (
                <div className="space-y-3 pt-3 border-t border-indigo-500/20">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                      <List className="w-3.5 h-3.5 text-indigo-400" />
                      Daftar Pilihan Opsi ({options.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs text-indigo-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Opsi
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {options.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-700 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt.appLabel}
                            onChange={(e) => handleUpdateOption(opt.id, { appLabel: e.target.value, formLabel: e.target.value })}
                            placeholder="Label Opsi (e.g. pendek kurus)..."
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <input
                            type="text"
                            value={opt.systemValue}
                            onChange={(e) => handleUpdateOption(opt.id, { systemValue: e.target.value })}
                            placeholder="Kode / Value (e.g. SK)..."
                            className="w-24 sm:w-28 px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs font-mono text-indigo-300 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(opt.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Hapus opsi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={opt.description || ''}
                          onChange={(e) => handleUpdateOption(opt.id, { description: e.target.value })}
                          placeholder="Info / Deskripsi Opsi (e.g. short skinny)..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950/70 border border-stone-800 text-xs text-stone-300 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirm Delete Warning Banner */}
          {confirmDelete && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/50 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Konfirmasi Hapus Elemen (CASCADE)</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Menghapus <strong className="text-white font-mono">{element.systemKey}</strong> akan menghapus seluruh data anak di bawahnya secara otomatis. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onDelete) onDelete(element.id, level, element.systemKey);
                    onClose();
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-900/30"
                >
                  <Trash2 className="w-4 h-4" /> Ya, Hapus Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ================================================================= */}
        {/* 3. STICKY MODAL ACTIONS FOOTER                                    */}
        {/* ================================================================= */}
        <div className="sticky bottom-0 z-20 px-4 py-3.5 sm:px-6 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 flex items-center justify-between gap-3">
          {/* Delete Trigger Button */}
          {onDelete && !confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-red-950/60 hover:text-red-400 text-stone-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-transparent hover:border-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          ) : (
            <div />
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 sm:px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`min-h-[44px] px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${
                saveSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30 active:scale-95'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
