import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  HelpCircle,
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  ArrowLeft,
  Settings,
  Home,
  Trophy,
  ArrowRightLeft,
  Menu,
  CornerDownLeft,
  Layers,
  Cpu,
  Terminal,
  Feather,
  Crown,
  ChevronRight,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { ActiveTab, Artist, DatabaseSchema, AppTheme } from '../types';
import { getTranslation, TranslationDictionary } from '../utils/i18n';
import { useUITheme } from '../context/UIThemeContext';
import { getBorderRadiusClass } from '../utils/uiThemeEngine';
import { jumpToTarget, SearchHighlight, getArtistSearchMatchPreview } from './SearchHighlight';
import { getCountryFlag, getTypeInfo } from '../utils/calculations';

interface FloatingActionHubProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenGuidelines: () => void;
  onAddNew: () => void;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalArtists: number;
  selectedArtist?: Artist | null;
  onEditArtist?: () => void;
  onDeleteArtist?: () => void;
  onSelectSearchResult?: (artist: Artist, matchedField?: string) => void;
  schema?: DatabaseSchema;
  theme?: AppTheme;
  t?: TranslationDictionary;
  artists?: Artist[];
  hasBottomNav?: boolean;
  onResetSettings?: () => void;
}

export const FloatingActionHub: React.FC<FloatingActionHubProps> = ({
  currentTab,
  onTabChange,
  onOpenGuidelines,
  onAddNew,
  onOpenSettings,
  searchQuery = '',
  onSearchChange,
  totalArtists,
  selectedArtist,
  onEditArtist,
  onDeleteArtist,
  onSelectSearchResult,
  schema,
  theme = 'dark',
  t = getTranslation('default'),
  artists = [],
  hasBottomNav = true,
  onResetSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(true);

  const hubContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme !== 'light' && theme !== 'sepia';
  const isDetailPage = currentTab === 'detail' && selectedArtist;
  const isSettingsPage = currentTab === 'settings';

  const uiTheme = useUITheme();
  const radius = getBorderRadiusClass(uiTheme.global.borderRadius);
  const primaryColor = uiTheme.global.primaryColor || '#FE9900';

  // Click Outside: close menu and collapse search
  useEffect(() => {
    if (!isOpen && !isSearchExpanded) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (hubContainerRef.current && !hubContainerRef.current.contains(target)) {
        setIsOpen(false);
        setIsSearchExpanded(false);
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, isSearchExpanded]);

  // Focus search input when search is expanded
  useEffect(() => {
    if (isSearchExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchExpanded]);

  // Keyboard shortcut Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchExpanded) {
          setIsSearchExpanded(false);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSearchExpanded]);

  // Compute matching artists & preview snippets
  const matchingResults = useMemo(() => {
    const trimmed = (searchQuery || '').trim();
    if (!trimmed || artists.length === 0) return [];
    const q = trimmed.toLowerCase();

    return artists
      .map((artist) => {
        const preview = getArtistSearchMatchPreview(artist, trimmed);
        const fullName = `${artist.firstName || ''} ${artist.lastName || ''}`.toLowerCase();
        const typeInfo = getTypeInfo(artist.typeCode);

        const isNameMatch = fullName.includes(q);
        const isCountryMatch =
          (artist.country && artist.country.toLowerCase().includes(q)) ||
          (artist.countryCode && artist.countryCode.toLowerCase().includes(q));
        const isTypeMatch =
          (artist.typeCode && artist.typeCode.toLowerCase().includes(q)) ||
          typeInfo.indonesia.toLowerCase().includes(q) ||
          typeInfo.english.toLowerCase().includes(q);
        const hasSnippet = preview !== null;

        if (isNameMatch || isCountryMatch || isTypeMatch || hasSnippet) {
          return {
            artist,
            preview,
            isNameMatch,
          };
        }
        return null;
      })
      .filter((item): item is { artist: Artist; preview: ReturnType<typeof getArtistSearchMatchPreview>; isNameMatch: boolean } => item !== null)
      .slice(0, 8);
  }, [artists, searchQuery]);

  const handleSelectSearchResult = (artist: Artist, matchedField?: string) => {
    setShowSearchDropdown(false);
    setIsSearchExpanded(false);
    setIsOpen(false);
    onSearchChange('');

    if (onSelectSearchResult) {
      onSelectSearchResult(artist, matchedField);
    } else {
      if (currentTab !== 'home') {
        onTabChange('home');
      }
      setTimeout(() => {
        jumpToTarget(artist.id);
      }, 50);
    }
  };

  const renderBrandIcon = () => {
    switch (uiTheme.icon) {
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-on-primary stroke-[2.5]" />;
      case 'Feather':
        return <Feather className="w-5 h-5 text-on-primary stroke-[2.5]" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-on-primary fill-current" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-on-primary stroke-[2.5]" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-on-primary stroke-[2.5]" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-5 h-5 fill-current text-on-primary" />;
    }
  };

  const searchPlaceholder = schema?.pageTexts?.home?.buttons?.searchPlaceholder || t.searchPlaceholder || 'Cari artis, atribut, spek...';

  // Bottom positioning centered horizontally above BottomNav or at the bottom
  const bottomPositionClass = hasBottomNav
    ? 'bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-20 left-1/2 -translate-x-1/2'
    : 'bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 left-1/2 -translate-x-1/2';

  return (
    <div ref={hubContainerRef} className={`fixed z-50 flex flex-col items-center pointer-events-auto ${bottomPositionClass}`}>
      {/* ========================================================================= */}
      {/* POPUP ACTION MENU / SHEET                                                 */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          style={{
            backgroundColor: 'var(--color-surface, #16131c)',
            borderColor: 'var(--color-border, #2e273b)',
            color: 'var(--color-text-main, #f5f3f8)',
          }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] sm:w-84 max-w-[340px] rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header Panel */}
          <div
            style={{
              borderColor: 'var(--color-border, #2e273b)',
              backgroundColor: 'var(--color-surface-sub, #201b29)',
            }}
            className="p-3.5 border-b flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                style={{
                  backgroundColor: 'var(--color-primary, #958ab8)',
                  color: 'var(--color-text-on-primary, #ffffff)',
                }}
                className="w-6 h-6 rounded-lg flex items-center justify-center font-black shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="text-xs font-black tracking-tight uppercase font-mono">
                Menu Aksi Cepat
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors"
              title="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search Input / Toggle Section */}
          <div
            style={{
              borderColor: 'var(--color-border, #2e273b)',
              backgroundColor: 'var(--color-surface-sub, #201b29)',
            }}
            className="p-3 border-b"
          >
            <div className="relative">
              <Search
                style={{ color: 'var(--color-text-muted, #a395a8)' }}
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (searchQuery || '').trim()) {
                    if (matchingResults.length > 0) {
                      handleSelectSearchResult(matchingResults[0].artist, matchingResults[0].preview?.matchedField);
                    } else {
                      if (currentTab !== 'home') {
                        onTabChange('home');
                      }
                      setIsOpen(false);
                      const firstMatch = document.querySelector('.search-highlight-mark');
                      if (firstMatch) {
                        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }
                  } else if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
                style={{
                  backgroundColor: 'var(--color-bg-app, #0C0A09)',
                  borderColor: 'var(--color-border, #2e273b)',
                  color: 'var(--color-text-main, #f5f3f8)',
                }}
                className={`w-full ${radius} pl-9 pr-8 py-2 text-xs focus:outline-none transition-colors border`}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  style={{ color: 'var(--color-text-muted, #a395a8)' }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-100 opacity-70"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown inside Floating Hub */}
            {showSearchDropdown && (searchQuery || '').trim() && matchingResults.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface, #16131c)',
                  borderColor: 'var(--color-border, #2e273b)',
                  color: 'var(--color-text-main, #f5f3f8)',
                }}
                className="mt-2 rounded-xl border shadow-xl overflow-hidden max-h-56 overflow-y-auto"
              >
                <div
                  style={{
                    borderColor: 'var(--color-border, #2e273b)',
                    color: 'var(--color-primary, #958ab8)',
                  }}
                  className="px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-wider border-b flex items-center justify-between"
                >
                  <span>Hasil ({matchingResults.length})</span>
                  <span>Klik untuk melihat</span>
                </div>
                <div className="divide-y divide-white/10">
                  {matchingResults.map(({ artist, preview }) => {
                    const flag = getCountryFlag(artist.countryCode, artist.country);
                    return (
                      <div
                        key={artist.id}
                        onClick={() => handleSelectSearchResult(artist, preview?.matchedField)}
                        className="p-2 flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-white/10"
                      >
                        <div
                          style={{
                            backgroundColor: 'var(--color-surface-sub, #201b29)',
                            borderColor: 'var(--color-border, #2e273b)',
                          }}
                          className="w-8 h-10 rounded-md overflow-hidden shrink-0 border"
                        >
                          <img
                            src={artist.avatarUrl}
                            alt={artist.firstName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              style={{ color: 'var(--color-text-main, #f5f3f8)' }}
                              className="text-xs font-bold truncate"
                            >
                              <SearchHighlight text={artist.firstName} query={searchQuery} />{' '}
                              <SearchHighlight text={artist.lastName} query={searchQuery} />
                            </span>
                            <span className="text-xs">{flag}</span>
                          </div>
                          {preview && preview.matchedField !== 'name' && (
                            <div
                              style={{ color: 'var(--color-primary, #958ab8)' }}
                              className="text-[10px] font-mono truncate"
                            >
                              [{preview.label}]: <SearchHighlight text={preview.snippet} query={searchQuery} />
                            </div>
                          )}
                        </div>
                        <CornerDownLeft
                          style={{ color: 'var(--color-primary, #958ab8)' }}
                          className="w-3 h-3 shrink-0"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action List Items */}
          <div className="p-2 space-y-1">
            {/* Contextual Actions on Settings Page: Reset Pengaturan */}
            {isSettingsPage && onResetSettings && (
              <div className="space-y-1 pb-1 border-b border-stone-800/60">
                <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Aksi Pengaturan
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onResetSettings();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 hover:bg-rose-900/60 hover:text-white transition-all text-xs font-bold active:scale-95 cursor-pointer"
                  title="Kembalikan semua preferensi ke pengaturan bawaan"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Reset Pengaturan</div>
                      <div className="text-[10px] text-rose-300/80 font-normal">Kembalikan preferensi ke default</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            )}

            {/* Contextual Actions on Detail Page */}
            {isDetailPage && (
              <div className="space-y-1 pb-1 border-b border-stone-800/60">
                <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                  Aksi Artis Aktif
                </div>

                {onEditArtist && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onEditArtist();
                    }}
                    style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}60` }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all hover:scale-[1.01] active:scale-95 text-stone-100`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{ backgroundColor: primaryColor }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-950"
                      >
                        <Edit className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">{t.edit} Profil Artis</div>
                        <div className="text-[10px] text-stone-400 font-normal">Edit data & skor penilaian</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                )}

                {onDeleteArtist && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onDeleteArtist();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 hover:text-white transition-all text-xs font-bold active:scale-95"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">{t.delete} Artis</div>
                        <div className="text-[10px] text-rose-400 font-normal">Hapus entri profil dari koleksi</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    onTabChange('home');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-stone-800 hover:bg-stone-900/80 transition-colors text-xs font-semibold text-stone-300 hover:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{t.back} ke Beranda</div>
                      <div className="text-[10px] text-stone-400 font-normal">Kembali ke katalog artis</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            )}

            {/* Primary Action: Tambah Artis */}
            <button
              onClick={() => {
                setIsOpen(false);
                onAddNew();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-primary text-on-primary font-black text-xs shadow-md transition-all hover:scale-[1.01] active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-on-primary">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="text-left">
                  <div className="font-black">{t.addArtist}</div>
                  <div className="text-[10px] opacity-80 font-semibold">Buat entri artis & model baru</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-on-primary" />
            </button>

            {/* Panduan Penilaian / Skor */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenGuidelines();
              }}
              style={{
                borderColor: 'var(--color-border, #2e273b)',
                color: 'var(--color-text-main, #f5f3f8)',
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border transition-colors text-xs font-semibold hover:bg-white/10"
            >
              <div className="flex items-center gap-2.5">
                <div
                  style={{
                    backgroundColor: 'var(--color-primary-light, rgba(149,138,184,0.15))',
                    color: 'var(--color-primary, #958ab8)',
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{t.guide}</div>
                  <div style={{ color: 'var(--color-text-muted, #a395a8)' }} className="text-[10px] font-normal">Panduan standar rubrik & bobot skor</div>
                </div>
              </div>
              <ChevronRight style={{ color: 'var(--color-text-muted, #a395a8)' }} className="w-4 h-4" />
            </button>

            {/* Pengaturan Aplikasi */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              style={{
                borderColor: isSettingsPage ? 'var(--color-primary, #958ab8)' : 'var(--color-border, #2e273b)',
                backgroundColor: isSettingsPage ? 'var(--color-primary-light, rgba(149,138,184,0.15))' : 'transparent',
                color: isSettingsPage ? 'var(--color-primary, #958ab8)' : 'var(--color-text-main, #f5f3f8)',
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border transition-colors text-xs font-semibold hover:bg-white/10"
            >
              <div className="flex items-center gap-2.5">
                <div
                  style={{
                    backgroundColor: 'var(--color-primary-light, rgba(149,138,184,0.15))',
                    color: 'var(--color-primary, #958ab8)',
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                >
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{t.settings}</div>
                  <div style={{ color: 'var(--color-text-muted, #a395a8)' }} className="text-[10px] font-normal">Tema, Database Editor, Backup/Restore</div>
                </div>
              </div>
              <ChevronRight style={{ color: 'var(--color-text-muted, #a395a8)' }} className="w-4 h-4" />
            </button>

            {/* Beranda Cepat */}
            {currentTab !== 'home' && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onTabChange('home');
                }}
                style={{
                  borderColor: 'var(--color-border, #2e273b)',
                  color: 'var(--color-text-main, #f5f3f8)',
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border transition-colors text-xs font-semibold hover:bg-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface-sub, #201b29)',
                      color: 'var(--color-text-muted, #a395a8)',
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                  >
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{t.home}</div>
                    <div style={{ color: 'var(--color-text-muted, #a395a8)' }} className="text-[10px] font-normal">Katalog utama & filter koleksi</div>
                  </div>
                </div>
                <ChevronRight style={{ color: 'var(--color-text-muted, #a395a8)' }} className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN FLOATING ACTION BUTTON (FAB)                                         */}
      {/* ========================================================================= */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-primary text-on-primary font-black border-2 border-stone-950/30 shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 select-none ${
          isOpen ? 'rotate-90 scale-105' : 'hover:rotate-6'
        }`}
        title={isOpen ? 'Tutup Menu' : 'Menu Aksi Cepat (Semua Fungsi)'}
        aria-label="Menu Aksi Cepat"
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          renderBrandIcon()
        )}
      </button>
    </div>
  );
};
