import React, { useState, useEffect } from 'react';
import {
  MasterTaxonomyData,
  FormTabGroup,
  DEFAULT_FORM_LAYOUT_STRUCTURE,
  FORM_FIELD_DISPLAY_NAMES,
  getArtistFormLayoutStructure,
  saveArtistFormLayoutStructure,
  resetArtistFormLayoutStructure,
} from '../../utils/taxonomyManager';
import {
  GripVertical,
  MoveUp,
  MoveDown,
  Save,
  CheckCircle2,
  Layers,
  Sparkles,
  Sliders,
  Tag,
  Hash,
  RotateCcw,
  Info,
  Folder,
  FolderPlus,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Smile,
  Eye,
  User,
  Ruler,
  Globe,
  FileText,
  Calendar,
  Award,
  Link as LinkIcon,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';

interface TaxonomyReorderTabProps {
  data: MasterTaxonomyData;
  isDark?: boolean;
  onShowToast?: (msg: string) => void;
}

export const TaxonomyReorderTab: React.FC<TaxonomyReorderTabProps> = ({
  data,
  isDark = true,
  onShowToast,
}) => {
  // 1. Layout Structure State (List of Top-Level Tab Groups)
  const [tabGroups, setTabGroups] = useState<FormTabGroup[]>(() =>
    getArtistFormLayoutStructure()
  );

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    folder_biodata: true,
    folder_measurements: true,
    folder_appeal: true,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Modal / Inline "Tambah Folder Baru"
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState('');

  // Move Field Modal
  const [movingField, setMovingField] = useState<{
    fieldKey: string;
    fromGroupId: string;
  } | null>(null);

  // Editing Folder Title
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupTitle, setEditGroupTitle] = useState('');

  // Drag states for Groups (top level)
  const [draggedGroupIdx, setDraggedGroupIdx] = useState<number | null>(null);
  // Drag states for Inner Fields
  const [draggedFieldInfo, setDraggedFieldInfo] = useState<{
    groupId: string;
    fieldIdx: number;
  } | null>(null);

  // Sync state if external change happens
  useEffect(() => {
    const handleLayoutUpdate = (e: any) => {
      if (e.detail?.structure) {
        setTabGroups(e.detail.structure);
      }
    };
    window.addEventListener('applet:form_layout_reordered', handleLayoutUpdate);
    return () =>
      window.removeEventListener('applet:form_layout_reordered', handleLayoutUpdate);
  }, []);

  const toggleFolderExpand = (groupId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Helper to get field meta
  const getFieldInfo = (key: string) => {
    return (
      FORM_FIELD_DISPLAY_NAMES[key] || {
        label: key,
        sub: 'Field Sistem',
        icon: 'Tag',
      }
    );
  };

  // Icon renderer
  const renderFieldIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case 'Image':
        return <ImageIcon className="w-4 h-4 text-sky-400" />;
      case 'User':
        return <User className="w-4 h-4 text-emerald-400" />;
      case 'Globe':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'FileText':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4 text-rose-400" />;
      case 'Ruler':
        return <Ruler className="w-4 h-4 text-purple-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
      case 'Tag':
        return <Tag className="w-4 h-4 text-stone-400" />;
      case 'Award':
        return <Award className="w-4 h-4 text-orange-400" />;
      case 'Link':
        return <LinkIcon className="w-4 h-4 text-teal-400" />;
      case 'Smile':
        return <Smile className="w-4 h-4 text-pink-400" />;
      case 'Eye':
        return <Eye className="w-4 h-4 text-indigo-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      default:
        return <Hash className="w-4 h-4 text-stone-400" />;
    }
  };

  // ---------------------------------------------------------------------------
  // TAB GROUP ACTIONS (REORDER, CREATE, DELETE, RENAME)
  // ---------------------------------------------------------------------------
  const handleMoveGroupUp = (idx: number) => {
    if (idx <= 0) return;
    const next = [...tabGroups];
    const [moved] = next.splice(idx, 1);
    next.splice(idx - 1, 0, moved);
    const updated = next.map((g, i) => ({ ...g, orderIndex: i }));
    setTabGroups(updated);
    saveArtistFormLayoutStructure(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    if (onShowToast) {
      onShowToast(`Posisi Tab "${moved.title}" dipindahkan ke atas & disinkronkan!`);
    }
  };

  const handleMoveGroupDown = (idx: number) => {
    if (idx >= tabGroups.length - 1) return;
    const next = [...tabGroups];
    const [moved] = next.splice(idx, 1);
    next.splice(idx + 1, 0, moved);
    const updated = next.map((g, i) => ({ ...g, orderIndex: i }));
    setTabGroups(updated);
    saveArtistFormLayoutStructure(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    if (onShowToast) {
      onShowToast(`Posisi Tab "${moved.title}" dipindahkan ke bawah & disinkronkan!`);
    }
  };

  const handleCreateFolder = () => {
    const title = newFolderTitle.trim();
    if (!title) return;

    const newGroup: FormTabGroup = {
      id: `folder_custom_${Date.now()}`,
      type: 'folder',
      title: title.toUpperCase(),
      icon: 'Folder',
      orderIndex: tabGroups.length,
      fieldKeys: [],
      isCustom: true,
    };

    const updated = [...tabGroups, newGroup].map((g, i) => ({ ...g, orderIndex: i }));
    setTabGroups(updated);
    saveArtistFormLayoutStructure(updated);
    setExpandedFolders((prev) => ({ ...prev, [newGroup.id]: true }));
    setNewFolderTitle('');
    setIsAddingFolder(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);

    if (onShowToast) {
      onShowToast(`Folder baru "${title}" berhasil ditambahkan & disinkronkan!`);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = tabGroups.find((g) => g.id === groupId);
    if (!group) return;

    // Move orphan fields to Biodata folder or Standalone
    const orphanFields = group.fieldKeys;
    const next = tabGroups.filter((g) => g.id !== groupId);

    if (orphanFields.length > 0) {
      const targetGroup = next.find((g) => g.id === 'folder_biodata') || next[0];
      if (targetGroup) {
        targetGroup.fieldKeys.push(...orphanFields);
      }
    }

    const updated = next.map((g, i) => ({ ...g, orderIndex: i }));
    setTabGroups(updated);
    saveArtistFormLayoutStructure(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);

    if (onShowToast) {
      onShowToast(`Folder "${group.title}" berhasil dihapus & tata letak diperbarui.`);
    }
  };

  const handleStartRenameGroup = (group: FormTabGroup) => {
    setEditingGroupId(group.id);
    setEditGroupTitle(group.title);
  };

  const handleSaveRenameGroup = (groupId: string) => {
    if (!editGroupTitle.trim()) return;
    const next = tabGroups.map((g) =>
      g.id === groupId ? { ...g, title: editGroupTitle.trim().toUpperCase() } : g
    );
    const updated = next.map((g, i) => ({ ...g, orderIndex: i }));
    setTabGroups(updated);
    saveArtistFormLayoutStructure(updated);
    setEditingGroupId(null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    if (onShowToast) {
      onShowToast(`Nama Tab berhasil diubah menjadi "${editGroupTitle.trim().toUpperCase()}".`);
    }
  };

  // ---------------------------------------------------------------------------
  // FIELD ACTIONS INSIDE GROUPS (REORDER, MOVE TO FOLDER, STANDALONE)
  // ---------------------------------------------------------------------------
  const handleMoveFieldUp = (groupId: string, fieldIdx: number) => {
    if (fieldIdx <= 0) return;
    const next = tabGroups.map((g) => {
      if (g.id === groupId) {
        const nextFields = [...g.fieldKeys];
        const [moved] = nextFields.splice(fieldIdx, 1);
        nextFields.splice(fieldIdx - 1, 0, moved);
        return { ...g, fieldKeys: nextFields };
      }
      return g;
    });
    const updated = next.map((g, i) => ({ ...g, orderIndex: i }));
    setTabGroups(updated);
    saveArtistFormLayoutStructure(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleMoveFieldDown = (groupId: string, fieldIdx: number) => {
    const group = tabGroups.find((g) => g.id === groupId);
    if (!group || fieldIdx >= group.fieldKeys.length - 1) return;
    const next = tabGroups.map((g) => {
      if (g.id === groupId) {
        const nextFields = [...g.fieldKeys];
        const [moved] = nextFields.splice(fieldIdx, 1);
        nextFields.splice(fieldIdx + 1, 0, moved);
        return { ...g, fieldKeys: nextFields };
      }
      return g;
    });
    const updated = next.map((g, i) => ({ ...g, orderIndex: i }));
    setTabGroups(updated);
    saveArtistFormLayoutStructure(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExecuteMoveField = (targetGroupId: string) => {
    if (!movingField) return;
    const { fieldKey, fromGroupId } = movingField;
    if (targetGroupId === fromGroupId) {
      setMovingField(null);
      return;
    }

    let next = tabGroups.map((g) => {
      if (g.id === fromGroupId) {
        return {
          ...g,
          fieldKeys: g.fieldKeys.filter((k) => k !== fieldKey),
        };
      }
      return g;
    });

    if (targetGroupId === '__NEW_STANDALONE__') {
      // Create a new standalone tab for this field
      const fieldInfo = getFieldInfo(fieldKey);
      const newStandaloneGroup: FormTabGroup = {
        id: `standalone_${fieldKey}_${Date.now()}`,
        type: 'standalone',
        title: fieldInfo.label.toUpperCase(),
        icon: fieldInfo.icon,
        orderIndex: next.length,
        fieldKeys: [fieldKey],
        isCustom: true,
      };
      next.push(newStandaloneGroup);
    } else {
      next = next.map((g) => {
        if (g.id === targetGroupId) {
          return {
            ...g,
            fieldKeys: [...g.fieldKeys, fieldKey],
          };
        }
        return g;
      });
    }

    const updated = next.map((g, i) => ({ ...g, orderIndex: i }));
    setTabGroups(updated);
    saveArtistFormLayoutStructure(updated);
    setMovingField(null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);

    if (onShowToast) {
      onShowToast(`Field berhasil dipindahkan & disinkronkan ke Form Artis!`);
    }
  };

  // ---------------------------------------------------------------------------
  // SAVE & RESET
  // ---------------------------------------------------------------------------
  const handleSaveAll = () => {
    saveArtistFormLayoutStructure(tabGroups);
    setIsSaved(true);
    setHasChanges(false);

    if (onShowToast) {
      onShowToast(
        'Struktur Tab & Folder berhasil disimpan! Tersinkronisasi penuh ke Halaman Edit/Buat Artis.'
      );
    }

    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetToDefault = () => {
    const def = resetArtistFormLayoutStructure();
    setTabGroups(def);
    setHasChanges(false);
    setIsSaved(true);

    if (onShowToast) {
      onShowToast('Struktur Tab & Folder dikembalikan ke standar 6 tab default!');
    }

    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* ================================================================= */}
      {/* 1. INFORMATIONAL BANNER (Sinkronisasi Khusus Form Artis)           */}
      {/* ================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3 text-stone-200">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-bold text-white flex items-center gap-2">
            <span>Manajemen Folder Kategori &amp; Tab Form Artis</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-normal">
              100% Sinkron ke Form Artis
            </span>
          </p>
          <p className="text-stone-300 text-xs leading-relaxed">
            Folder Kategori di bawah merepresentasikan <strong>Tab Navigasi di Halaman Edit/Buat Artis</strong>. Field yang berada di dalam folder akan dikelompokkan ke dalam Tab tersebut. Field yang berstatus Standalone akan menjadi Tab tersendiri.
          </p>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. TOP ACTION CONTROLS & SAVE BAR                                 */}
      {/* ================================================================= */}
      <div className="p-3 sm:p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddingFolder(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <span>Tambah Folder Tab Baru</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Kembalikan ke urutan dan struktur 6 Tab standar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Susunan Standar</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
              Ada Perubahan Belum Disimpan
            </span>
          )}

          <button
            onClick={handleSaveAll}
            className={`min-h-[44px] px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${
              isSaved
                ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30 active:scale-95'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Susunan Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Struktur &amp; Urutan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline Form: Tambah Folder Baru */}
      {isAddingFolder && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-indigo-400" />
              Nama Folder Kategori Baru (Akan menjadi Judul Tab)
            </span>
            <button
              onClick={() => setIsAddingFolder(false)}
              className="text-stone-400 hover:text-stone-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFolderTitle}
              onChange={(e) => setNewFolderTitle(e.target.value)}
              placeholder="Contoh: MEDIA & SOSIAL..."
              className="flex-1 bg-stone-900 border border-stone-700 text-stone-100 px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
              }}
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Folder</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. MULTI-LEVEL TAB & FOLDER LIST (URUTAN TAB 1 S/D 6)              */}
      {/* ================================================================= */}
      <div className="space-y-3">
        {tabGroups.map((group, groupIdx) => {
          const isExpanded = !!expandedFolders[group.id];
          const isSystemEntry = group.type === 'system_custom_entry';
          const isStandalone = group.type === 'standalone';
          const isFolder = group.type === 'folder';

          return (
            <div
              key={group.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isSystemEntry
                  ? 'bg-cyan-950/20 border-cyan-500/30'
                  : isStandalone
                  ? 'bg-stone-900/90 border-stone-800'
                  : 'bg-stone-900 border-stone-800'
              }`}
            >
              {/* HEADER TAB GROUP (REORDERABLE TOP-LEVEL) */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 border-b border-stone-800/80 bg-stone-900/60">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Tab Order Number Badge */}
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {groupIdx + 1}
                  </span>

                  {/* Icon & Title */}
                  {isFolder && (
                    <button
                      onClick={() => toggleFolderExpand(group.id)}
                      className="p-1 text-stone-400 hover:text-stone-200 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-amber-400" />
                      )}
                    </button>
                  )}

                  {isFolder ? (
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : isSystemEntry ? (
                    <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                  )}

                  {editingGroupId === group.id ? (
                    <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                      <input
                        type="text"
                        value={editGroupTitle}
                        onChange={(e) => setEditGroupTitle(e.target.value)}
                        className="bg-stone-950 border border-stone-700 text-stone-100 px-2 py-1 rounded text-xs focus:outline-none focus:border-indigo-400 w-full"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRenameGroup(group.id)}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingGroupId(null)}
                        className="p-1 bg-stone-800 text-stone-300 rounded hover:bg-stone-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-stone-100 truncate">
                          {group.title}
                        </span>
                        {isSystemEntry && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                            Entri Kustom Sistem
                          </span>
                        )}
                        {isStandalone && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-medium">
                            Standalone Tab
                          </span>
                        )}
                        {isFolder && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                            Folder ({group.fieldKeys.length} Field)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions for Top-Level Tab Reorder */}
                <div className="flex items-center gap-1 shrink-0">
                  {isFolder && group.isCustom && (
                    <>
                      <button
                        onClick={() => handleStartRenameGroup(group)}
                        className="p-1.5 text-stone-400 hover:text-stone-200 rounded hover:bg-stone-800"
                        title="Ubah Nama Folder"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40"
                        title="Hapus Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleMoveGroupUp(groupIdx)}
                    disabled={groupIdx === 0}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Geser Tab Ke Atas"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveGroupDown(groupIdx)}
                    disabled={groupIdx === tabGroups.length - 1}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Geser Tab Ke Bawah"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* INNER FIELDS LIST (FOR FOLDERS & STANDALONE TABS) */}
              {isFolder && isExpanded && (
                <div className="p-2 sm:p-3 space-y-1.5 bg-stone-950/40">
                  {group.fieldKeys.length === 0 ? (
                    <div className="text-center py-4 text-stone-500 text-xs italic">
                      Folder ini masih kosong. Pindahkan field ke folder ini menggunakan tombol "Pindah Folder".
                    </div>
                  ) : (
                    group.fieldKeys.map((fieldKey, fIdx) => {
                      const meta = getFieldInfo(fieldKey);
                      return (
                        <div
                          key={fieldKey}
                          className="flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl bg-stone-900 border border-stone-800/80 hover:border-stone-700 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-5 h-5 rounded-md bg-stone-800 text-stone-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {fIdx + 1}
                            </span>
                            <div className="w-6 h-6 rounded-lg bg-stone-800/80 flex items-center justify-center shrink-0">
                              {renderFieldIcon(meta.icon)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-stone-200 truncate">
                                {meta.label}
                              </p>
                              <p className="text-[10px] text-stone-400 truncate">
                                {meta.sub} •{' '}
                                <code className="text-indigo-300 font-mono">{fieldKey}</code>
                              </p>
                            </div>
                          </div>

                          {/* Field Inner Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Pindah Folder Button */}
                            <button
                              onClick={() =>
                                setMovingField({
                                  fieldKey,
                                  fromGroupId: group.id,
                                })
                              }
                              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-indigo-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                              title="Pindahkan field ke folder lain atau buat tab standalone"
                            >
                              <ArrowRightLeft className="w-3 h-3 text-indigo-400" />
                              <span className="hidden sm:inline">Pindah</span>
                            </button>

                            {/* Inner Order Controls */}
                            <button
                              onClick={() => handleMoveFieldUp(group.id, fIdx)}
                              disabled={fIdx === 0}
                              className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 disabled:pointer-events-none"
                              title="Geser Field Ke Atas"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveFieldDown(group.id, fIdx)}
                              disabled={fIdx === group.fieldKeys.length - 1}
                              className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 disabled:pointer-events-none"
                              title="Geser Field Ke Bawah"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* STANDALONE FIELD PREVIEW */}
              {isStandalone && (
                <div className="p-2 sm:p-3 bg-stone-950/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                      {group.id.includes('appearance') ? (
                        <Smile className="w-4 h-4" />
                      ) : group.id.includes('impression') ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <Tag className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-200">
                        Field Standalone (Dirender sebagai Tab Khusus)
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {group.fieldKeys.length} sub-parameter terintegrasi otomatis.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setMovingField({
                        fieldKey: group.fieldKeys[0] || group.id,
                        fromGroupId: group.id,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-indigo-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Masukkan ke Folder</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* 4. MODAL PINDAH FOLDER / JADIKAN STANDALONE TAB                   */}
      {/* ================================================================= */}
      {movingField && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-100">
                    Pindahkan Field: {getFieldInfo(movingField.fieldKey).label}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Pilih Folder Tujuan atau jadikan Tab Standalone tersendiri.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMovingField(null)}
                className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Pilih Folder Kategori Tujuan:
              </p>
              {tabGroups
                .filter((g) => g.type === 'folder')
                .map((folder) => {
                  const isCurrent = folder.id === movingField.fromGroupId;
                  return (
                    <button
                      key={folder.id}
                      disabled={isCurrent}
                      onClick={() => handleExecuteMoveField(folder.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-stone-950 border-stone-800 text-stone-500 opacity-60'
                          : 'bg-stone-850 hover:bg-indigo-950/50 border-stone-700 hover:border-indigo-500 text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Folder className="w-4 h-4 text-amber-400" />
                        <div>
                          <p className="font-bold text-xs text-stone-100">{folder.title}</p>
                          <p className="text-[10px] text-stone-400">
                            {folder.fieldKeys.length} field di dalam folder ini
                          </p>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                          Saat Ini
                        </span>
                      ) : (
                        <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                    </button>
                  );
                })}

              <div className="pt-2">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Atau Keluarkan dari Folder:
                </p>
                <button
                  onClick={() => handleExecuteMoveField('__NEW_STANDALONE__')}
                  className="w-full p-3 rounded-2xl bg-pink-950/30 hover:bg-pink-950/50 border border-pink-500/40 hover:border-pink-400 text-pink-200 text-left flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <div>
                      <p className="font-bold text-xs text-pink-100">
                        Jadikan Tab Standalone Tersendiri
                      </p>
                      <p className="text-[10px] text-pink-300/80">
                        Field akan keluar dari folder dan otomatis menjadi Judul Tab baru
                      </p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-pink-400" />
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setMovingField(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
