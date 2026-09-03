'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Award, ArrowUpDown, Star, X, Filter } from 'lucide-react'
import { getRatingBadgeClass } from '@/lib/rating'

interface ArtistRankItem {
  id: string
  name: string
  mainRole?: string
  avatarUrl?: string
  overallRating: number
  videoCount: number
}

function RankArtistsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlMainRole = searchParams.get('mainRole') || ''

  const [artists, setArtists] = useState<ArtistRankItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [activeMainRole, setActiveMainRole] = useState<string>('')

  useEffect(() => {
    fetchArtistRankings()
  }, [])

  useEffect(() => {
    setActiveMainRole(urlMainRole)
  }, [urlMainRole])

  const fetchArtistRankings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/artists')
      if (res.ok) {
        const data = await res.json()
        setArtists(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredArtists = artists.filter((a) => {
    if (!activeMainRole) return true
    return a.mainRole && a.mainRole.toLowerCase() === activeMainRole.toLowerCase()
  })

  const sortedArtists = [...filteredArtists].sort((a, b) => {
    if (sortOrder === 'desc') return b.overallRating - a.overallRating
    return a.overallRating - b.overallRating
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" /> Rank Artis
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Leaderboard artis dari akumulasi total pivot nilai
          </p>
        </div>
      </div>

      {/* Active MainRole Filter Banner */}
      {activeMainRole && (
        <div className="flex items-center justify-between bg-indigo-600/20 border border-indigo-500/40 p-2.5 rounded-xl text-xs text-indigo-300">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filter Peran Utama Aktif: <strong>{activeMainRole}</strong></span>
          </div>
          <button
            onClick={() => {
              setActiveMainRole('')
              router.push('/rank-artists')
            }}
            className="p-1 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sort Bar */}
      <div className="flex items-center justify-between bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400">
          Total: <strong className="text-white">{sortedArtists.length}</strong> Artis
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
        <div className="py-12 text-center text-slate-400 text-sm">Memuat peringkat artis...</div>
      ) : sortedArtists.length === 0 ? (
        <div className="py-12 text-center bg-slate-800/30 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Belum ada data artis.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedArtists.map((artist, index) => {
            const rankNum = index + 1
            const badgeClass = getRatingBadgeClass(artist.overallRating)

            return (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Leaderboard Badge */}
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

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {artist.avatarUrl ? (
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-500/20">
                        {artist.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name & Video count */}
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-100 truncate group-hover:text-indigo-400">
                      {artist.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {artist.mainRole && (
                        <span className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.2 rounded-md font-semibold">
                          {artist.mainRole}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {artist.videoCount} Video
                      </span>
                    </div>
                  </div>
                </div>

                {/* Aggregated Score */}
                <div
                  className={`px-2.5 py-1 rounded-xl border text-xs font-extrabold flex items-center gap-1 flex-shrink-0 ml-2 ${badgeClass}`}
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>{artist.overallRating}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function RankArtistsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-400 text-sm">Memuat...</div>}>
      <RankArtistsContent />
    </Suspense>
  )
}
