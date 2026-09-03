'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Users, Search, Edit3, Trash2, X, Star } from 'lucide-react'
import { getRatingBadgeClass } from '@/lib/rating'

interface Artist {
  id: string
  name: string
  mainRole?: string
  avatarUrl?: string
  notes?: string
  overallRating: number
  videoCount: number
  linksList?: string[]
}

export default function ArtistListPage() {
  const router = useRouter()
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [mainRole, setMainRole] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [linksText, setLinksText] = useState('')
  const [galleryText, setGalleryText] = useState('')

  useEffect(() => {
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
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

  const openAddModal = () => {
    setEditingArtist(null)
    setName('')
    setMainRole('')
    setAvatarUrl('')
    setNotes('')
    setLinksText('')
    setGalleryText('')
    setModalOpen(true)
  }

  const openEditModal = (artist: Artist, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setEditingArtist(artist)
    setName(artist.name)
    setMainRole(artist.mainRole || '')
    setAvatarUrl(artist.avatarUrl || '')
    setNotes(artist.notes || '')
    setLinksText(artist.linksList ? artist.linksList.join('\n') : '')
    setGalleryText((artist as any).galleryList ? (artist as any).galleryList.join('\n') : '')
    setModalOpen(true)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!confirm('Apakah Anda yakin ingin menghapus profil artis ini?')) return

    try {
      const res = await fetch(`/api/artists/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setArtists(artists.filter((a) => a.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    const payload = {
      name,
      mainRole,
      avatarUrl,
      notes,
      links: linksText.split('\n').map((l) => l.trim()).filter(Boolean),
      gallery: galleryText.split('\n').map((l) => l.trim()).filter(Boolean),
    }

    try {
      const endpoint = editingArtist ? `/api/artists/${editingArtist.id}` : '/api/artists'
      const method = editingArtist ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setModalOpen(false)
        fetchArtists()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.mainRole && a.mainRole.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" /> Profil Artis
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Nilai total artis merupakan hasil akumulasi pivot snapshot video
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama artis atau peran utama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-400"
        />
      </div>

      {/* 2-Column Grid Artis */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Memuat profil artis...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center bg-slate-800/30 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Belum ada profil artis ditemukan.</p>
          <button
            onClick={openAddModal}
            className="mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            + Tambah Artis Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((artist) => {
            const badgeClass = getRatingBadgeClass(artist.overallRating)

            return (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all flex flex-col justify-between"
              >
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 z-20 flex gap-1 bg-slate-900/70 backdrop-blur-md rounded-lg p-1 opacity-90">
                  <button
                    onClick={(e) => openEditModal(artist, e)}
                    className="p-1 text-slate-300 hover:text-indigo-400"
                    title="Edit Profil"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(artist.id, e)}
                    className="p-1 text-slate-300 hover:text-rose-400"
                    title="Hapus Profil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 text-center flex flex-col items-center">
                  <div className="relative mb-2">
                    {artist.avatarUrl ? (
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/30 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center ring-2 ring-indigo-500/30">
                        {artist.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {artist.name}
                  </h3>

                  {artist.mainRole && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        router.push(`/rank-artists?mainRole=${encodeURIComponent(artist.mainRole || '')}`)
                      }}
                      className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2 py-0.5 rounded-full mt-1 line-clamp-1"
                    >
                      {artist.mainRole}
                    </button>
                  )}

                  <p className="text-[10px] text-slate-400 mt-1">
                    {artist.videoCount} Video Tertaut
                  </p>
                </div>

                {/* Rating Banner */}
                <div className={`p-2 border-t text-center ${badgeClass}`}>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Total Score: {artist.overallRating}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Modal Dialog Buat / Edit Artis */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingArtist ? 'Edit Profil Artis' : 'Tambah Artis Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Artis *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Artis / Grup..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Peran Utama (Main Role)</label>
                <input
                  type="text"
                  placeholder="Misal: Aktor Utama, Sutradara, Producer..."
                  value={mainRole}
                  onChange={(e) => setMainRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  URL Foto Avatar
                </label>
                <input
                  type="url"
                  placeholder="https://image-url.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan / Profil</label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi singkat artis..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Galeri Foto & Portofolio Visual (1 URL per baris)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://image-url1.jpg&#10;https://image-url2.jpg"
                  value={galleryText}
                  onChange={(e) => setGalleryText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tautan Sosmed / Website (1 link per baris)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://instagram.com/..."
                  value={linksText}
                  onChange={(e) => setLinksText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
