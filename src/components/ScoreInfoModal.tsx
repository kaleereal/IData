import React from 'react';
import { SCORE_TRAIT_INFO, APPEAL_DEFINITIONS } from '../types';
import { X, Award, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

interface ScoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'scores' | 'appeal';
}

export const ScoreInfoModal: React.FC<ScoreInfoModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'scores',
}) => {
  const [activeTab, setActiveTab] = React.useState<'scores' | 'appeal'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Panduan & Standar Penilaian</h2>
              <p className="text-xs text-stone-400">
                Formula pembobotan terstruktur & rubrik klasifikasi appeal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-800 bg-stone-900/80 px-6 pt-2">
          <button
            onClick={() => setActiveTab('scores')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'scores'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Modul Penilaian (1–99)
          </button>
          <button
            onClick={() => setActiveTab('appeal')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'appeal'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Klasifikasi Appeal & Panduan
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-stone-300">
          {activeTab === 'scores' ? (
            <>
              {/* Overall Formula Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-800/60 to-stone-900 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base mb-1">
                  <Sparkles className="w-4 h-4" />
                  Formula Overall Rating
                </div>
                <div className="text-xs font-mono bg-black/40 p-2.5 rounded-lg border border-white/5 text-amber-200 mb-2">
                  Overall Rating = Round( Appearance Score × 60% + Impression Score × 40% )
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Skor keseluruhan menggabungkan aspek fisik (60%) dan kesan/daya tarik performa
                  (40%) dalam skala standar 1 hingga 99.
                </p>
              </div>

              {/* Appearance Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    Appearance (Penampilan Fisik) — Bobot 60%
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Total 6 Atribut
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {SCORE_TRAIT_INFO.appearance.map(trait => (
                    <div
                      key={trait.key}
                      className="p-3 rounded-lg bg-stone-800/60 border border-stone-700/50 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{trait.label}</span>
                        <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">
                          {trait.weightLabel}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">{trait.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impression Section */}
              <div className="space-y-3 pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                    Impression (Kesan & Daya Tarik Non-Fisik) — Bobot 40%
                  </h3>
                  <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                    Total 6 Atribut
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {SCORE_TRAIT_INFO.impression.map(trait => (
                    <div
                      key={trait.key}
                      className="p-3 rounded-lg bg-stone-800/60 border border-stone-700/50 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{trait.label}</span>
                        <span className="text-xs font-mono font-bold text-pink-300 bg-pink-950 px-1.5 py-0.5 rounded">
                          {trait.weightLabel}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">{trait.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proportional Note */}
              <div className="p-3 rounded-lg bg-stone-800/40 border border-stone-700 text-xs text-stone-400 space-y-1">
                <div className="font-semibold text-stone-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Proportional Rating
                </div>
                <p>
                  Dihitung otomatis berdasarkan keseimbangan rasio lingkar dada (Bust), lingkar pinggang (Waist),
                  dan lingkar pinggul (Hip).
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {Object.entries(APPEAL_DEFINITIONS).map(([key, cat]) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center gap-2 font-bold text-white text-base">
                    <span>{cat.icon}</span>
                    <span>{cat.title}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {cat.options.map(opt => (
                      <div
                        key={opt.name}
                        className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-300 text-sm">{opt.name}</span>
                          <span className="text-[11px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded">
                            {cat.title}
                          </span>
                        </div>
                        <p className="text-xs text-stone-300">{opt.description}</p>
                        <div className="text-[11px] text-amber-200/90 bg-amber-950/30 p-2 rounded-lg border border-amber-500/10 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Panduan Penilai:</strong> {opt.guidelines}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-800 text-white hover:bg-stone-700 transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
