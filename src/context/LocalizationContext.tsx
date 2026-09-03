import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UITextRecord, UITextChangeLog } from '../types';
import {
  localizationCache,
  getUIText,
  UI_TEXT_STORAGE_KEY,
  UI_TEXT_HISTORY_KEY,
} from '../utils/dynamicLocalization';

interface LocalizationContextType {
  currentLocale: string;
  setLocale: (locale: string) => void;
  t: (key: string, fallback?: string) => string;
  records: UITextRecord[];
  history: UITextChangeLog[];
  updateKey: (key: string, value: string, locale?: string, note?: string) => void;
  bulkUpdate: (updates: { text_key: string; text_value: string; locale?: string }[], note?: string) => void;
  findAndReplace: (findText: string, replaceText: string, targetLocale?: string, category?: string) => number;
  rollback: (logId: string) => boolean;
  flushCache: () => void;
  resetToDefault: () => void;
  addNewKey: (newRecord: Omit<UITextRecord, 'id' | 'last_updated'>) => void;
  deleteKey: (key: string) => void;
  exportData: (format: 'json' | 'csv', localeFilter?: string) => void;
  importData: (content: string, format: 'json' | 'csv', mode?: 'merge' | 'replace') => { success: boolean; count: number; error?: string };
  scanAndSyncScope: () => { addedCount: number; scannedCategories: string[]; newKeys: string[] };
}

const LocalizationContext = createContext<LocalizationContextType | null>(null);

export const LocalizationProvider: React.FC<{ children: React.ReactNode; initialLocale?: string }> = ({
  children,
  initialLocale = 'default',
}) => {
  const [currentLocale, setCurrentLocaleState] = useState<string>(() => {
    return initialLocale;
  });

  const [records, setRecords] = useState<UITextRecord[]>(() => {
    return localizationCache.getAllRecords();
  });

  const [history, setHistory] = useState<UITextChangeLog[]>(() => {
    return localizationCache.getHistory();
  });

  const [version, setVersion] = useState<number>(0);

  // Sync with cache manager
  useEffect(() => {
    localizationCache.setLocale(currentLocale);
  }, [currentLocale]);

  // Subscribe to changes in cache manager
  useEffect(() => {
    const unsubscribe = localizationCache.subscribe(() => {
      setRecords(localizationCache.getAllRecords());
      setHistory(localizationCache.getHistory());
      setVersion(v => v + 1);
    });
    return () => unsubscribe();
  }, []);

  const setLocale = useCallback((locale: string) => {
    setCurrentLocaleState(locale);
    localizationCache.setLocale(locale);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      // version dependency ensures re-render on changes
      return localizationCache.get(key, fallback);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, currentLocale]
  );

  const updateKey = useCallback((key: string, value: string, locale?: string, note?: string) => {
    localizationCache.updateKey(key, value, locale || currentLocale, note);
  }, [currentLocale]);

  const bulkUpdate = useCallback((updates: { text_key: string; text_value: string; locale?: string }[], note?: string) => {
    localizationCache.bulkUpdate(updates, note);
  }, []);

  const findAndReplace = useCallback((findText: string, replaceText: string, targetLocale?: string, category?: string): number => {
    return localizationCache.findAndReplace(findText, replaceText, targetLocale || currentLocale, category);
  }, [currentLocale]);

  const rollback = useCallback((logId: string): boolean => {
    return localizationCache.rollback(logId);
  }, []);

  const flushCache = useCallback(() => {
    localizationCache.flushCache();
  }, []);

  const resetToDefault = useCallback(() => {
    localizationCache.resetAllToDefault();
  }, []);

  const addNewKey = useCallback((newRecord: Omit<UITextRecord, 'id' | 'last_updated'>) => {
    const now = new Date().toISOString();
    const id = `uitext_${newRecord.text_key.replace(/\./g, '_')}_${newRecord.locale}`;
    localizationCache.updateKey(newRecord.text_key, newRecord.text_value, newRecord.locale, 'Tambah Kunci Teks Baru');
  }, []);

  const deleteKey = useCallback((key: string) => {
    // Soft removal or resetting to empty
    localizationCache.updateKey(key, '', currentLocale, 'Hapus Kunci Teks');
  }, [currentLocale]);

  const exportData = useCallback((format: 'json' | 'csv', localeFilter?: string) => {
    const allRecords = localizationCache.getAllRecords();
    const filtered = localeFilter && localeFilter !== 'all' 
      ? allRecords.filter(r => r.locale === localeFilter) 
      : allRecords;

    if (format === 'json') {
      const dataStr = JSON.stringify(filtered, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ui_text_dictionary_${localeFilter || 'all'}_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV Format
      const headers = ['id', 'text_key', 'locale', 'category', 'type', 'text_value', 'default_value', 'description', 'last_updated'];
      const escapeCSV = (str: string = '') => `"${str.replace(/"/g, '""')}"`;
      
      const csvRows = [
        headers.join(','),
        ...filtered.map(r => [
          escapeCSV(r.id),
          escapeCSV(r.text_key),
          escapeCSV(r.locale),
          escapeCSV(r.category),
          escapeCSV(r.type),
          escapeCSV(r.text_value),
          escapeCSV(r.default_value),
          escapeCSV(r.description || ''),
          escapeCSV(r.last_updated),
        ].join(','))
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ui_text_dictionary_${localeFilter || 'all'}_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  const importData = useCallback((content: string, format: 'json' | 'csv', mode: 'merge' | 'replace' = 'merge'): { success: boolean; count: number; error?: string } => {
    try {
      let importedRecords: UITextRecord[] = [];

      if (format === 'json') {
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          return { success: false, count: 0, error: 'Format JSON harus berupa Array objek UITextRecord' };
        }
        importedRecords = parsed.filter(item => item && item.text_key && item.text_value !== undefined);
      } else {
        // Simple CSV parser
        const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          return { success: false, count: 0, error: 'Berkas CSV kosong atau tidak memiliki baris data' };
        }
        
        // Parse CSV with regex to handle quoted cells
        const parseCSVLine = (text: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
              if (inQuotes && text[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current);
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
        const keyIdx = headers.indexOf('text_key');
        const valIdx = headers.indexOf('text_value');
        const locIdx = headers.indexOf('locale');
        const catIdx = headers.indexOf('category');
        const typeIdx = headers.indexOf('type');

        if (keyIdx === -1 || valIdx === -1) {
          return { success: false, count: 0, error: 'Kolom text_key atau text_value tidak ditemukan dalam header CSV' };
        }

        const now = new Date().toISOString();
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]);
          const text_key = cells[keyIdx]?.trim();
          const text_value = cells[valIdx] ?? '';
          const locale = (locIdx >= 0 ? cells[locIdx]?.trim() : 'id') || 'id';
          const category = (catIdx >= 0 ? cells[catIdx]?.trim() : 'Global / Navbar') as any;
          const type = (typeIdx >= 0 ? cells[typeIdx]?.trim() : 'Label') as any;

          if (text_key) {
            importedRecords.push({
              id: `uitext_${text_key.replace(/\./g, '_')}_${locale}`,
              text_key,
              locale,
              category: category || 'Global / Navbar',
              type: type || 'Label',
              text_value,
              default_value: text_value,
              last_updated: now,
            });
          }
        }
      }

      if (importedRecords.length === 0) {
        return { success: false, count: 0, error: 'Tidak ada baris teks valid yang ditemukan untuk diimpor' };
      }

      if (mode === 'replace') {
        localStorage.setItem(UI_TEXT_STORAGE_KEY, JSON.stringify(importedRecords));
        localizationCache.loadFromStorage();
      } else {
        // Merge mode
        const updates = importedRecords.map(r => ({
          text_key: r.text_key,
          text_value: r.text_value,
          locale: r.locale,
        }));
        localizationCache.bulkUpdate(updates, `Impor berkas ${format.toUpperCase()} (${importedRecords.length} entri)`);
      }

      return { success: true, count: importedRecords.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Gagal memproses file' };
    }
  }, []);

  const value = useMemo<LocalizationContextType>(() => ({
    currentLocale,
    setLocale,
    t,
    records,
    history,
    updateKey,
    bulkUpdate,
    findAndReplace,
    rollback,
    flushCache,
    resetToDefault,
    addNewKey,
    deleteKey,
    exportData,
    importData,
    scanAndSyncScope: () => {
      const res = localizationCache.scanAndRegisterDynamicAppContent();
      setRecords(localizationCache.getAllRecords());
      setHistory(localizationCache.getHistory());
      setVersion(v => v + 1);
      return res;
    },
  }), [
    currentLocale,
    setLocale,
    t,
    records,
    history,
    updateKey,
    bulkUpdate,
    findAndReplace,
    rollback,
    flushCache,
    resetToDefault,
    addNewKey,
    deleteKey,
    exportData,
    importData,
  ]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    // Fallback standalone helper if used outside provider
    return {
      currentLocale: 'default',
      setLocale: (loc: string) => localizationCache.setLocale(loc),
      t: (key: string, fallback?: string) => localizationCache.get(key, fallback),
      records: localizationCache.getAllRecords(),
      history: localizationCache.getHistory(),
      updateKey: (k, v, l, n) => localizationCache.updateKey(k, v, l, n),
      bulkUpdate: (u, n) => localizationCache.bulkUpdate(u, n),
      findAndReplace: (f, r, l, c) => localizationCache.findAndReplace(f, r, l, c),
      rollback: (id) => localizationCache.rollback(id),
      flushCache: () => localizationCache.flushCache(),
      resetToDefault: () => localizationCache.resetAllToDefault(),
      addNewKey: (rec) => localizationCache.updateKey(rec.text_key, rec.text_value, rec.locale),
      deleteKey: (k) => localizationCache.updateKey(k, ''),
      exportData: () => {},
      importData: () => ({ success: false, count: 0 }),
      scanAndSyncScope: () => localizationCache.scanAndRegisterDynamicAppContent(),
    };
  }
  return context;
};
