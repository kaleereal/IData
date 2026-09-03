'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { BarChart3, Filter, ArrowUpDown, X, Play, Tag } from 'lucide-react'
import { getRatingBadgeClass } from '@/lib/rating'

interface VideoRankItem {
  id: string
  title: string
  thumbnail?: string
  overallRating: number
  customFields?: Record<string, any>
}

interface CustomConfig {
  id: string
  name: string
  fieldType: string
  optionsList: string[]
}

function RankVideosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlTag = searchParams.get('tag') || ''

  const [videos, setVideos] = useState<VideoRankItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [customConfigs, setCustomConfigs] = useState<CustomConfig[]>([])
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({})
  const [activeUrlTag, setActiveUrlTag] = useState<string>('')

  useEffect(() => {
    fetchConfigs()
  }, [])

  useEffect(() => {
    setActiveUrlTag(urlTag)
  }, [urlTag])

  useEffect(() => {
    fetchRankings()
  }, [sortOrder])

  const fetchConfigs = async () => {
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

  const fetchRankings = async () => {
    setLoading(true)
    try {
      const sortParam = sortOrder === 'desc' ? 'rating_desc' : 'rating_asc'
      const res = await fetch(`/api/videos?sort=${sortParam}`)
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

  const filteredVideos = videos.filter((v) => {
    const cf = v.customFields || {}

    // Check URL query tag filter
    if (activeUrlTag) {
      const hasUrlTag = Object.values(cf).some((val) => {
        if (Array.isArray(val)) return val.includes(activeUrlTag)
        return val === activeUrlTag
      })
      if (!hasUrlTag) return false
    }

    // Check custom modal selected filters
    if (Object.keys(selectedFilters).length === 0) return true

    return Object.entries(selectedFilters).every(([configId, selectedVal]) => {
      if (!selectedVal || (Array.isArray(selectedVal) && selectedVal.length === 0)) return true
      const itemVal = cf[configId]
      if (!itemVal) return false

      if (Array.isArray(selectedVal)) {
        if (Array.isArray(itemVal)) {
          return selectedVal.some((sv) => itemVal.includes(sv))
        }
        return selectedVal.includes(itemVal)
      }

      if (Array.isArray(itemVal)) {
        return itemVal.includes(selectedVal)
      }
      return itemVal === selectedVal
    })
  })

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" /> Rank Video
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Leaderboard video berdasarkan rating</p>
        </div>

        <button
          onClick={() => setFilterModalOpen(true)}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <Filter className="w-4 h-4 text-indigo-400" /> Filter
        </button>
      </div>

      {/* Active URL Tag Banner */}
      {activeUrlTag && (
        <div className="flex items-center justify-between bg-indigo-600/20 border border-indigo-500/40 p-2.5 rounded-xl text-xs text-indigo-300">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-indigo-400" />
            <span>Filter Tag Aktif: <strong>{activeUrlTag}</strong></span>
          </div>
          <button
            onClick={() => {
              setActiveUrlTag('')
              router.push('/rank-videos')
            }}
            className="p-1 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sort Toggle Bar */}
      <div className="flex items-center justify-between bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400">
          Total: <strong className="text-white">{filteredVideos.length}</strong> Video
        </span>
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {sortOrder === 'desc' ? 'Tertinggi → Terendah' : 'Terendah → Tertinggi'}
        </button>
      </div>

      {/* Leaderboard List UI */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Memuat peringkat video...</div>
      ) : filteredVideos.length === 0 ? (
        <div className="py-12 text-center bg-slate-800/30 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Tidak ada data video sesuai filter.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredVideos.map((video, index) => {
            const rankNum = index + 1
            const badgeClass = getRatingBadgeClass(video.overallRating)

            return (
              <Link
                key={video.id}
                href={`/videos/edit/${video.id}`}
                className="bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Leaderboard Number Badge */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${
                      rankNum === 1
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                        : rankNum === 2
                        ? 'bg-slate-300 text-slate-950 ring-2 ring-slate-200'
                        : rankNum === 3
                        ? 'bg-amber-700 text-white ring-2 ring-amber-600'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {rankNum}
                  </div>

                  {/* Video Thumbnail */}
                  <div className="w-16 h-10 rounded-lg bg-black overflow-hidden relative flex-shrink-0">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Play className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-slate-100 truncate group-hover:text-indigo-400">
                      {video.title}
                    </h3>
                  </div>
                </div>

                {/* Score */}
                <div className={`px-2.5 py-1 rounded-xl border text-xs font-extrabold flex-shrink-0 ml-2 ${badgeClass}`}>
                  {video.overallRating}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Filter Bottom Sheet Modal */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-end">
          <div className="w-full max-w-[480px] bg-slate-900 border-t border-slate-700 rounded-t-3xl p-5 max-h-[85vh] flex flex-col space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-400" /> Filter Peringkat Video
              </h3>
              <button onClick={() => setFilterModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {customConfigs.map((config) => {
                const currentVal = selectedFilters[config.id] || (config.fieldType === 'MultiChoice' ? [] : '')

                return (
                  <div key={config.id} className="space-y-1.5 bg-slate-800/40 border border-slate-800 p-3 rounded-2xl">
                    <label className="font-semibold text-slate-200 block">{config.name}</label>

                    {config.fieldType === 'SingleChoice' && (
                      <select
                        value={currentVal}
                        onChange={(e) =>
                          setSelectedFilters({ ...selectedFilters, [config.id]: e.target.value })
                        }
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                      >
                        <option value="">Semua</option>
                        {config.optionsList.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {config.fieldType === 'MultiChoice' && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {config.optionsList.map((opt) => {
                          const isChecked = Array.isArray(currentVal) && currentVal.includes(opt)
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                const arr = Array.isArray(currentVal) ? currentVal : []
                                const updated = isChecked
                                  ? arr.filter((x: string) => x !== opt)
                                  : [...arr, opt]
                                setSelectedFilters({ ...selectedFilters, [config.id]: updated })
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                isChecked
                                  ? 'bg-indigo-600 text-white border-indigo-500'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedFilters({})
                  setActiveUrlTag('')
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RankVideosPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-400 text-sm">Memuat...</div>}>
      <RankVideosContent />
    </Suspense>
  )
}
