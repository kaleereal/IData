import React, { useState, useRef } from 'react';
import {
  CustomPageEntry,
  CustomPageBlock,
  CustomPageImageLayout,
  CustomPageImage,
  CustomPageButton,
  CustomPageButtonGroupLayout,
  Artist,
  AppTheme,
} from '../types';
import { useUITheme } from '../context/UIThemeContext';
import {
  getBorderRadiusClass,
  getInnerRadiusClass,
  getElevationClass,
} from '../utils/uiThemeEngine';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  Upload,
  User,
  Sliders,
  Sparkles,
  AlertCircle,
  Eye,
  ExternalLink,
  Layers,
  X,
  FileText,
} from 'lucide-react';

interface CustomPageFormProps {
  entryToEdit?: CustomPageEntry | null;
  artists: Artist[];
  customPages: CustomPageEntry[]; // To check which artists are already linked to other entries
  onSave: (entry: CustomPageEntry) => void;
  onCancel: () => void;
  theme?: AppTheme;
}

export const CustomPageForm: React.FC<CustomPageFormProps> = ({
  entryToEdit,
  artists,
  customPages,
  onSave,
  onCancel,
}) => {
  const uiTheme = useUITheme();
  const radius = getBorderRadiusClass(uiTheme.tokens?.radius?.card || uiTheme.global.borderRadius);
  const innerRadius = getInnerRadiusClass(uiTheme.tokens?.radius?.inner || uiTheme.global.borderRadius);
  const elevation = getElevationClass(uiTheme.tokens?.shadows?.elevation || uiTheme.global.elevation);

  // Core Form Fields
  const [title, setTitle] = useState(entryToEdit?.title || '');
  const [description, setDescription] = useState(entryToEdit?.description || '');
  const [linkedArtistId, setLinkedArtistId] = useState<string>(
    entryToEdit?.linkedArtistId || ''
  );

  // Dynamic Ordered Blocks with stable IDs
  const [blocks, setBlocks] = useState<CustomPageBlock[]>(() => {
    if (entryToEdit?.blocks && entryToEdit.blocks.length > 0) {
      return JSON.parse(JSON.stringify(entryToEdit.blocks));
    }
    // Default initial template if new
    return [
      {
        id: `block-img-${Date.now()}-1`,
        type: 'image_category',
        title: 'Galeri Foto Utama',
        layout: 'grid_3',
        images: [],
      },
    ];
  });

  // URL input buffers for each image category block (blockId -> current typed URL)
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});

  // File input refs for multi-image gallery pickers
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Validation Error Toast
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter available artists for linking:
  // Requirement 9 & 20: 1 custom page max 1 artis. Artis yang sudah ditautkan ke entri lain tidak boleh dipilih,
  // kecuali artis yang sedang ditautkan pada entri ini jika sedang mode edit.
  const availableArtists = artists.filter(artist => {
    const isLinkedToAnother = customPages.some(
      page => page.linkedArtistId === artist.id && page.id !== entryToEdit?.id
    );
    return !isLinkedToAnother;
  });

  // -------------------------------------------------------------
  // BLOCK ORDERING HANDLERS (SLIDE UP / SLIDE DOWN)
  // -------------------------------------------------------------
  // Requirement 17: Semua blok yang dibuat harus dapat diatur ulang menggunakan fitur slide ke atas / ke bawah.
  const handleMoveBlockUp = (index: number) => {
    if (index <= 0) return;
    setBlocks(prev => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveBlockDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    setBlocks(prev => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  // -------------------------------------------------------------
  // ADD NEW BLOCKS TOOL
  // -------------------------------------------------------------
  // Requirement 10: Tool untuk menambahkan kategori field embed gambar
  const handleAddImageCategoryBlock = () => {
    const newBlock: CustomPageBlock = {
      id: `block-img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image_category',
      title: '',
      layout: 'grid_3',
      images: [],
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  // Requirement 16: Tool untuk membuat field add button text
  const handleAddButtonsGroupBlock = () => {
    const newBlock: CustomPageBlock = {
      id: `block-btn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'buttons_group',
      title: 'Tautan & Tombol Interaktif',
      layout: 'grid_2',
      buttons: [
        {
          id: `btn-${Date.now()}-1`,
          label: 'Website / Link Resmi',
          url: 'https://',
          layoutRule: 'default',
        },
      ],
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  // -------------------------------------------------------------
  // IMAGE CATEGORY BLOCK HANDLERS
  // -------------------------------------------------------------
  const handleUpdateImageBlockTitle = (blockId: string, newTitle: string) => {
    setBlocks(prev =>
      prev.map(b => (b.id === blockId && b.type === 'image_category' ? { ...b, title: newTitle } : b))
    );
  };

  const handleUpdateImageBlockLayout = (blockId: string, newLayout: CustomPageImageLayout) => {
    setBlocks(prev =>
      prev.map(b => (b.id === blockId && b.type === 'image_category' ? { ...b, layout: newLayout } : b))
    );
  };

  // Requirement 13: Penambahan Gambar melalui URL
  // Tombol ✓ disabled saat URL kosong, aktif saat ada text. Klik ✓ menyimpan gambar & mengosongkan input.
  const handleAddImageViaUrl = (blockId: string) => {
    const rawUrl = (urlInputs[blockId] || '').trim();
    if (!rawUrl) return;

    const newImage: CustomPageImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: rawUrl,
      caption: '',
    };

    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId && b.type === 'image_category') {
          return {
            ...b,
            images: [...b.images, newImage],
          };
        }
        return b;
      })
    );

    // Clear input buffer for next image
    setUrlInputs(prev => ({ ...prev, [blockId]: '' }));
  };

  // Requirement 14: Penambahan Gambar melalui Submit Image (Galeri Perangkat)
  // Multi-image selection, batch added to active category as individual image items
  const handleImageFilesSelected = (blockId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    let loadedCount = 0;
    const newImages: CustomPageImage[] = [];

    fileArray.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          newImages.push({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            url: event.target.result as string,
            caption: file.name.replace(/\.[^/.]+$/, ''),
          });
        }
        loadedCount++;
        if (loadedCount === fileArray.length && newImages.length > 0) {
          setBlocks(prev =>
            prev.map(b => {
              if (b.id === blockId && b.type === 'image_category') {
                return {
                  ...b,
                  images: [...b.images, ...newImages],
                };
              }
              return b;
            })
          );
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImageFromBlock = (blockId: string, imageId: string) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId && b.type === 'image_category') {
          return {
            ...b,
            images: b.images.filter(img => img.id !== imageId),
          };
        }
        return b;
      })
    );
  };

  const handleUpdateImageCaption = (blockId: string, imageId: string, newCaption: string) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId && b.type === 'image_category') {
          return {
            ...b,
            images: b.images.map(img => (img.id === imageId ? { ...img, caption: newCaption } : img)),
          };
        }
        return b;
      })
    );
  };

  // -------------------------------------------------------------
  // BUTTONS GROUP BLOCK HANDLERS
  // -------------------------------------------------------------
  const handleUpdateButtonBlockTitle = (blockId: string, newTitle: string) => {
    setBlocks(prev =>
      prev.map(b => (b.id === blockId && b.type === 'buttons_group' ? { ...b, title: newTitle } : b))
    );
  };

  const handleUpdateButtonBlockLayout = (blockId: string, newLayout: CustomPageButtonGroupLayout) => {
    setBlocks(prev =>
      prev.map(b => (b.id === blockId && b.type === 'buttons_group' ? { ...b, layout: newLayout } : b))
    );
  };

  const handleAddButtonToBlock = (blockId: string) => {
    const newBtn: CustomPageButton = {
      id: `btn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: 'Tombol Baru',
      url: 'https://',
      layoutRule: 'default',
    };

    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId && b.type === 'buttons_group') {
          return {
            ...b,
            buttons: [...b.buttons, newBtn],
          };
        }
        return b;
      })
    );
  };

  const handleUpdateButtonInBlock = (
    blockId: string,
    btnId: string,
    field: 'label' | 'url' | 'layoutRule',
    value: string
  ) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId && b.type === 'buttons_group') {
          return {
            ...b,
            buttons: b.buttons.map(btn => (btn.id === btnId ? { ...btn, [field]: value } : btn)),
          };
        }
        return b;
      })
    );
  };

  const handleRemoveButtonFromBlock = (blockId: string, btnId: string) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId && b.type === 'buttons_group') {
          return {
            ...b,
            buttons: b.buttons.filter(btn => btn.id !== btnId),
          };
        }
        return b;
      })
    );
  };

  // -------------------------------------------------------------
  // SAVE FORM HANDLER
  // -------------------------------------------------------------
  // Requirement 7: Field nama halaman tidak boleh kosong ketika entri disimpan.
  // Requirement 3 & 18: Nilai "updatedAt" harus diperbarui ke waktu sekarang.
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Nama Halaman wajib diisi sebelum menyimpan.');
      return;
    }

    const nowIso = new Date().toISOString();
    const entryToSave: CustomPageEntry = {
      id: entryToEdit?.id || `custom-page-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      linkedArtistId: linkedArtistId.trim() || undefined,
      blocks: blocks,
      createdAt: entryToEdit?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    onSave(entryToSave);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full max-w-5xl mx-auto pb-36 space-y-6 text-stone-100 animate-in fade-in duration-300"
    >
      {/* 1. Header Bar */}
      <div className={`p-4 sm:p-5 ${radius} bg-stone-900/90 border border-stone-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl`}>
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onCancel}
            className={`p-2.5 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer`}
            title="Batal dan Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                {entryToEdit ? 'EDIT ENTRI CUSTOM' : 'BUAT ENTRI CUSTOM'}
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                {entryToEdit ? 'Mode Edit' : 'Entri Baru'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Kustomisasi judul, deskripsi, galeri foto terstruktur, layout kolom responsif, dan tombol aksi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2.5 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all cursor-pointer`}
          >
            Batal
          </button>
          <button
            type="submit"
            className={`flex items-center gap-2 px-5 py-2.5 ${innerRadius} bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-102 active:scale-95 cursor-pointer`}
          >
            <Save className="w-4 h-4" />
            <span>Simpan Entri</span>
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 flex items-center justify-between gap-3 animate-in shake">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="p-1 text-rose-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Primary Metadata Card (Nama Halaman, Deskripsi, Tautkan Artis) */}
      <div className={`p-5 sm:p-6 ${radius} bg-stone-900 border border-stone-800 space-y-5 ${elevation}`}>
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              INFORMASI UTAMA HALAMAN CUSTOM
            </h2>
          </div>
          <span className="text-[10px] font-mono text-stone-400 uppercase">Header & Tautan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Field Text: Nama Halaman (Requirement 7) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
              NAMA HALAMAN CUSTOM <span className="text-amber-400 font-bold">*Wajib</span>:
            </label>
            <input
              type="text"
              placeholder="Contoh: Showcase Galeri Spesial, Photoshoot Musim Panas, Backstage Exclusive"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white font-bold tracking-wide focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>

          {/* Field Text: Deskripsi Halaman (Requirement 8: Multiline opsional) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
              DESKRIPSI HALAMAN (Opsional):
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan keterangan detail, narasi pengantar, atau informasi pelengkap mengenai konten halaman kustom ini..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
            />
          </div>

          {/* Field: Tautkan ke Artis (Requirement 9: 1 custom page max 1 artis, ID reference) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
              TAUTKAN KE ARTIS:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={linkedArtistId}
                onChange={e => setLinkedArtistId(e.target.value)}
                className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-100 font-semibold focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                <option value="">-- Tanpa Tautan Artis (Entri Kosong) --</option>
                {availableArtists.map(artist => (
                  <option key={artist.id} value={artist.id}>
                    {artist.firstName} {artist.lastName} ({artist.country})
                  </option>
                ))}
              </select>

              {linkedArtistId && (
                <button
                  type="button"
                  onClick={() => setLinkedArtistId('')}
                  className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs font-bold transition-colors shrink-0"
                >
                  Lepas Tautan Artis
                </button>
              )}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Entri yang ditautkan ke artis akan muncul di tab "Tab Entri Artis" dan menyediakan tombol navigasi cepat pada Gallery halaman artis.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Dynamic Blocks Builder */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>STRUKTUR BLOK KONTEN</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Atur urutan susunan konten menggunakan tombol panah naik/turun di setiap blok.
            </p>
          </div>

          {/* Quick Add Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAddImageCategoryBlock}
              className={`flex items-center gap-1.5 px-3.5 py-2 ${innerRadius} bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Tambah Kategori Gambar</span>
            </button>

            <button
              type="button"
              onClick={handleAddButtonsGroupBlock}
              className={`flex items-center gap-1.5 px-3.5 py-2 ${innerRadius} bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Tambah Blok Tombol</span>
            </button>
          </div>
        </div>

        {/* List of Ordered Blocks */}
        {blocks.length === 0 ? (
          <div className={`p-8 ${radius} bg-stone-900/60 border border-stone-800 border-dashed text-center space-y-3`}>
            <Layers className="w-8 h-8 text-stone-500 mx-auto" />
            <p className="text-xs text-stone-400">
              Belum ada blok konten. Tambahkan kategori gambar atau blok tombol di atas.
            </p>
          </div>
        ) : (
          blocks.map((block, blockIndex) => {
            const isFirst = blockIndex === 0;
            const isLast = blockIndex === blocks.length - 1;

            if (block.type === 'image_category') {
              const currentUrlInput = urlInputs[block.id] || '';
              const isUrlValid = currentUrlInput.trim().length > 0;

              return (
                <div
                  key={block.id}
                  className={`p-4 sm:p-5 ${radius} bg-stone-900 border border-cyan-500/30 space-y-4 ${elevation} transition-all`}
                >
                  {/* Block Header: Type, Order Controls, Delete */}
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                          BLOK #{blockIndex + 1} • KATEGORI GAMBAR
                        </span>
                        <strong className="text-xs sm:text-sm text-white">
                          {block.title || 'Kategori Gambar Tanpa Judul'}
                        </strong>
                      </div>
                    </div>

                    {/* Order Controls & Actions (Requirement 17: Slide up / down) */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveBlockUp(blockIndex)}
                        disabled={isFirst}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                          isFirst
                            ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700 hover:text-white cursor-pointer'
                        }`}
                        title="Geser Naik (Slide Up)"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveBlockDown(blockIndex)}
                        disabled={isLast}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                          isLast
                            ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700 hover:text-white cursor-pointer'
                        }`}
                        title="Geser Turun (Slide Down)"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <div className="w-px h-5 bg-stone-800 mx-1" />

                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                        title="Hapus Kategori Gambar Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Kategori Settings: Judul Kategori & Tata Letak Gambar (Requirement 11 & 15) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Judul Kategori Gambar (Requirement 11) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                        JUDUL KATEGORI GAMBAR (Opsional):
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Photoshoot Edition A, Red Carpet, Candid Shots"
                        value={block.title || ''}
                        onChange={e => handleUpdateImageBlockTitle(block.id, e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Edit Tata Letak Gambar (Requirement 15: slide_bar, grid_2, grid_3, grid_4) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                        EDIT TATA LETAK GAMBAR:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {(
                          [
                            { id: 'slide_bar', label: 'Slide Bar' },
                            { id: 'grid_2', label: '2 Kolom' },
                            { id: 'grid_3', label: '3 Kolom' },
                            { id: 'grid_4', label: '4 Kolom' },
                          ] as { id: CustomPageImageLayout; label: string }[]
                        ).map(opt => {
                          const isSelected = block.layout === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleUpdateImageBlockLayout(block.id, opt.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                                isSelected
                                  ? 'bg-cyan-500 text-stone-950 border-cyan-400 shadow-sm'
                                  : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Tambah Gambar (Requirement 12, 13, 14) */}
                  <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-stone-400">
                        TAMBAH GAMBAR ({block.images.length} Gambar Tersimpan)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* URL Method with checkmark button (Requirement 13) */}
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            placeholder="Tempel URL gambar (https://...)"
                            value={currentUrlInput}
                            onChange={e =>
                              setUrlInputs(prev => ({ ...prev, [block.id]: e.target.value }))
                            }
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddImageViaUrl(block.id);
                              }
                            }}
                            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        {/* Checkmark Button: Disabled when empty, colored when filled (Requirement 13) */}
                        <button
                          type="button"
                          disabled={!isUrlValid}
                          onClick={() => handleAddImageViaUrl(block.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                            isUrlValid
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-md shadow-emerald-500/20'
                              : 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700'
                          }`}
                          title="Simpan URL Gambar Baru"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Submit Image / Multi-select from Device (Requirement 14) */}
                      <div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          ref={el => (fileInputRefs.current[block.id] = el)}
                          onChange={e => handleImageFilesSelected(block.id, e.target.files)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[block.id]?.click()}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Pilih Banyak Gambar dari Galeri</span>
                        </button>
                      </div>
                    </div>

                    {/* Preview list of images in this block */}
                    {block.images.length > 0 && (
                      <div className="pt-2 border-t border-stone-800/80">
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto pr-1">
                          {block.images.map((img, imgIdx) => (
                            <div
                              key={img.id}
                              className="relative group rounded-xl bg-stone-900 border border-stone-800 overflow-hidden"
                            >
                              <div className="aspect-square w-full bg-stone-950 overflow-hidden">
                                <img
                                  src={img.url}
                                  alt={img.caption || `Gambar #${imgIdx + 1}`}
                                  onError={e => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop';
                                  }}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImageFromBlock(block.id, img.id)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors shadow-md cursor-pointer"
                                title="Hapus foto"
                              >
                                <X className="w-3 h-3" />
                              </button>

                              {/* Caption input */}
                              <div className="p-1 bg-stone-900">
                                <input
                                  type="text"
                                  placeholder="Caption..."
                                  value={img.caption || ''}
                                  onChange={e =>
                                    handleUpdateImageCaption(block.id, img.id, e.target.value)
                                  }
                                  className="w-full bg-transparent text-[10px] text-stone-300 placeholder-stone-600 focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (block.type === 'buttons_group') {
              return (
                <div
                  key={block.id}
                  className={`p-4 sm:p-5 ${radius} bg-stone-900 border border-emerald-500/30 space-y-4 ${elevation} transition-all`}
                >
                  {/* Block Header */}
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                          BLOK #{blockIndex + 1} • GRUP TOMBOL
                        </span>
                        <strong className="text-xs sm:text-sm text-white">
                          {block.title || 'Blok Tombol Interaktif'}
                        </strong>
                      </div>
                    </div>

                    {/* Order Controls & Actions (Requirement 17) */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveBlockUp(blockIndex)}
                        disabled={isFirst}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                          isFirst
                            ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700 hover:text-white cursor-pointer'
                        }`}
                        title="Geser Naik (Slide Up)"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveBlockDown(blockIndex)}
                        disabled={isLast}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                          isLast
                            ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700 hover:text-white cursor-pointer'
                        }`}
                        title="Geser Turun (Slide Down)"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <div className="w-px h-5 bg-stone-800 mx-1" />

                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                        title="Hapus Blok Tombol Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Buttons Group Configuration (Requirement 16) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                        JUDUL GRUP TOMBOL (Opsional):
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Media Sosial & Link Resmi, Download & Arsip"
                        value={block.title || ''}
                        onChange={e => handleUpdateButtonBlockTitle(block.id, e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                        TATA LETAK SUSUNAN TOMBOL:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {(
                          [
                            { id: 'vertical', label: '1 Kolom' },
                            { id: 'grid_2', label: '2 Kolom' },
                            { id: 'grid_3', label: '3 Kolom' },
                            { id: 'horizontal_wrap', label: 'Baris Wrap' },
                          ] as { id: CustomPageButtonGroupLayout; label: string }[]
                        ).map(opt => {
                          const isSelected = block.layout === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleUpdateButtonBlockLayout(block.id, opt.id)}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                                isSelected
                                  ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-sm'
                                  : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Buttons Items List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-stone-400">
                        DAFTAR TOMBOL ({block.buttons.length} Tombol)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddButtonToBlock(block.id)}
                        className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Item Tombol</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {block.buttons.map((btn, btnIdx) => (
                        <div
                          key={btn.id}
                          className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                            {btnIdx + 1}
                          </span>

                          {/* Button Title / Label */}
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Judul Tombol (Contoh: Instagram Resmi)"
                              value={btn.label}
                              onChange={e =>
                                handleUpdateButtonInBlock(block.id, btn.id, 'label', e.target.value)
                              }
                              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                            />
                          </div>

                          {/* Button URL */}
                          <div className="flex-1">
                            <input
                              type="url"
                              placeholder="URL Link (https://...)"
                              value={btn.url}
                              onChange={e =>
                                handleUpdateButtonInBlock(block.id, btn.id, 'url', e.target.value)
                              }
                              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-400"
                            />
                          </div>

                          {/* Button Style Rule */}
                          <div className="w-32 shrink-0">
                            <select
                              value={btn.layoutRule || 'default'}
                              onChange={e =>
                                handleUpdateButtonInBlock(block.id, btn.id, 'layoutRule', e.target.value)
                              }
                              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
                            >
                              <option value="default">Solid Amber</option>
                              <option value="gradient">Gradient Neon</option>
                              <option value="outline">Garis Outline</option>
                              <option value="pill">Rounded Pill</option>
                            </select>
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveButtonFromBlock(block.id, btn.id)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-900 transition-colors shrink-0"
                            title="Hapus Tombol"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })
        )}
      </div>

      {/* 4. Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-stone-950/95 border-t border-stone-800/90 backdrop-blur-md flex items-center justify-between max-w-5xl mx-auto rounded-t-3xl shadow-2xl">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all cursor-pointer"
        >
          Batal
        </button>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-102 active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Entri Custom</span>
          </button>
        </div>
      </div>
    </form>
  );
};
