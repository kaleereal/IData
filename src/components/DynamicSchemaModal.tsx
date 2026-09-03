import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Sparkles,
  Smile,
  Eye,
  Tag,
  Layers,
  ChevronDown,
  Check,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DatabaseSchema,
  AppealCategoryDefinition,
  AppealOptionItem,
  ScoringTraitMetadata,
} from '../types';
import { DEFAULT_DATABASE_SCHEMA } from '../data/defaultSchema';

export type DynamicSchemaTab = 'appeal' | 'attributes' | 'specialty' | 'appearance' | 'impression';

interface DynamicSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: DatabaseSchema;
  onSaveSchema: (newSchema: DatabaseSchema) => void;
  initialTab?: DynamicSchemaTab;
}

export const DynamicSchemaModal: React.FC<DynamicSchemaModalProps> = ({
  isOpen,
  onClose,
  schema,
  onSaveSchema,
  initialTab = 'appeal',
}) => {
  const [activeTab, setActiveTab] = useState<DynamicSchemaTab>(initialTab);
  const [draftSchema, setDraftSchema] = useState<DatabaseSchema>(schema);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // States for Category Management
  const [newCategoryModal, setNewCategoryModal] = useState<{
    isOpen: boolean;
    tab: 'appeal' | 'attributes' | 'specialty';
    title: string;
    description: string;
  }>({
    isOpen: false,
    tab: 'appeal',
    title: '',
    description: '',
  });

  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [categoryEditTitle, setCategoryEditTitle] = useState('');
  const [categoryEditDesc, setCategoryEditDesc] = useState('');

  // States for Option Management
  const [newOptionModal, setNewOptionModal] = useState<{
    isOpen: boolean;
    tab: 'appeal' | 'attributes' | 'specialty';
    categoryKey: string;
    name: string;
    description: string;
  }>({
    isOpen: false,
    tab: 'appeal',
    categoryKey: '',
    name: '',
    description: '',
  });

  const [editingOption, setEditingOption] = useState<{
    tab: 'appeal' | 'attributes' | 'specialty';
    categoryKey: string;
    oldName: string;
    name: string;
    description: string;
  } | null>(null);

  // States for Scoring Traits Management
  const [editingTrait, setEditingTrait] = useState<{
    category: 'appearance' | 'impression';
    key: string;
    label: string;
    shortDescription: string;
  } | null>(null);

  const [newTraitModal, setNewTraitModal] = useState<{
    isOpen: boolean;
    category: 'appearance' | 'impression';
    key: string;
    label: string;
    shortDescription: string;
  }>({
    isOpen: false,
    category: 'appearance',
    key: '',
    label: '',
    shortDescription: '',
  });

  // Sync draftSchema when isOpen or schema changes
  useEffect(() => {
    if (isOpen) {
      setDraftSchema(JSON.parse(JSON.stringify(schema)));
      setActiveTab(initialTab);
      setSaveSuccessMessage(null);
    }
  }, [isOpen, schema, initialTab]);

  if (!isOpen) return null;

  // Helper to get Category Record for active character tab
  const getCategoriesForTab = (tab: 'appeal' | 'attributes' | 'specialty'): Record<string, AppealCategoryDefinition> => {
    if (tab === 'appeal') return draftSchema.appealCategories || {};
    if (tab === 'attributes') return draftSchema.attributeCategories || {};
    return draftSchema.specialtyCategories || {};
  };

  // Handler: Update Field Section Title (e.g. APPEAL, ATTRIBUTES, SPECIALTY, APPEARANCE, IMPRESSION)
  const handleUpdateSectionTitle = (tab: DynamicSchemaTab, newTitle: string) => {
    setDraftSchema(prev => ({
      ...prev,
      sectionTitles: {
        ...(prev.sectionTitles || {}),
        [tab]: newTitle,
      },
    }));
  };

  // Handler: Add New Category
  const handleCreateCategory = () => {
    const { tab, title, description } = newCategoryModal;
    if (!title.trim()) return;

    const key = `custom_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const newCat: AppealCategoryDefinition = {
      title: title.trim(),
      icon: 'Tag',
      shortDescription: description.trim() || `Kategori ${title.trim()}`,
      options: [],
    };

    setDraftSchema(prev => {
      const updated = { ...prev };
      if (tab === 'appeal') {
        updated.appealCategories = { ...(updated.appealCategories || {}), [key]: newCat };
      } else if (tab === 'attributes') {
        updated.attributeCategories = { ...(updated.attributeCategories || {}), [key]: newCat };
      } else {
        updated.specialtyCategories = { ...(updated.specialtyCategories || {}), [key]: newCat };
      }
      return updated;
    });

    setNewCategoryModal({ isOpen: false, tab: 'appeal', title: '', description: '' });
  };

  // Handler: Save Category Title & Description Edit
  const handleSaveCategoryEdit = (tab: 'appeal' | 'attributes' | 'specialty', catKey: string) => {
    if (!categoryEditTitle.trim()) return;

    setDraftSchema(prev => {
      const updated = { ...prev };
      const targetMap = tab === 'appeal'
        ? { ...updated.appealCategories }
        : tab === 'attributes'
        ? { ...updated.attributeCategories }
        : { ...updated.specialtyCategories };

      if (targetMap[catKey]) {
        targetMap[catKey] = {
          ...targetMap[catKey],
          title: categoryEditTitle.trim(),
          shortDescription: categoryEditDesc.trim(),
        };
      }

      if (tab === 'appeal') updated.appealCategories = targetMap as any;
      else if (tab === 'attributes') updated.attributeCategories = targetMap as any;
      else updated.specialtyCategories = targetMap as any;

      return updated;
    });

    setEditingCategoryKey(null);
  };

  // Handler: Delete Category
  const handleDeleteCategory = (tab: 'appeal' | 'attributes' | 'specialty', catKey: string) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini beserta seluruh opsi di dalamnya?')) return;

    setDraftSchema(prev => {
      const updated = { ...prev };
      if (tab === 'appeal') {
        const next = { ...updated.appealCategories };
        delete next[catKey];
        updated.appealCategories = next as any;
      } else if (tab === 'attributes') {
        const next = { ...updated.attributeCategories };
        delete next[catKey];
        updated.attributeCategories = next as any;
      } else {
        const next = { ...updated.specialtyCategories };
        delete next[catKey];
        updated.specialtyCategories = next as any;
      }
      return updated;
    });
  };

  // Handler: Add New Option to Category
  const handleCreateOption = () => {
    const { tab, categoryKey, name, description } = newOptionModal;
    if (!name.trim() || !categoryKey) return;

    const newOpt: AppealOptionItem = {
      id: `opt_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      guidelines: description.trim(),
    };

    setDraftSchema(prev => {
      const updated = { ...prev };
      const targetMap = tab === 'appeal'
        ? { ...updated.appealCategories }
        : tab === 'attributes'
        ? { ...updated.attributeCategories }
        : { ...updated.specialtyCategories };

      if (targetMap[categoryKey]) {
        const currentOptions = targetMap[categoryKey].options || [];
        targetMap[categoryKey] = {
          ...targetMap[categoryKey],
          options: [...currentOptions, newOpt],
        };
      }

      if (tab === 'appeal') updated.appealCategories = targetMap as any;
      else if (tab === 'attributes') updated.attributeCategories = targetMap as any;
      else updated.specialtyCategories = targetMap as any;

      return updated;
    });

    setNewOptionModal({ isOpen: false, tab: 'appeal', categoryKey: '', name: '', description: '' });
  };

  // Handler: Save Option Edit
  const handleSaveOptionEdit = () => {
    if (!editingOption || !editingOption.name.trim()) return;
    const { tab, categoryKey, oldName, name, description } = editingOption;

    setDraftSchema(prev => {
      const updated = { ...prev };
      const targetMap = tab === 'appeal'
        ? { ...updated.appealCategories }
        : tab === 'attributes'
        ? { ...updated.attributeCategories }
        : { ...updated.specialtyCategories };

      if (targetMap[categoryKey]) {
        targetMap[categoryKey] = {
          ...targetMap[categoryKey],
          options: (targetMap[categoryKey].options || []).map(opt =>
            opt.name === oldName
              ? { ...opt, name: name.trim(), description: description.trim(), guidelines: description.trim() }
              : opt
          ),
        };
      }

      if (tab === 'appeal') updated.appealCategories = targetMap as any;
      else if (tab === 'attributes') updated.attributeCategories = targetMap as any;
      else updated.specialtyCategories = targetMap as any;

      return updated;
    });

    setEditingOption(null);
  };

  // Handler: Delete Option
  const handleDeleteOption = (tab: 'appeal' | 'attributes' | 'specialty', categoryKey: string, optName: string) => {
    if (!window.confirm(`Hapus opsi "${optName}"?`)) return;

    setDraftSchema(prev => {
      const updated = { ...prev };
      const targetMap = tab === 'appeal'
        ? { ...updated.appealCategories }
        : tab === 'attributes'
        ? { ...updated.attributeCategories }
        : { ...updated.specialtyCategories };

      if (targetMap[categoryKey]) {
        targetMap[categoryKey] = {
          ...targetMap[categoryKey],
          options: (targetMap[categoryKey].options || []).filter(opt => opt.name !== optName),
        };
      }

      if (tab === 'appeal') updated.appealCategories = targetMap as any;
      else if (tab === 'attributes') updated.attributeCategories = targetMap as any;
      else updated.specialtyCategories = targetMap as any;

      return updated;
    });
  };

  // Handler: Save Scoring Trait Edit
  const handleSaveTraitEdit = () => {
    if (!editingTrait || !editingTrait.label.trim()) return;
    const { category, key, label, shortDescription } = editingTrait;

    setDraftSchema(prev => {
      const updated = { ...prev };
      const traitsList = category === 'appearance'
        ? [...(updated.scoringTraits?.appearance || [])]
        : [...(updated.scoringTraits?.impression || [])];

      const idx = traitsList.findIndex(t => t.key === key);
      if (idx >= 0) {
        traitsList[idx] = {
          ...traitsList[idx],
          label: label.trim(),
          shortDescription: shortDescription.trim(),
        };
      }

      updated.scoringTraits = {
        appearance: category === 'appearance' ? traitsList : (updated.scoringTraits?.appearance || []),
        impression: category === 'impression' ? traitsList : (updated.scoringTraits?.impression || []),
      };

      return updated;
    });

    setEditingTrait(null);
  };

  // Handler: Add New Scoring Trait
  const handleCreateTrait = () => {
    const { category, key, label, shortDescription } = newTraitModal;
    if (!label.trim()) return;

    const traitKey = key.trim() || `trait_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const newTrait: ScoringTraitMetadata = {
      key: traitKey,
      label: label.trim(),
      category: category,
      weight: 0.15,
      weightLabel: '15%',
      shortDescription: shortDescription.trim() || `Penilaian untuk ${label.trim()}`,
      rubricGuide: {
        sTier: '90–99: Kualitas luar biasa istimewa.',
        aTier: '80–89: Performa sangat baik di atas rata-rata.',
        bTier: '70–79: Cukup baik dan proporsional.',
        cTier: '< 70: Masih memerlukan peningkatan.',
      },
    };

    setDraftSchema(prev => {
      const updated = { ...prev };
      const currentAppearance = updated.scoringTraits?.appearance || [];
      const currentImpression = updated.scoringTraits?.impression || [];

      updated.scoringTraits = {
        appearance: category === 'appearance' ? [...currentAppearance, newTrait] : currentAppearance,
        impression: category === 'impression' ? [...currentImpression, newTrait] : currentImpression,
      };

      return updated;
    });

    setNewTraitModal({ isOpen: false, category: 'appearance', key: '', label: '', shortDescription: '' });
  };

  // Handler: Delete Scoring Trait
  const handleDeleteTrait = (category: 'appearance' | 'impression', traitKey: string) => {
    if (!window.confirm('Hapus trait penilaian slider ini?')) return;

    setDraftSchema(prev => {
      const updated = { ...prev };
      const currentAppearance = (updated.scoringTraits?.appearance || []).filter(t => t.key !== traitKey);
      const currentImpression = (updated.scoringTraits?.impression || []).filter(t => t.key !== traitKey);

      updated.scoringTraits = {
        appearance: category === 'appearance' ? currentAppearance : (updated.scoringTraits?.appearance || []),
        impression: category === 'impression' ? currentImpression : (updated.scoringTraits?.impression || []),
      };

      return updated;
    });
  };

  // Handler: Save All Schema Changes
  const handleSaveAll = () => {
    onSaveSchema(draftSchema);
    try {
      localStorage.setItem('database_schema_v2', JSON.stringify(draftSchema));
      localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(draftSchema));
      window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: draftSchema }));
    } catch (e) {
      console.error('Error broadcasting schema update', e);
    }
    setSaveSuccessMessage('Skema dinamis berhasil diperbarui dan disinkronkan!');
    setTimeout(() => {
      setSaveSuccessMessage(null);
      onClose();
    }, 1200);
  };

  // Handler: Reset to default schema
  const handleResetToDefault = () => {
    if (!window.confirm('Kembalikan seluruh skema kategori dan trait ke konfigurasi sistem bawaan (default)?')) return;
    setDraftSchema(JSON.parse(JSON.stringify(DEFAULT_DATABASE_SCHEMA)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden text-stone-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase font-display">
                Pengaturan Skema Dinamis (Dynamic Schema)
              </h2>
              <p className="text-xs text-stone-400">
                Kustomisasi nama bidang utama, kategori, opsi pilihan, dan parameter scoring slider.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-stone-950 border-b border-stone-800 overflow-x-auto">
          {[
            { id: 'appeal' as const, label: draftSchema.sectionTitles?.appeal || 'APPEAL', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'attributes' as const, label: draftSchema.sectionTitles?.attributes || 'ATTRIBUTES', icon: <Tag className="w-4 h-4" /> },
            { id: 'specialty' as const, label: draftSchema.sectionTitles?.specialty || 'SPECIALTY', icon: <Layers className="w-4 h-4" /> },
            { id: 'appearance' as const, label: 'APPEARANCE SCORING', icon: <Smile className="w-4 h-4" /> },
            { id: 'impression' as const, label: 'IMPRESSION SCORING', icon: <Eye className="w-4 h-4" /> },
          ].map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Universal: Rename Main Field Title (APPEAL, ATTRIBUTES, SPECIALTY, APPEARANCE, IMPRESSION) */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-stone-400 block tracking-wider">
                Nama Bidang Utama ({activeTab.toUpperCase()}):
              </label>
              <button
                type="button"
                onClick={() => handleUpdateSectionTitle(activeTab, activeTab.toUpperCase())}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
              >
                Gunakan Default ({activeTab.toUpperCase()})
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draftSchema.sectionTitles?.[activeTab] ?? ''}
                onChange={e => handleUpdateSectionTitle(activeTab, e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                placeholder={`Masukkan nama bidang ${activeTab.toUpperCase()}...`}
              />
              <span className="text-[11px] text-stone-400 hidden sm:inline">
                (Sinkron ke seluruh halaman)
              </span>
            </div>
          </div>

          {/* TAB 1, 2, 3: APPEAL, ATTRIBUTES, SPECIALTY */}
          {(activeTab === 'appeal' || activeTab === 'attributes' || activeTab === 'specialty') && (
            <div className="space-y-6">
              {/* Categories & Items List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Daftar Kategori & Opsi {draftSchema.sectionTitles?.[activeTab] || activeTab.toUpperCase()}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Ubah nama kategori, deskripsi, tambahkan opsi baru, atau sesuaikan item yang sudah ada.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNewCategoryModal({
                        isOpen: true,
                        tab: activeTab,
                        title: '',
                        description: '',
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>(+) Tambah Kategori Baru</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(Object.entries(getCategoriesForTab(activeTab)) as [string, AppealCategoryDefinition][]).map(([catKey, catDef]) => {
                    const isEditingCat = editingCategoryKey === catKey;

                    return (
                      <div
                        key={catKey}
                        className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3"
                      >
                        {/* Category Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-850 pb-2.5">
                          {isEditingCat ? (
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={categoryEditTitle}
                                  onChange={e => setCategoryEditTitle(e.target.value)}
                                  className="px-3 py-1.5 rounded-lg bg-stone-900 border border-amber-500 text-xs font-bold text-white flex-1"
                                  placeholder="Nama Kategori"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveCategoryEdit(activeTab, catKey)}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold cursor-pointer"
                                >
                                  Simpan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategoryKey(null)}
                                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 text-stone-400 text-xs cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                              <input
                                type="text"
                                value={categoryEditDesc}
                                onChange={e => setCategoryEditDesc(e.target.value)}
                                className="w-full px-3 py-1 rounded-lg bg-stone-900 border border-stone-700 text-[11px] text-stone-300"
                                placeholder="Deskripsi Kategori (opsional)"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                                  {catDef.title}
                                </h4>
                                <span className="text-[10px] font-mono text-stone-500">({catKey})</span>
                              </div>
                              <p className="text-[11px] text-stone-400 mt-0.5">
                                {catDef.shortDescription || 'Tidak ada deskripsi kategori.'}
                              </p>
                            </div>
                          )}

                          {!isEditingCat && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategoryKey(catKey);
                                  setCategoryEditTitle(catDef.title);
                                  setCategoryEditDesc(catDef.shortDescription || '');
                                }}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
                                title="Edit Kategori"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setNewOptionModal({
                                    isOpen: true,
                                    tab: activeTab,
                                    categoryKey: catKey,
                                    name: '',
                                    description: '',
                                  })
                                }
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 text-[10px] font-bold cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Tambah Opsi</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(activeTab, catKey)}
                                className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                                title="Hapus Kategori"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Options Grid */}
                        <div className="space-y-2 pt-1">
                          <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                            Pilihan Opsi ({catDef.options?.length || 0}):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {(catDef.options || []).map(opt => {
                              const isEditingOpt =
                                editingOption?.categoryKey === catKey &&
                                editingOption?.oldName === opt.name;

                              if (isEditingOpt) {
                                return (
                                  <div
                                    key={opt.name}
                                    className="p-2.5 rounded-xl bg-stone-900 border border-amber-500 space-y-2 col-span-full sm:col-span-2"
                                  >
                                    <input
                                      type="text"
                                      value={editingOption.name}
                                      onChange={e =>
                                        setEditingOption(prev =>
                                          prev ? { ...prev, name: e.target.value } : null
                                        )
                                      }
                                      className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-700 text-xs text-white font-bold"
                                      placeholder="Nama Opsi"
                                    />
                                    <textarea
                                      rows={2}
                                      value={editingOption.description}
                                      onChange={e =>
                                        setEditingOption(prev =>
                                          prev ? { ...prev, description: e.target.value } : null
                                        )
                                      }
                                      className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-700 text-[11px] text-stone-200"
                                      placeholder="Deskripsi Opsi (dinamis muncul saat opsi ini dipilih)"
                                    />
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={handleSaveOptionEdit}
                                        className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold cursor-pointer"
                                      >
                                        Simpan
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingOption(null)}
                                        className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-400 text-xs cursor-pointer"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={opt.name}
                                  className="p-2.5 rounded-xl bg-stone-900 border border-stone-800/80 flex flex-col justify-between hover:border-stone-700 transition-all text-left"
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-xs font-bold text-stone-200 truncate">
                                        {opt.name}
                                      </span>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingOption({
                                              tab: activeTab,
                                              categoryKey: catKey,
                                              oldName: opt.name,
                                              name: opt.name,
                                              description: opt.description || opt.guidelines || '',
                                            })
                                          }
                                          className="p-1 rounded text-stone-400 hover:text-white cursor-pointer"
                                          title="Edit Opsi"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteOption(activeTab, catKey, opt.name)
                                          }
                                          className="p-1 rounded text-rose-400/70 hover:text-rose-400 cursor-pointer"
                                          title="Hapus Opsi"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-stone-400 line-clamp-2 mt-1">
                                      {opt.description || opt.guidelines || 'Tidak ada deskripsi.'}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCE SCORING */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Parameter Trait Appearance Scoring (60% Bobot Overall)
                  </h3>
                  <p className="text-xs text-stone-400">
                    Sesuaikan penamaan slider fisik, deskripsi, rubrik penilaian, atau tambahkan parameter evaluasi baru.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNewTraitModal({
                      isOpen: true,
                      category: 'appearance',
                      key: '',
                      label: '',
                      shortDescription: '',
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>(+) Tambah Trait Appearance</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(draftSchema.scoringTraits?.appearance || []).map(trait => {
                  const isEditing = editingTrait?.key === trait.key && editingTrait?.category === 'appearance';

                  if (isEditing) {
                    return (
                      <div
                        key={trait.key}
                        className="p-4 rounded-xl bg-stone-950 border border-cyan-500 space-y-3 col-span-full"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-stone-400">Label Slider:</label>
                          <input
                            type="text"
                            value={editingTrait.label}
                            onChange={e =>
                              setEditingTrait(prev => (prev ? { ...prev, label: e.target.value } : null))
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-white font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-stone-400">Deskripsi Ringkas:</label>
                          <textarea
                            rows={2}
                            value={editingTrait.shortDescription}
                            onChange={e =>
                              setEditingTrait(prev =>
                                prev ? { ...prev, shortDescription: e.target.value } : null
                              )
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-stone-200"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSaveTraitEdit}
                            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-stone-950 font-bold text-xs cursor-pointer"
                          >
                            Simpan Perubahan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTrait(null)}
                            className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-400 text-xs cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={trait.key}
                      className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between space-y-2 hover:border-cyan-500/40 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase">{trait.label}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingTrait({
                                  category: 'appearance',
                                  key: trait.key,
                                  label: trait.label,
                                  shortDescription: trait.shortDescription,
                                })
                              }
                              className="p-1 rounded text-stone-400 hover:text-white cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTrait('appearance', trait.key)}
                              className="p-1 rounded text-rose-400/70 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-400">{trait.shortDescription}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: IMPRESSION SCORING */}
          {activeTab === 'impression' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Parameter Trait Impression Scoring (40% Bobot Overall)
                  </h3>
                  <p className="text-xs text-stone-400">
                    Sesuaikan penamaan slider performa, ekspresi, aura, rubrik panduan, atau tambahkan parameter baru.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNewTraitModal({
                      isOpen: true,
                      category: 'impression',
                      key: '',
                      label: '',
                      shortDescription: '',
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>(+) Tambah Trait Impression</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(draftSchema.scoringTraits?.impression || []).map(trait => {
                  const isEditing = editingTrait?.key === trait.key && editingTrait?.category === 'impression';

                  if (isEditing) {
                    return (
                      <div
                        key={trait.key}
                        className="p-4 rounded-xl bg-stone-950 border border-pink-500 space-y-3 col-span-full"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-stone-400">Label Slider:</label>
                          <input
                            type="text"
                            value={editingTrait.label}
                            onChange={e =>
                              setEditingTrait(prev => (prev ? { ...prev, label: e.target.value } : null))
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-white font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-stone-400">Deskripsi Ringkas:</label>
                          <textarea
                            rows={2}
                            value={editingTrait.shortDescription}
                            onChange={e =>
                              setEditingTrait(prev =>
                                prev ? { ...prev, shortDescription: e.target.value } : null
                              )
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-stone-200"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSaveTraitEdit}
                            className="px-4 py-1.5 rounded-lg bg-pink-500 text-stone-950 font-bold text-xs cursor-pointer"
                          >
                            Simpan Perubahan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTrait(null)}
                            className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-400 text-xs cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={trait.key}
                      className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between space-y-2 hover:border-pink-500/40 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase">{trait.label}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingTrait({
                                  category: 'impression',
                                  key: trait.key,
                                  label: trait.label,
                                  shortDescription: trait.shortDescription,
                                })
                              }
                              className="p-1 rounded text-stone-400 hover:text-white cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTrait('impression', trait.key)}
                              className="p-1 rounded text-rose-400/70 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-400">{trait.shortDescription}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-t border-stone-800 bg-stone-950/70">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Skema Bawaan</span>
          </button>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Skema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Modal: Add Category */}
      {newCategoryModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-700 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Tambah Kategori Baru ({newCategoryModal.tab.toUpperCase()})
              </h3>
              <button
                type="button"
                onClick={() => setNewCategoryModal(prev => ({ ...prev, isOpen: false }))}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1">
                  Nama Kategori <span className="text-amber-400">*</span>:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newCategoryModal.title}
                  onChange={e => setNewCategoryModal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Misal: Karakter Khusus, Kostum Signature, dsb."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1">
                  Deskripsi Singkat (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={newCategoryModal.description}
                  onChange={e => setNewCategoryModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Keterangan mengenai cakupan kategori ini..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setNewCategoryModal(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={!newCategoryModal.title.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  newCategoryModal.title.trim()
                    ? 'bg-amber-500 text-stone-950 cursor-pointer'
                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                }`}
              >
                Buat Kategori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal: Add Option */}
      {newOptionModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-700 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Tambah Opsi Pilihan Baru
              </h3>
              <button
                type="button"
                onClick={() => setNewOptionModal(prev => ({ ...prev, isOpen: false }))}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1">
                  Nama Opsi <span className="text-amber-400">*</span>:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newOptionModal.name}
                  onChange={e => setNewOptionModal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Dimples, Twin Tail, Goth Girl, dsb."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1">
                  Deskripsi Dinamis Opsi:
                </label>
                <textarea
                  rows={2}
                  value={newOptionModal.description}
                  onChange={e => setNewOptionModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi ini akan otomatis muncul pada form saat opsi ini dipilih..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setNewOptionModal(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateOption}
                disabled={!newOptionModal.name.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  newOptionModal.name.trim()
                    ? 'bg-amber-500 text-stone-950 cursor-pointer'
                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                }`}
              >
                Tambah Opsi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal: Add Scoring Trait */}
      {newTraitModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-700 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Tambah Trait Slider ({newTraitModal.category.toUpperCase()})
              </h3>
              <button
                type="button"
                onClick={() => setNewTraitModal(prev => ({ ...prev, isOpen: false }))}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1">
                  Nama / Label Trait <span className="text-amber-400">*</span>:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newTraitModal.label}
                  onChange={e => setNewTraitModal(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Contoh: Hip Line, Vokal Emosional, dsb."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1">
                  Deskripsi Evaluasi:
                </label>
                <textarea
                  rows={2}
                  value={newTraitModal.shortDescription}
                  onChange={e => setNewTraitModal(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Panduan penilaian untuk slider ini..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setNewTraitModal(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateTrait}
                disabled={!newTraitModal.label.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  newTraitModal.label.trim()
                    ? 'bg-amber-500 text-stone-950 cursor-pointer'
                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                }`}
              >
                Tambah Trait
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
