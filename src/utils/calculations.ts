import { AppearanceScores, ImpressionScores, Measurements, Artist, ARTIST_TYPES } from '../types';

/**
 * Calculates current age from YYYY-MM-DD birthdate
 */
export function calculateAge(bornDate: string): number {
  if (!bornDate) return 0;
  const birth = new Date(bornDate);
  if (isNaN(birth.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Calculates age when artist debuted
 */
export function calculateAgeAtDebut(bornDate: string, debutDate: string): number {
  if (!bornDate || !debutDate) return 0;
  const birth = new Date(bornDate);
  const debut = new Date(debutDate);
  if (isNaN(birth.getTime()) || isNaN(debut.getTime())) return 0;
  let age = debut.getFullYear() - birth.getFullYear();
  const m = debut.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && debut.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Appearance Score Calculation:
 * Face: 25%
 * Skin: 15%
 * Breast: 15%
 * Butt: 15%
 * V: 10%
 * Thigh & Calve: 20%
 */
export function calculateAppearanceScore(scores: AppearanceScores): number {
  const total =
    (scores.face || 0) * 0.25 +
    (scores.skin || 0) * 0.15 +
    (scores.breast || 0) * 0.15 +
    (scores.butt || 0) * 0.15 +
    (scores.v || 0) * 0.10 +
    (scores.thighCalve || 0) * 0.20;
  return Math.round(total * 10) / 10;
}

/**
 * Impression Score Calculation:
 * Voice: 15%
 * Expression: 20%
 * Sex Appeal: 20%
 * Authenticity: 15%
 * Chemistry: 15%
 * Aura: 15%
 */
export function calculateImpressionScore(scores: ImpressionScores): number {
  const total =
    (scores.voice || 0) * 0.15 +
    (scores.expression || 0) * 0.20 +
    (scores.sexAppeal || 0) * 0.20 +
    (scores.authenticity || 0) * 0.15 +
    (scores.chemistry || 0) * 0.15 +
    (scores.aura || 0) * 0.15;
  return Math.round(total * 10) / 10;
}

/**
 * Overall Rating Calculation:
 * Appearance & Impression weighted score (default 60% / 40%)
 * Round to nearest integer (scale 1-99)
 */
export function calculateOverallRating(
  appearanceScore: number,
  impressionScore: number,
  appearanceWeight: number = 60,
  impressionWeight: number = 40
): number {
  const totalWeight = appearanceWeight + impressionWeight;
  if (totalWeight <= 0) return Math.round(appearanceScore * 0.6 + impressionScore * 0.4);
  const total = (appearanceScore * appearanceWeight + impressionScore * impressionWeight) / totalWeight;
  return Math.round(total);
}

/**
 * Proportional Rating Calculation:
 * Evaluates Bust-Waist-Hip aesthetic balance on 1-99 scale.
 * Idealized classical ratio: Waist-to-Hip ~ 0.70, Bust-to-Waist ~ 1.42.
 */
export function calculateProportionalRating(m: Measurements): number {
  if (!m || !m.bustCm || !m.waistCm || !m.hipCm) return 0;
  const bust = Number(m.bustCm) || 0;
  const waist = Number(m.waistCm) || 0;
  const hip = Number(m.hipCm) || 0;
  if (bust <= 0 || waist <= 0 || hip <= 0) return 0;

  const whr = waist / hip; // Waist to hip ratio
  const bwr = bust / waist; // Bust to waist ratio
  
  // WHR penalty from ideal ~0.68 - 0.72
  const whrDeviation = Math.abs(whr - 0.70);
  const whrScore = Math.max(0, 100 - whrDeviation * 120);

  // BWR penalty from ideal ~1.40
  const bwrDeviation = Math.abs(bwr - 1.40);
  const bwrScore = Math.max(0, 100 - bwrDeviation * 80);

  const finalScore = Math.round(whrScore * 0.6 + bwrScore * 0.4);
  return Math.min(99, Math.max(1, finalScore));
}

export interface ScoreStatusInfo {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  tier: string;
}

/**
 * Returns dynamic status label from BURUK to INDAH for score value (0-99/100)
 */
export function getScoreStatus(score: number): ScoreStatusInfo {
  if (score === undefined || score === null || score <= 0) {
    return {
      label: 'BELUM DINILAI',
      color: 'text-stone-500',
      bgColor: 'bg-stone-900',
      borderColor: 'border-stone-800',
      tier: '-',
    };
  }
  if (score < 45) {
    return {
      label: 'BURUK',
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/80',
      borderColor: 'border-rose-800/80',
      tier: 'Tier D',
    };
  }
  if (score < 60) {
    return {
      label: 'KURANG',
      color: 'text-orange-400',
      bgColor: 'bg-orange-950/80',
      borderColor: 'border-orange-800/80',
      tier: 'Tier C',
    };
  }
  if (score < 75) {
    return {
      label: 'CUKUP',
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/80',
      borderColor: 'border-amber-800/80',
      tier: 'Tier B',
    };
  }
  if (score < 85) {
    return {
      label: 'BAGUS',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/80',
      borderColor: 'border-emerald-800/80',
      tier: 'Tier A',
    };
  }
  if (score < 95) {
    return {
      label: 'SANGAT BAGUS',
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-950/80',
      borderColor: 'border-cyan-800/80',
      tier: 'Tier S',
    };
  }
  return {
    label: 'INDAH',
    color: 'text-fuchsia-300',
    bgColor: 'bg-fuchsia-950/90',
    borderColor: 'border-fuchsia-500/80',
    tier: 'Tier S+',
  };
}

/**
 * Helper to get country flag emoji from 2-letter ISO code or country name
 */
export function getCountryFlag(countryCode: string, countryName?: string): string {
  if (!countryCode && countryName) {
    const map: Record<string, string> = {
      'Japan': '🇯🇵',
      'Jepang': '🇯🇵',
      'Moldova': '🇲🇩',
      'United States': '🇺🇸',
      'Amerika Serikat': '🇺🇸',
      'South Korea': '🇰🇷',
      'Korea Selatan': '🇰🇷',
      'Indonesia': '🇮🇩',
      'United Kingdom': '🇬🇧',
      'Inggris': '🇬🇧',
      'Russia': '🇷🇺',
      'Rusia': '🇷🇺',
      'France': '🇫🇷',
      'Prancis': '🇫🇷',
      'Brazil': '🇧🇷',
      'Brasil': '🇧🇷',
      'Thailand': '🇹🇭',
      'China': '🇨🇳',
      'Tiongkok': '🇨🇳',
      'Germany': '🇩🇪',
      'Jerman': '🇩🇪',
      'Spain': '🇪🇸',
      'Spanyol': '🇪🇸',
      'Italy': '🇮🇹',
      'Italia': '🇮🇹',
      'Australia': '🇦🇺',
      'Canada': '🇨🇦',
      'Kanada': '🇨🇦',
      'Ukraine': '🇺🇦',
      'Ukraina': '🇺🇦',
    };
    if (map[countryName]) return map[countryName];
  }

  if (countryCode && countryCode.length === 2) {
    const code = countryCode.toUpperCase();
    // Offset for Regional Indicator Symbols
    const codePoints = [...code].map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  return '🌐';
}

/**
 * Get Type Info by code
 */
export function getTypeInfo(typeCode: string) {
  return ARTIST_TYPES.find(t => t.code === typeCode) || {
    code: typeCode,
    indonesia: typeCode,
    english: typeCode
  };
}

/**
 * Format Full Name
 */
export function getArtistDisplayName(artist: { firstName: string; lastName: string }) {
  if (!artist.lastName) {
    return artist.firstName.toUpperCase();
  }
  return `${artist.firstName} ${artist.lastName}`.toUpperCase();
}

/**
 * Filter similar artists based on classification
 */
export function getSimilarArtists(
  currentArtist: Artist,
  allArtists: Artist[],
  filterType: 'age' | 'maturity' | 'appeal' | 'attributes' | 'specialty' | 'country' | 'status' | 'by status' | 'type' | 'type artist' | 'class' | 'all'
): Artist[] {
  const currentAge = calculateAge(currentArtist.bornDate);
  const isCurrentSpecial = (currentArtist.attributes?.length || 0) > 0;
  const currentStatus = (currentArtist.artistStatus || 'Amatir').trim().toLowerCase();

  return allArtists.filter(a => {
    // If same artist, keep in list (as requirement says "serta memberikan penanda pada artis yang sedang dibuka")
    if (filterType === 'all') return true;

    if (filterType === 'status' || filterType === 'by status' || filterType === 'type') {
      const aStatus = (a.artistStatus || 'Amatir').trim().toLowerCase();
      return aStatus === currentStatus || a.id === currentArtist.id;
    }

    if (filterType === 'age') {
      const aAge = calculateAge(a.bornDate);
      return Math.abs(aAge - currentAge) <= 2;
    }

    if (filterType === 'maturity') {
      return a.appeal?.maturity === currentArtist.appeal?.maturity;
    }

    if (filterType === 'appeal') {
      let matches = 0;
      if (a.appeal?.maturity && a.appeal.maturity === currentArtist.appeal?.maturity) matches++;
      if (a.appeal?.vibe && a.appeal.vibe === currentArtist.appeal?.vibe) matches++;
      if (a.appeal?.style && a.appeal.style === currentArtist.appeal?.style) matches++;
      if (a.appeal?.bodyShape && a.appeal.bodyShape === currentArtist.appeal?.bodyShape) matches++;
      return matches >= 2 || a.id === currentArtist.id;
    }

    if (filterType === 'attributes') {
      const currentAttrs = currentArtist.attributes || [];
      const aAttrs = a.attributes || [];
      if (currentAttrs.length === 0) return aAttrs.length === 0;
      return aAttrs.some(attr => currentAttrs.includes(attr)) || a.id === currentArtist.id;
    }

    if (filterType === 'specialty') {
      const currentSpecs = currentArtist.specialty || [];
      const aSpecs = a.specialty || [];
      if (currentSpecs.length === 0) return true;
      return aSpecs.some(s => currentSpecs.includes(s)) || a.id === currentArtist.id;
    }

    if (filterType === 'country') {
      return (a.country || '').toLowerCase() === (currentArtist.country || '').toLowerCase();
    }

    if (filterType === 'type artist') {
      return a.typeCode === currentArtist.typeCode;
    }

    if (filterType === 'class') {
      const aIsSpecial = (a.attributes?.length || 0) > 0;
      return aIsSpecial === isCurrentSpecial;
    }

    return true;
  }).sort((a, b) => {
    const aRating = calculateOverallRating(
      calculateAppearanceScore(a.appearanceScores),
      calculateImpressionScore(a.impressionScores)
    );
    const bRating = calculateOverallRating(
      calculateAppearanceScore(b.appearanceScores),
      calculateImpressionScore(b.impressionScores)
    );
    return bRating - aRating;
  });
}

/**
 * Formats a YYYY-MM-DD or YYYY-MM date string into 'Bulan Tahun' (e.g. 'Jan 2020')
 */
export function formatMonthYear(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return '-';
  const clean = dateStr.trim();
  const parts = clean.split('-');
  if (parts.length >= 2) {
    const y = parts[0];
    const m = parseInt(parts[1], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    if (m >= 1 && m <= 12 && y && y.length === 4) {
      return `${months[m - 1]} ${y}`;
    }
  }
  return dateStr;
}
