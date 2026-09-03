import { Artist } from '../types';

export const INITIAL_ARTISTS: Artist[] = [
  {
    id: 'artist-1',
    firstName: 'NISSA',
    lastName: 'MOLDOVA',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    country: 'Moldova',
    countryCode: 'MD',
    bornDate: '1998-05-14',
    debutDate: '2019-09-01',
    heightCm: 168,
    typeCode: 'AK', // average skinny
    artistStatus: 'Profesional',
    measurements: {
      cupSize: 'C',
      bustCm: 86,
      waistCm: 60,
      hipCm: 89
    },
    attributes: ['High Fashion', 'Sultry Eyes', 'Catwalk'], // Special
    appeal: {
      maturity: 'MILF / Mature',
      vibe: 'Girlfriend Experience (GFE)',
      style: 'Elegant / Glamour',
      bodyShape: 'Slim / Langsing'
    },
    specialty: ['Editorial', 'Runway', 'Cinematic Modeling'],
    appearanceScores: {
      face: 85,
      skin: 80,
      breast: 78,
      butt: 82,
      v: 75,
      thighCalve: 88
    },
    impressionScores: {
      voice: 77,
      expression: 84,
      sexAppeal: 86,
      authenticity: 80,
      chemistry: 79,
      aura: 83
    },
    notes: 'Kharisma visual yang sangat kuat dengan pengalaman panggung internasional.',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'artist-2',
    firstName: 'YUNA',
    lastName: 'KIM',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    country: 'South Korea',
    countryCode: 'KR',
    bornDate: '2002-11-20',
    debutDate: '2021-03-15',
    heightCm: 162,
    typeCode: 'SL', // short slim
    artistStatus: 'Profesional',
    measurements: {
      cupSize: 'B',
      bustCm: 82,
      waistCm: 58,
      hipCm: 85
    },
    attributes: ['Idol Glow', 'Aegyo', 'Porcelain Skin'], // Special
    appeal: {
      maturity: 'Teen / Young',
      vibe: 'Innocent / Polos',
      style: 'Sporty / Active',
      bodyShape: 'Petite / Mungil'
    },
    specialty: ['Music Video', 'Commercial Acting', 'Dance'],
    appearanceScores: {
      face: 92,
      skin: 95,
      breast: 74,
      butt: 76,
      v: 80,
      thighCalve: 86
    },
    impressionScores: {
      voice: 88,
      expression: 91,
      sexAppeal: 78,
      authenticity: 92,
      chemistry: 87,
      aura: 89
    },
    notes: 'Aura idol yang sangat murni dengan senyuman yang memikat publik.',
    createdAt: '2025-01-11T11:00:00Z',
    updatedAt: '2025-01-11T11:00:00Z'
  },
  {
    id: 'artist-3',
    firstName: 'MUTIARA',
    lastName: '', // Single name example from PDF!
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
    country: 'Indonesia',
    countryCode: 'ID',
    bornDate: '1999-08-24',
    debutDate: '2020-02-10',
    heightCm: 165,
    typeCode: 'AL', // average slim
    artistStatus: 'Amatir',
    measurements: {
      cupSize: 'D',
      bustCm: 88,
      waistCm: 62,
      hipCm: 92
    },
    attributes: [], // Standard (0 attributes)
    appeal: {
      maturity: 'Teen / Young',
      vibe: 'Girl Next Door (GND)',
      style: 'Bohemian / Natural',
      bodyShape: 'Curvy / Jam Pasir'
    },
    specialty: ['Drama Series', 'Product Ambassador'],
    appearanceScores: {
      face: 88,
      skin: 86,
      breast: 85,
      butt: 84,
      v: 78,
      thighCalve: 83
    },
    impressionScores: {
      voice: 85,
      expression: 88,
      sexAppeal: 82,
      authenticity: 90,
      chemistry: 86,
      aura: 84
    },
    notes: 'Penampilan natural eksotis dengan ekspresi hangat.',
    createdAt: '2025-01-12T09:00:00Z',
    updatedAt: '2025-01-12T09:00:00Z'
  },
  {
    id: 'artist-4',
    firstName: 'ASUKA',
    lastName: 'TAKAHASHI',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop',
    country: 'Japan',
    countryCode: 'JP',
    bornDate: '1996-03-12',
    debutDate: '2016-08-01',
    heightCm: 158,
    typeCode: 'SK', // short skinny
    artistStatus: 'Profesional',
    measurements: {
      cupSize: 'E',
      bustCm: 90,
      waistCm: 59,
      hipCm: 88
    },
    attributes: ['Expressive Eyes', 'Versatile Voice', 'Pro Actor'], // Special
    appeal: {
      maturity: 'MILF / Mature',
      vibe: 'Girlfriend Experience (GFE)',
      style: 'Elegant / Glamour',
      bodyShape: 'Curvy / Jam Pasir'
    },
    specialty: ['Romantic Lead', 'Immersive Acting', 'Gravure'],
    appearanceScores: {
      face: 94,
      skin: 92,
      breast: 93,
      butt: 85,
      v: 88,
      thighCalve: 87
    },
    impressionScores: {
      voice: 94,
      expression: 96,
      sexAppeal: 93,
      authenticity: 89,
      chemistry: 95,
      aura: 92
    },
    notes: 'Salah satu talent papan atas dengan performa akting dan daya tarik luar biasa.',
    createdAt: '2025-01-12T14:00:00Z',
    updatedAt: '2025-01-12T14:00:00Z'
  },
  {
    id: 'artist-5',
    firstName: 'ELENA',
    lastName: 'ROSTOVA',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    country: 'Russia',
    countryCode: 'RU',
    bornDate: '1994-09-30',
    debutDate: '2015-05-18',
    heightCm: 175,
    typeCode: 'TL', // tall slim
    artistStatus: 'Profesional',
    measurements: {
      cupSize: 'C',
      bustCm: 89,
      waistCm: 61,
      hipCm: 91
    },
    attributes: ['Piercing Gaze', 'High Cheekbones'], // Special
    appeal: {
      maturity: 'Cougar',
      vibe: 'Bad Girl / Rebel',
      style: 'Gothic / Alt',
      bodyShape: 'Slim / Langsing'
    },
    specialty: ['Edgy Drama', 'Artistic Cinema'],
    appearanceScores: {
      face: 89,
      skin: 87,
      breast: 81,
      butt: 84,
      v: 79,
      thighCalve: 93
    },
    impressionScores: {
      voice: 82,
      expression: 86,
      sexAppeal: 91,
      authenticity: 84,
      chemistry: 82,
      aura: 90
    },
    notes: 'Penampilan tajam dan misterius dengan siluet model runway yang dominan.',
    createdAt: '2025-01-13T10:00:00Z',
    updatedAt: '2025-01-13T10:00:00Z'
  },
  {
    id: 'artist-6',
    firstName: 'SCARLETT',
    lastName: 'MONROE',
    avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop',
    country: 'United States',
    countryCode: 'US',
    bornDate: '1997-04-18',
    debutDate: '2018-10-05',
    heightCm: 170,
    typeCode: 'TC', // tall chubby/curvy
    artistStatus: 'Amatir',
    measurements: {
      cupSize: 'G',
      bustCm: 98,
      waistCm: 68,
      hipCm: 102
    },
    attributes: [], // Standard (0 attributes)
    appeal: {
      maturity: 'MILF / Mature',
      vibe: 'Bad Girl / Rebel',
      style: 'Elegant / Glamour',
      bodyShape: 'Voluptuous / Berisi'
    },
    specialty: ['Glamour Shots', 'Feature Film'],
    appearanceScores: {
      face: 90,
      skin: 88,
      breast: 96,
      butt: 95,
      v: 84,
      thighCalve: 89
    },
    impressionScores: {
      voice: 86,
      expression: 89,
      sexAppeal: 95,
      authenticity: 85,
      chemistry: 88,
      aura: 93
    },
    notes: 'Daya pikat feminin klasik dengan lekukan tubuh luar biasa.',
    createdAt: '2025-01-13T15:00:00Z',
    updatedAt: '2025-01-13T15:00:00Z'
  },
  {
    id: 'artist-7',
    firstName: 'CHLOE',
    lastName: 'DUBOIS',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
    country: 'France',
    countryCode: 'FR',
    bornDate: '2001-02-14',
    debutDate: '2022-07-20',
    heightCm: 167,
    typeCode: 'AA', // average average / average build
    artistStatus: 'Amatir',
    measurements: {
      cupSize: 'C',
      bustCm: 85,
      waistCm: 61,
      hipCm: 89
    },
    attributes: ['French Chic', 'Dimples'], // Special
    appeal: {
      maturity: 'Teen / Young',
      vibe: 'Girl Next Door (GND)',
      style: 'Bohemian / Natural',
      bodyShape: 'Slim / Langsing'
    },
    specialty: ['Indie Film', 'Acoustic Singing'],
    appearanceScores: {
      face: 87,
      skin: 89,
      breast: 80,
      butt: 81,
      v: 82,
      thighCalve: 85
    },
    impressionScores: {
      voice: 89,
      expression: 87,
      sexAppeal: 81,
      authenticity: 94,
      chemistry: 89,
      aura: 86
    },
    notes: 'Kesan santai, hangat dan sangat mudah dicintai.',
    createdAt: '2025-01-14T08:00:00Z',
    updatedAt: '2025-01-14T08:00:00Z'
  },
  {
    id: 'artist-8',
    firstName: 'GABRIELA',
    lastName: 'SANTOS',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop',
    country: 'Brazil',
    countryCode: 'BR',
    bornDate: '1995-12-03',
    debutDate: '2017-04-12',
    heightCm: 171,
    typeCode: 'TA', // tall average
    artistStatus: 'Profesional',
    measurements: {
      cupSize: 'F',
      bustCm: 94,
      waistCm: 64,
      hipCm: 100
    },
    attributes: ['Athletic Curve', 'Sunkissed'], // Special
    appeal: {
      maturity: 'MILF / Mature',
      vibe: 'Girl Next Door (GND)',
      style: 'Sporty / Active',
      bodyShape: 'Curvy / Jam Pasir'
    },
    specialty: ['Fitness Commercials', 'Action Stunt'],
    appearanceScores: {
      face: 86,
      skin: 91,
      breast: 91,
      butt: 97,
      v: 85,
      thighCalve: 92
    },
    impressionScores: {
      voice: 81,
      expression: 85,
      sexAppeal: 93,
      authenticity: 88,
      chemistry: 84,
      aura: 87
    },
    notes: 'Kombinasi tubuh bugar kencang dengan lekukan latin yang memukau.',
    createdAt: '2025-01-14T12:00:00Z',
    updatedAt: '2025-01-14T12:00:00Z'
  }
];
