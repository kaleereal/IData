import React from 'react';
import { X, Info, Sparkles, CheckCircle2, Award, Ruler, Globe, HelpCircle } from 'lucide-react';
import { DatabaseSchema, SCORE_TRAIT_INFO, APPEAL_DEFINITIONS } from '../types';
import { DEFAULT_DATABASE_SCHEMA } from '../data/defaultSchema';
import { getMasterTaxonomyItem } from '../utils/taxonomyManager';

interface FieldInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldId?: string | null;
  fieldKey?: string | null;
  itemName?: string | null;
  customTitle?: string | null;
  customDescription?: string | null;
  customGuidelines?: string | null;
  schema?: DatabaseSchema;
  isEditorMode?: boolean; // false = Viewer Mode (Keterangan/Deskripsi saja), true = Edit Mode (Petunjuk input/formula/penilaian)
}

export const FieldInfoModal: React.FC<FieldInfoModalProps> = ({
  isOpen,
  onClose,
  fieldId,
  fieldKey,
  itemName,
  customTitle,
  customDescription,
  customGuidelines,
  schema = DEFAULT_DATABASE_SCHEMA,
  isEditorMode = false,
}) => {
  const targetKey = fieldKey || fieldId || '';
  if (!isOpen || (!targetKey && !itemName && !customTitle)) return null;

  // 0. Search in Master Taxonomy (Source of Truth)
  const taxItem = targetKey ? getMasterTaxonomyItem(targetKey) : null;

  // 1. Search in schema fields
  const field = schema?.fields?.[targetKey] || DEFAULT_DATABASE_SCHEMA?.fields?.[targetKey];

  // 2. Search in scoring traits (Appearance & Impression)
  const allScoringTraits = [
    ...(schema?.scoringTraits?.appearance || DEFAULT_DATABASE_SCHEMA.scoringTraits.appearance),
    ...(schema?.scoringTraits?.impression || DEFAULT_DATABASE_SCHEMA.scoringTraits.impression),
    ...SCORE_TRAIT_INFO.appearance,
    ...SCORE_TRAIT_INFO.impression,
  ];
  const scoringTrait = allScoringTraits.find(
    t =>
      t.key === targetKey ||
      t.key.toLowerCase() === targetKey.toLowerCase() ||
      (itemName && (t.label.toLowerCase() === itemName.toLowerCase() || t.key.toLowerCase() === itemName.toLowerCase()))
  ) as any;

  // 3. Search in all category definitions (Appeal, Attributes, Specialty, ArtistStatus)
  const allCategoryDefs: Record<string, any> = {
    ...DEFAULT_DATABASE_SCHEMA.appealCategories,
    ...(schema?.appealCategories || {}),
    ...(schema?.attributeCategories || {}),
    ...(schema?.specialtyCategories || {}),
    ...(schema?.artistStatusCategory ? { artistStatus: schema.artistStatusCategory } : {}),
    ...APPEAL_DEFINITIONS,
  };
  const categoryDef = allCategoryDefs[targetKey];

  // 4. Search for specific option item if itemName or targetKey matches
  let foundOption: { name: string; description?: string; guidelines?: string } | null = null;
  if (itemName || targetKey) {
    const searchTarget = (itemName || targetKey).toLowerCase();
    for (const cat of Object.values(allCategoryDefs)) {
      if (cat && Array.isArray(cat.options)) {
        const match = cat.options.find(
          (o: any) =>
            o.name.toLowerCase() === searchTarget ||
            (o.id && o.id.toLowerCase() === searchTarget)
        );
        if (match) {
          foundOption = match;
          break;
        }
      }
    }
  }

  // Derive title
  const title =
    customTitle ||
    (isEditorMode && taxItem?.formLabel ? taxItem.formLabel : null) ||
    taxItem?.appLabel ||
    (foundOption ? foundOption.name : null) ||
    field?.label ||
    scoringTrait?.label ||
    categoryDef?.title ||
    (targetKey === 'artistStatus'
      ? 'STATUS ARTIS'
      : targetKey === 'proportionalRating'
      ? 'PROPORTIONAL RATING'
      : targetKey === 'overallRating'
      ? 'OVERALL RATING'
      : targetKey === 'appearanceScore'
      ? 'APPEARANCE SCORE'
      : targetKey === 'impressionScore'
      ? 'IMPRESSION SCORE'
      : itemName || targetKey.toUpperCase());

  // Derive description (Viewer Mode only uses this)
  const description =
    customDescription ||
    taxItem?.description ||
    (foundOption ? foundOption.description : null) ||
    field?.shortDescription ||
    scoringTrait?.shortDescription ||
    scoringTrait?.description ||
    categoryDef?.shortDescription ||
    (targetKey === 'artistStatus'
      ? 'Klasifikasi jenjang status karier artis: Amatir (independen/pemula) atau Profesional (resmi berlisensi).'
      : targetKey === 'proportionalRating'
      ? 'Indeks estetika keseimbangan rasio Waist-to-Hip (WHR) dan Bust-to-Waist berdasarkan Golden Ratio (skala 60–99 PTS).'
      : targetKey === 'overallRating'
      ? 'Formula tertimbang standar gabungan Appearance (60%) dan Impression (40%) pada skala 1–99.'
      : targetKey === 'appearanceScore'
      ? 'Nilai gabungan estetika visual fisik (Face, Skin, Breast, Butt, V, Thigh & Calve) dengan bobot 60% terhadap Overall Rating.'
      : targetKey === 'impressionScore'
      ? 'Nilai gabungan performa, vokal, chemistry, aura, dan daya tarik panggung dengan bobot 40% terhadap Overall Rating.'
      : targetKey === 'custom_entry' || targetKey === 'customPageId'
      ? 'Tautan khusus ke Halaman Custom (Showcase galeri foto eksklusif, set album, dan tautan aksi eksternal).'
      : targetKey === 'notes'
      ? 'Catatan kurasi editorial, evaluasi talenta, sorotan keunggulan, atau rekam jejak performa artis.'
      : targetKey === 'biodata'
      ? 'Data identitas dasar talenta termasuk nama panggung, negara asal, tanggal lahir, debut, dan tautan resmi.'
      : targetKey === 'measurements'
      ? 'Parameter proporsi fisik meliputi ukuran Cup, Lingkar Dada (Bust), Pinggang (Waist), dan Pinggul (Hip).'
      : 'Keterangan dan deskripsi parameter talent.');

  // Derive editor guidelines (Editor Mode only uses this)
  const editorGuidelines =
    customGuidelines ||
    taxItem?.evaluationGuideline ||
    (foundOption ? foundOption.guidelines : null) ||
    field?.editorGuidelines ||
    (scoringTrait?.rubricGuide
      ? `Tier S (90-99): ${scoringTrait.rubricGuide.sTier}\nTier A (80-89): ${scoringTrait.rubricGuide.aTier}\nTier B (70-79): ${scoringTrait.rubricGuide.bTier}\nTier C (<70): ${scoringTrait.rubricGuide.cTier}`
      : targetKey === 'custom_entry' || targetKey === 'customPageId'
      ? 'Pilih salah satu entri Halaman Custom yang telah dibuat atau gunakan tombol (+) untuk membuat dan menautkan halaman custom baru secara langsung.'
      : targetKey === 'notes'
      ? 'Tuliskan ulasan ringkas mengenai ciri khas, keunggulan performa, atau catatan penting evaluasi artis ini.'
      : targetKey === 'measurements'
      ? 'Masukkan lingkar tubuh dalam satuan centimeter (CM) dan ukuran Cup (A-L). Sistem akan otomatis mengkalkulasi Proportional Rating.'
      : targetKey === 'links'
      ? 'Tambahkan tautan akun resmi artis seperti Instagram, X (Twitter), TikTok, YouTube, atau website portofolio.'
      : undefined);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100 p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 font-mono">
                {isEditorMode ? 'Petunjuk Penilaian & Input' : 'Keterangan Item / Bidang'}
              </span>
              <h3 className="text-base font-bold text-white leading-snug">{title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. VIEW MODE: ONLY SHOW DESCRIPTION */}
        {!isEditorMode ? (
          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 text-stone-300 text-xs sm:text-sm leading-relaxed space-y-2">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Deskripsi / Penjelasan:</span>
            </div>
            <p className="text-stone-300 leading-relaxed">{description}</p>
          </div>
        ) : (
          /* 2. EDIT MODE: SHOW SCORING GUIDELINES, INPUT INSTRUCTIONS & RUBRIC */
          <div className="space-y-3">
            {/* Scoring & Input Guidelines */}
            {editorGuidelines ? (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Petunjuk Input & Standar Penilaian:</span>
                </div>
                <div className="text-stone-200 text-xs leading-relaxed whitespace-pre-line">
                  {editorGuidelines}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Petunjuk Pengisian:</span>
                </div>
                <div className="text-stone-200 text-xs leading-relaxed">
                  Pilih atau masukkan data yang sesuai dengan kriteria standar artis.
                </div>
              </div>
            )}

            {/* Trait Scoring Rubric Box if scoringTrait */}
            {scoringTrait?.rubricGuide && (
              <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2 text-xs">
                <div className="font-bold text-cyan-300 flex items-center justify-between text-[11px] uppercase tracking-wider">
                  <span>Panduan Nilai (1 - 99):</span>
                  {scoringTrait.weightLabel && (
                    <span className="font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                      Bobot: {scoringTrait.weightLabel}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-500/20 text-stone-300">
                    <strong className="text-amber-400">Tier S (90-99):</strong> {scoringTrait.rubricGuide.sTier}
                  </div>
                  <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/20 text-stone-300">
                    <strong className="text-emerald-400">Tier A (80-89):</strong> {scoringTrait.rubricGuide.aTier}
                  </div>
                  <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20 text-stone-300">
                    <strong className="text-cyan-400">Tier B (70-79):</strong> {scoringTrait.rubricGuide.bTier}
                  </div>
                  <div className="p-2 rounded bg-rose-950/30 border border-rose-500/20 text-stone-300">
                    <strong className="text-rose-400">Tier C (&lt;70):</strong> {scoringTrait.rubricGuide.cTier}
                  </div>
                </div>
              </div>
            )}

            {/* Options Guidelines if categoryDef in Edit Mode */}
            {categoryDef?.options && categoryDef.options.length > 0 && !foundOption && (
              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-stone-300 text-[11px]">Kriteria Pilihan:</div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {categoryDef.options.map((opt: any) => (
                    <div key={opt.name} className="p-2 rounded bg-stone-950 border border-stone-800 text-[11px]">
                      <div className="font-bold text-amber-300">{opt.name}</div>
                      {opt.guidelines && (
                        <div className="text-stone-300 text-[10px] mt-0.5">{opt.guidelines}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Close */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
