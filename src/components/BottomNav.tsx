import React from 'react';
import { Home, Trophy, ArrowRightLeft, Settings } from 'lucide-react';
import { ActiveTab, AppTheme } from '../types';
import { getTranslation, TranslationDictionary } from '../utils/i18n';
import { useUITheme } from '../context/UIThemeContext';
import { getBorderRadiusClass } from '../utils/uiThemeEngine';

interface BottomNavProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onAddNew?: () => void;
  theme?: AppTheme;
  t?: TranslationDictionary;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  t = getTranslation('default'),
}) => {
  const uiTheme = useUITheme();
  const navStyle = uiTheme.global.navigationStyle || 'floating_pill';
  const radius = getBorderRadiusClass(uiTheme.global.borderRadius);

  // Dynamic container wrapper based on navigation style
  const getNavContainerClass = () => {
    switch (navStyle) {
      case 'floating_pill':
        return 'fixed bottom-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-full max-w-md z-40';
      case 'glass_bar':
        return 'fixed bottom-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-full max-w-lg z-40';
      case 'compact_hud':
        return 'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl z-40 pb-[env(safe-area-inset-bottom,0px)]';
      case 'minimal_icons':
        return 'fixed bottom-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-full max-w-sm z-40';
      case 'docked_bottom':
      default:
        return 'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl z-40 pb-[env(safe-area-inset-bottom,0px)]';
    }
  };

  const getNavInnerClass = () => {
    const isPill = navStyle === 'floating_pill' || navStyle === 'glass_bar' || navStyle === 'minimal_icons';
    const containerRadius = isPill ? (navStyle === 'floating_pill' ? 'rounded-full' : radius) : 'rounded-none border-t';
    const bgEffect = uiTheme.global.glassmorphism
      ? 'backdrop-blur-xl shadow-2xl'
      : 'shadow-2xl';

    return `${isPill ? 'border px-3 py-1.5' : 'py-1.5 px-3'} ${containerRadius} ${bgEffect} transition-all duration-200`;
  };

  const isHomeActive = currentTab === 'home';
  const isRankActive = currentTab === 'rank';
  const isCompareActive = currentTab === 'compare';
  const isSettingsActive = currentTab === 'settings';

  return (
    <div className={getNavContainerClass()}>
      <nav
        style={{
          backgroundColor: 'var(--color-surface, var(--app-card, #16131c))',
          borderColor: 'var(--color-border, var(--app-border, #2e273b))',
          color: 'var(--color-text-main, var(--app-text, #f5f3f8))',
        }}
        className={getNavInnerClass()}
      >
        <div className="flex items-center justify-between px-1">
          {/* 1. Home */}
          <button
            onClick={() => onTabChange('home')}
            style={{
              color: isHomeActive ? 'var(--color-primary, #958ab8)' : 'var(--color-text-muted, #a395a8)',
            }}
            className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-0.5 transition-all py-1 px-2 ${radius} ${
              isHomeActive ? 'font-bold scale-105' : 'hover:opacity-100 font-medium opacity-80'
            }`}
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            {navStyle !== 'minimal_icons' && (
              <span className="text-[10px] sm:text-[11px] tracking-wide leading-none">{t.home}</span>
            )}
          </button>

          {/* 2. Rank */}
          <button
            onClick={() => onTabChange('rank')}
            style={{
              color: isRankActive ? 'var(--color-primary, #958ab8)' : 'var(--color-text-muted, #a395a8)',
            }}
            className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-0.5 transition-all py-1 px-2 ${radius} ${
              isRankActive ? 'font-bold scale-105' : 'hover:opacity-100 font-medium opacity-80'
            }`}
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            {navStyle !== 'minimal_icons' && (
              <span className="text-[10px] sm:text-[11px] tracking-wide leading-none">{t.rank}</span>
            )}
          </button>

          {/* 3. Compare */}
          <button
            onClick={() => onTabChange('compare')}
            style={{
              color: isCompareActive ? 'var(--color-primary, #958ab8)' : 'var(--color-text-muted, #a395a8)',
            }}
            className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-0.5 transition-all py-1 px-2 ${radius} ${
              isCompareActive ? 'font-bold scale-105' : 'hover:opacity-100 font-medium opacity-80'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            {navStyle !== 'minimal_icons' && (
              <span className="text-[10px] sm:text-[11px] tracking-wide leading-none">{t.compare}</span>
            )}
          </button>

          {/* 5. Pengaturan (Settings) */}
          <button
            onClick={() => onTabChange('settings')}
            style={{
              color: isSettingsActive ? 'var(--color-primary, #958ab8)' : 'var(--color-text-muted, #a395a8)',
            }}
            className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-0.5 transition-all py-1 px-2 ${radius} ${
              isSettingsActive ? 'font-bold scale-105' : 'hover:opacity-100 font-medium opacity-80'
            }`}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            {navStyle !== 'minimal_icons' && (
              <span className="text-[10px] sm:text-[11px] tracking-wide leading-none">{t.settings}</span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};
