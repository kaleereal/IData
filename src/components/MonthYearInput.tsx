import React, { useState, useEffect } from 'react';
import { Calendar, HelpCircle, ChevronDown } from 'lucide-react';

interface MonthYearInputProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  onInfoClick?: () => void;
  helperText?: string;
}

const MONTHS = [
  { val: '01', short: 'Jan', full: 'Januari' },
  { val: '02', short: 'Feb', full: 'Februari' },
  { val: '03', short: 'Mar', full: 'Maret' },
  { val: '04', short: 'Apr', full: 'April' },
  { val: '05', short: 'Mei', full: 'Mei' },
  { val: '06', short: 'Jun', full: 'Juni' },
  { val: '07', short: 'Jul', full: 'Juli' },
  { val: '08', short: 'Agu', full: 'Agustus' },
  { val: '09', short: 'Sep', full: 'September' },
  { val: '10', short: 'Okt', full: 'Oktober' },
  { val: '11', short: 'Nov', full: 'November' },
  { val: '12', short: 'Des', full: 'Desember' },
];

export const MonthYearInput: React.FC<MonthYearInputProps> = ({
  value,
  onChange,
  label,
  onInfoClick,
  helperText,
}) => {
  // Parse initial YYYY-MM
  const parseValue = (val: string) => {
    if (!val) return { year: '', month: '' };
    const parts = val.split('-');
    if (parts.length >= 2) {
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      return { year: y, month: m };
    }
    return { year: '', month: '' };
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(() => parseValue(value).month);
  const [selectedYear, setSelectedYear] = useState<string>(() => parseValue(value).year);

  useEffect(() => {
    const parsed = parseValue(value);
    setSelectedMonth(parsed.month);
    setSelectedYear(parsed.year);
  }, [value]);

  const handleMonthChange = (m: string) => {
    setSelectedMonth(m);
    if (selectedYear) {
      onChange(`${selectedYear}-${m}-01`);
    } else if (m) {
      const currentYear = new Date().getFullYear().toString();
      setSelectedYear(currentYear);
      onChange(`${currentYear}-${m}-01`);
    } else {
      onChange('');
    }
  };

  const handleYearChange = (y: string) => {
    setSelectedYear(y);
    if (y && y.length === 4) {
      const m = selectedMonth || '01';
      if (!selectedMonth) setSelectedMonth('01');
      onChange(`${y}-${m}-01`);
    } else if (!y) {
      onChange('');
    }
  };

  const getDisplayFormatted = () => {
    if (!selectedYear) return '';
    const mObj = MONTHS.find(m => m.val === selectedMonth);
    return `${mObj ? mObj.short : 'Jan'} ${selectedYear}`;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
          {label}:
        </label>
        {onInfoClick && (
          <button
            type="button"
            onClick={onInfoClick}
            className="text-stone-500 hover:text-amber-400 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Bulan Dropdown */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={e => handleMonthChange(e.target.value)}
            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-100 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer appearance-none pr-8"
          >
            <option value="">-- Bulan --</option>
            {MONTHS.map(m => (
              <option key={m.val} value={m.val}>
                {m.short} ({m.full})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Tahun Input */}
        <div className="relative">
          <input
            type="number"
            min={1950}
            max={2050}
            placeholder="Tahun (YYYY)"
            value={selectedYear}
            onChange={e => handleYearChange(e.target.value)}
            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Selected Month/Year Preview badge & calculation helper */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {getDisplayFormatted() ? (
          <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-500/20">
            📅 {getDisplayFormatted()}
          </span>
        ) : (
          <span className="text-[10px] text-stone-500 italic">Format: Bulan & Tahun (Contoh: Jan 2020)</span>
        )}
        {helperText && (
          <span className="text-[11px] font-mono text-amber-400 font-bold">
            {helperText}
          </span>
        )}
      </div>
    </div>
  );
};
