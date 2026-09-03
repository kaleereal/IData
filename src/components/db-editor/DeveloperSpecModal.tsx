import React, { useState } from 'react';
import { Code, Database, Copy, Check, X, Server, Layers, Terminal } from 'lucide-react';
import { generateSQLMigration, generateRESTAPISpec } from '../../utils/dynamicLocalization';

interface DeveloperSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const DeveloperSpecModal: React.FC<DeveloperSpecModalProps> = ({
  isOpen,
  onClose,
  isDark = true,
}) => {
  const [tab, setTab] = useState<'sql_ui' | 'api_ui'>('sql_ui');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const sqlUiCode = generateSQLMigration();
  const apiUiCode = generateRESTAPISpec();

  const getActiveCode = () => {
    switch (tab) {
      case 'sql_ui': return sqlUiCode;
      case 'api_ui': return apiUiCode;
      default: return sqlUiCode;
    }
  };

  const getFilenameLabel = () => {
    switch (tab) {
      case 'sql_ui': return 'schema_ui_text_migration.sql (PostgreSQL / Cloud SQL)';
      case 'api_ui': return 'server/api/translations.ts (Express.js + In-Memory / Redis)';
      default: return '';
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className={`border rounded-2xl sm:rounded-3xl max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl flex flex-col max-h-[90vh] ${
        isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Spesifikasi Skema Database, DDL Migration & REST API Docs
              </h3>
              <p className="text-xs text-stone-400">
                Skema Database Key-Value UI, Relasi CASCADE, Redis &amp; SWR Cache
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setTab('sql_ui')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'sql_ui'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-stone-800/60 text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 1. SQL UI Localization
          </button>
          <button
            onClick={() => setTab('api_ui')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'api_ui'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-stone-800/60 text-stone-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> 2. REST & GraphQL Spec
          </button>
        </div>

        {/* Filename & Copy Header */}
        <div className="flex items-center justify-between text-xs bg-stone-950 px-3 py-2 rounded-t-lg border border-b-0 border-stone-800 text-stone-400 shrink-0">
          <span className="font-mono text-indigo-400 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" /> {getFilenameLabel()}
          </span>
          <button
            onClick={() => copyToClipboard(getActiveCode(), tab)}
            className="flex items-center gap-1 text-stone-300 hover:text-white font-medium bg-stone-800 px-2 py-0.5 rounded transition-colors"
          >
            {copied === tab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Tersalin!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Salin Kode
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 min-h-0 bg-stone-950 border border-stone-800 rounded-b-lg overflow-hidden flex flex-col">
          <pre className="flex-1 p-4 text-xs font-mono text-stone-300 overflow-auto whitespace-pre leading-relaxed select-all">
            {getActiveCode()}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800 shrink-0 text-xs text-stone-400">
          <span>Total Eksekusi: PostgreSQL 14+, Express.js, TypeScript 5.0+, Redis v7</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
