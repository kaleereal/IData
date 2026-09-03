import { CustomPageEntry } from '../types';

export const INITIAL_CUSTOM_PAGES: CustomPageEntry[] = [
  {
    id: 'custom-page-1',
    title: 'Exhibition & Special Gallery Showcase',
    description: 'Koleksi sesi foto studio eksklusif, photoshoot tema editorial majalah, serta video preview & dokumentasi resmi.',
    linkedArtistId: 'artist-1', // Tertaut ke Eva Elfie (atau artis pertama)
    blocks: [
      {
        id: 'block-img-cat-1',
        type: 'image_category',
        title: 'Editorial & Magazine Photoshoot',
        layout: 'grid_3',
        images: [
          {
            id: 'img-1',
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
            caption: 'Studio Glamour Portrait - Edition A',
          },
          {
            id: 'img-2',
            url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
            caption: 'Monochrome Fashion Shoot',
          },
          {
            id: 'img-3',
            url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
            caption: 'Sunset Outdoor Session',
          },
        ],
      },
      {
        id: 'block-img-cat-2',
        type: 'image_category',
        title: 'Cinematic Visual Reels (Slide Bar)',
        layout: 'slide_bar',
        images: [
          {
            id: 'img-4',
            url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
            caption: 'Behind The Scenes #1',
          },
          {
            id: 'img-5',
            url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop',
            caption: 'Behind The Scenes #2',
          },
          {
            id: 'img-6',
            url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop',
            caption: 'Behind The Scenes #3',
          },
          {
            id: 'img-7',
            url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
            caption: 'Behind The Scenes #4',
          },
        ],
      },
      {
        id: 'block-btn-1',
        type: 'buttons_group',
        title: 'Tautan & Dokumentasi Eksternal',
        layout: 'grid_2',
        buttons: [
          {
            id: 'btn-1',
            label: 'Portal Media Resmi',
            url: 'https://example.com/press',
            layoutRule: 'gradient',
          },
          {
            id: 'btn-2',
            label: 'Download Press Kit (High Res)',
            url: 'https://example.com/presskit',
            layoutRule: 'outline',
          },
        ],
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'custom-page-2',
    title: 'Archive Unlinked: Event & Concert Highlights',
    description: 'Dokumentasi acara publik, penampilan panggung, dan galeri interaktif yang belum ditautkan ke profil artis tertentu.',
    linkedArtistId: undefined, // Belum tertaut artis (Entri Kosong)
    blocks: [
      {
        id: 'block-img-cat-3',
        type: 'image_category',
        title: 'Spotlight Stage Gallery',
        layout: 'grid_2',
        images: [
          {
            id: 'img-8',
            url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop',
            caption: 'Opening Night Stage',
          },
          {
            id: 'img-9',
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
            caption: 'Encore Performance',
          },
        ],
      },
      {
        id: 'block-btn-2',
        type: 'buttons_group',
        title: 'Informasi Tiket & Acara',
        layout: 'vertical',
        buttons: [
          {
            id: 'btn-3',
            label: 'Informasi Jadwal Acara Lengkap',
            url: 'https://example.com/schedule',
            layoutRule: 'default',
          },
        ],
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];
