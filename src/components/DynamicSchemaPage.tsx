import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Tag,
  Layers,
  Eye,
  Smile,
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Download,
  Upload,
  Search,
  Check,
  AlertCircle,
  X,
  FileSpreadsheet,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  Percent,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import {
  DatabaseSchema,
  AppealCategoryDefinition,
  AppealOptionItem,
  ScoringTraitMetadata,
  FieldMetadata,
} from '../types';
import { DEFAULT_DATABASE_SCHEMA } from '../data/defaultSchema';
import {
  exportSchemaToCsv,
  importSchemaFromCsv,
  downloadCsvFile,
  ImportSchemaResult,
} from '../utils/schemaCsvHelper';

export type DynamicSchemaTab = 'biodata' | 'appeal' | 'attributes' | 'specialty' | 'appearance' | 'impression';

interface DynamicSchemaPageProps {
  schema: DatabaseSchema;
  onSaveSchema: (newSchema: DatabaseSchema) => void;
  onResetSchema?: () => void;
  onBack: () => void;
  initialTab?: DynamicSchemaTab;
}

export const DynamicSchemaPage: React.FC<DynamicSchemaPageProps> = ({
  schema,
  onSaveSchema,
  onResetSchema,
  onBack,
  initialTab = 'appeal',
}) => {
  const [activeTab, setActiveTab] = useState<DynamicSchemaTab>(initialTab);
  const [draftSchema, setDraftSchema] = useState<DatabaseSchema>(() => JSON.parse(JSON.stringify(schema)));
  const [searchQuery, setSearchQuery] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

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

  const [editingCategory, setEditingCategory] = useState<{
    tab: 'appeal' | 'attributes' | 'specialty';
    catKey: string;
    title: string;
    description: string;
  } | null>(null);

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

  // States for Biodata Field Management
  const [editingBiodataField, setEditingBiodataField] = useState<{
    key: string;
    label: string;
    shortDescription: string;
    editorGuidelines?: string;
  } | null>(null);

  // States for Scoring Traits Management
  const [editingTrait, setEditingTrait] = useState<{
    category: 'appearance' | 'impression';
    key: string;
    label: string;
    shortDescription: string;
    weightPercent: number;
  } | null>(null);

  const [newTraitModal, setNewTraitModal] = useState<{
    isOpen: boolean;
    category: 'appearance' | 'impression';
    key: string;
    label: string;
    shortDescription: string;
    weightPercent: number;
  }>({
    isOpen: false,
    category: 'appearance',
    key: '',
    label: '',
    shortDescription: '',
    weightPercent: 15,
  });

  // Global Confirmation Dialog for Deletions and Reset
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // CSV Import State
  const [csvImportModal, setCsvImportModal] = useState<{
    isOpen: boolean;
    fileContent: string | null;
    fileName: string | null;
    parsedResult: ImportSchemaResult | null;
  }>({
    isOpen: false,
    fileContent: null,
    fileName: null,
    parsedResult: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep draftSchema updated if schema prop updates from parent
  useEffect(() => {
    setDraftSchema(JSON.parse(JSON.stringify(schema)));
  }, [schema]);

  // Set initial tab when specified
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Toast auto dismiss
  useEffect(() => {
    if (saveToast) {
      const timer = setTimeout(() => setSaveToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveToast]);

  // Tab definitions
  const tabs: Array<{ id: DynamicSchemaTab; label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = [
    {
      id: 'biodata',
      label: draftSchema.sectionTitles?.biodata || 'BIODATA',
      icon: <User className="w-4 h-4" />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
    {
      id: 'appeal',
      label: draftSchema.sectionTitles?.appeal || 'APPEAL',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
    },
    {
      id: 'attributes',
      label: draftSchema.sectionTitles?.attributes || 'ATTRIBUTES',
      icon: <Tag className="w-4 h-4" />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    },
    {
      id: 'specialty',
      label: draftSchema.sectionTitles?.specialty || 'SPECIALTY',
      icon: <Layers className="w-4 h-4" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
    },
    {
      id: 'appearance',
      label: draftSchema.sectionTitles?.appearance || 'APPEARANCE',
      icon: <Eye className="w-4 h-4" />,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
    },
    {
      id: 'impression',
      label: draftSchema.sectionTitles?.impression || 'IMPRESSION',
      icon: <Smile className="w-4 h-4" />,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
    },
  ];

  // =========================================================================
  // FIX: Section Title Update (Do not revert when text is deleted)
  // =========================================================================
  const handleUpdateSectionTitle = (tabKey: DynamicSchemaTab, newTitle: string) => {
    setDraftSchema(prev => ({
      ...prev,
      sectionTitles: {
        ...(prev.sectionTitles || {}),
        [tabKey]: newTitle, // stores raw string as typed without falling back
      },
    }));
  };

  // Helper to get Category Record for active character tab
  const getCategoriesForTab = (tab: 'appeal' | 'attributes' | 'specialty'): Record<string, AppealCategoryDefinition> => {
    if (tab === 'appeal') return draftSchema.appealCategories || {};
    if (tab === 'attributes') return draftSchema.attributeCategories || {};
    return draftSchema.specialtyCategories || {};
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
    setSaveToast(`Kategori "${title.trim()}" berhasil ditambahkan.`);
  };

  // Handler: Save Category Edit
  const handleSaveCategoryEdit = () => {
    if (!editingCategory || !editingCategory.title.trim()) return;
    const { tab, catKey, title, description } = editingCategory;

    setDraftSchema(prev => {
      const updated = { ...prev };
      const targetMap =
        tab === 'appeal'
          ? { ...updated.appealCategories }
          : tab === 'attributes'
          ? { ...updated.attributeCategories }
          : { ...updated.specialtyCategories };

      if (targetMap[catKey]) {
        targetMap[catKey] = {
          ...targetMap[catKey],
          title: title.trim(),
          shortDescription: description.trim(),
        };
      }

      if (tab === 'appeal') updated.appealCategories = targetMap as any;
      else if (tab === 'attributes') updated.attributeCategories = targetMap as any;
      else updated.specialtyCategories = targetMap as any;

      return updated;
    });

    setEditingCategory(null);
    setSaveToast('Kategori berhasil diperbarui.');
  };

  // Handler: Delete Category
  const handleDeleteCategory = (tab: 'appeal' | 'attributes' | 'specialty', catKey: string) => {
    const targetCats = getCategoriesForTab(tab);
    const catTitle = targetCats[catKey]?.title || catKey;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Kategori?',
      message: `Apakah Anda yakin ingin menghapus kategori "${catTitle}" beserta seluruh opsi di dalamnya?`,
      confirmLabel: 'Ya, Hapus Kategori',
      isDestructive: true,
      onConfirm: () => {
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
          onSaveSchema(updated);
          try {
            localStorage.setItem('database_schema_v2', JSON.stringify(updated));
            localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: updated }));
          } catch (e) {
            console.error('Sync error', e);
          }
          return updated;
        });
        setConfirmDialog(null);
        setSaveToast(`Kategori "${catTitle}" telah berhasil dihapus.`);
      },
    });
  };

  // Handler: Add New Option
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
      const targetMap =
        tab === 'appeal'
          ? { ...updated.appealCategories }
          : tab === 'attributes'
          ? { ...updated.attributeCategories }
          : { ...updated.specialtyCategories };

      if (targetMap[categoryKey]) {
        targetMap[categoryKey] = {
          ...targetMap[categoryKey],
          options: [...(targetMap[categoryKey].options || []), newOpt],
        };
      }

      if (tab === 'appeal') updated.appealCategories = targetMap as any;
      else if (tab === 'attributes') updated.attributeCategories = targetMap as any;
      else updated.specialtyCategories = targetMap as any;

      return updated;
    });

    setNewOptionModal({ isOpen: false, tab: 'appeal', categoryKey: '', name: '', description: '' });
    setSaveToast(`Opsi "${name.trim()}" berhasil ditambahkan.`);
  };

  // Handler: Save Option Edit
  const handleSaveOptionEdit = () => {
    if (!editingOption || !editingOption.name.trim()) return;
    const { tab, categoryKey, oldName, name, description } = editingOption;

    setDraftSchema(prev => {
      const updated = { ...prev };
      const targetMap =
        tab === 'appeal'
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
    setSaveToast('Opsi berhasil diperbarui.');
  };

  // Handler: Delete Option
  const handleDeleteOption = (tab: 'appeal' | 'attributes' | 'specialty', categoryKey: string, optName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Opsi Pilihan?',
      message: `Apakah Anda yakin ingin menghapus opsi "${optName}"?`,
      confirmLabel: 'Ya, Hapus Opsi',
      isDestructive: true,
      onConfirm: () => {
        setDraftSchema(prev => {
          const updated = { ...prev };
          const targetMap =
            tab === 'appeal'
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

          onSaveSchema(updated);
          try {
            localStorage.setItem('database_schema_v2', JSON.stringify(updated));
            localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: updated }));
          } catch (e) {
            console.error('Sync error', e);
          }
          return updated;
        });
        setConfirmDialog(null);
        setSaveToast(`Opsi "${optName}" telah berhasil dihapus.`);
      },
    });
  };

  // Handler: Save Trait Edit (including weight percentage)
  const handleSaveTraitEdit = () => {
    if (!editingTrait || !editingTrait.label.trim()) return;
    const { category, key, label, shortDescription, weightPercent } = editingTrait;
    const validWeightPct = Math.max(1, Math.min(100, Math.round(weightPercent || 15)));

    setDraftSchema(prev => {
      const updated = { ...prev };
      const traitList = category === 'appearance' ? updated.scoringTraits?.appearance : updated.scoringTraits?.impression;

      if (traitList) {
        const updatedList = traitList.map(t =>
          t.key === key
            ? {
                ...t,
                label: label.trim(),
                shortDescription: shortDescription.trim(),
                weight: validWeightPct / 100,
                weightLabel: `${validWeightPct}%`,
              }
            : t
        );

        updated.scoringTraits = {
          appearance: category === 'appearance' ? updatedList : (updated.scoringTraits?.appearance || []),
          impression: category === 'impression' ? updatedList : (updated.scoringTraits?.impression || []),
        };
      }

      onSaveSchema(updated);
      try {
        localStorage.setItem('database_schema_v2', JSON.stringify(updated));
        localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: updated }));
      } catch (e) {
        console.error('Sync error', e);
      }
      return updated;
    });

    setEditingTrait(null);
    setSaveToast(`Trait scoring "${label.trim()}" (${validWeightPct}%) berhasil diperbarui.`);
  };

  // Handler: Add New Scoring Trait
  const handleCreateTrait = () => {
    const { category, key, label, shortDescription, weightPercent } = newTraitModal;
    if (!label.trim()) return;

    const traitKey = key.trim() || `trait_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const validWeightPct = Math.max(1, Math.min(100, Math.round(weightPercent || 15)));

    const newTrait: ScoringTraitMetadata = {
      key: traitKey,
      label: label.trim(),
      category,
      weight: validWeightPct / 100,
      weightLabel: `${validWeightPct}%`,
      shortDescription: shortDescription.trim() || `Parameter penilaian ${label.trim()}`,
      rubricGuide: {
        sTier: '90-99 (Sempurna & Istimewa)',
        aTier: '80-89 (Sangat Bagus)',
        bTier: '70-79 (Standar Rata-rata)',
        cTier: '<70 (Perlu Peningkatan)',
      },
    };

    setDraftSchema(prev => {
      const updated = { ...prev };
      const currentList = category === 'appearance' ? updated.scoringTraits?.appearance || [] : updated.scoringTraits?.impression || [];

      updated.scoringTraits = {
        appearance: category === 'appearance' ? [...currentList, newTrait] : (updated.scoringTraits?.appearance || []),
        impression: category === 'impression' ? [...currentList, newTrait] : (updated.scoringTraits?.impression || []),
      };

      onSaveSchema(updated);
      try {
        localStorage.setItem('database_schema_v2', JSON.stringify(updated));
        localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: updated }));
      } catch (e) {
        console.error('Sync error', e);
      }
      return updated;
    });

    setNewTraitModal({ isOpen: false, category: 'appearance', key: '', label: '', shortDescription: '', weightPercent: 15 });
    setSaveToast(`Trait "${label.trim()}" (${validWeightPct}%) berhasil ditambahkan.`);
  };

  // Handler: Delete Scoring Trait
  const handleDeleteTrait = (category: 'appearance' | 'impression', traitKey: string) => {
    const list = category === 'appearance' ? draftSchema.scoringTraits?.appearance || [] : draftSchema.scoringTraits?.impression || [];
    const trait = list.find(t => t.key === traitKey);
    const traitLabel = trait?.label || traitKey;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Trait Penilaian?',
      message: `Apakah Anda yakin ingin menghapus parameter trait "${traitLabel}" dari penilaian ${category.toUpperCase()}?`,
      confirmLabel: 'Ya, Hapus Trait',
      isDestructive: true,
      onConfirm: () => {
        setDraftSchema(prev => {
          const updated = { ...prev };
          const currentAppearance = (updated.scoringTraits?.appearance || []).filter(t => t.key !== traitKey);
          const currentImpression = (updated.scoringTraits?.impression || []).filter(t => t.key !== traitKey);

          updated.scoringTraits = {
            appearance: category === 'appearance' ? currentAppearance : (updated.scoringTraits?.appearance || []),
            impression: category === 'impression' ? currentImpression : (updated.scoringTraits?.impression || []),
          };

          onSaveSchema(updated);
          try {
            localStorage.setItem('database_schema_v2', JSON.stringify(updated));
            localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: updated }));
          } catch (e) {
            console.error('Sync error', e);
          }
          return updated;
        });
        setConfirmDialog(null);
        setSaveToast(`Trait "${traitLabel}" telah berhasil dihapus.`);
      },
    });
  };

  // Handler: Update Scoring Weights (Appearance vs Impression Contribution)
  const handleUpdateScoringWeights = (appWeight: number, impWeight: number) => {
    const clampedApp = Math.max(0, Math.min(100, Math.round(appWeight)));
    const clampedImp = Math.max(0, Math.min(100, Math.round(impWeight)));

    setDraftSchema(prev => {
      const updated = {
        ...prev,
        scoringWeights: {
          appearanceWeight: clampedApp,
          impressionWeight: clampedImp,
        },
      };
      onSaveSchema(updated);
      try {
        localStorage.setItem('database_schema_v2', JSON.stringify(updated));
        localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: updated }));
      } catch (e) {
        console.error('Sync error', e);
      }
      return updated;
    });

    setSaveToast(`Bobot penilaian diatur: Appearance ${clampedApp}% & Impression ${clampedImp}%.`);
  };

  // Handler: Normalize trait weights within category to sum to 100%
  const handleNormalizeTraitWeights = (category: 'appearance' | 'impression') => {
    setDraftSchema(prev => {
      const updated = { ...prev };
      const list = category === 'appearance' ? [...(updated.scoringTraits?.appearance || [])] : [...(updated.scoringTraits?.impression || [])];
      if (list.length === 0) return prev;

      const equalWeight = Math.floor(100 / list.length);
      const normalized = list.map((t, idx) => {
        const pct = idx === list.length - 1 ? 100 - equalWeight * (list.length - 1) : equalWeight;
        return {
          ...t,
          weight: pct / 100,
          weightLabel: `${pct}%`,
        };
      });

      updated.scoringTraits = {
        appearance: category === 'appearance' ? normalized : (updated.scoringTraits?.appearance || []),
        impression: category === 'impression' ? normalized : (updated.scoringTraits?.impression || []),
      };

      onSaveSchema(updated);
      try {
        localStorage.setItem('database_schema_v2', JSON.stringify(updated));
        localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: updated }));
      } catch (e) {
        console.error('Sync error', e);
      }
      return updated;
    });

    setSaveToast(`Bobot seluruh trait ${category.toUpperCase()} berhasil dinormalisasi (Total 100%).`);
  };

  // Handler: Save Biodata Field Edit (only title/label, text, and description)
  const handleSaveBiodataFieldEdit = () => {
    if (!editingBiodataField || !editingBiodataField.label.trim()) return;
    const { key, label, shortDescription, editorGuidelines } = editingBiodataField;

    setDraftSchema(prev => {
      const updated = { ...prev };
      if (!updated.fields) updated.fields = {};
      const existingField = updated.fields[key] || DEFAULT_DATABASE_SCHEMA.fields[key];

      if (existingField) {
        updated.fields[key] = {
          ...existingField,
          label: label.trim(),
          shortDescription: shortDescription.trim(),
          editorGuidelines: editorGuidelines?.trim() || existingField.editorGuidelines,
        };
      }

      onSaveSchema(updated);
      try {
        localStorage.setItem('database_schema_v2', JSON.stringify(updated));
        localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: updated }));
      } catch (e) {
        console.error('Sync error', e);
      }
      return updated;
    });

    setEditingBiodataField(null);
    setSaveToast(`Bidang biodata "${label.trim()}" berhasil disimpan.`);
  };

  // Handler: Save All Schema Changes & Synchronize
  const handleSaveAll = () => {
    // Keep user customized sectionTitles without forcing fallback on non-empty/empty state
    const sanitizedSchema = { ...draftSchema };
    sanitizedSchema.sectionTitles = {
      ...sanitizedSchema.sectionTitles,
      biodata: sanitizedSchema.sectionTitles?.biodata !== undefined ? sanitizedSchema.sectionTitles.biodata : 'BIODATA',
      appeal: sanitizedSchema.sectionTitles?.appeal !== undefined ? sanitizedSchema.sectionTitles.appeal : 'APPEAL',
      attributes: sanitizedSchema.sectionTitles?.attributes !== undefined ? sanitizedSchema.sectionTitles.attributes : 'ATTRIBUTES',
      specialty: sanitizedSchema.sectionTitles?.specialty !== undefined ? sanitizedSchema.sectionTitles.specialty : 'SPECIALTY',
      appearance: sanitizedSchema.sectionTitles?.appearance !== undefined ? sanitizedSchema.sectionTitles.appearance : 'APPEARANCE',
      impression: sanitizedSchema.sectionTitles?.impression !== undefined ? sanitizedSchema.sectionTitles.impression : 'IMPRESSION',
    };

    onSaveSchema(sanitizedSchema);
    try {
      localStorage.setItem('database_schema_v2', JSON.stringify(sanitizedSchema));
      localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(sanitizedSchema));
      window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: sanitizedSchema }));
    } catch (e) {
      console.error('Error broadcasting schema update', e);
    }
    setSaveToast('Skema dinamis berhasil disimpan dan disinkronkan ke seluruh halaman!');
  };

  // Handler: Reset to default schema with modal confirmation
  const handleResetToDefault = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset ke Standar Default?',
      message: 'Semua perubahan judul bidang, kategori, opsi, nama biodata, dan bobot persentase akan dikembalikan ke konfigurasi bawaan sistem. Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Ya, Reset Skema',
      isDestructive: true,
      onConfirm: () => {
        const defaultCopy = JSON.parse(JSON.stringify(DEFAULT_DATABASE_SCHEMA));
        setDraftSchema(defaultCopy);
        onSaveSchema(defaultCopy);
        onResetSchema?.();
        try {
          localStorage.setItem('database_schema_v2', JSON.stringify(defaultCopy));
          localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(defaultCopy));
          window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: defaultCopy }));
        } catch (e) {
          console.error('Error broadcasting schema reset', e);
        }
        setConfirmDialog(null);
        setSaveToast('Skema telah berhasil dikembalikan ke pengaturan bawaan default.');
      },
    });
  };

  // Handler: Export CSV
  const handleExportCsv = () => {
    const csvData = exportSchemaToCsv(draftSchema);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsvFile(`dynamic_schema_${dateStr}.csv`, csvData);
    setSaveToast('File CSV berhasil diunduh. Anda dapat membukanya di Google Sheets atau Excel.');
  };

  // Handler: Trigger File Select for CSV Import
  const handleSelectCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = importSchemaFromCsv(content, draftSchema);
        setCsvImportModal({
          isOpen: true,
          fileContent: content,
          fileName: file.name,
          parsedResult: parsed,
        });
      }
    };
    reader.readAsText(file, 'UTF-8');
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handler: Apply CSV Import
  const handleApplyCsvImport = () => {
    if (!csvImportModal.parsedResult || !csvImportModal.parsedResult.success) return;

    const newSchema = csvImportModal.parsedResult.schema;
    setDraftSchema(newSchema);
    onSaveSchema(newSchema);
    try {
      localStorage.setItem('database_schema_v2', JSON.stringify(newSchema));
      localStorage.setItem('talent_rating_db_schema_v1', JSON.stringify(newSchema));
      window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: newSchema }));
    } catch (e) {
      console.error('Failed to sync schema', e);
    }

    const { sectionTitlesUpdated, categoriesUpdated, optionsUpdated, traitsUpdated } = csvImportModal.parsedResult.summary;
    setCsvImportModal({ isOpen: false, fileContent: null, fileName: null, parsedResult: null });
    setSaveToast(
      `Impor CSV Sukses: ${sectionTitlesUpdated} Judul Bidang, ${categoriesUpdated} Kategori, ${optionsUpdated} Opsi, ${traitsUpdated} Trait diperbarui!`
    );
  };

  // Filtered categories/traits/biodata based on searchQuery
  const biodataFields = useMemo(() => {
    const rawFields: Record<string, FieldMetadata> = { ...(DEFAULT_DATABASE_SCHEMA.fields || {}), ...(draftSchema.fields || {}) };
    const allBiodata = Object.entries(rawFields).filter(([_, f]) => f.category === 'biodata');
    if (!searchQuery.trim()) return allBiodata;
    const q = searchQuery.toLowerCase();
    return allBiodata.filter(([k, f]) =>
      k.toLowerCase().includes(q) ||
      f.label.toLowerCase().includes(q) ||
      (f.shortDescription && f.shortDescription.toLowerCase().includes(q))
    );
  }, [draftSchema.fields, searchQuery]);

  const categoriesList = useMemo(() => {
    if (activeTab === 'biodata' || activeTab === 'appearance' || activeTab === 'impression') return [];
    const cats = getCategoriesForTab(activeTab as 'appeal' | 'attributes' | 'specialty');
    return Object.entries(cats).filter(([_, def]) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchCat = def.title.toLowerCase().includes(q) || def.shortDescription?.toLowerCase().includes(q);
      const matchOpt = (def.options || []).some(o => o.name.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q));
      return matchCat || matchOpt;
    });
  }, [activeTab, draftSchema, searchQuery]);

  const traitsList = useMemo(() => {
    if (activeTab !== 'appearance' && activeTab !== 'impression') return [];
    const list = activeTab === 'appearance' ? draftSchema.scoringTraits?.appearance || [] : draftSchema.scoringTraits?.impression || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(t => t.label.toLowerCase().includes(q) || t.shortDescription?.toLowerCase().includes(q));
  }, [activeTab, draftSchema, searchQuery]);

  // Current tab metadata
  const currentTabMeta = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col pb-28">
      {/* Hidden File Input for CSV Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleSelectCsvFile}
      />

      {/* ========================================================================= */}
      {/* 1. TOP STICKY HEADER                                                      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          {/* Left: Back Button & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-all cursor-pointer flex-shrink-0"
              title="Kembali ke halaman sebelumnya"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </span>
                <h1 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-display truncate">
                  Pengaturan Skema Dinamis
                </h1>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block truncate">
                Kustomisasi nama bidang utama, kategori, opsi pilihan, dan scoring traits
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-bold transition-all cursor-pointer"
              title="Unduh seluruh skema ke file CSV (dapat diedit di Google Sheets/Excel)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Ekspor CSV</span>
            </button>

            {/* CSV Import Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-bold transition-all cursor-pointer"
              title="Unggah file CSV yang telah diedit untuk memperbarui skema secara otomatis"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Impor CSV</span>
            </button>

            {/* Reset to Default */}
            <button
              type="button"
              onClick={handleResetToDefault}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-900 hover:bg-red-950/40 text-stone-400 hover:text-red-400 border border-stone-800 text-xs font-bold transition-all cursor-pointer"
              title="Kembalikan ke konfigurasi default sistem"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline ml-1">Reset Default</span>
            </button>

            {/* Save All */}
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. HORIZONTAL TAB SELECTOR (Mobile Optimized Pill Scroll)                 */}
        {/* ========================================================================= */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto pb-2.5 pt-1 scrollbar-none flex items-center gap-2">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-black ring-1 ring-amber-400/50'
                    : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 border-stone-800 hover:bg-stone-800'
                }`}
              >
                <span className={isActive ? 'text-stone-950' : t.color}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] px-4 py-2.5 rounded-xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="flex-1">{saveToast}</span>
          <button type="button" onClick={() => setSaveToast(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT CONTAINER                                                 */}
      {/* ========================================================================= */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* ======================================================================= */}
        {/* CARD A: KUSTOMISASI JUDUL BIDANG UTAMA (SECTION TITLE)                  */}
        {/* ======================================================================= */}
        <section className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider block">
                Pengaturan Label Global
              </span>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                Nama Bidang Utama: {currentTabMeta.label}
              </h2>
            </div>
            <span className="text-xs text-stone-400">
              Sinkron ke tab, formulir artis, kartu, dan filter
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={draftSchema.sectionTitles?.[activeTab] ?? ''}
                onChange={e => handleUpdateSectionTitle(activeTab, e.target.value)}
                placeholder={`Masukkan nama bidang ${activeTab.toUpperCase()}...`}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleUpdateSectionTitle(activeTab, activeTab.toUpperCase())}
                className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                title="Reset nama bidang ke default"
              >
                Gunakan Default ({activeTab.toUpperCase()})
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition-all border border-stone-700 cursor-pointer whitespace-nowrap"
              >
                Terapkan Label
              </button>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 italic">
            * Anda dapat menghapus seluruh teks dan mengetik nama baru secara bebas. Saat disimpan, label ini akan langsung diperbarui di semua halaman aplikasi.
          </p>
        </section>

        {/* Search and Filter within Active Tab */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={`Cari kategori atau opsi dalam ${currentTabMeta.label}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Item Button */}
          {(activeTab === 'appeal' || activeTab === 'attributes' || activeTab === 'specialty') ? (
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
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Kategori {currentTabMeta.label}</span>
            </button>
          ) : activeTab === 'biodata' ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-bold">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Kustomisasi Judul, Teks & Deskripsi Bidang Biodata</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                setNewTraitModal({
                  isOpen: true,
                  category: activeTab,
                  key: '',
                  label: '',
                  shortDescription: '',
                  weightPercent: 15,
                })
              }
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Trait Penilaian Slider</span>
            </button>
          )}
        </div>

        {/* ======================================================================= */}
        {/* TAB: BIODATA FIELDS (Edit Judul/Label, Teks Panduan, Deskripsi)         */}
        {/* ======================================================================= */}
        {activeTab === 'biodata' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Daftar Bidang Biodata ({biodataFields.length} Field)</span>
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Anda dapat mengubah judul label, teks panduan/format pengisian, dan deskripsi masing-masing field biodata artis.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-mono text-xs font-bold border border-blue-500/20">
                Skema Biodata Dinamis
              </span>
            </div>

            {biodataFields.length === 0 ? (
              <div className="p-8 rounded-2xl bg-stone-900/50 border border-stone-800 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-stone-500 mx-auto" />
                <p className="text-sm text-stone-400 font-medium">
                  {searchQuery ? `Tidak ada bidang biodata yang cocok dengan "${searchQuery}".` : 'Tidak ada bidang biodata ditemukan.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Hapus Filter Pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {biodataFields.map(([fieldKey, fieldDef]) => (
                  <div
                    key={fieldKey}
                    className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800/80 hover:border-blue-500/40 shadow-sm flex flex-col justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                            {fieldDef.label}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-950 text-stone-400 border border-stone-800">
                            {fieldKey}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingBiodataField({
                              key: fieldKey,
                              label: fieldDef.label,
                              shortDescription: fieldDef.shortDescription || '',
                              editorGuidelines: fieldDef.editorGuidelines || '',
                            })
                          }
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                          title="Edit Judul, Teks & Deskripsi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Ubah</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/70 space-y-1">
                          <div className="text-[10px] uppercase font-bold text-stone-500">Teks Panduan / Format:</div>
                          <p className="text-stone-300 font-mono text-[11px] leading-relaxed">
                            {fieldDef.editorGuidelines || 'Tidak ada teks panduan format.'}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/70 space-y-1">
                          <div className="text-[10px] uppercase font-bold text-stone-500">Deskripsi Field:</div>
                          <p className="text-stone-400 text-[11px] leading-relaxed">
                            {fieldDef.shortDescription || 'Tidak ada deskripsi.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 1, 2, 3: APPEAL, ATTRIBUTES, SPECIALTY CATEGORIES & OPTIONS        */}
        {/* ======================================================================= */}
        {(activeTab === 'appeal' || activeTab === 'attributes' || activeTab === 'specialty') && (
          <div className="space-y-4">
            {categoriesList.length === 0 ? (
              <div className="p-8 rounded-2xl bg-stone-900/50 border border-stone-800 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-stone-500 mx-auto" />
                <p className="text-sm text-stone-400 font-medium">
                  {searchQuery ? `Tidak ada kategori atau opsi yang cocok dengan "${searchQuery}".` : `Belum ada kategori untuk ${currentTabMeta.label}.`}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Hapus Filter Pencarian
                  </button>
                )}
              </div>
            ) : (
              categoriesList.map(([catKey, catDef]) => {
                const options = catDef.options || [];

                return (
                  <div
                    key={catKey}
                    className="p-4 sm:p-5 rounded-2xl bg-stone-900/80 border border-stone-800/90 shadow-md space-y-4 transition-all hover:border-stone-700"
                  >
                    {/* Category Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                            {catDef.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-stone-950 border border-stone-800 font-mono text-[10px] text-stone-400">
                            key: {catKey}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold">
                            {options.length} Opsi
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 leading-relaxed">
                          {catDef.shortDescription}
                        </p>
                      </div>

                      {/* Action Buttons for Category */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingCategory({
                              tab: activeTab,
                              catKey,
                              title: catDef.title,
                              description: catDef.shortDescription,
                            })
                          }
                          className="p-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 transition-colors"
                          title="Edit nama dan deskripsi kategori"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(activeTab, catKey)}
                          className="p-1.5 rounded-lg bg-stone-950 hover:bg-red-950/40 text-stone-400 hover:text-red-400 border border-stone-800 transition-colors"
                          title="Hapus kategori ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-stone-400 font-bold uppercase tracking-wider">
                        <span>Pilihan Opsi ({options.length}):</span>
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
                          className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Tambah Opsi</span>
                        </button>
                      </div>

                      {options.length === 0 ? (
                        <p className="text-xs text-stone-500 italic p-3 rounded-xl bg-stone-950/60 border border-stone-800/60">
                          Belum ada opsi pada kategori ini. Klik "+ Tambah Opsi" untuk menambahkan.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {options.map((opt) => (
                            <div
                              key={opt.id || opt.name}
                              className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 hover:border-stone-700 flex flex-col justify-between gap-2 transition-colors"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-stone-100">{opt.name}</span>
                                  <div className="flex items-center gap-1">
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
                                      className="p-1 rounded text-stone-400 hover:text-amber-400"
                                      title="Edit Opsi"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOption(activeTab, catKey, opt.name)}
                                      className="p-1 rounded text-stone-400 hover:text-red-400"
                                      title="Hapus Opsi"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                                  {opt.description || opt.guidelines || 'Tidak ada deskripsi.'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 4 & 5: APPEARANCE & IMPRESSION SCORING TRAITS                       */}
        {/* ======================================================================= */}
        {(activeTab === 'appearance' || activeTab === 'impression') && (
          <div className="space-y-4">
            {/* CARD 1: BOBOT KONTRIBUSI RATING KESELURUHAN (APPEARANCE VS IMPRESSION) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-cyan-500/30 shadow-lg space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Sliders className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                      Bobot Kontribusi Rating Keseluruhan
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Tentukan persentase pengaruh Appearance vs Impression terhadap Skor Akhir (Overall Rating).
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleUpdateScoringWeights(60, 40)}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold border border-stone-700 cursor-pointer"
                  >
                    Preset 60% / 40% (Standar)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateScoringWeights(50, 50)}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold border border-stone-700 cursor-pointer"
                  >
                    Preset 50% / 50% (Seimbang)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateScoringWeights(70, 30)}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold border border-stone-700 cursor-pointer"
                  >
                    Preset 70% / 30%
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Appearance Weight Card */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-cyan-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      {draftSchema.sectionTitles?.appearance || 'APPEARANCE'}
                    </span>
                    <span className="text-base font-black font-mono text-cyan-400">
                      {draftSchema.scoringWeights?.appearanceWeight ?? 60}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={draftSchema.scoringWeights?.appearanceWeight ?? 60}
                      onChange={e => {
                        const appW = parseInt(e.target.value, 10) || 0;
                        handleUpdateScoringWeights(appW, 100 - appW);
                      }}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
                    <span className="text-[11px] text-stone-400">Input Angka:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={draftSchema.scoringWeights?.appearanceWeight ?? 60}
                        onChange={e => {
                          const appW = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                          handleUpdateScoringWeights(appW, 100 - appW);
                        }}
                        className="w-16 px-2 py-1 rounded-lg bg-stone-900 border border-stone-700 text-xs font-mono font-bold text-cyan-400 text-center"
                      />
                      <span className="text-xs font-bold text-stone-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Impression Weight Card */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-pink-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5" />
                      {draftSchema.sectionTitles?.impression || 'IMPRESSION'}
                    </span>
                    <span className="text-base font-black font-mono text-pink-400">
                      {draftSchema.scoringWeights?.impressionWeight ?? 40}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={draftSchema.scoringWeights?.impressionWeight ?? 40}
                      onChange={e => {
                        const impW = parseInt(e.target.value, 10) || 0;
                        handleUpdateScoringWeights(100 - impW, impW);
                      }}
                      className="w-full accent-pink-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
                    <span className="text-[11px] text-stone-400">Input Angka:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={draftSchema.scoringWeights?.impressionWeight ?? 40}
                        onChange={e => {
                          const impW = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                          handleUpdateScoringWeights(100 - impW, impW);
                        }}
                        className="w-16 px-2 py-1 rounded-lg bg-stone-900 border border-stone-700 text-xs font-mono font-bold text-pink-400 text-center"
                      />
                      <span className="text-xs font-bold text-stone-400">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: DAFTAR TRAIT PENILAIAN DENGAN BOBOT PERSENTASE */}
            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                  Trait Penilaian Slider {currentTabMeta.label}
                </h3>
                <p className="text-[11px] text-stone-400">
                  Parameter ini tampil sebagai slider protected 0–99 pada formulir artis. Bobot persentase menentukan kontribusi trait pada bidang ini.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNormalizeTraitWeights(activeTab as 'appearance' | 'impression')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-bold transition-all cursor-pointer"
                  title="Bagi rata bobot seluruh trait agar totalnya pas 100%"
                >
                  <Percent className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Normalisasi Bobot (100%)</span>
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-xs font-bold">
                  {traitsList.length} Trait (Total: {traitsList.reduce((acc, t) => acc + Math.round((t.weight || 0) * 100), 0)}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {traitsList.map(trait => (
                <div
                  key={trait.key}
                  className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800/80 hover:border-cyan-500/40 shadow-sm flex flex-col justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <h4 className="font-bold text-xs sm:text-sm text-white">{trait.label}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-950 text-cyan-400 font-bold border border-stone-800" title="Bobot Persentase Trait">
                          {trait.weightLabel || `${Math.round((trait.weight || 0) * 100)}%`}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingTrait({
                              category: activeTab,
                              key: trait.key,
                              label: trait.label,
                              shortDescription: trait.shortDescription,
                              weightPercent: Math.round((trait.weight || 0.15) * 100),
                            })
                          }
                          className="p-1 rounded text-stone-400 hover:text-cyan-400"
                          title="Edit Trait & Bobot"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrait(activeTab, trait.key)}
                          className="p-1 rounded text-stone-400 hover:text-red-400"
                          title="Hapus Trait"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">{trait.shortDescription}</p>
                  </div>

                  {/* Rubric Preview Pill */}
                  {trait.rubricGuide && (
                    <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 text-[10px] space-y-1 font-mono text-stone-400">
                      <div className="flex justify-between">
                        <span className="text-amber-400 font-bold">Tier S (90-99):</span>
                        <span className="truncate max-w-[200px] text-right">{trait.rubricGuide.sTier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400 font-bold">Tier A (80-89):</span>
                        <span className="truncate max-w-[200px] text-right">{trait.rubricGuide.aTier}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. MODALS (Add Category, Edit Category, Add Option, Edit Option, CSV)     */}
      {/* ========================================================================= */}

      {/* Modal: Tambah Kategori Baru */}
      {newCategoryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase">Tambah Kategori Baru ({newCategoryModal.tab})</h3>
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
                <label className="text-xs font-bold text-stone-300 block mb-1">Nama Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Style Rambut, Konsep Kostum"
                  value={newCategoryModal.title}
                  onChange={e => setNewCategoryModal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Deskripsi Kategori</label>
                <textarea
                  placeholder="Penjelasan kriteria kategori..."
                  rows={3}
                  value={newCategoryModal.description}
                  onChange={e => setNewCategoryModal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewCategoryModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={!newCategoryModal.title.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black disabled:opacity-50"
              >
                Tambah Kategori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Kategori */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase">Edit Kategori</h3>
              <button type="button" onClick={() => setEditingCategory(null)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={editingCategory.title}
                  onChange={e => setEditingCategory(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Deskripsi Kategori</label>
                <textarea
                  rows={3}
                  value={editingCategory.description}
                  onChange={e => setEditingCategory(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCategoryEdit}
                disabled={!editingCategory.title.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black disabled:opacity-50"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Opsi Baru */}
      {newOptionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase">Tambah Opsi Pilihan</h3>
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
                <label className="text-xs font-bold text-stone-300 block mb-1">Nama Opsi</label>
                <input
                  type="text"
                  placeholder="Contoh: Athletic, Vintage, dll"
                  value={newOptionModal.name}
                  onChange={e => setNewOptionModal(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Deskripsi / Panduan Kriteria</label>
                <textarea
                  placeholder="Keterangan yang akan muncul saat opsi ini dipilih..."
                  rows={3}
                  value={newOptionModal.description}
                  onChange={e => setNewOptionModal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewOptionModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateOption}
                disabled={!newOptionModal.name.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black disabled:opacity-50"
              >
                Tambah Opsi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Opsi */}
      {editingOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase">Edit Opsi</h3>
              <button type="button" onClick={() => setEditingOption(null)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Nama Opsi</label>
                <input
                  type="text"
                  value={editingOption.name}
                  onChange={e => setEditingOption(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Deskripsi / Kriteria Opsi</label>
                <textarea
                  rows={3}
                  value={editingOption.description}
                  onChange={e => setEditingOption(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingOption(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveOptionEdit}
                disabled={!editingOption.name.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black disabled:opacity-50"
              >
                Simpan Opsi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Trait */}
      {editingTrait && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase">Edit Trait Penilaian ({editingTrait.category})</h3>
              <button type="button" onClick={() => setEditingTrait(null)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Label Trait</label>
                <input
                  type="text"
                  value={editingTrait.label}
                  onChange={e => setEditingTrait(prev => prev ? { ...prev, label: e.target.value } : null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Bobot Persentase (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingTrait.weightPercent ?? 15}
                    onChange={e => setEditingTrait(prev => prev ? { ...prev, weightPercent: parseInt(e.target.value, 10) || 0 } : null)}
                    className="w-24 px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-400 text-center"
                  />
                  <span className="text-xs font-bold text-stone-400">% dari total skor {editingTrait.category}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Keterangan / Panduan Penilaian</label>
                <textarea
                  rows={3}
                  value={editingTrait.shortDescription}
                  onChange={e => setEditingTrait(prev => prev ? { ...prev, shortDescription: e.target.value } : null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTrait(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTraitEdit}
                disabled={!editingTrait.label.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-stone-950 text-xs font-black disabled:opacity-50"
              >
                Simpan Trait
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Trait Baru */}
      {newTraitModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase">Tambah Trait Slider Baru ({newTraitModal.category})</h3>
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
                <label className="text-xs font-bold text-stone-300 block mb-1">Nama / Label Trait</label>
                <input
                  type="text"
                  placeholder="Contoh: Eye Contact, Charisma"
                  value={newTraitModal.label}
                  onChange={e => setNewTraitModal(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Bobot Persentase (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newTraitModal.weightPercent ?? 15}
                    onChange={e => setNewTraitModal(prev => ({ ...prev, weightPercent: parseInt(e.target.value, 10) || 0 }))}
                    className="w-24 px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-400 text-center"
                  />
                  <span className="text-xs font-bold text-stone-400">% dari total skor {newTraitModal.category}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Deskripsi Trait</label>
                <textarea
                  placeholder="Penjelasan aspek yang dinilai..."
                  rows={3}
                  value={newTraitModal.shortDescription}
                  onChange={e => setNewTraitModal(prev => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewTraitModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateTrait}
                disabled={!newTraitModal.label.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-stone-950 text-xs font-black disabled:opacity-50"
              >
                Tambah Trait
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Biodata Field (Judul, Teks Panduan, Deskripsi) */}
      {editingBiodataField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-black text-white uppercase">
                  Ubah Bidang Biodata: {editingBiodataField.key}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBiodataField(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Judul / Label Field (Tampil di Formulir & Kartu)
                </label>
                <input
                  type="text"
                  value={editingBiodataField.label}
                  onChange={e => setEditingBiodataField(prev => prev ? { ...prev, label: e.target.value } : null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white font-bold focus:outline-none focus:border-blue-400"
                  placeholder="Contoh: Nama Lengkap / Stage Name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Teks Panduan / Format Input (Placeholder & Petunjuk)
                </label>
                <input
                  type="text"
                  value={editingBiodataField.editorGuidelines || ''}
                  onChange={e => setEditingBiodataField(prev => prev ? { ...prev, editorGuidelines: e.target.value } : null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                  placeholder="Contoh: Format text, max 50 karakter..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Deskripsi / Keterangan Tambahan
                </label>
                <textarea
                  rows={3}
                  value={editingBiodataField.shortDescription || ''}
                  onChange={e => setEditingBiodataField(prev => prev ? { ...prev, shortDescription: e.target.value } : null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-blue-400"
                  placeholder="Penjelasan fungsi bidang data ini..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingBiodataField(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBiodataFieldEdit}
                disabled={!editingBiodataField.label.trim()}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-stone-950 text-xs font-black disabled:opacity-50 cursor-pointer"
              >
                Simpan Bidang Biodata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Global Confirmation Dialog (Reset Default & Delete) */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
              <div className={`p-2 rounded-xl ${confirmDialog.isDestructive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {confirmDialog.isDestructive ? <AlertTriangle className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-white uppercase truncate">
                  {confirmDialog.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {confirmDialog.message}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-800/80">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const onConf = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  onConf();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer ${
                  confirmDialog.isDestructive
                    ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
                }`}
              >
                {confirmDialog.confirmLabel || 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CSV IMPORT REVIEW MODAL                                                */}
      {/* ========================================================================= */}
      {csvImportModal.isOpen && csvImportModal.parsedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-700 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-black text-white uppercase">
                  Konfirmasi Impor Skema CSV
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCsvImportModal({ isOpen: false, fileContent: null, fileName: null, parsedResult: null })}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-stone-400 block mb-1">File Terdeteksi:</span>
                <span className="font-mono text-white font-bold">{csvImportModal.fileName}</span>
              </div>

              {csvImportModal.parsedResult.success ? (
                <div className="space-y-2">
                  <span className="text-emerald-400 font-bold block">
                    ✓ File CSV valid dan siap diterapkan:
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Judul Bidang</span>
                      <strong className="text-amber-400 text-sm">{csvImportModal.parsedResult.summary.sectionTitlesUpdated}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Kategori</span>
                      <strong className="text-purple-400 text-sm">{csvImportModal.parsedResult.summary.categoriesUpdated}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Opsi Pilihan</span>
                      <strong className="text-emerald-400 text-sm">{csvImportModal.parsedResult.summary.optionsUpdated}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Trait Scoring</span>
                      <strong className="text-cyan-400 text-sm">{csvImportModal.parsedResult.summary.traitsUpdated}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 space-y-1">
                  <span className="font-bold block">Gagal memproses file CSV:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {csvImportModal.parsedResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setCsvImportModal({ isOpen: false, fileContent: null, fileName: null, parsedResult: null })}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
              >
                Batal
              </button>
              {csvImportModal.parsedResult.success && (
                <button
                  type="button"
                  onClick={handleApplyCsvImport}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-md"
                >
                  Terapkan ke Aplikasi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
