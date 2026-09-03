'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Edit3, Trash2, Tag, Play, Film } from 'lucide-react'
import { getRatingBadgeClass } from '@/lib/rating'

interface VideoItem {
  id: string
  url: string
  title: string
  notes?: string
  thumbnail?: string
  overallRating: number
  artists: {
    artist: {
      id: string
      name: string
      avatarUrl?: string
    }
  }[]
  customFields?: Record<string, any>
}

interface CustomFieldConfig {
  id: string
  name: string
  fieldType: string
  optionsList: string[]
}

export default function HomeBeranda() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [customConfigs, setCustomConfigs] = useState<CustomFieldConfig[]>([])
  const [swipedVideoId, setSwipedVideoId] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomConfigs()
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [search, selectedTag])

  const fetchCustomConfigs = async () => {
    try {
      const res = await fetch('/api/custom-fields?targetType=VIDEO')
      if (res.ok) {
        const data = await res.json()
        setCustomConfigs(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (search) query.set('search', search)
      if (selectedTag) query.set('tag', selectedTag)

      const res = await fetch(`/api/videos?${query.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setVideos(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!confirm('Apakah Anda yakin ingin menghapus video ini?')) return

    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Extract all tag options for quick filter chips
  const allTags = Array.from(
    new Set(
      customConfigs
        .filter((c) => c.fieldType === 'MultiChoice' || c.fieldType === 'SingleChoice')
        .flatMap((c) => c.optionsList || [])
    )
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Film className="w-6 h-6 text-indigo-400" /> Koleksi Video
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manajemen database video dengan sistem rating kustom
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari judul atau catatan video..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-400"
        />
      </div>

      {/* Filter Chips (Scrollable Horizontal) */}
      {allTags.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
              selectedTag === ''
                ? 'bg-indigo-600 text-white font-medium'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Semua
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap border transition-colors flex items-center gap-1 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white border-indigo-500 font-medium'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Video Cards List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Memuat video...</div>
      ) : videos.length === 0 ? (
        <div className="py-12 text-center bg-slate-800/30 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Belum ada video ditemukan.</p>
          <Link
            href="/videos/new"
            className="inline-block mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            + Tambah Video Baru
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => {
            const badgeClass = getRatingBadgeClass(video.overallRating)
            const isSwiped = swipedVideoId === video.id

            return (
              <div
                key={video.id}
                className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-800/40 backdrop-blur-sm group transition-all"
              >
                {/* Swipe Action Background Controls */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2 z-0 bg-slate-900/90 w-full justify-end">
                  <Link
                    href={`/videos/edit/${video.id}`}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl text-xs font-medium flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </Link>
                  <button
                    onClick={(e) => handleDelete(video.id, e)}
                    className="p-2.5 bg-rose-600 text-white rounded-xl text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>

                {/* Main Card Content */}
                <div
                  className={`relative z-10 bg-slate-800/90 transition-transform duration-200 ${
                    isSwiped ? '-translate-x-32' : 'translate-x-0'
                  }`}
                  onClick={() => setSwipedVideoId(isSwiped ? null : video.id)}
                >
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                        <Play className="w-10 h-10 mb-1 opacity-50" />
                        <span className="text-xs">Tidak Ada Preview</span>
                      </div>
                    )}

                    {/* Overall Rating Badge */}
                    <div
                      className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full border text-xs font-bold shadow-lg backdrop-blur-md ${badgeClass}`}
                    >
                      {video.overallRating} / 100
                    </div>
                  </div>

                  <div className="p-3">
                    <Link href={`/videos/edit/${video.id}`} className="block">
                      <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug hover:text-indigo-400 transition-colors">
                        {video.title}
                      </h3>
                    </Link>

                    {/* Associated Artists Avatars */}
                    {video.artists && video.artists.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-[11px] text-slate-400">Artis:</span>
                        <div className="flex items-center -space-x-1.5">
                          {video.artists.map(({ artist }) => (
                            <Link
                              key={artist.id}
                              href={`/artists/${artist.id}`}
                              title={artist.name}
                              className="inline-block relative hover:z-10 transition-transform"
                            >
                              {artist.avatarUrl ? (
                                <img
                                  src={artist.avatarUrl}
                                  alt={artist.name}
                                  className="w-6 h-6 rounded-full object-cover ring-2 ring-slate-800"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-indigo-600/80 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-800">
                                  {artist.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Swipe indicator helper */}
                    <div className="mt-2 text-[10px] text-slate-500 flex justify-between items-center border-t border-slate-700/40 pt-1.5">
                      <span>Tap / geser card untuk opsi</span>
                      <div className="flex gap-2">
                        <Link href={`/videos/edit/${video.id}`} className="text-indigo-400 hover:underline">
                          Edit
                        </Link>
                        <button onClick={(e) => handleDelete(video.id, e)} className="text-rose-400 hover:underline">
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
