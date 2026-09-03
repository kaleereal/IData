import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Sparkles, HelpCircle, Search, Plus, X, Edit, Trash2, ArrowLeft, Settings, Terminal, Feather, Crown, Layers, Cpu, CornerDownLeft, Star } from 'lucide-react';
import { ActiveTab, Artist, DatabaseSchema, AppTheme } from '../types';
import { getTranslation, TranslationDictionary } from '../utils/i18n';
import { useUITheme } from '../context/UIThemeContext';
import { getBorderRadiusClass } from '../utils/uiThemeEngine';
import { jumpToTarget, SearchHighlight, getArtistSearchMatchPreview } from './SearchHighlight';
import { getCountryFlag, getTypeInfo } from '../utils/calculations';

interface NavbarProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenGuidelines: () => void;
  onAddNew: () => void;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  totalArtists: number;
  selectedArtist?: Artist | null;
  onEditArtist?: () => void;
  onDeleteArtist?: () => void;
  onSelectSearchResult?: (artist: Artist, matchedField?: string) => void;
  schema?: DatabaseSchema;
  theme?: AppTheme;
  t?: TranslationDictionary;
  artists?: Artist[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenGuidelines,
  onAddNew,
  onOpenSettings,
  searchQuery = '',
  onSearchChange,
  isSearchOpen = false,
  onToggleSearch,
  totalArtists,
  selectedArtist,
  onEditArtist,
  onDeleteArtist,
  onSelectSearchResult,
  schema,
  theme = 'dark',
  t = getTranslation('default'),
  artists = [],
}) => {
  const isDark = theme !== 'light' && theme !== 'sepia';
  const isDetailPage = currentTab === 'detail' && selectedArtist;
  const isSettingsPage = currentTab === 'settings';

  const uiTheme = useUITheme();
  const radius = getBorderRadiusClass(uiTheme.global.borderRadius);
  const primaryColor = uiTheme.global.primaryColor || '#FE9900';

  const [showDropdown, setShowDropdown] = useState<boolean>(true);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchToggleBtnRef = useRef<HTMLButtonElement>(null);

  // Click Outside Behavior: close search bar and reset query when clicking outside
  useEffect(() => {
    if (!isSearchOpen && !searchQuery) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target) &&
        searchToggleBtnRef.current &&
        !searchToggleBtnRef.current.contains(target)
      ) {
        if (isSearchOpen) {
          onToggleSearch();
        }
        if (searchQuery) {
          onSearchChange('');
        }
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSearchOpen, searchQuery, onToggleSearch, onSearchChange]);

  // Compute matching artists and preview snippets
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
      .slice(0, 8); // Top 8 immediate suggestions
  }, [artists, searchQuery]);

  const handleSelectSearchResult = (artist: Artist, matchedField?: string) => {
    setShowDropdown(false);
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
    if (isSearchOpen) {
      onToggleSearch();
    }
    onSearchChange('');
  };

  const searchPlaceholder = schema?.pageTexts?.home?.buttons?.searchPlaceholder || t.searchPlaceholder;

  // Resolve dynamic theme icon
  const renderBrandIcon = () => {
    switch (uiTheme.icon) {
      case 'Terminal':
        return <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-on-primary" />;
      case 'Feather':
        return <Feather className="w-4 h-4 sm:w-5 sm:h-5 text-on-primary" />;
      case 'Crown':
        return <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-on-primary fill-current" />;
      case 'Layers':
        return <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-on-primary" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-on-primary" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-on-primary" />;
    }
  };

  const getHeaderBgClass = () => {
    switch (theme) {
      case 'midnight':
        return 'bg-[#0B132B]/95 border-[#1E293B]/90 text-slate-100 shadow-xl';
      case 'slate':
        return 'bg-[#18181B]/95 border-[#27272A]/90 text-zinc-100 shadow-xl';
      case 'sepia':
        return 'bg-[#FAF6EE]/95 border-[#E6DCB8] text-stone-900 shadow-xs';
      case 'forest':
        return 'bg-[#061A14]/95 border-[#0C2A20]/90 text-emerald-100 shadow-xl';
      case 'light':
        return 'bg-white/95 border-stone-200 text-stone-900 shadow-xs';
      case 'dark':
      default:
        return 'bg-stone-950/95 border-stone-800/80 text-white shadow-xl';
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b backdrop-blur-md pt-[env(safe-area-inset-top,0px)] ${getHeaderBgClass()}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3 min-w-0">
        {/* Brand Icon Button (Navigates to Home, App Name Removed per Requirement 1) */}
        <div
          onClick={() => onTabChange('home')}
          className="flex items-center cursor-pointer group select-none shrink-0"
          title="Beranda"
        >
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 ${radius} bg-primary text-on-primary flex items-center justify-center font-black shadow-lg group-hover:scale-105 transition-transform shrink-0`}
          >
            {renderBrandIcon()}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          {/* Detail View Context: Edit & Delete buttons */}
          {isDetailPage ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              {/* Back to List */}
              <button
                onClick={() => onTabChange('home')}
                className={`flex items-center justify-center p-2 ${radius} border transition-colors ${
                  isDark
                    ? 'bg-stone-900 hover:bg-stone-800 border-stone-700/80 text-stone-300 hover:text-white'
                    : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700 hover:text-stone-950'
                }`}
                title={t.back}
                aria-label={t.back}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* EDIT ARTIST Button */}
              {onEditArtist && (
                <button
                  onClick={onEditArtist}
                  className={`flex items-center justify-center p-2 ${radius} bg-primary text-on-primary shadow-md transition-all hover:scale-105 active:scale-95`}
                  title={t.edit}
                  aria-label={t.edit}
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              {/* DELETE ARTIST Button */}
              {onDeleteArtist && (
                <button
                  onClick={onDeleteArtist}
                  className={`flex items-center justify-center p-2 ${radius} border transition-all shadow-md active:scale-95 ${
                    isDark
                      ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/40 text-rose-300 hover:text-white'
                      : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-700 hover:text-rose-900'
                  }`}
                  title={t.delete}
                  aria-label={t.delete}
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Search Toggle Button */}
              <button
                ref={searchToggleBtnRef}
                onClick={onToggleSearch}
                className={`flex items-center gap-1.5 py-1.5 px-3 ${radius} border text-xs font-semibold transition-all ${
                  isSearchOpen || searchQuery
                    ? 'bg-primary text-on-primary border-primary font-bold shadow-md'
                    : isDark
                    ? 'bg-stone-900 hover:bg-stone-800 border-stone-700/80 text-stone-300 hover:text-white'
                    : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700 hover:text-stone-950'
                }`}
                title={t.search}
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.search}</span>
              </button>

              {/* Guidelines Button */}
              <button
                onClick={onOpenGuidelines}
                className={`flex items-center gap-1.5 py-1.5 px-3 ${radius} border text-xs font-semibold transition-colors ${
                  isDark
                    ? 'bg-stone-900 hover:bg-stone-800 border-stone-700/80 text-stone-300 hover:text-white'
                    : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700 hover:text-stone-950'
                }`}
                title={t.guide}
              >
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">{t.guide}</span>
              </button>

              {/* Settings Page Button */}
              <button
                onClick={onOpenSettings}
                className={`flex items-center gap-1.5 py-1.5 px-3 ${radius} border text-xs font-semibold transition-all ${
                  isSettingsPage
                    ? 'bg-primary text-on-primary border-primary font-bold shadow-md'
                    : isDark
                    ? 'bg-stone-900 hover:bg-stone-800 border-stone-700/80 text-stone-300 hover:text-white'
                    : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700 hover:text-stone-950'
                }`}
                title={t.settings}
              >
                <Settings className={`w-3.5 h-3.5 ${!isSettingsPage ? 'text-primary' : ''}`} />
                <span className="hidden sm:inline">{t.settings}</span>
              </button>

              {/* Add Artist Button */}
              <button
                onClick={onAddNew}
                className={`flex items-center gap-1.5 py-1.5 px-3 ${radius} bg-primary text-on-primary text-xs font-bold shadow-md transition-all hover:scale-102 active:scale-95`}
                title={t.addArtist}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">{t.addArtist}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expandable Search Input Row */}
      {isSearchOpen && (
        <div
          ref={searchContainerRef}
          className={`border-t px-4 sm:px-6 py-2.5 animate-in slide-in-from-top-2 duration-200 relative ${
            isDark ? 'border-stone-800/80 bg-stone-900/95' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="relative flex-1">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-stone-400' : 'text-stone-500'}`} />
              <input
                type="text"
                autoFocus
                placeholder={searchPlaceholder}
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (searchQuery || '').trim()) {
                    if (matchingResults.length > 0) {
                      handleSelectSearchResult(matchingResults[0].artist, matchingResults[0].preview?.matchedField);
                    } else {
                      if (currentTab !== 'home') {
                        onTabChange('home');
                      }
                      setShowDropdown(false);
                      const firstMatch = document.querySelector('.search-highlight-mark');
                      if (firstMatch) {
                        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        const parentCard = firstMatch.closest('[id^="artist-card-"]');
                        if (parentCard) {
                          parentCard.classList.remove('search-target-pulse');
                          void (parentCard as HTMLElement).offsetWidth;
                          parentCard.classList.add('search-target-pulse');
                          setTimeout(() => parentCard.classList.remove('search-target-pulse'), 2200);
                        }
                      }
                    }
                  } else if (e.key === 'Escape') {
                    setShowDropdown(false);
                    onToggleSearch();
                    onSearchChange('');
                  }
                }}
                className={`w-full border ${radius} pl-9 pr-8 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-stone-950 border-stone-700 text-white placeholder-stone-400'
                    : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 shadow-xs'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Instant Search Results Dropdown with Context Previews */}
              {showDropdown && (searchQuery || '').trim() && matchingResults.length > 0 && (
                <div
                  className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border shadow-2xl overflow-hidden max-h-80 overflow-y-auto ${
                    isDark ? 'bg-stone-950/98 border-stone-800 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
                  }`}
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-800 flex items-center justify-between">
                    <span>Hasil Pencarian Langsung ({matchingResults.length})</span>
                    <span className="flex items-center gap-1 text-[9px] text-amber-400">
                      <span>Tekan Enter atau klik untuk melihat profil</span>
                      <CornerDownLeft className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="divide-y divide-stone-800/40">
                    {matchingResults.map(({ artist, preview }) => {
                      const flag = getCountryFlag(artist.countryCode, artist.country);
                      return (
                        <div
                          key={artist.id}
                          onClick={() => handleSelectSearchResult(artist, preview?.matchedField)}
                          className={`p-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                            isDark ? 'hover:bg-stone-900/90' : 'hover:bg-stone-100'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-9 h-11 rounded-md overflow-hidden bg-stone-900 shrink-0 border border-stone-700/50">
                            <img
                              src={artist.avatarUrl}
                              alt={artist.firstName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Data Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">
                                <SearchHighlight text={artist.firstName} query={searchQuery} />{' '}
                                <SearchHighlight text={artist.lastName} query={searchQuery} />
                              </span>
                              <span className="text-xs shrink-0">{flag}</span>
                              <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {artist.typeCode}
                              </span>
                            </div>

                            {/* Match Context Preview Snippet */}
                            {preview && preview.matchedField !== 'name' && (
                              <div className="text-[11px] text-amber-300/90 font-mono truncate flex items-center gap-1">
                                <span className="text-stone-400 font-sans text-[10px] uppercase">
                                  [{preview.label}]:
                                </span>
                                <span className="truncate">
                                  <SearchHighlight text={preview.snippet} query={searchQuery} />
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Arrow */}
                          <div className="shrink-0 text-stone-400 text-xs flex items-center gap-1 font-mono">
                            <CornerDownLeft className="w-3 h-3 text-amber-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                onToggleSearch();
                onSearchChange('');
              }}
              className={`p-2 ${radius} transition-colors ${
                isDark ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-500 hover:text-stone-950 hover:bg-stone-200'
              }`}
              title={t.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
