'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  Film,
  FileText,
  ExternalLink,
  Play,
  ChevronDown,
  ChevronUp,
  Images,
  Tag,
  Award,
} from 'lucide-react'
import { getRatingBadgeClass } from '@/lib/rating'

interface LinkedVideo {
  id: string
  title: string
  thumbnail?: string
  url: string
  videoOverallRating: number
  earnedRating: number
  roleStatus: string
  weight: number
}

interface InheritedTagRank {
  tag: string
  rank: number;
  totalScore: number
}

interface ArtistDetail {
  id: string
  name: string
  mainRole?: string
  avatarUrl?: string
  notes?: string
  overallRating: number
  linksList?: string[]
  galleryList?: string[]
  linkedVideos: LinkedVideo[]
  inheritedTagRanks: InheritedTagRank[]
}

export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const [artist, setArtist] = useState<ArtistDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'videos' | 'notes'>('videos')
  const [galleryCollapsed, setGalleryCollapsed] = useState(true)

  useEffect(() => {
    fetchArtist()
  }, [id])

  const fetchArtist = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/artists/${id}`)
      if (res.ok) {
        const data = await res.json()
        setArtist(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Memuat detail artis...</div>
  }

  if (!artist) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        Artis tidak ditemukan.{' '}
        <button onClick={() => router.back()} className="text-indigo-400 hover:underline">
          Kembali
        </button>
      </div>
    )
  }

  const badgeClass = getRatingBadgeClass(artist.overallRating)

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white truncate">Profil Artis</h1>
      </div>

      {/* Header Profile Cover Card */}
      <div className="bg-slate-800/60 border border-slate-800 rounded-3xl p-5 text-center flex flex-col items-center relative overflow-hidden">
        <div className="relative mb-3">
          {artist.avatarUrl ? (
            <img
              src={artist.avatarUrl}
              alt={artist.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-600 text-white font-black text-2xl flex items-center justify-center ring-4 ring-indigo-500/30 shadow-xl">
              {artist.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <h2 className="text-lg font-extrabold text-white">{artist.name}</h2>

        {/* Peran Utama Interaktif (Redirect to Rank Artists filtered by Peran Utama) */}
        {artist.mainRole && (
          <button
            onClick={() =>
              router.push(`/rank-artists?mainRole=${encodeURIComponent(artist.mainRole || '')}`)
            }
            className="mt-1 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Award className="w-3.5 h-3.5" /> {artist.mainRole}
          </button>
        )}

        {/* Total Rating Display (SUM from Pivots) */}
        <div
          className={`mt-3 px-4 py-1.5 rounded-full border text-sm font-extrabold flex items-center gap-1.5 shadow-md ${badgeClass}`}
        >
          <Star className="w-4 h-4 fill-current" />
          <span>Total Nilai Akumulasi: {artist.overallRating}</span>
        </div>
      </div>

      {/* GALERI FOTO & PORTOFOLIO VISUAL (Collapsed by default) */}
      <div className="border border-slate-800 bg-slate-800/30 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setGalleryCollapsed(!galleryCollapsed)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-800/50"
        >
          <span className="flex items-center gap-2">
            <Images className="w-4 h-4 text-indigo-400" /> GALERI FOTO & PORTOFOLIO VISUAL (
            {artist.galleryList?.length || 0})
          </span>
          {galleryCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {!galleryCollapsed && (
          <div className="p-3 pt-1 border-t border-slate-800/50">
            {!artist.galleryList || artist.galleryList.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada foto galeri.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {artist.galleryList.map((imgUrl, idx) => (
                  <a
                    key={idx}
                    href={imgUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square rounded-xl bg-black overflow-hidden border border-slate-700/80 block hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={imgUrl}
                      alt={`Galeri ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ATRIBUT TERKAIT (WARISAN VIDEO) - Dynamic Aggregated Attributes with Rank Position */}
      {artist.inheritedTagRanks && artist.inheritedTagRanks.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-indigo-400" /> ATRIBUT TERKAIT (WARISAN VIDEO)
          </h3>
          <p className="text-[10px] text-slate-400">
            Klik tag untuk membuka Filter di Halaman Rank Video
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {artist.inheritedTagRanks.map((item) => (
              <button
                key={item.tag}
                onClick={() => router.push(`/rank-videos?tag=${encodeURIComponent(item.tag)}`)}
                className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>{item.tag}</span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-md">
                  (Peringkat #{item.rank})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'videos'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Film className="w-4 h-4" /> Video Terkait ({artist.linkedVideos?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'notes'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Catatan & Profil
        </button>
      </div>

      {/* Tab Content 1: Linked Video List */}
      {activeTab === 'videos' && (
        <div className="space-y-2.5">
          {!artist.linkedVideos || artist.linkedVideos.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-slate-800/30 rounded-2xl p-4">
              Belum ada video yang tertaut dengan artis ini.
            </div>
          ) : (
            artist.linkedVideos.map((video) => (
              <div
                key={video.id}
                className="bg-slate-800/50 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-20 h-12 rounded-xl bg-black overflow-hidden relative flex-shrink-0">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Play className="w-5 h-5 opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/videos/edit/${video.id}`}
                      className="text-xs font-bold text-slate-100 line-clamp-1 hover:text-indigo-400 transition-colors"
                    >
                      {video.title}
                    </Link>

                    {/* Display Format: (Nilai) (Status Peran) e.g. 80 (Artis Utama) */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        {video.earnedRating}
                      </span>
                      <span className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md font-semibold">
                        ({video.roleStatus})
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg bg-slate-800 flex-shrink-0"
                  title="Buka Link Video"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content 2: Notes & Social Links */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" /> Catatan & Deskripsi
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {artist.notes || 'Tidak ada catatan untuk profil artis ini.'}
            </p>
          </div>

          {artist.linksList && artist.linksList.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-200">Tautan Terkait</h3>
              <div className="space-y-1.5">
                {artist.linksList.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-xs text-indigo-400 transition-colors truncate"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
