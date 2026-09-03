import React, { useState } from 'react';
import { UITextType, UITextLocation, UITextRecord } from '../../types';
import { Plus, X, Tag, Sparkles, Check, AlertCircle } from 'lucide-react';

interface AddNewKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKey: (record: Omit<UITextRecord, 'id' | 'last_updated'>) => void;
  activeLocale: string;
  isDark?: boolean;
}

export const AddNewKeyModal: React.FC<AddNewKeyModalProps> = ({
  isOpen,
  onClose,
  onAddKey,
  activeLocale,
  isDark = false,
}) => {
  const [key, setKey] = useState('');
  const [type, setType] = useState<UITextType>('Label');
  const [category, setCategory] = useState<UITextLocation>('Global / Navbar');
  const [textValue, setTextValue] = useState('');
  const [description, setDescription] = useState('');
  const [locale, setLocale] = useState(activeLocale);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('Key ID tidak boleh kosong.');
      return;
    }
    if (!textValue.trim()) {
      setError('Nilai teks tidak boleh kosong.');
      return;
    }

    // Format key: lowercase with dot notation
    const formattedKey = key.trim().toLowerCase().replace(/\s+/g, '.');

    onAddKey({
      text_key: formattedKey,
      locale,
      category,
      type,
      text_value: textValue.trim(),
      default_value: textValue.trim(),
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl ${
        isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Tambah Kunci Teks Baru</h3>
              <p className="text-xs text-stone-400">Daftarkan elemen teks UI dinamis baru ke dalam kamus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold block text-stone-400">Unique Key ID (Dot Notation):</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Contoh: home.hero.banner_title"
              className={`w-full px-3 py-2 rounded-xl font-mono text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold block text-stone-400">Tipe Elemen:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as UITextType)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              >
                <option value="Title">Title (Judul)</option>
                <option value="Description">Description (Deskripsi)</option>
                <option value="Placeholder">Placeholder (Kolom Input)</option>
                <option value="Button">Button (Tombol)</option>
                <option value="Label">Label (Nama Kolom)</option>
                <option value="Tooltip">Tooltip (Bantuan Hover)</option>
                <option value="Notification">Notification (Toast / Pesan)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold block text-stone-400">Lokasi / Halaman:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as UITextLocation)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              >
                <option value="Global / Navbar">Global / Navbar</option>
                <option value="Home / Catalog">Home / Catalog</option>
                <option value="Detail Profil">Detail Profil</option>
                <option value="Ranking & Leaderboard">Ranking & Leaderboard</option>
                <option value="Compare Artis">Compare Artis</option>
                <option value="Form Tambah / Edit">Form Tambah / Edit</option>
                <option value="Settings & Preferensi">Settings & Preferensi</option>
                <option value="Database Editor">Database Editor</option>
                <option value="Notifikasi & Dialog">Notifikasi & Dialog</option>
                <option value="Custom Pages">Custom Pages</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold block text-stone-400">Nilai Teks (Initial Value):</label>
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Ketik isi teks antarmuka..."
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold block text-stone-400">Deskripsi / Konteks UI (Opsional):</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Judul utama pada banner promosi beranda"
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
              }`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
            >
              Simpan Kunci Teks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
