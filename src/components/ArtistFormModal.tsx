import React, { useState, useEffect } from 'react';
import {
  Artist,
  DatabaseSchema,
  AppealData,
  Measurements,
  AppearanceScores,
  ImpressionScores,
  CountryOption,
} from '../types';
import {
  calculateAge,
  calculateAgeAtDebut,
  calculateAppearanceScore,
  calculateImpressionScore,
  calculateOverallRating,
  calculateProportionalRating,
  getCountryFlag,
} from '../utils/calculations';
import {
  X,
  Sparkles,
  Award,
  Ruler,
  Check,
  Plus,
  Trash2,
  Info,
  Calendar,
  Globe,
  Sliders,
  HelpCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface ArtistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (artistData: Artist) => void;
  artistToEdit?: Artist | null;
  schema: DatabaseSchema;
  onAddNewCountry?: (country: CountryOption) => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop',
];

export const ArtistFormModal: React.FC<ArtistFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  artistToEdit,
  schema,
  onAddNewCountry,
}) => {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATARS[0]);
  const [country, setCountry] = useState(schema.countries[0]?.name || 'Moldova');
  const [countryCode, setCountryCode] = useState(schema.countries[0]?.code || 'MD');
  const [bornDate, setBornDate] = useState('1998-05-14');
  const [debutDate, setDebutDate] = useState('2019-09-01');
  const [heightCm, setHeightCm] = useState<number | string>(168);
  const [typeCode, setTypeCode] = useState('AK');

  // Measurements
  const [measurements, setMeasurements] = useState<Measurements>({
    cupSize: 'C',
    bustCm: 86,
    waistCm: 60,
    hipCm: 89,
  });

  // Appeal Data
  const [appeal, setAppeal] = useState<AppealData>({
    maturity: 'MILF / Mature',
    vibe: 'Girlfriend Experience (GFE)',
    style: 'Elegant / Glamour',
    bodyShape: 'Slim / Langsing',
  });

  // Structured Attributes dictionary
  const [structuredAttributes, setStructuredAttributes] = useState<Record<string, string>>({
    primaryTrait: 'High Fashion',
    bodyTrait: 'Natural Curves',
    charmPoint: 'Sultry Eyes',
  });

  // Structured Specialty dictionary
  const [structuredSpecialty, setStructuredSpecialty] = useState<Record<string, string>>({
    mainSpecialty: 'Editorial & High Fashion',
    performanceGenre: 'Sensual & Passionate',
    visualTheme: 'High Fashion / Luxury',
  });

  // Custom option adding inline state
  const [customInputCategory, setCustomInputCategory] = useState<string | null>(null);
  const [customInputValue, setCustomInputValue] = useState('');

  // Scores
  const [appearanceScores, setAppearanceScores] = useState<AppearanceScores>({
    face: 85,
    skin: 80,
    breast: 78,
    butt: 82,
    v: 75,
    thighCalve: 88,
  });

  const [impressionScores, setImpressionScores] = useState<ImpressionScores>({
    voice: 77,
    expression: 84,
    sexAppeal: 86,
    authenticity: 80,
    chemistry: 79,
    aura: 83,
  });

  const [notes, setNotes] = useState('');

  // Inline "Add New Country" Modal state
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [customCountryName, setCustomCountryName] = useState('');
  const [customCountryCode, setCustomCountryCode] = useState('');

  // Image Upload State
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImageFileUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar yang valid (JPG, PNG, WebP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        setAvatarUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Normalize categories helpers
  const getAppealCategoryList = () => {
    if (!schema.appealCategories) return [];
    if (Array.isArray(schema.appealCategories)) return schema.appealCategories as any[];
    return Object.entries(schema.appealCategories).map(([key, cat]) => ({
      key,
      title: (cat as any).title || key.toUpperCase(),
      icon: (cat as any).icon || '🧬',
      shortDescription: (cat as any).shortDescription || '',
      options: (cat as any).options || [],
    }));
  };

  const getAttributeCategoryList = () => {
    if (!schema.attributeCategories) return [];
    if (Array.isArray(schema.attributeCategories)) return schema.attributeCategories as any[];
    return Object.entries(schema.attributeCategories).map(([key, cat]) => ({
      key,
      title: (cat as any).title || key.toUpperCase(),
      icon: (cat as any).icon || '✨',
      shortDescription: (cat as any).shortDescription || '',
      options: (cat as any).options || [],
    }));
  };

  const getSpecialtyCategoryList = () => {
    if (!schema.specialtyCategories) return [];
    if (Array.isArray(schema.specialtyCategories)) return schema.specialtyCategories as any[];
    return Object.entries(schema.specialtyCategories).map(([key, cat]) => ({
      key,
      title: (cat as any).title || key.toUpperCase(),
      icon: (cat as any).icon || '🏆',
      shortDescription: (cat as any).shortDescription || '',
      options: (cat as any).options || [],
    }));
  };

  // Sync state whenever modal opens or artistToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (artistToEdit) {
        setFirstName(artistToEdit.firstName || '');
        setLastName(artistToEdit.lastName || '');
        setAvatarUrl(artistToEdit.avatarUrl || DEFAULT_AVATARS[0]);
        setCountry(artistToEdit.country || schema.countries[0]?.name || 'Moldova');
        setCountryCode(artistToEdit.countryCode || schema.countries[0]?.code || 'MD');
        setBornDate(artistToEdit.bornDate || '1998-05-14');
        setDebutDate(artistToEdit.debutDate || '2019-09-01');
        setHeightCm(artistToEdit.heightCm || 168);
        setTypeCode(artistToEdit.typeCode || 'AK');
        setMeasurements(
          artistToEdit.measurements || { cupSize: 'C', bustCm: 86, waistCm: 60, hipCm: 89 }
        );
        setAppeal(
          artistToEdit.appeal || {
            maturity: 'MILF / Mature',
            vibe: 'Girlfriend Experience (GFE)',
            style: 'Elegant / Glamour',
            bodyShape: 'Slim / Langsing',
          }
        );

        // Map existing attributes array to structured dictionary
        const attrList = getAttributeCategoryList();
        const attrDict: Record<string, string> = {};
        attrList.forEach((cat, idx) => {
          if (artistToEdit.attributes && artistToEdit.attributes[idx]) {
            attrDict[cat.key] = artistToEdit.attributes[idx];
          } else {
            attrDict[cat.key] = cat.options?.[0]?.name || '';
          }
        });
        setStructuredAttributes(attrDict);

        // Map existing specialty array to structured dictionary
        const specList = getSpecialtyCategoryList();
        const specDict: Record<string, string> = {};
        specList.forEach((cat, idx) => {
          if (artistToEdit.specialty && artistToEdit.specialty[idx]) {
            specDict[cat.key] = artistToEdit.specialty[idx];
          } else {
            specDict[cat.key] = cat.options?.[0]?.name || '';
          }
        });
        setStructuredSpecialty(specDict);

        setAppearanceScores(
          artistToEdit.appearanceScores || {
            face: 80,
            skin: 80,
            breast: 80,
            butt: 80,
            v: 80,
            thighCalve: 80,
          }
        );
        setImpressionScores(
          artistToEdit.impressionScores || {
            voice: 80,
            expression: 80,
            sexAppeal: 80,
            authenticity: 80,
            chemistry: 80,
            aura: 80,
          }
        );
        setNotes(artistToEdit.notes || '');
      } else {
        // Reset for new creation
        setFirstName('');
        setLastName('');
        setAvatarUrl(DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]);
        setCountry(schema.countries[0]?.name || 'Moldova');
        setCountryCode(schema.countries[0]?.code || 'MD');
        setBornDate('1998-05-14');
        setDebutDate('2019-09-01');
        setHeightCm(168);
        setTypeCode('AK');
        setMeasurements({ cupSize: 'C', bustCm: 86, waistCm: 60, hipCm: 89 });
        setAppeal({
          maturity: 'MILF / Mature',
          vibe: 'Girlfriend Experience (GFE)',
          style: 'Elegant / Glamour',
          bodyShape: 'Slim / Langsing',
        });

        const attrList = getAttributeCategoryList();
        const initialAttr: Record<string, string> = {};
        attrList.forEach(cat => {
          initialAttr[cat.key] = cat.options?.[0]?.name || '';
        });
        setStructuredAttributes(initialAttr);

        const specList = getSpecialtyCategoryList();
        const initialSpec: Record<string, string> = {};
        specList.forEach(cat => {
          initialSpec[cat.key] = cat.options?.[0]?.name || '';
        });
        setStructuredSpecialty(initialSpec);

        setAppearanceScores({
          face: 85,
          skin: 80,
          breast: 78,
          butt: 82,
          v: 75,
          thighCalve: 88,
        });
        setImpressionScores({
          voice: 77,
          expression: 84,
          sexAppeal: 86,
          authenticity: 80,
          chemistry: 79,
          aura: 83,
        });
        setNotes('');
      }
    }
  }, [isOpen, artistToEdit, schema]);

  if (!isOpen) return null;

  // Real-time calculations
  const age = calculateAge(bornDate);
  const ageAtDebut = calculateAgeAtDebut(bornDate, debutDate);
  const appScore = calculateAppearanceScore(appearanceScores);
  const impScore = calculateImpressionScore(impressionScores);
  const overallRating = calculateOverallRating(appScore, impScore);
  const propRating = calculateProportionalRating(measurements);

  // Active attributes list
  const activeAttributesList = Object.values(structuredAttributes).filter(Boolean);
  const isSpecial = activeAttributesList.length > 0;

  const handleCountrySelect = (cName: string) => {
    const found = schema.countries.find(c => c.name === cName);
    setCountry(cName);
    if (found) {
      setCountryCode(found.code);
    }
  };

  const handleSaveNewCountry = () => {
    if (!customCountryName.trim() || !customCountryCode.trim()) return;
    const newC: CountryOption = {
      name: customCountryName.trim(),
      code: customCountryCode.trim().toUpperCase(),
    };
    onAddNewCountry?.(newC);
    setCountry(newC.name);
    setCountryCode(newC.code);
    setCustomCountryName('');
    setCustomCountryCode('');
    setIsAddingCountry(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      alert('Nama depan (First Name) wajib diisi.');
      return;
    }

    const artistData: Artist = {
      id: artistToEdit ? artistToEdit.id : `artist-${Date.now()}`,
      firstName: firstName.trim().toUpperCase(),
      lastName: (lastName || '').trim().toUpperCase(),
      avatarUrl: avatarUrl.trim() || DEFAULT_AVATARS[0],
      country: country || 'Moldova',
      countryCode: countryCode || 'MD',
      bornDate: bornDate || '1998-01-01',
      debutDate: debutDate || '2020-01-01',
      heightCm: Number(heightCm) || 165,
      typeCode: typeCode || 'AK',
      measurements: {
        cupSize: measurements.cupSize || 'C',
        bustCm: Number(measurements.bustCm) || 85,
        waistCm: Number(measurements.waistCm) || 60,
        hipCm: Number(measurements.hipCm) || 90,
      },
      attributes: (Object.values(structuredAttributes).filter(Boolean) as string[]),
      appeal: appeal,
      specialty: (Object.values(structuredSpecialty).filter(Boolean) as string[]),
      appearanceScores: appearanceScores,
      impressionScores: impressionScores,
      notes: (notes || '').trim(),
      createdAt: artistToEdit ? artistToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(artistData);
    onClose();
  };

  const appealCategoryList = getAppealCategoryList();
  const attributeCategoryList = getAttributeCategoryList();
  const specialtyCategoryList = getSpecialtyCategoryList();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                {artistToEdit ? 'MODE EDIT ENTRI ARTIS' : 'BUAT ARTIS BARU'}
              </h2>
              <p className="text-xs text-stone-400">
                Semua bidang bersifat opsional kecuali{' '}
                <strong className="text-amber-400">FIRST NAME</strong>.
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

        {/* Live Score Preview Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-stone-950/50 border-b border-stone-800 text-xs">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] ${
                isSpecial
                  ? 'bg-[#00BCD5] text-white shadow-sm'
                  : 'bg-[#FECDD2] text-stone-900 shadow-sm'
              }`}
            >
              {isSpecial ? 'Special Banner (#00BCD5)' : 'Standard Banner (#FECDD2)'}
            </span>
            <span className="text-stone-400 hidden sm:inline">
              Usia: <strong>{age} th</strong> | Debut: <strong>{ageAtDebut} th</strong> | Proporsi:{' '}
              <strong className="text-pink-300">{propRating} pts</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-stone-400 block text-[10px]">APPEARANCE (60%)</span>
              <strong className="text-cyan-300 font-mono text-sm">{appScore.toFixed(1)}</strong>
            </div>
            <div className="text-right">
              <span className="text-stone-400 block text-[10px]">IMPRESSION (40%)</span>
              <strong className="text-pink-300 font-mono text-sm">{impScore.toFixed(1)}</strong>
            </div>
            <div className="text-right pl-3 border-l border-stone-700">
              <span className="text-amber-400 block text-[10px] font-bold">OVERALL RATING</span>
              <strong className="text-2xl font-black text-amber-400 font-sans leading-none">
                {overallRating}
              </strong>
            </div>
          </div>
        </div>

        {/* Form Body Scrollable */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-7 text-xs sm:text-sm"
        >
          {/* Section 1: Biodata */}
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-1.5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                1. {schema.sectionTitles.biodata || 'BIODATA'}
              </h3>
              <span className="text-[11px] text-stone-400 italic">
                Informasi Pokok & Identitas Artis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* First Name (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-white mb-0.5">
                  FIRST NAME <span className="text-amber-400">* (Wajib Diisi)</span>
                </label>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Nama Depan Artis / Model
                </span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: NISSA"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 uppercase font-medium"
                />
              </div>

              {/* Last Name (Optional) */}
              <div>
                <label className="block text-xs font-bold text-stone-200 mb-0.5">
                  LAST NAME <span className="text-stone-500 font-normal">(Opsional)</span>
                </label>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Nama Belakang / Marga
                </span>
                <input
                  type="text"
                  placeholder="Contoh: MOLDOVA"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 uppercase font-medium"
                />
              </div>

              {/* Country (Pilihan Tunggal with Add Option) */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-xs font-bold text-stone-200">
                    COUNTRY <span className="text-stone-500 font-normal">(Opsional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingCountry(true)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    + Tambah Opsi
                  </button>
                </div>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Negara Asal / Kewarganegaraan
                </span>

                <select
                  value={country}
                  onChange={e => handleCountrySelect(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-3.5 pr-8 py-2 text-white focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
                >
                  {schema.countries.map(c => (
                    <option key={c.name} value={c.name}>
                      {getCountryFlag(c.code, c.name)} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Born Date */}
              <div>
                <label className="block text-xs font-bold text-stone-200 mb-0.5">
                  BORN <span className="text-stone-500 font-normal">(Opsional)</span>
                </label>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Tanggal Lahir (Format YYYY-MM-DD)
                </span>
                <input
                  type="date"
                  value={bornDate}
                  onChange={e => setBornDate(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              {/* Debut Date */}
              <div>
                <label className="block text-xs font-bold text-stone-200 mb-0.5">
                  DEBUT <span className="text-stone-500 font-normal">(Opsional)</span>
                </label>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Tanggal Memulai Karir / Debut
                </span>
                <input
                  type="date"
                  value={debutDate}
                  onChange={e => setDebutDate(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-bold text-stone-200 mb-0.5">
                  HEIGHT <span className="text-stone-500 font-normal">(Opsional)</span>
                </label>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Tinggi Badan (Centimeter)
                </span>
                <input
                  type="number"
                  min="120"
                  max="230"
                  placeholder="168"
                  value={heightCm}
                  onChange={e => setHeightCm(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              {/* Body Type Code */}
              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-xs font-bold text-stone-200 mb-0.5">
                  BODY TYPE <span className="text-stone-500 font-normal">(Opsional)</span>
                </label>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Klasifikasi Tipe Kerangka & Proporsi Fisik
                </span>
                <select
                  value={typeCode}
                  onChange={e => setTypeCode(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  {schema.artistTypes.map(t => (
                    <option key={t.code} value={t.code}>
                      [{t.code}] {t.english.toUpperCase()} — {t.indonesia}
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar (Foto Profil) with Local Upload & URL Option */}
              <div className="sm:col-span-2 md:col-span-3 space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-stone-200 mb-0.5">
                    FOTO PROFIL / AVATAR <span className="text-stone-500 font-normal">(Opsional)</span>
                  </label>
                  <span className="text-[10px] text-stone-400 block">
                    Unggah foto dari perangkat lokal Anda atau masukkan tautan URL gambar (Aspek rasio vertikal 2:3)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Left: Drag & Drop / File Upload Box */}
                  <div
                    onDragOver={e => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      const file = e.dataTransfer.files?.[0];
                      handleImageFileUpload(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`col-span-1 md:col-span-2 border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDraggingImage
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-stone-700 hover:border-amber-500/50 bg-stone-950/40 hover:bg-stone-950/70'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageFileUpload(e.target.files?.[0])}
                    />
                    <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-400 mb-2 border border-amber-500/20">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-white mb-0.5">
                      Klik untuk Unggah Foto Lokal atau Drag & Drop
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Mendukung PNG, JPG, JPEG, WebP, GIF (Maksimal 5MB)
                    </div>
                  </div>

                  {/* Right: Live Preview Box */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-950/60 border border-stone-800">
                    <div className="w-16 h-22 rounded-xl overflow-hidden border-2 border-amber-500/40 shrink-0 shadow-md relative bg-stone-900">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar Preview"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-600">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                        Preview Avatar
                      </span>
                      <span className="text-[10px] text-stone-400 block truncate">
                        {avatarUrl.startsWith('data:') ? 'Foto Lokal (Base64)' : avatarUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(DEFAULT_AVATARS[0])}
                        className="text-[10px] font-bold text-stone-400 hover:text-white underline block"
                      >
                        Reset ke Default
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct URL Input & Preset Selector */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-stone-300">
                    Atau Masukkan Tautan (URL) Gambar Langsung / Pilih Preset:
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                      className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                    />
                    {/* Preset Avatar Selector */}
                    <div className="flex gap-1 overflow-x-auto pb-0.5 max-w-full sm:max-w-[220px] no-scrollbar">
                      {DEFAULT_AVATARS.map((url, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setAvatarUrl(url)}
                          className={`w-8 h-8 rounded-lg overflow-hidden border shrink-0 transition-all ${
                            avatarUrl === url
                              ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                              : 'border-stone-700 hover:border-stone-500 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={url}
                            alt="preset"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Measurements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                2. {schema.sectionTitles.measurements || 'MEASUREMENTS'}
              </h3>
              <span className="text-xs font-mono font-bold text-pink-300 bg-pink-950/60 px-2.5 py-0.5 rounded-lg border border-pink-500/30">
                PROPORTIONAL RATING: {propRating} pts
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Cup Size */}
              <div>
                <label className="block text-xs font-bold text-pink-300 mb-0.5">
                  CUP SIZE <span className="text-stone-500 font-normal">(Opsional)</span>
                </label>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Ukuran Cup Payudara
                </span>
                <select
                  value={measurements.cupSize}
                  onChange={e =>
                    setMeasurements({ ...measurements, cupSize: e.target.value })
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-pink-400"
                >
                  {schema.cupSizes.map(cup => (
                    <option key={cup} value={cup}>
                      {cup} Cup
                    </option>
                  ))}
                </select>
              </div>

              {/* Bust */}
              <div>
                <label className="block text-xs font-bold text-stone-200 mb-0.5">
                  BUST SIZE <span className="text-stone-500 font-normal">(Opsional)</span>
                </label>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Lingkar Dada (cm)
                </span>
                <input
                  type="number"
                  min="50"
                  max="160"
                  value={measurements.bustCm || ''}
                  placeholder="86"
                  onChange={e =>
                    setMeasurements({
                      ...measurements,
                      bustCm: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-pink-400 font-medium"
                />
              </div>

              {/* Waist */}
              <div>
                <label className="block text-xs font-bold text-stone-200 mb-0.5">
                  WAIST SIZE <span className="text-stone-500 font-normal">(Opsional)</span>
                </label>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Lingkar Pinggang (cm)
                </span>
                <input
                  type="number"
                  min="40"
                  max="140"
                  value={measurements.waistCm || ''}
                  placeholder="60"
                  onChange={e =>
                    setMeasurements({
                      ...measurements,
                      waistCm: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-pink-400 font-medium"
                />
              </div>

              {/* Hip */}
              <div>
                <label className="block text-xs font-bold text-stone-200 mb-0.5">
                  HIP SIZE <span className="text-stone-500 font-normal">(Opsional)</span>
                </label>
                <span className="text-[10px] text-stone-400 block mb-1">
                  Lingkar Pinggul (cm)
                </span>
                <input
                  type="number"
                  min="50"
                  max="160"
                  value={measurements.hipCm || ''}
                  placeholder="89"
                  onChange={e =>
                    setMeasurements({
                      ...measurements,
                      hipCm: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-pink-400 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Appeal Classification (Structured Categories) */}
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-1.5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                3. {schema.sectionTitles.appeal || 'APPEAL'}
              </h3>
              <span className="text-[11px] text-stone-400 italic">
                Klasifikasi Dimensi Daya Pikat & Karakter
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appealCategoryList.map(cat => {
                const currentVal = appeal[cat.key as keyof AppealData] || '';
                const selectedOpt = cat.options?.find(o => o.name === currentVal);

                return (
                  <div
                    key={cat.key}
                    className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2.5 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>{cat.icon}</span>
                        <span>{cat.title.toUpperCase()}</span>
                      </label>
                      <span className="text-[10px] text-stone-500">Pilihan Tunggal</span>
                    </div>

                    <p className="text-[10px] text-stone-400">{cat.shortDescription}</p>

                    <select
                      value={currentVal}
                      onChange={e =>
                        setAppeal({ ...appeal, [cat.key]: e.target.value })
                      }
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
                    >
                      {cat.options?.map(opt => (
                        <option key={opt.id || opt.name} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>

                    {selectedOpt && (
                      <div className="text-[11px] text-stone-400 bg-stone-900/80 p-2.5 rounded-lg border border-stone-800 leading-relaxed">
                        <strong className="text-amber-300 font-semibold">
                          {selectedOpt.name}:
                        </strong>{' '}
                        {selectedOpt.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Structured Attributes (Format Appeal) */}
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-1.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  4. {schema.sectionTitles.attributes || 'ATTRIBUTES'}
                </h3>
                <span className="text-[11px] text-stone-400 italic">
                  Format Kategori Karakteristik Khusus (Special Entry: Banner #00BCD5 Cyan)
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  isSpecial
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {isSpecial ? 'Special Card Active' : 'Standard Card'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {attributeCategoryList.map(cat => {
                const currentVal = structuredAttributes[cat.key] || '';
                const selectedOpt = cat.options?.find(o => o.name === currentVal);

                return (
                  <div
                    key={cat.key}
                    className="p-4 rounded-xl bg-stone-950/60 border border-cyan-500/25 space-y-2.5 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-xs text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>{cat.icon}</span>
                        <span>{cat.title.toUpperCase()}</span>
                      </label>
                      <span className="text-[10px] text-stone-500">Pilihan Format</span>
                    </div>

                    <p className="text-[10px] text-stone-400">{cat.shortDescription}</p>

                    <select
                      value={currentVal}
                      onChange={e =>
                        setStructuredAttributes({
                          ...structuredAttributes,
                          [cat.key]: e.target.value,
                        })
                      }
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">-- Kosong / None --</option>
                      {cat.options?.map(opt => (
                        <option key={opt.id || opt.name} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>

                    {selectedOpt && (
                      <div className="text-[11px] text-stone-400 bg-stone-900/80 p-2.5 rounded-lg border border-stone-800 leading-relaxed">
                        <strong className="text-cyan-300 font-semibold">
                          {selectedOpt.name}:
                        </strong>{' '}
                        {selectedOpt.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Structured Specialty (Format Appeal) */}
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-1.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  5. {schema.sectionTitles.specialty || 'SPECIALTY'}
                </h3>
                <span className="text-[11px] text-stone-400 italic">
                  Format Kategori Keahlian & Spesialisasi Performa
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">
                {Object.values(structuredSpecialty).filter(Boolean).length} Kategori Terpilih
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {specialtyCategoryList.map(cat => {
                const currentVal = structuredSpecialty[cat.key] || '';
                const selectedOpt = cat.options?.find(o => o.name === currentVal);

                return (
                  <div
                    key={cat.key}
                    className="p-4 rounded-xl bg-stone-950/60 border border-emerald-500/25 space-y-2.5 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-xs text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>{cat.icon}</span>
                        <span>{cat.title.toUpperCase()}</span>
                      </label>
                      <span className="text-[10px] text-stone-500">Pilihan Format</span>
                    </div>

                    <p className="text-[10px] text-stone-400">{cat.shortDescription}</p>

                    <select
                      value={currentVal}
                      onChange={e =>
                        setStructuredSpecialty({
                          ...structuredSpecialty,
                          [cat.key]: e.target.value,
                        })
                      }
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-400"
                    >
                      <option value="">-- Kosong / None --</option>
                      {cat.options?.map(opt => (
                        <option key={opt.id || opt.name} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>

                    {selectedOpt && (
                      <div className="text-[11px] text-stone-400 bg-stone-900/80 p-2.5 rounded-lg border border-stone-800 leading-relaxed">
                        <strong className="text-emerald-300 font-semibold">
                          {selectedOpt.name}:
                        </strong>{' '}
                        {selectedOpt.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: Scoring System with Rubrics */}
          <div className="space-y-5">
            <div className="border-b border-stone-800 pb-1.5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                6. {schema.sectionTitles.scoring || 'SCORING SYSTEM'}
              </h3>
              <span className="text-xs text-amber-400 font-medium">Panduan Skor 1 s/d 99</span>
            </div>

            {/* Appearance & Impression side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Appearance Score Module */}
              <div className="p-4 rounded-xl bg-stone-950/60 border border-cyan-500/20 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div>
                    <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      APPEARANCE (60%)
                    </h4>
                    <p className="text-[10px] text-stone-400">
                      Penilaian Aspek Penampilan Fisik
                    </p>
                  </div>
                  <span className="text-base font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    {appScore.toFixed(1)}/99
                  </span>
                </div>

                {schema.scoringTraits.appearance.map(trait => {
                  const val =
                    appearanceScores[trait.key as keyof typeof appearanceScores] || 75;
                  return (
                    <div
                      key={trait.key}
                      className="space-y-1.5 bg-stone-900/60 p-3 rounded-xl border border-stone-800"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-xs text-white uppercase tracking-wider">
                            {trait.label}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono ml-1.5">
                            ({trait.weightLabel})
                          </span>
                          <p className="text-[10px] text-stone-400">
                            {trait.shortDescription}
                          </p>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={val}
                          onChange={e =>
                            setAppearanceScores({
                              ...appearanceScores,
                              [trait.key]: Number(e.target.value),
                            })
                          }
                          className="w-14 text-center bg-stone-800 border border-stone-700 rounded-lg py-1 font-mono font-bold text-cyan-300 text-sm focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="99"
                        value={val}
                        onChange={e =>
                          setAppearanceScores({
                            ...appearanceScores,
                            [trait.key]: Number(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Impression Score Module */}
              <div className="p-4 rounded-xl bg-stone-950/60 border border-pink-500/20 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div>
                    <h4 className="font-bold text-pink-300 text-sm flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                      IMPRESSION (40%)
                    </h4>
                    <p className="text-[10px] text-stone-400">
                      Penilaian Aspek Impresi, Emosi & Karisma
                    </p>
                  </div>
                  <span className="text-base font-mono font-bold text-pink-300 bg-pink-950/80 px-2.5 py-0.5 rounded border border-pink-500/30">
                    {impScore.toFixed(1)}/99
                  </span>
                </div>

                {schema.scoringTraits.impression.map(trait => {
                  const val =
                    impressionScores[trait.key as keyof typeof impressionScores] || 75;
                  return (
                    <div
                      key={trait.key}
                      className="space-y-1.5 bg-stone-900/60 p-3 rounded-xl border border-stone-800"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-xs text-white uppercase tracking-wider">
                            {trait.label}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono ml-1.5">
                            ({trait.weightLabel})
                          </span>
                          <p className="text-[10px] text-stone-400">
                            {trait.shortDescription}
                          </p>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={val}
                          onChange={e =>
                            setImpressionScores({
                              ...impressionScores,
                              [trait.key]: Number(e.target.value),
                            })
                          }
                          className="w-14 text-center bg-stone-800 border border-stone-700 rounded-lg py-1 font-mono font-bold text-pink-300 text-sm focus:outline-none focus:border-pink-400"
                        />
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="99"
                        value={val}
                        onChange={e =>
                          setImpressionScores({
                            ...impressionScores,
                            [trait.key]: Number(e.target.value),
                          })
                        }
                        className="w-full accent-pink-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 7: Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider">
              NOTES{' '}
              <span className="text-stone-500 font-normal">
                (Catatan Kurator / Ringkasan Evaluasi - Opsional)
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="Tambahkan catatan khusus, keunikan kepribadian, atau rekam jejak talent..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-semibold text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 uppercase tracking-wider"
            >
              {artistToEdit ? 'Simpan Perubahan Artis' : 'Simpan & Buat Artis'}
            </button>
          </div>
        </form>
      </div>

      {/* Inline Modal: Add New Country */}
      {isAddingCountry && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-700 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                Tambah Opsi Negara Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCountry(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Nama Negara (English / Indonesia):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Singapore, Switzerland"
                  value={customCountryName}
                  onChange={e => setCustomCountryName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Kode 2 Huruf (ISO Country Code):
                </label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="Contoh: SG, CH"
                  value={customCountryCode}
                  onChange={e => setCustomCountryCode(e.target.value.toUpperCase())}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white uppercase font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCountry(false)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs hover:bg-stone-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewCountry}
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400"
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
