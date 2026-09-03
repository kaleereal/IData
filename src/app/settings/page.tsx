'use client'

import { useEffect, useState } from 'react'
import {
  Settings,
  Plus,
  GripVertical,
  Edit3,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Percent,
  Lock,
  Unlock,
  RotateCcw,
  Sliders,
  FolderPlus,
  Palette,
  Check,
  Play,
} from 'lucide-react'
import {
  CardThemePreset,
  DEFAULT_THEME_PRESETS,
  getSavedPresets,
  savePresets,
  getActiveTheme,
  setActiveThemeId,
} from '@/lib/theme'

export interface CategoryItem {
  id?: string
  code?: string
  name: string
  description?: string
}

export interface OptionCategory {
  id?: string
  name: string
  items: CategoryItem[]
}

export interface CustomFieldConfig {
  id: string
  targetType: string // "VIDEO" | "ARTIST"
  name: string
  description?: string
  fieldType: string // "SingleChoice" | "MultiChoice" | "Text" | "Slider"
  options?: string
  optionsList: string[]
  parsedOptions?: {
    categories?: OptionCategory[]
    items?: CategoryItem[]
  } | null
  position: number
  maxEntries?: number
}

interface RoleWeightConfig {
  id: string
  roleStatus: string
  weight: number
  isLocked: boolean
}

export default function SettingsPage() {
  const [targetTab, setTargetTab] = useState<'VIDEO' | 'ARTIST'>('VIDEO')
  const [configs, setConfigs] = useState<CustomFieldConfig[]>([])
  const [roleWeights, setRoleWeights] = useState<RoleWeightConfig[]>([])

  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  // Collapsible section states
  const [roleWeightsCollapsed, setRoleWeightsCollapsed] = useState(false)
  const [customFieldsCollapsed, setCustomFieldsCollapsed] = useState(false)
  const [cardThemeCollapsed, setCardThemeCollapsed] = useState(false)

  // Theme Studio States
  const [presets, setPresets] = useState<CardThemePreset[]>([])
  const [activeTheme, setActiveTheme] = useState<CardThemePreset>(DEFAULT_THEME_PRESETS[0])
  const [editingPreset, setEditingPreset] = useState<CardThemePreset | null>(null)
  const [themeModalOpen, setThemeModalOpen] = useState(false)

  // Form state for theme preset
  const [themeName, setThemeName] = useState('')
  const [themeBgColor, setThemeBgColor] = useState('#1e293b')
  const [themeTextColor, setThemeTextColor] = useState('#f8fafc')
  const [themeBorderColor, setThemeBorderColor] = useState('#334155')
  const [themeBadgeBg, setThemeBadgeBg] = useState('#4f46e5')
  const [themeBadgeText, setThemeBadgeText] = useState('#ffffff')
  const [themeRadius, setThemeRadius] = useState('1rem')
  const [themeCardStyle, setThemeCardStyle] = useState<'standard' | 'glass' | 'neon' | 'cyberpunk' | 'minimal'>('standard')

  // Modal states for Custom Fields
  const [modalOpen, setModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<CustomFieldConfig | null>(null)

  // Form states for Custom Field
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fieldType, setFieldType] = useState('MultiChoice')
  const [optionsStr, setOptionsStr] = useState('')
  const [maxEntries, setMaxEntries] = useState('')

  // Structured Options state for SingleChoice (Body Type / Categorized)
  const [useCategories, setUseCategories] = useState(false)
  const [categories, setCategories] = useState<OptionCategory[]>([])

  useEffect(() => {
    fetchCustomConfigs()
    fetchRoleWeights()
    loadThemePresets()
  }, [targetTab])

  const loadThemePresets = () => {
    const loaded = getSavedPresets()
    setPresets(loaded)
    const active = getActiveTheme()
    setActiveTheme(active)
  }

  const handleSelectActiveTheme = (preset: CardThemePreset) => {
    setActiveTheme(preset)
    setActiveThemeId(preset.id)
  }

  const openNewThemeModal = () => {
    setEditingPreset(null)
    setThemeName('Preset Tema Baru')
    setThemeBgColor('#0f172a')
    setThemeTextColor('#f8fafc')
    setThemeBorderColor('#3b82f6')
    setThemeBadgeBg('#2563eb')
    setThemeBadgeText('#ffffff')
    setThemeRadius('1rem')
    setThemeCardStyle('standard')
    setThemeModalOpen(true)
  }

  const openEditThemeModal = (preset: CardThemePreset, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingPreset(preset)
    setThemeName(preset.name)
    setThemeBgColor(preset.bgColor)
    setThemeTextColor(preset.textColor)
    setThemeBorderColor(preset.borderColor)
    setThemeBadgeBg(preset.badgeBg)
    setThemeBadgeText(preset.badgeText)
    setThemeRadius(preset.borderRadius || '1rem')
    setThemeCardStyle(preset.cardStyle || 'standard')
    setThemeModalOpen(true)
  }

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (presets.length <= 1) {
      alert('Tidak dapat menghapus. Minimal 1 preset tema card harus tersedia.')
      return
    }
    if (!confirm('Apakah Anda yakin ingin menghapus preset tema card ini?')) return

    const updated = presets.filter((p) => p.id !== id)
    setPresets(updated)
    savePresets(updated)
    if (activeTheme.id === id) {
      handleSelectActiveTheme(updated[0])
    }
  }

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault()
    if (!themeName) return

    const newPreset: CardThemePreset = {
      id: editingPreset ? editingPreset.id : `preset-${Date.now()}`,
      name: themeName,
      bgColor: themeBgColor,
      textColor: themeTextColor,
      borderColor: themeBorderColor,
      badgeBg: themeBadgeBg,
      badgeText: themeBadgeText,
      borderRadius: themeRadius,
      cardStyle: themeCardStyle,
    }

    let updated: CardThemePreset[] = []
    if (editingPreset) {
      updated = presets.map((p) => (p.id === editingPreset.id ? newPreset : p))
    } else {
      updated = [...presets, newPreset]
    }

    setPresets(updated)
    savePresets(updated)
    handleSelectActiveTheme(newPreset)
    setThemeModalOpen(false)
  }

  const fetchCustomConfigs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/custom-fields?targetType=${targetTab}`)
      if (res.ok) {
        const data = await res.json()
        setConfigs(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoleWeights = async () => {
    try {
      const res = await fetch('/api/role-weights')
      if (res.ok) {
        const data = await res.json()
        setRoleWeights(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateRoleWeight = async (id: string, weightVal: number) => {
    const num = Math.min(100, Math.max(0, weightVal))
    try {
      const res = await fetch('/api/role-weights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, weight: num }),
      })
      if (res.ok) {
        setRoleWeights(
          roleWeights.map((rw) => (rw.id === id ? { ...rw, weight: num } : rw))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleLockRoleWeight = async (id: string, currentLock: boolean) => {
    try {
      const res = await fetch('/api/role-weights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isLocked: !currentLock }),
      })
      if (res.ok) {
        setRoleWeights(
          roleWeights.map((rw) => (rw.id === id ? { ...rw, isLocked: !currentLock } : rw))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRecalculateAll = async () => {
    if (
      !confirm(
        'Hitung ulang seluruh nilai video untuk semua artis berdasarkan bobot terbaru?\nItem yang terkunci (Locked) TIDAK akan diubah.'
      )
    ) {
      return
    }

    setRecalculating(true)
    try {
      const res = await fetch('/api/role-weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recalculate_all' }),
      })
      if (res.ok) {
        const data = await res.json()
        alert(`Berhasil menghitung ulang ${data.recalculatedCount || 0} tautan video artis!`)
      } else {
        alert('Gagal menghitung ulang.')
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan.')
    } finally {
      setRecalculating(false)
    }
  }

  const openAddModal = () => {
    setEditingConfig(null)
    setName('')
    setDescription('')
    setFieldType(targetTab === 'ARTIST' ? 'Slider' : 'MultiChoice')
    setOptionsStr('')
    setMaxEntries('')
    setUseCategories(false)
    setCategories([
      {
        name: 'Kategori 1',
        items: [
          { name: 'Item 1', description: 'Deskripsi item 1' },
        ],
      },
    ])
    setModalOpen(true)
  }

  const openEditModal = (config: CustomFieldConfig) => {
    setEditingConfig(config)
    setName(config.name)
    setDescription(config.description || '')
    setFieldType(config.fieldType)
    setOptionsStr(config.options || config.optionsList?.join(', ') || '')
    setMaxEntries(config.maxEntries ? String(config.maxEntries) : '')

    if (config.parsedOptions && config.parsedOptions.categories) {
      setUseCategories(true)
      setCategories(config.parsedOptions.categories)
    } else {
      setUseCategories(false)
      setCategories([
        {
          name: 'Kategori 1',
          items: config.optionsList.map((opt) => ({ name: opt, description: '' })),
        },
      ])
    }

    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengaturan field kustom ini?')) return
    try {
      const res = await fetch(`/api/custom-fields/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setConfigs(configs.filter((c) => c.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    let finalOptions: any = optionsStr

    if ((fieldType === 'SingleChoice' || fieldType === 'MultiChoice') && useCategories) {
      finalOptions = { categories }
    }

    const payload = {
      targetType: targetTab,
      name,
      description,
      fieldType,
      options: finalOptions,
      maxEntries: maxEntries ? Number(maxEntries) : null,
      position: editingConfig ? editingConfig.position : configs.length,
    }

    try {
      const endpoint = editingConfig ? `/api/custom-fields/${editingConfig.id}` : '/api/custom-fields'
      const method = editingConfig ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setModalOpen(false)
        fetchCustomConfigs()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === configs.length - 1)) return

    const newConfigs = [...configs]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newConfigs[index]
    newConfigs[index] = newConfigs[targetIndex]
    newConfigs[targetIndex] = temp

    setConfigs(newConfigs)

    try {
      await fetch('/api/custom-fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfigs),
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Category helpers for modal
  const addCategory = () => {
    setCategories([
      ...categories,
      {
        name: `Kategori ${categories.length + 1}`,
        items: [{ name: 'Item Baru', description: '' }],
      },
    ])
  }

  const removeCategory = (catIdx: number) => {
    setCategories(categories.filter((_, idx) => idx !== catIdx))
  }

  const updateCategoryName = (catIdx: number, catName: string) => {
    setCategories(
      categories.map((c, idx) => (idx === catIdx ? { ...c, name: catName } : c))
    )
  }

  const addItemToCategory = (catIdx: number) => {
    setCategories(
      categories.map((c, idx) => {
        if (idx === catIdx) {
          return {
            ...c,
            items: [...c.items, { name: 'Item Baru', description: '' }],
          }
        }
        return c
      })
    )
  }

  const removeItemFromCategory = (catIdx: number, itemIdx: number) => {
    setCategories(
      categories.map((c, idx) => {
        if (idx === catIdx) {
          return {
            ...c,
            items: c.items.filter((_, iIdx) => iIdx !== itemIdx),
          }
        }
        return c
      })
    )
  }

  const updateCategoryItem = (
    catIdx: number,
    itemIdx: number,
    key: 'name' | 'description',
    val: string
  ) => {
    setCategories(
      categories.map((c, idx) => {
        if (idx === catIdx) {
          return {
            ...c,
            items: c.items.map((it, iIdx) =>
              iIdx === itemIdx ? { ...it, [key]: val } : it
            ),
          }
        }
        return c
      })
    )
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" /> Pengaturan Skema & Aplikasi
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Atur skema dinamis (Dynamic Schema), trait slider penilaian, Card Theme Studio, dan bobot relasi peran.
        </p>
      </div>

      {/* SECTION: CARD THEME STUDIO (Collapsible) */}
      <div className="border border-slate-800 bg-slate-900/80 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setCardThemeCollapsed(!cardThemeCollapsed)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-slate-800/50"
        >
          <span className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-400" /> Card Theme Studio & Presets ({presets.length})
          </span>
          {cardThemeCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {!cardThemeCollapsed && (
          <div className="p-3 pt-1 border-t border-slate-800/60 space-y-3">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Kustomisasi tampilan visual card di Halaman Utama dan Artis. Pilih preset aktif atau buat preset baru.
            </p>

            {/* Presets List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((preset) => {
                const isActive = activeTheme.id === preset.id

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectActiveTheme(preset)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                      isActive
                        ? 'ring-2 ring-indigo-500 border-indigo-500/80 bg-slate-800/90'
                        : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{preset.name}</span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Aktif
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => openEditThemeModal(preset, e)}
                          className="p-1 text-slate-400 hover:text-indigo-400"
                          title="Edit Preset"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeletePreset(preset.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Hapus Preset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Miniature Card Preview in Preset list */}
                    <div
                      className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                      style={{
                        backgroundColor: preset.bgColor,
                        color: preset.textColor,
                        borderColor: preset.borderColor,
                        borderRadius: preset.borderRadius || '0.75rem',
                      }}
                    >
                      <span className="font-bold truncate">Pratinjau Card</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: preset.badgeBg, color: preset.badgeText }}
                      >
                        85 / 100
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={openNewThemeModal}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Plus className="w-4 h-4" /> Buat Preset Card Theme Baru
            </button>
          </div>
        )}
      </div>

      {/* SECTION 1: RELASI NILAI & PENGATURAN BOBOT STATUS PERAN (Collapsible) */}
      <div className="border border-slate-800 bg-slate-900/80 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setRoleWeightsCollapsed(!roleWeightsCollapsed)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-slate-800/50"
        >
          <span className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-indigo-400" /> Relasi Nilai & Bobot Status Peran ({roleWeights.length})
          </span>
          {roleWeightsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {!roleWeightsCollapsed && (
          <div className="p-3 pt-1 border-t border-slate-800/60 space-y-3">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Daftar status peran terisi otomatis dari entri video. Atur persentase bobot (0%-100%).
              Tombol <strong>Kunci (Lock)</strong> mencegah perubahan bobot saat hitung ulang global.
            </p>

            {roleWeights.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Belum ada status peran terdaftar. Tambahkan video dengan status peran untuk memunculkan opsi di sini.
              </p>
            ) : (
              <div className="space-y-2">
                {roleWeights.map((rw) => (
                  <div
                    key={rw.id}
                    className="p-2.5 bg-slate-800/60 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-100 block truncate">
                        {rw.roleStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={rw.isLocked}
                          value={rw.weight}
                          onChange={(e) => handleUpdateRoleWeight(rw.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-extrabold text-center text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                        />
                        <span className="text-xs text-slate-400 font-bold">%</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleLockRoleWeight(rw.id, rw.isLocked)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                          rw.isLocked
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                        title={rw.isLocked ? 'Terkunci (Locked)' : 'Terbuka (Unlocked)'}
                      >
                        {rw.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recalculate All Button */}
            <button
              type="button"
              onClick={handleRecalculateAll}
              disabled={recalculating || roleWeights.length === 0}
              className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 min-h-[44px]"
            >
              <RotateCcw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Memproses Hitung Ulang...' : 'Hitung Ulang Semua Nilai Video'}
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: PENGATURAN SKEMA DINAMIS / FIELD KUSTOM (Collapsible) */}
      <div className="border border-slate-800 bg-slate-900/80 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setCustomFieldsCollapsed(!customFieldsCollapsed)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-slate-800/50"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" /> Skema Dinamis & Dynamic Fields ({configs.length})
          </span>
          {customFieldsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {!customFieldsCollapsed && (
          <div className="p-3 pt-1 border-t border-slate-800/60 space-y-3">
            {/* Target Tab Switcher */}
            <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setTargetTab('VIDEO')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  targetTab === 'VIDEO'
                    ? 'bg-indigo-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Field Video
              </button>
              <button
                onClick={() => setTargetTab('ARTIST')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  targetTab === 'ARTIST'
                    ? 'bg-indigo-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Field / Biodata Artis
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">Memuat konfig skema...</div>
            ) : configs.length === 0 ? (
              <div className="py-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800 p-4">
                <p className="text-slate-400 text-xs">Belum ada field kustom/skema dikonfigurasi.</p>
                <button
                  onClick={openAddModal}
                  className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  + Tambah Field Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {configs.map((config, idx) => (
                  <div
                    key={config.id}
                    className="bg-slate-800/50 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <GripVertical className="w-4 h-4 cursor-grab text-slate-600" />
                      <div className="flex flex-col">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, 'up')}
                          className="text-[10px] text-slate-400 hover:text-indigo-400 disabled:opacity-20 leading-none p-0.5"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === configs.length - 1}
                          onClick={() => moveItem(idx, 'down')}
                          className="text-[10px] text-slate-400 hover:text-indigo-400 disabled:opacity-20 leading-none p-0.5"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 px-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-100 truncate">{config.name}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600/20 text-indigo-400 text-[10px] font-semibold border border-indigo-500/30">
                          {config.fieldType}
                        </span>
                      </div>
                      {config.description && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{config.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(config)}
                        className="p-1.5 text-slate-300 hover:text-indigo-400 rounded-lg"
                        title="Edit Field"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-400 rounded-lg"
                        title="Hapus Field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={openAddModal}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Plus className="w-4 h-4" /> Tambah Field / Trait Penilaian Baru
            </button>
          </div>
        )}
      </div>

      {/* CARD THEME STUDIO EDIT/CREATE MODAL WITH LIVE IDENTICAL PREVIEW */}
      {themeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingPreset ? 'Edit Preset Card Theme' : 'Buat Preset Card Theme Baru'}
              </h3>
              <button onClick={() => setThemeModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LIVE PREVIEW OF THEME (EXACT IDENTICAL CARD OUTPUT) */}
            <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-indigo-300 block uppercase tracking-wider">
                Pratinjau Langsung Card Studio
              </span>

              <div
                className="relative overflow-hidden p-3 border transition-all"
                style={{
                  backgroundColor: themeBgColor,
                  color: themeTextColor,
                  borderColor: themeBorderColor,
                  borderRadius: themeRadius,
                }}
              >
                <div className="aspect-video w-full rounded-xl bg-slate-950 overflow-hidden relative mb-2 flex items-center justify-center">
                  <Play className="w-8 h-8 opacity-40" />
                  <div
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-md"
                    style={{ backgroundColor: themeBadgeBg, color: themeBadgeText }}
                  >
                    88 / 100
                  </div>
                </div>

                <h3 className="text-sm font-bold line-clamp-1">
                  Video Showcase / Judul Demo Theme
                </h3>
                <p className="text-[11px] opacity-80 line-clamp-1 mt-0.5">
                  Artis: Demo Performa, Lead Actor
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveTheme} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Preset Theme *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Cyberpunk Blue, Dark Gold, Minimal Gray..."
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warna Latar (Card Bg)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={themeBgColor.startsWith('#') ? themeBgColor : '#1e293b'}
                      onChange={(e) => setThemeBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={themeBgColor}
                      onChange={(e) => setThemeBgColor(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warna Teks Utama</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={themeTextColor.startsWith('#') ? themeTextColor : '#ffffff'}
                      onChange={(e) => setThemeTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={themeTextColor}
                      onChange={(e) => setThemeTextColor(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warna Garis Tepi (Border)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={themeBorderColor.startsWith('#') ? themeBorderColor : '#334155'}
                      onChange={(e) => setThemeBorderColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={themeBorderColor}
                      onChange={(e) => setThemeBorderColor(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warna Latar Badge Rating</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={themeBadgeBg.startsWith('#') ? themeBadgeBg : '#4f46e5'}
                      onChange={(e) => setThemeBadgeBg(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={themeBadgeBg}
                      onChange={(e) => setThemeBadgeBg(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warna Teks Badge Rating</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={themeBadgeText.startsWith('#') ? themeBadgeText : '#ffffff'}
                      onChange={(e) => setThemeBadgeText(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={themeBadgeText}
                      onChange={(e) => setThemeBadgeText(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sudut Melengkung (Radius)</label>
                  <select
                    value={themeRadius}
                    onChange={(e) => setThemeRadius(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  >
                    <option value="0.5rem">0.5rem (Kecil)</option>
                    <option value="1rem">1.0rem (Sedang Standard)</option>
                    <option value="1.5rem">1.5rem (Bulat Besar)</option>
                    <option value="2rem">2.0rem (Extra Bulat)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setThemeModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Simpan & Gunakan Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Custom Field Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingConfig ? 'Edit Konfigurasi Field' : 'Tambah Field Kustom / Trait Penilaian Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Field / Trait *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Appearance, Impression, Body Type, Postur..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi Field</label>
                <input
                  type="text"
                  placeholder="Deskripsi singkat bantuan atau petunjuk..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tipe Field *</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Slider">Slider Penilaian (Trait Score 0 - 100)</option>
                  <option value="SingleChoice">SingleChoice (Pilihan Tunggal Kategori & Deskripsi)</option>
                  <option value="MultiChoice">MultiChoice (Multi Select / Tag Filter)</option>
                  <option value="Text">Teks Bebas</option>
                </select>
              </div>

              {(fieldType === 'SingleChoice' || fieldType === 'MultiChoice') && (
                <div className="space-y-2 border border-slate-800 bg-slate-800/40 p-3 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-200 font-semibold">Mode Opsi Pilihan</label>
                    <button
                      type="button"
                      onClick={() => setUseCategories(!useCategories)}
                      className="text-[11px] text-indigo-400 hover:underline font-bold"
                    >
                      {useCategories ? 'Switch ke Teks Koma Simpel' : 'Gunakan Struktur Kategori & Deskripsi Item'}
                    </button>
                  </div>

                  {!useCategories ? (
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">
                        Daftar Pilihan (Dipisahkan koma)
                      </label>
                      <input
                        type="text"
                        placeholder="Option A, Option B, Option C"
                        value={optionsStr}
                        onChange={(e) => setOptionsStr(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <p className="text-[11px] text-slate-400">
                        Atur Kategori & Item lengkap dengan judul deskripsi (misal untuk Body Type / typeCode).
                      </p>

                      {categories.map((cat, catIdx) => (
                        <div key={catIdx} className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={cat.name}
                              onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                              placeholder="Nama Kategori..."
                              className="flex-1 px-2.5 py-1 bg-slate-800 border border-slate-600 rounded-lg text-xs text-white font-bold"
                            />
                            {categories.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCategory(catIdx)}
                                className="p-1 text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Items inside category */}
                          <div className="space-y-1.5 pl-2 border-l-2 border-indigo-500/40">
                            {cat.items.map((it, itemIdx) => (
                              <div key={itemIdx} className="p-2 bg-slate-800/80 rounded-lg space-y-1">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={it.name}
                                    onChange={(e) =>
                                      updateCategoryItem(catIdx, itemIdx, 'name', e.target.value)
                                    }
                                    placeholder="Judul / Nama Option..."
                                    className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-100 font-semibold"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeItemFromCategory(catIdx, itemIdx)}
                                    className="text-slate-400 hover:text-rose-400 p-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={it.description || ''}
                                  onChange={(e) =>
                                    updateCategoryItem(catIdx, itemIdx, 'description', e.target.value)
                                  }
                                  placeholder="Deskripsi penjelasan item..."
                                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-[11px] text-slate-300"
                                />
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addItemToCategory(catIdx)}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 pt-1"
                            >
                              <Plus className="w-3 h-3" /> Tambah Item ke Kategori
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addCategory}
                        className="w-full py-2 bg-slate-800 border border-dashed border-slate-700 text-indigo-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1"
                      >
                        <FolderPlus className="w-3.5 h-3.5" /> Tambah Kategori Opsi Baru
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Maksimal Jumlah Entri (Opsional)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Batas maksimal..."
                  value={maxEntries}
                  onChange={(e) => setMaxEntries(e.target.value)}
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
                  Simpan Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
