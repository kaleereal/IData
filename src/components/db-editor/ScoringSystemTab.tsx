import React, { useState } from 'react';
import {
  ScoringSystemConfig,
  ScoringWeightItem,
  RatingPredicateTier,
} from '../../utils/taxonomyManager';
import {
  Calculator,
  Sliders,
  Award,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Star,
  Activity,
} from 'lucide-react';

interface ScoringSystemTabProps {
  config: ScoringSystemConfig;
  onUpdateConfig: (newConfig: ScoringSystemConfig) => void;
  isDark?: boolean;
}

export const ScoringSystemTab: React.FC<ScoringSystemTabProps> = ({
  config,
  onUpdateConfig,
  isDark = true,
}) => {
  const [minScale, setMinScale] = useState(config.minScale ?? 0);
  const [maxScale, setMaxScale] = useState(config.maxScale ?? 100);
  const [formulaExpression, setFormulaExpression] = useState(
    config.formulaExpression || '(Appearance * 0.5) + (Impression * 0.5)'
  );
  const [formulaDescription, setFormulaDescription] = useState(
    config.formulaDescription ||
      'Kalkulasi skor akhir dihitung dari rata-rata berbobot Appearance (50%) dan Impression (50%).'
  );

  const [appearanceWeights, setAppearanceWeights] = useState<ScoringWeightItem[]>(
    config.appearanceWeights || []
  );
  const [impressionWeights, setImpressionWeights] = useState<ScoringWeightItem[]>(
    config.impressionWeights || []
  );
  const [tiers, setTiers] = useState<RatingPredicateTier[]>(config.tiers || []);

  const [testAppearanceScore, setTestAppearanceScore] = useState(85);
  const [testImpressionScore, setTestImpressionScore] = useState(90);

  // Appearance Weights Total
  const totalAppearanceWeight = appearanceWeights.reduce((acc, w) => acc + (Number(w.weightPercent) || 0), 0);
  const totalImpressionWeight = impressionWeights.reduce((acc, w) => acc + (Number(w.weightPercent) || 0), 0);

  // Live Formula Simulator Test
  const calculateTestScore = () => {
    try {
      // Safe math eval with variables
      const expr = formulaExpression
        .replace(/Appearance/g, String(testAppearanceScore))
        .replace(/Impression/g, String(testImpressionScore));
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${expr});`);
      const val = Number(fn());
      return isNaN(val) ? 0 : Math.min(Math.max(val, minScale), maxScale);
    } catch {
      return 0;
    }
  };

  const simulatedScore = calculateTestScore();
  const matchedTier = tiers.find((t) => simulatedScore >= t.minScore && simulatedScore <= t.maxScore) || tiers[0];

  const handleUpdateAppearanceWeight = (idx: number, updates: Partial<ScoringWeightItem>) => {
    const updated = [...appearanceWeights];
    updated[idx] = { ...updated[idx], ...updates };
    setAppearanceWeights(updated);
  };

  const handleUpdateImpressionWeight = (idx: number, updates: Partial<ScoringWeightItem>) => {
    const updated = [...impressionWeights];
    updated[idx] = { ...updated[idx], ...updates };
    setImpressionWeights(updated);
  };

  const handleUpdateTier = (idx: number, updates: Partial<RatingPredicateTier>) => {
    const updated = [...tiers];
    updated[idx] = { ...updated[idx], ...updates };
    setTiers(updated);
  };

  const handleAddTier = () => {
    const newTier: RatingPredicateTier = {
      id: `tier_${Date.now()}`,
      grade: 'NEW',
      minScore: 0,
      maxScore: 50,
      label: 'Predikat Baru',
      badgeColor: '#6366f1',
      starCount: 3,
    };
    setTiers([...tiers, newTier]);
  };

  const handleDeleteTier = (idx: number) => {
    setTiers(tiers.filter((_, i) => i !== idx));
  };

  const handleSaveAll = () => {
    const updated: ScoringSystemConfig = {
      ...config,
      minScale,
      maxScale,
      formulaExpression,
      formulaDescription,
      appearanceWeights,
      impressionWeights,
      tiers,
    };
    onUpdateConfig(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight">
              TAB 2: SISTEM PENILAIAN SCORING & FORMULA ENGINE
            </h2>
            <p className="text-xs text-stone-400">
              Konfigurasi skala nilai (0-100), rumus formula kalkulasi, bobot persentase indikator, dan ambang batas predikat rating.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Save className="w-4 h-4" /> Simpan Konfigurasi Scoring
        </button>
      </div>

      {/* Grid: Formula Builder + Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Formula & Scale Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Formula & Scale Panel */}
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" /> 1. Formula Perhitungan Skor Total
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                DYNAMIC MATH EXPR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Skala Nilai Minimum</label>
                <input
                  type="number"
                  value={minScale}
                  onChange={(e) => setMinScale(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-950 border border-stone-700 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Skala Nilai Maksimum</label>
                <input
                  type="number"
                  value={maxScale}
                  onChange={(e) => setMaxScale(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-950 border border-stone-700 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Rumus Matematika Formula (Math Expression)
              </label>
              <input
                type="text"
                value={formulaExpression}
                onChange={(e) => setFormulaExpression(e.target.value)}
                placeholder="contoh: (Appearance * 0.5) + (Impression * 0.5)"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-950 border border-stone-700 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Variabel yang tersedia: <code className="text-indigo-400">Appearance</code>, <code className="text-purple-400">Impression</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Deskripsi Formula</label>
              <textarea
                rows={2}
                value={formulaDescription}
                onChange={(e) => setFormulaDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-950 border border-stone-700 text-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Live Formula Simulator */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Live Simulator
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">TEST BENCH</span>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-xs text-stone-300 mb-1">
                  <span>Skor Appearance:</span>
                  <strong className="text-indigo-400 font-mono">{testAppearanceScore}</strong>
                </div>
                <input
                  type="range"
                  min={minScale}
                  max={maxScale}
                  value={testAppearanceScore}
                  onChange={(e) => setTestAppearanceScore(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-300 mb-1">
                  <span>Skor Impression:</span>
                  <strong className="text-purple-400 font-mono">{testImpressionScore}</strong>
                </div>
                <input
                  type="range"
                  min={minScale}
                  max={maxScale}
                  value={testImpressionScore}
                  onChange={(e) => setTestImpressionScore(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-2 mt-4">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              Hasil Kalkulasi Formula
            </span>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {simulatedScore.toFixed(1)} <span className="text-xs text-stone-500">/ 100</span>
            </div>
            {matchedTier && (
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-black"
                  style={{ backgroundColor: `${matchedTier.badgeColor}20`, color: matchedTier.badgeColor }}
                >
                  Grade {matchedTier.grade} • {matchedTier.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Rating Scale & Predicate Tiers Manager */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> 2. Pengaturan Ambang Batas Predikat & Tier Rating
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Tentukan rentang nilai minimum & maksimum untuk setiap predikat (S, A, B, C, D) dan jumlah bintang.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddTier}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-white flex items-center gap-1 border border-stone-700"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Tier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tiers.map((tier, idx) => (
            <div
              key={tier.id || idx}
              className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tier.grade}
                    onChange={(e) => handleUpdateTier(idx, { grade: e.target.value })}
                    className="w-12 px-2 py-1 rounded text-center text-xs font-black bg-stone-900 border border-stone-700 text-amber-300 font-mono uppercase"
                  />
                  <input
                    type="text"
                    value={tier.label}
                    onChange={(e) => handleUpdateTier(idx, { label: e.target.value })}
                    placeholder="Nama Predikat"
                    className="flex-1 px-2.5 py-1 rounded text-xs bg-stone-900 border border-stone-700 text-white font-semibold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTier(idx)}
                  className="p-1 text-stone-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 block mb-0.5">Min Skor:</span>
                  <input
                    type="number"
                    value={tier.minScore}
                    onChange={(e) => handleUpdateTier(idx, { minScore: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded text-xs bg-stone-900 border border-stone-700 text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block mb-0.5">Max Skor:</span>
                  <input
                    type="number"
                    value={tier.maxScore}
                    onChange={(e) => handleUpdateTier(idx, { maxScore: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded text-xs bg-stone-900 border border-stone-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-stone-400">Bintang:</span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={tier.starCount || 5}
                    onChange={(e) => handleUpdateTier(idx, { starCount: Number(e.target.value) })}
                    className="w-12 px-1.5 py-0.5 rounded text-center text-xs bg-stone-900 border border-stone-700 text-amber-400 font-bold"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-stone-400">Warna:</span>
                  <input
                    type="color"
                    value={tier.badgeColor || '#f59e0b'}
                    onChange={(e) => handleUpdateTier(idx, { badgeColor: e.target.value })}
                    className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Weight Percentage per Indicator (Appearance & Impression) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Indicators */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Bobot Indikator: Appearance (Fisik)
              </h3>
              <span className="text-xs text-stone-400">Total persentase bobot harus 100%</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 ${
                totalAppearanceWeight === 100
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {totalAppearanceWeight === 100 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              <span>Total: {totalAppearanceWeight}%</span>
            </div>
          </div>

          <div className="space-y-3">
            {appearanceWeights.map((w, idx) => (
              <div key={w.key} className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block">{w.name}</span>
                  <span className="text-[11px] text-stone-500 line-clamp-1">{w.description}</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={w.weightPercent}
                    onChange={(e) => handleUpdateAppearanceWeight(idx, { weightPercent: Number(e.target.value) })}
                    className="w-16 px-2 py-1.5 rounded-lg text-xs font-black font-mono text-center bg-stone-900 border border-stone-700 text-cyan-400"
                  />
                  <span className="text-xs font-bold text-stone-400">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impression Indicators */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pink-400" /> Bobot Indikator: Impression (Karakter)
              </h3>
              <span className="text-xs text-stone-400">Total persentase bobot harus 100%</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 ${
                totalImpressionWeight === 100
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {totalImpressionWeight === 100 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              <span>Total: {totalImpressionWeight}%</span>
            </div>
          </div>

          <div className="space-y-3">
            {impressionWeights.map((w, idx) => (
              <div key={w.key} className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block">{w.name}</span>
                  <span className="text-[11px] text-stone-500 line-clamp-1">{w.description}</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={w.weightPercent}
                    onChange={(e) => handleUpdateImpressionWeight(idx, { weightPercent: Number(e.target.value) })}
                    className="w-16 px-2 py-1.5 rounded-lg text-xs font-black font-mono text-center bg-stone-900 border border-stone-700 text-pink-400"
                  />
                  <span className="text-xs font-bold text-stone-400">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
