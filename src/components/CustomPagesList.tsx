import React, { useState, useMemo } from 'react';
import { CustomPageEntry, Artist, AppTheme, DatabaseSchema } from '../types';
import { useUITheme } from '../context/UIThemeContext';
import {
  getBorderRadiusClass,
  getInnerRadiusClass,
  getElevationClass,
} from '../utils/uiThemeEngine';
import {
  Layers,
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  User,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  Grid,
} from 'lucide-react';

interface CustomPagesListProps {
  customPages: CustomPageEntry[];
  artists: Artist[];
  onSelectCustomPage?: (customPage: CustomPageEntry) => void;
  onSelectPage?: (pageId: string) => void;
  onCreateCustomPage?: () => void;
  onAddNewPage?: () => void;
  onEditCustomPage?: (customPage: CustomPageEntry) => void;
  onEditPage?: (customPage: CustomPageEntry) => void;
  onDeleteCustomPage?: (id: string) => void;
  onDeletePage?: (id: string) => void;
  onBackToSettings?: () => void;
  onBack?: () => void;
  onBackToHome?: () => void;
  onSelectArtistProfile?: (artist: Artist) => void;
  theme?: AppTheme;
}

export const CustomPagesList: React.FC<CustomPagesListProps> = ({
  customPages,
  artists,
  onSelectCustomPage,
  onSelectPage,
  onCreateCustomPage,
  onAddNewPage,
  onEditCustomPage,
  onEditPage,
  onDeleteCustomPage,
  onDeletePage,
  onBackToSettings,
  onBack,
  onBackToHome,
  onSelectArtistProfile,
}) => {
  const handleSelect = (page: CustomPageEntry) => {
    if (onSelectCustomPage) {
      onSelectCustomPage(page);
    } else if (onSelectPage) {
      onSelectPage(page.id);
    }
  };

  const handleCreate = () => {
    if (onCreateCustomPage) {
      onCreateCustomPage();
    } else if (onAddNewPage) {
      onAddNewPage();
    }
  };

  const handleEdit = (page: CustomPageEntry) => {
    if (onEditCustomPage) {
      onEditCustomPage(page);
    } else if (onEditPage) {
      onEditPage(page);
    }
  };

  const handleDelete = (id: string) => {
    if (onDeleteCustomPage) {
      onDeleteCustomPage(id);
    } else if (onDeletePage) {
      onDeletePage(id);
    }
  };

  const handleBack = () => {
    if (onBackToSettings) {
      onBackToSettings();
    } else if (onBack) {
      onBack();
    } else if (onBackToHome) {
      onBackToHome();
    }
  };
  const uiTheme = useUITheme();
  const radius = getBorderRadiusClass(uiTheme.tokens?.radius?.card || uiTheme.global.borderRadius);
  const innerRadius = getInnerRadiusClass(uiTheme.tokens?.radius?.inner || uiTheme.global.borderRadius);
  const elevation = getElevationClass(uiTheme.tokens?.shadows?.elevation || uiTheme.global.elevation);

  // Tab State: 'linked' (Tab Entri Artis) vs 'unlinked' (Tab Entri Kosong)
  const [activeTab, setActiveTab] = useState<'linked' | 'unlinked'>('linked');
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown menu state for specific item
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Delete Confirmation Modal state
  const [deletingEntry, setDeletingEntry] = useState<CustomPageEntry | null>(null);

  // Artist Lookup Map
  const artistMap = useMemo(() => {
    const map = new Map<string, Artist>();
    artists.forEach(a => map.set(a.id, a));
    return map;
  }, [artists]);

  // Counts for tabs
  const { linkedCount, unlinkedCount } = useMemo(() => {
    let linked = 0;
    let unlinked = 0;
    customPages.forEach(page => {
      if (page.linkedArtistId && page.linkedArtistId.trim() !== '') {
        linked++;
      } else {
        unlinked++;
      }
    });
    return { linkedCount: linked, unlinkedCount: unlinked };
  }, [customPages]);

  // Filter & Sort list
  // Requirement 3: Daftar Entri Custom harus otomatis diurutkan berdasarkan waktu terakhir dibuat atau diedit (updatedAt descending). Jangan menampilkan tanggal kepada pengguna.
  // Pencarian mencakup semua entri di halaman custom (Tab Entri Artis maupun Tab Entri Kosong)
  const filteredSortedPages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // If search query is present, search across all entries (both linked and unlinked)
    // If search query is empty, filter by active tab
    let baseList = customPages;
    if (!query) {
      baseList = customPages.filter(page => {
        const isLinked = Boolean(page.linkedArtistId && page.linkedArtistId.trim() !== '');
        return activeTab === 'linked' ? isLinked : !isLinked;
      });
    }

    const searched = baseList.filter(page => {
      if (!query) return true;

      // Match Title
      const titleMatch = page.title.toLowerCase().includes(query);
      if (titleMatch) return true;

      // Match Linked Artist Name or details
      if (page.linkedArtistId) {
        const artist = artistMap.get(page.linkedArtistId);
        if (artist) {
          const fullName = `${artist.firstName} ${artist.lastName}`.toLowerCase();
          const country = (artist.country || '').toLowerCase();
          if (fullName.includes(query) || country.includes(query)) return true;
        }
      }

      return false;
    });

    // Sort by updatedAt (descending: latest edited/created first)
    return searched.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [customPages, activeTab, searchQuery, artistMap]);

  return (
    <div className="w-full max-w-5xl mx-auto pb-32 space-y-5 text-stone-100 animate-in fade-in duration-300">
      {/* 1. Header Bar */}
      <div className={`p-4 sm:p-5 ${radius} bg-stone-900/90 border border-stone-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl`}>
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={handleBack}
            className={`p-2.5 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer`}
            title="Kembali ke Pengaturan"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Layers className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                HALAMAN CUSTOM
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                {customPages.length} Entri
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Sistem manajemen entri halaman khusus tambahan, galeri visual mandiri, dan showcase artis.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className={`flex items-center gap-2 px-4 py-2.5 ${innerRadius} bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-102 active:scale-95 cursor-pointer`}
        >
          <Plus className="w-4 h-4" />
          <span>Buat Entri Custom</span>
        </button>
      </div>

      {/* 2. Sticky Tab Bar & Search Section */}
      {/* Full Centered Search Bar & Tab Bar */}
      <div className="sticky top-16 z-30 space-y-3 bg-stone-950/95 p-3 sm:p-4 rounded-2xl border border-stone-800/90 backdrop-blur-md shadow-2xl">
        {/* Centered Search Bar */}
        <div className="w-full flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari entri custom atau nama artis tertaut (mencakup semua entri)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-stone-900 border border-stone-700/80 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1 rounded-md hover:bg-stone-800 transition-colors cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Centered Tab Selector & Search status */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 border-t border-stone-800/60">
          <div className="flex items-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('linked')}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'linked' && !searchQuery
                  ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Tab Entri Artis</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                  activeTab === 'linked' && !searchQuery
                    ? 'bg-stone-950 text-amber-400'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                {linkedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('unlinked')}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'unlinked' && !searchQuery
                  ? 'bg-cyan-500 text-stone-950 shadow-md font-black'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tab Entri Kosong</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                  activeTab === 'unlinked' && !searchQuery
                    ? 'bg-stone-950 text-cyan-400'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                {unlinkedCount}
              </span>
            </button>
          </div>

          {searchQuery && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl font-mono">
              <span>Hasil Pencarian Semua Entri:</span>
              <span className="font-bold">{filteredSortedPages.length} entri ditemukan</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. List Container */}
      {/* Requirement 2: Layout utama berbentuk list, scrolling vertikal */}
      <div className="space-y-3">
        {filteredSortedPages.length === 0 ? (
          /* Empty State */
          <div className={`p-8 sm:p-12 ${radius} bg-stone-900/60 border border-stone-800/80 text-center space-y-4 shadow-md`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-center text-stone-400">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-200">
                {searchQuery
                  ? 'Tidak ada entri yang cocok dengan pencarian'
                  : activeTab === 'linked'
                  ? 'Belum ada Entri Custom yang tertaut ke Artis'
                  : 'Belum ada Entri Custom tanpa tautan artis'}
              </h3>
              <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
                {searchQuery
                  ? `Kata kunci "${searchQuery}" tidak ditemukan pada ${
                      activeTab === 'linked' ? 'Tab Entri Artis' : 'Tab Entri Kosong'
                    }.`
                  : activeTab === 'linked'
                  ? 'Buat entri baru dan tautkan ke salah satu artis terdaftar, atau tautkan entri kosong dari halaman Edit Artis.'
                  : 'Entri kosong dapat digunakan sebagai draf bebas atau showcase umum yang belum ditautkan ke artis tertentu.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                type="button"
                onClick={handleCreate}
                className={`inline-flex items-center gap-2 px-4 py-2 ${innerRadius} bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md cursor-pointer`}
              >
                <Plus className="w-4 h-4" />
                <span>Buat Entri Custom Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          filteredSortedPages.map(page => {
            const linkedArtist = page.linkedArtistId
              ? artistMap.get(page.linkedArtistId)
              : undefined;

            // Count summary for visual cues
            const totalImageCategories = page.blocks.filter(b => b.type === 'image_category').length;
            const totalImages = page.blocks.reduce((acc, b) => {
              if (b.type === 'image_category') return acc + (b.images?.length || 0);
              return acc;
            }, 0);
            const totalButtons = page.blocks.reduce((acc, b) => {
              if (b.type === 'buttons_group') return acc + (b.buttons?.length || 0);
              return acc;
            }, 0);

            return (
              <div
                key={page.id}
                className={`p-4 sm:p-5 ${radius} bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all ${elevation} group relative`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Content Preview & Info */}
                  <div
                    onClick={() => handleSelect(page)}
                    className="flex-1 min-w-0 cursor-pointer space-y-2.5"
                  >
                    {/* Title */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors tracking-tight">
                        {page.title}
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
                        {page.blocks.length} Blok Struktur
                      </span>
                    </div>

                    {/* Description preview if present */}
                    {page.description && (
                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {page.description}
                      </p>
                    )}

                    {/* Linked Artist Info & Badges */}
                    <div className="flex items-center gap-3 flex-wrap pt-1">
                      {/* Linked Artist Badge */}
                      {linkedArtist ? (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 ${innerRadius} bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold`}>
                          {linkedArtist.avatarUrl ? (
                            <img
                              src={linkedArtist.avatarUrl}
                              alt={linkedArtist.firstName}
                              className="w-4 h-4 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className="font-bold">
                            {linkedArtist.firstName} {linkedArtist.lastName}
                          </span>
                        </div>
                      ) : (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${innerRadius} bg-stone-800/80 border border-stone-700 text-stone-400 text-xs font-mono`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                          <span>Belum memiliki artis tertaut</span>
                        </div>
                      )}

                      {/* Content summary badges */}
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-cyan-400" />
                          <span>{totalImages} Foto ({totalImageCategories} Kat.)</span>
                        </span>
                        {totalButtons > 0 && (
                          <span className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3 text-emerald-400" />
                            <span>{totalButtons} Tombol</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (View Button + Dropdown Menu ⋮) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelect(page)}
                      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition-all cursor-pointer`}
                      title="Buka Halaman Custom"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka</span>
                    </button>

                    {/* Three-dots Menu ⋮ */}
                    {/* Requirement 5: Tombol ⋮ harus membuka menu: Edit Entri & Hapus Entri */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === page.id ? null : page.id);
                        }}
                        className={`p-2 ${innerRadius} bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer`}
                        title="Opsi Entri Custom"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Menu Popup */}
                      {menuOpenId === page.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1.5 w-44 bg-stone-950 border border-stone-800 rounded-xl p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-0.5">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setMenuOpenId(null);
                                handleSelect(page);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-stone-200 hover:bg-stone-800 hover:text-white transition-colors text-left cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Lihat Halaman</span>
                            </button>

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setMenuOpenId(null);
                                handleEdit(page);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-stone-200 hover:bg-stone-800 hover:text-white transition-colors text-left cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Edit Entri</span>
                            </button>

                            <div className="h-px bg-stone-800 my-1" />

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setMenuOpenId(null);
                                setDeletingEntry(page);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors text-left cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Hapus Entri</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Confirmation Dialog for Delete Entry */}
      {/* Requirement 5 & 24: Hapus Entri harus menampilkan confirmation dialog sebelum data benar-benar dihapus. Menghapus Entri Custom tidak boleh menghapus entri artis yang pernah tertaut dengannya. */}
      {deletingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Hapus Entri Custom</h3>
                <span className="text-xs text-stone-400 font-mono">Konfirmasi Penghapusan</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-300">
              <p>
                Apakah Anda yakin ingin menghapus entri custom{' '}
                <strong className="text-white">"{deletingEntry.title}"</strong>?
              </p>
              <p className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-stone-400">
                <strong className="text-amber-400 block mb-0.5">Catatan Keamanan:</strong>
                Penghapusan ini hanya menghapus data halaman custom ini. Entri artis yang pernah tertaut tidak akan terhapus ataupun berubah.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(deletingEntry.id);
                  setDeletingEntry(null);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Entri</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
