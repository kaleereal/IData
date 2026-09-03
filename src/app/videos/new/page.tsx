'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react'
import { RatingFolder, calculateOverallVideoRating, getRatingBadgeClass } from '@/lib/rating'

interface Artist {
  id: string
  name: string
  mainRole?: string
  avatarUrl?: string
}

interface ArtistLinkSelection {
  artistId: string
  roleStatus: string
}

interface CustomFieldConfig {
  id: string
  name: string
  description?: string
  fieldType: string
  optionsList: string[]
}

export default function VideoFormPage({ params }: { params?: Promise<{ id?: string }> }) {
  const router = useRouter()
  const resolvedParams = params ? use(params) : null
  const videoId = resolvedParams?.id

  // Form states
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [embedHtml, setEmbedHtml] = useState('')
  const [domain, setDomain] = useState('')
  const [notesCollapsed, setNotesCollapsed] = useState(true)

  // Rating Folders State
  const [ratingFolders, setRatingFolders] = useState<RatingFolder[]>([
    {
      id: 'f-1',
      name: 'Folder Rating Utama',
      items: [
        { id: 'i-1', name: 'Kualitas Visual', score: 80 },
        { id: 'i-2', name: 'Audio & Music', score: 85 },
      ],
    },
  ])

  // Custom Fields State
  const [customConfigs, setCustomConfigs] = useState<CustomFieldConfig[]>([])
  const [customValues, setCustomValues] = useState<Record<string, any>>({})

  // Artists State
  const [artists, setArtists] = useState<Artist[]>([])
  const [artistSelections, setArtistSelections] = useState<ArtistLinkSelection[]>([])
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([])
  const [artistBottomSheetOpen, setArtistBottomSheetOpen] = useState(false)

  // Meta states
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'f-1': true })

  const overallScore = calculateOverallVideoRating(ratingFolders)

  useEffect(() => {
    fetchConfigsAndArtists()
    fetchRoleSuggestions()
  }, [])

  const fetchRoleSuggestions = async () => {
    try {
      const res = await fetch('/api/role-weights')
      if (res.ok) {
        const data = await res.json()
        const roles = data.map((d: any) => d.roleStatus.trim()).filter(Boolean)
        setRoleSuggestions(Array.from(new Set(['Artis Utama', ...roles])))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchConfigsAndArtists = async () => {
    try {
      const [configRes, artistRes] = await Promise.all([
        fetch('/api/custom-fields?targetType=VIDEO'),
        fetch('/api/artists'),
      ])

      if (configRes.ok) {
        const cData = await configRes.json()
        setCustomConfigs(cData)
      }
      if (artistRes.ok) {
        const aData = await artistRes.json()
        setArtists(aData)
      }

      if (videoId) {
        fetchVideoDetail(videoId)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchVideoDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/videos/${id}`)
      if (res.ok) {
        const data = await res.json()
        setUrl(data.url || '')
        setTitle(data.title || '')
        setNotes(data.notes || '')
        setThumbnail(data.thumbnail || '')
        setEmbedHtml(data.embedHtml || '')
        setDomain(data.domain || '')
        if (data.ratingFolders && data.ratingFolders.length > 0) {
          setRatingFolders(data.ratingFolders)
          const initialExpanded: Record<string, boolean> = {}
          data.ratingFolders.forEach((f: RatingFolder) => {
            initialExpanded[f.id] = true
          })
          setExpandedFolders(initialExpanded)
        }
        if (data.customFields) {
          setCustomValues(data.customFields)
        }
        if (data.artists && Array.isArray(data.artists)) {
          setArtistSelections(
            data.artists.map((p: any) => ({
              artistId: p.artist.id,
              roleStatus: p.roleStatus || 'Artis Utama',
            }))
          )
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Auto fetch metadata
  const handleFetchMetadata = async () => {
    if (!url) return
    setFetchingMeta(true)
    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.title && !title) setTitle(data.title)
        if (data.thumbnail) setThumbnail(data.thumbnail)
        if (data.embedHtml) setEmbedHtml(data.embedHtml)
        if (data.domain) setDomain(data.domain)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetchingMeta(false)
    }
  }

  // Folder & Item Management
  const addFolder = () => {
    const newId = `f-${Date.now()}`
    const newFolder: RatingFolder = {
      id: newId,
      name: `Folder ${ratingFolders.length + 1}`,
      items: [{ id: `i-${Date.now()}`, name: 'Item Baru', score: 75 }],
    }
    setRatingFolders([...ratingFolders, newFolder])
    setExpandedFolders({ ...expandedFolders, [newId]: true })
  }

  const deleteFolder = (folderId: string) => {
    if (ratingFolders.length <= 1) {
      alert('Video harus memiliki minimal 1 Folder Rating.')
      return
    }
    setRatingFolders(ratingFolders.filter((f) => f.id !== folderId))
  }

  const updateFolderName = (folderId: string, name: string) => {
    setRatingFolders(
      ratingFolders.map((f) => (f.id === folderId ? { ...f, name } : f))
    )
  }

  const addItemToFolder = (folderId: string) => {
    setRatingFolders(
      ratingFolders.map((f) => {
        if (f.id === folderId) {
          return {
            ...f,
            items: [
              ...f.items,
              { id: `i-${Date.now()}`, name: 'Item Baru', score: 75 },
            ],
          }
        }
        return f
      })
    )
  }

  const updateItem = (folderId: string, itemId: string, key: 'name' | 'score', value: any) => {
    setRatingFolders(
      ratingFolders.map((f) => {
        if (f.id === folderId) {
          return {
            ...f,
            items: f.items.map((i) => {
              if (i.id === itemId) {
                if (key === 'score') {
                  const numVal = Math.min(100, Math.max(0, Number(value) || 0))
                  return { ...i, score: numVal }
                }
                return { ...i, [key]: value }
              }
              return i
            }),
          }
        }
        return f
      })
    )
  }

  const deleteItem = (folderId: string, itemId: string) => {
    setRatingFolders(
      ratingFolders.map((f) => {
        if (f.id === folderId) {
          return { ...f, items: f.items.filter((i) => i.id !== itemId) }
        }
        return f
      })
    )
  }

  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }))
  }

  const toggleArtistSelect = (artistId: string) => {
    const existing = artistSelections.find((s) => s.artistId === artistId)
    if (existing) {
      setArtistSelections(artistSelections.filter((s) => s.artistId !== artistId))
    } else {
      setArtistSelections([
        ...artistSelections,
        { artistId, roleStatus: 'Artis Utama' },
      ])
    }
  }

  const updateArtistRoleStatus = (artistId: string, roleStatus: string) => {
    setArtistSelections(
      artistSelections.map((s) => (s.artistId === artistId ? { ...s, roleStatus } : s))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !title) {
      alert('URL dan Judul wajib diisi!')
      return
    }

    setLoading(true)
    try {
      const payload = {
        url,
        title,
        notes,
        thumbnail,
        embedHtml,
        domain,
        ratingFolders,
        customFields: customValues,
        artistLinks: artistSelections,
      }

      const endpoint = videoId ? `/api/videos/${videoId}` : '/api/videos'
      const method = videoId ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/')
      } else {
        const errData = await res.json()
        alert(`Gagal menyimpan: ${errData.error || 'Terjadi kesalahan'}`)
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan koneksi server')
    } finally {
      setLoading(false)
    }
  }

  const selectedArtistObjects = artists.filter((a) =>
    artistSelections.some((s) => s.artistId === a.id)
  )

  return (
    <div className="space-y-5 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1.5 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white">
          {videoId ? 'Edit Entri Video' : 'Tambah Video Baru'}
        </h1>
        <div className="w-8" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Field 1: Link Multifungsi & Fetch */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            <LinkIcon className="w-3.5 h-3.5 text-indigo-400" /> URL Link Video
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              required
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleFetchMetadata}
              className="flex-1 px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleFetchMetadata}
              disabled={fetchingMeta || !url}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {fetchingMeta ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
        </div>

        {/* Embed / Thumbnail Preview Card */}
        {(thumbnail || embedHtml) && (
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-3 space-y-2">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
              {thumbnail ? (
                <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs text-slate-400">Preview Embed Metadata</div>
              )}
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 truncate max-w-[200px]">
                Domain: {domain || 'Metadata OK'}
              </span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                Buka Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Field 2: Field Text Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Judul Video</label>
          <input
            type="text"
            required
            placeholder="Judul video..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Field 3: Field Catatan (Collapsible) */}
        <div className="border border-slate-800 bg-slate-800/30 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setNotesCollapsed(!notesCollapsed)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-slate-800/50"
          >
            <span>Catatan Video (Opsional)</span>
            {notesCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {!notesCollapsed && (
            <div className="p-3 pt-0 border-t border-slate-800/50">
              <textarea
                rows={3}
                placeholder="Tulis catatan kustom di sini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Field 4: Folder Number (Sistem Rating) */}
        <div className="space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Sistem Rating Folder</h3>
              <p className="text-[11px] text-slate-400">Perhitungan Overall Rating otomatis (0-100)</p>
            </div>
            {/* Live Overall Score Banner */}
            <div
              className={`px-3 py-1.5 rounded-xl border text-sm font-extrabold flex items-center gap-1 ${getRatingBadgeClass(
                overallScore
              )}`}
            >
              Overall: {overallScore}/100
            </div>
          </div>

          {/* Progress Bar Score Visual */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                overallScore >= 80 ? 'bg-emerald-500' : overallScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${overallScore}%` }}
            />
          </div>

          {/* Rating Folders Accordion */}
          <div className="space-y-3 pt-2">
            {ratingFolders.map((folder) => {
              const isExpanded = expandedFolders[folder.id] ?? true
              return (
                <div
                  key={folder.id}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => toggleFolderExpand(folder.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-200 flex-1 text-left"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <input
                        type="text"
                        value={folder.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateFolderName(folder.id, e.target.value)}
                        className="bg-transparent font-semibold text-slate-100 focus:bg-slate-700/50 px-1 py-0.5 rounded text-xs focus:outline-none border-b border-transparent focus:border-indigo-400"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFolder(folder.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-3 space-y-2.5">
                      {folder.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(folder.id, item.id, 'name', e.target.value)}
                            placeholder="Nama Item..."
                            className="flex-1 px-2.5 py-1.5 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex items-center gap-1 w-28">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              inputMode="numeric"
                              value={item.score}
                              onChange={(e) => updateItem(folder.id, item.id, 'score', e.target.value)}
                              className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-center font-bold text-white focus:outline-none focus:border-indigo-500 min-h-[44px]"
                            />
                            <span className="text-[10px] text-slate-400">/100</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteItem(folder.id, item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addItemToFolder(folder.id)}
                        className="w-full py-2 bg-slate-900/50 hover:bg-slate-700/50 border border-dashed border-slate-700 rounded-lg text-xs font-semibold text-indigo-400 flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <Plus className="w-4 h-4" /> Tambah Item
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            <button
              type="button"
              onClick={addFolder}
              className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Plus className="w-4 h-4" /> Tambah Folder Rating
            </button>
          </div>
        </div>

        {/* Field 5: Tautan Artis & Status Peran */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Tautan Artis & Status Peran
          </label>
          <button
            type="button"
            onClick={() => setArtistBottomSheetOpen(true)}
            className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-left flex items-center justify-between min-h-[48px]"
          >
            {artistSelections.length > 0 ? (
              <span className="text-slate-100 font-medium">
                {artistSelections.length} Artis Terpilih (
                {selectedArtistObjects.map((a) => a.name).join(', ')})
              </span>
            ) : (
              <span className="text-slate-500">Pilih artis yang terlibat...</span>
            )}
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Per-artist Status Peran Input Fields with Auto-complete */}
          {selectedArtistObjects.length > 0 && (
            <div className="space-y-2 bg-slate-800/40 border border-slate-800 p-3 rounded-2xl">
              <label className="text-[11px] font-bold text-indigo-300 block">
                Atur Status Peran Artis
              </label>
              {selectedArtistObjects.map((artist) => {
                const sel = artistSelections.find((s) => s.artistId === artist.id)
                const currentRoleStatus = sel?.roleStatus || 'Artis Utama'

                return (
                  <div
                    key={artist.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                        {artist.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-100 block truncate">
                          {artist.name}
                        </span>
                        {artist.mainRole && (
                          <span className="text-[10px] text-indigo-400 block">
                            Peran Utama: {artist.mainRole}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        list={`role-suggestions-${artist.id}`}
                        value={currentRoleStatus}
                        onChange={(e) => updateArtistRoleStatus(artist.id, e.target.value)}
                        placeholder="Status Peran..."
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500 w-full sm:w-44"
                      />
                      <datalist id={`role-suggestions-${artist.id}`}>
                        {roleSuggestions.map((role) => (
                          <option key={role} value={role} />
                        ))}
                      </datalist>
                      <button
                        type="button"
                        onClick={() => toggleArtistSelect(artist.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                        title="Hapus tautan artis"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Fields 6 & 7: Dynamic Custom Fields */}
        {customConfigs.map((config) => {
          const value = customValues[config.id] || (config.fieldType === 'MultiChoice' ? [] : '')

          return (
            <div key={config.id} className="space-y-1.5 bg-slate-800/40 border border-slate-800 p-3 rounded-2xl">
              <label className="text-xs font-semibold text-slate-200 block">
                {config.name} {config.description && <span className="text-[10px] text-slate-400">({config.description})</span>}
              </label>

              {config.fieldType === 'SingleChoice' && (
                <select
                  value={value}
                  onChange={(e) =>
                    setCustomValues({ ...customValues, [config.id]: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Pilih --</option>
                  {config.optionsList.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {config.fieldType === 'MultiChoice' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {config.optionsList.map((opt) => {
                    const isChecked = Array.isArray(value) && value.includes(opt)
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const currentArr = Array.isArray(value) ? value : []
                          const updated = isChecked
                            ? currentArr.filter((item: string) => item !== opt)
                            : [...currentArr, opt]
                          setCustomValues({ ...customValues, [config.id]: updated })
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1 ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                        {opt}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Clean Submit Button at end of form */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : videoId ? 'Perbarui Video' : 'Simpan Video'}
          </button>
        </div>
      </form>

      {/* Multi-Select Artis Bottom Sheet */}
      {artistBottomSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end">
          <div className="w-full max-w-[480px] bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 max-h-[80vh] flex flex-col space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Pilih Artis Terkait</h3>
              <button
                type="button"
                onClick={() => setArtistBottomSheetOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {artists.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Belum ada artis. Tambahkan artis di menu Artis.
                </p>
              ) : (
                artists.map((artist) => {
                  const isSelected = artistSelections.some((s) => s.artistId === artist.id)
                  return (
                    <div
                      key={artist.id}
                      onClick={() => toggleArtistSelect(artist.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500'
                          : 'bg-slate-800/60 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {artist.avatarUrl ? (
                          <img
                            src={artist.avatarUrl}
                            alt={artist.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {artist.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-semibold text-slate-100 block">
                            {artist.name}
                          </span>
                          {artist.mainRole && (
                            <span className="text-[10px] text-indigo-400 block">
                              Peran Utama: {artist.mainRole}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setArtistBottomSheetOpen(false)}
              className="w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
