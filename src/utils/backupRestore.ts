import { Artist, DatabaseSchema } from '../types';
import {
  calculateOverallRating,
  calculateAppearanceScore,
  calculateImpressionScore,
  calculateProportionalRating,
  calculateAge,
} from './calculations';

export interface ExportDataPayload {
  app: string;
  version: number;
  exportedAt: string;
  totalArtists: number;
  schema?: DatabaseSchema;
  artists: Artist[];
}

export interface ParseResult {
  success: boolean;
  artists?: Artist[];
  schema?: DatabaseSchema;
  error?: string;
  count?: number;
}

// Trigger browser download of a file
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------------
// 1. JSON EXPORT & IMPORT
// ----------------------------------------------------------------------------
export function exportDatabaseAsJSON(artists: Artist[], schema?: DatabaseSchema) {
  const payload: ExportDataPayload = {
    app: 'IDOL_PRO_DATABASE',
    version: 1,
    exportedAt: new Date().toISOString(),
    totalArtists: artists.length,
    schema,
    artists,
  };

  const jsonContent = JSON.stringify(payload, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  triggerFileDownload(
    jsonContent,
    `idol_pro_database_backup_${dateStr}.json`,
    'application/json'
  );
}

export function parseJSONBackup(rawText: string): ParseResult {
  try {
    const data = JSON.parse(rawText);
    if (!data) {
      return { success: false, error: 'File kosong atau format tidak valid.' };
    }

    let parsedArtists: Artist[] = [];
    let parsedSchema: DatabaseSchema | undefined = undefined;

    if (Array.isArray(data)) {
      parsedArtists = data;
    } else if (Array.isArray(data.artists)) {
      parsedArtists = data.artists;
      if (data.schema && typeof data.schema === 'object') {
        parsedSchema = data.schema;
      }
    } else {
      return {
        success: false,
        error: 'Tidak ditemukan array entri artis dalam file JSON ini.',
      };
    }

    // Basic sanitization
    parsedArtists = parsedArtists.filter(
      a => a && typeof a === 'object' && (a.firstName || a.id)
    );

    return {
      success: true,
      artists: parsedArtists,
      schema: parsedSchema,
      count: parsedArtists.length,
    };
  } catch (err: any) {
    return { success: false, error: `Gagal membaca file JSON: ${err.message}` };
  }
}

// ----------------------------------------------------------------------------
// 2. HTML EXPORT & IMPORT
// ----------------------------------------------------------------------------
export function exportDatabaseAsHTML(artists: Artist[], schema?: DatabaseSchema) {
  const dateStr = new Date().toISOString().split('T')[0];
  const payload: ExportDataPayload = {
    app: 'IDOL_PRO_DATABASE',
    version: 1,
    exportedAt: new Date().toISOString(),
    totalArtists: artists.length,
    schema,
    artists,
  };
  const jsonString = JSON.stringify(payload);

  const rows = artists
    .map((artist, idx) => {
      const appearance = calculateAppearanceScore(artist.appearanceScores);
      const impression = calculateImpressionScore(artist.impressionScores);
      const overall = calculateOverallRating(appearance, impression);
      const proportional = calculateProportionalRating(artist.measurements);
      const age = calculateAge(artist.bornDate);
      const isSpecial = (artist.attributes?.length || 0) > 0;
      const statusBadge = isSpecial
        ? '<span class="badge badge-special">SPECIAL</span>'
        : '<span class="badge badge-standard">STANDARD</span>';

      return `
      <tr>
        <td class="text-center font-bold">${idx + 1}</td>
        <td>
          <div class="name-box">
            <strong>${artist.firstName} ${artist.lastName || ''}</strong>
            <span class="country-tag">${artist.country} (${artist.countryCode})</span>
          </div>
        </td>
        <td class="text-center">${statusBadge}</td>
        <td class="text-center font-bold overall-score">${overall.toFixed(1)}</td>
        <td class="text-center">${appearance.toFixed(1)}</td>
        <td class="text-center">${impression.toFixed(1)}</td>
        <td class="text-center">${proportional.toFixed(1)}</td>
        <td class="text-center">${artist.heightCm} cm</td>
        <td class="text-center">${artist.measurements.cupSize} (${artist.measurements.bustCm}-${artist.measurements.waistCm}-${artist.measurements.hipCm})</td>
        <td class="text-center">${artist.typeCode}</td>
        <td class="text-center">${age > 0 ? age + ' th' : '-'}</td>
        <td>
          <small>${artist.appeal.maturity} • ${artist.appeal.vibe} • ${artist.appeal.style} • ${artist.appeal.bodyShape}</small>
        </td>
      </tr>`;
    })
    .join('\n');

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>IDOL PRO - Database Export & Catalog</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0c0a09; color: #f5f5f4; margin: 0; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #f59e0b; margin-bottom: 4px; font-size: 24px; }
    .subtitle { color: #a8a29e; font-size: 14px; margin-top: 0; margin-bottom: 20px; }
    .stats-bar { display: flex; gap: 16px; margin-bottom: 24px; background: #1c1917; padding: 16px; border-radius: 12px; border: 1px solid #292524; }
    .stat-item { flex: 1; text-align: center; }
    .stat-val { font-size: 20px; font-weight: bold; color: #f59e0b; }
    .stat-lbl { font-size: 11px; color: #a8a29e; text-transform: uppercase; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; background: #1c1917; border-radius: 12px; overflow: hidden; border: 1px solid #292524; font-size: 13px; }
    th { background: #292524; color: #f59e0b; text-align: left; padding: 12px 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px; border-bottom: 1px solid #292524; }
    tr:hover { background: #292524; }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .overall-score { color: #f59e0b; font-size: 15px; }
    .badge { display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; border-radius: 4px; letter-spacing: 0.5px; }
    .badge-special { background: rgba(0, 188, 213, 0.15); color: #00bcd5; border: 1px solid rgba(0, 188, 213, 0.4); }
    .badge-standard { background: rgba(254, 205, 210, 0.15); color: #fecdd2; border: 1px solid rgba(254, 205, 210, 0.4); }
    .country-tag { display: block; font-size: 11px; color: #a8a29e; margin-top: 2px; }
    .name-box strong { color: #ffffff; }
    footer { margin-top: 24px; text-align: center; font-size: 12px; color: #78716c; }
    @media print { body { background: #fff; color: #000; } table { border-color: #ccc; } th { background: #eee; color: #000; } td { border-color: #ddd; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>👑 IDOL PRO - KATALOG ARTIS & DATABASE CADANGAN</h1>
    <p class="subtitle">Cadangan offline basis data entri artis • Tanggal Ekspor: ${dateStr} • Total Entri: ${artists.length} Artis</p>

    <div class="stats-bar">
      <div class="stat-item"><div class="stat-val">${artists.length}</div><div class="stat-lbl">Total Artis</div></div>
      <div class="stat-item"><div class="stat-val">${artists.filter(a => (a.attributes?.length || 0) > 0).length}</div><div class="stat-lbl">Special</div></div>
      <div class="stat-item"><div class="stat-val">${artists.filter(a => !a.attributes || a.attributes.length === 0).length}</div><div class="stat-lbl">Standard</div></div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="text-center">#</th>
          <th>Nama Artis</th>
          <th class="text-center">Status</th>
          <th class="text-center">Overall</th>
          <th class="text-center">App</th>
          <th class="text-center">Imp</th>
          <th class="text-center">Prop</th>
          <th class="text-center">Tinggi</th>
          <th class="text-center">Ukuran (B-W-H)</th>
          <th class="text-center">Tipe</th>
          <th class="text-center">Usia</th>
          <th>Daya Tarik / Appeal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <footer>
      Dokumen ini diekspor secara otomatis oleh IDOL PRO Database & Sistem Penilaian Terstruktur.
    </footer>
  </div>

  <!-- RAW DATA STORAGE FOR RESTORATION -->
  <script id="raw-db-data" type="application/json">
${jsonString}
  </script>
</body>
</html>`;

  triggerFileDownload(
    htmlContent,
    `idol_pro_database_export_${dateStr}.html`,
    'text/html'
  );
}

export function parseHTMLBackup(rawText: string): ParseResult {
  try {
    // 1. Try to find embedded JSON payload in script tag
    const scriptMatch = rawText.match(
      /<script[^>]*id=["']raw-db-data["'][^>]*>([\s\S]*?)<\/script>/i
    );
    if (scriptMatch && scriptMatch[1]) {
      const jsonStr = scriptMatch[1].trim();
      return parseJSONBackup(jsonStr);
    }

    // 2. Fallback: Parse HTML table rows using DOMParser
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawText, 'text/html');
      const tableRows = doc.querySelectorAll('tbody tr');
      if (tableRows.length > 0) {
        const parsedArtists: Artist[] = [];
        tableRows.forEach((row, idx) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 8) {
            const nameEl = cells[1]?.querySelector('strong');
            const fullName = nameEl?.textContent?.trim() || `Artist ${idx + 1}`;
            const parts = fullName.split(' ');
            const firstName = parts[0] || fullName;
            const lastName = parts.slice(1).join(' ') || '';

            const newArtist: Artist = {
              id: `imported_${Date.now()}_${idx}`,
              firstName,
              lastName,
              avatarUrl: '',
              country: 'Indonesia',
              countryCode: 'ID',
              bornDate: '2000-01-01',
              debutDate: '2020-01-01',
              heightCm: 165,
              typeCode: 'AK',
              measurements: { cupSize: 'C', bustCm: 86, waistCm: 60, hipCm: 88 },
              attributes: [],
              appeal: { maturity: 'Teen / Young', vibe: 'Girl Next Door (GND)', style: 'Elegant / Glamour', bodyShape: 'Slim / Langsing' },
              specialty: [],
              appearanceScores: { face: 85, skin: 85, breast: 85, butt: 85, v: 85, thighCalve: 85 },
              impressionScores: { voice: 85, expression: 85, sexAppeal: 85, authenticity: 85, chemistry: 85, aura: 85 },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            parsedArtists.push(newArtist);
          }
        });

        if (parsedArtists.length > 0) {
          return {
            success: true,
            artists: parsedArtists,
            count: parsedArtists.length,
          };
        }
      }
    }

    return {
      success: false,
      error: 'Tidak dapat menemukan data entri artis dalam file HTML ini.',
    };
  } catch (err: any) {
    return { success: false, error: `Gagal membaca file HTML: ${err.message}` };
  }
}

// ----------------------------------------------------------------------------
// 3. MARKDOWN EXPORT & IMPORT
// ----------------------------------------------------------------------------
export function exportDatabaseAsMarkdown(artists: Artist[], schema?: DatabaseSchema) {
  const dateStr = new Date().toISOString().split('T')[0];
  const payload: ExportDataPayload = {
    app: 'IDOL_PRO_DATABASE',
    version: 1,
    exportedAt: new Date().toISOString(),
    totalArtists: artists.length,
    schema,
    artists,
  };
  const jsonString = JSON.stringify(payload);

  let md = `# 👑 IDOL PRO - Basis Data Entri Artis & Model\n\n`;
  md += `> **Tanggal Ekspor:** ${dateStr}  \n`;
  md += `> **Total Entri Terdaftar:** ${artists.length} Artis  \n\n`;

  md += `## 📊 Ringkasan Leaderboard & Skor\n\n`;
  md += `| # | Nama Artis | Negara | Status | Overall | Appearance | Impression | Proportional | Tinggi | Ukuran (B-W-H) | Tipe |\n`;
  md += `|---|------------|--------|--------|---------|------------|------------|--------------|--------|----------------|------|\n`;

  artists.forEach((a, i) => {
    const appScore = calculateAppearanceScore(a.appearanceScores);
    const impScore = calculateImpressionScore(a.impressionScores);
    const overall = calculateOverallRating(appScore, impScore);
    const propScore = calculateProportionalRating(a.measurements);
    const isSpecial = (a.attributes?.length || 0) > 0 ? 'SPECIAL' : 'STANDARD';

    md += `| ${i + 1} | **${a.firstName} ${a.lastName || ''}** | ${a.country} (${a.countryCode}) | ${isSpecial} | **${overall}** | ${appScore.toFixed(1)} | ${impScore.toFixed(1)} | ${propScore} | ${a.heightCm} cm | ${a.measurements.cupSize} (${a.measurements.bustCm}-${a.measurements.waistCm}-${a.measurements.hipCm}) | ${a.typeCode} |\n`;
  });

  md += `\n\n## 📝 Rincian Profil Artis\n\n`;

  artists.forEach((a, i) => {
    const appScore = calculateAppearanceScore(a.appearanceScores);
    const impScore = calculateImpressionScore(a.impressionScores);
    const overall = calculateOverallRating(appScore, impScore);
    const age = calculateAge(a.bornDate);
    md += `### ${i + 1}. ${a.firstName} ${a.lastName || ''} (⭐ ${overall})\n\n`;
    md += `- **Negara:** ${a.country} (${a.countryCode})\n`;
    md += `- **Lahir / Usia:** ${a.bornDate} (${age > 0 ? age + ' tahun' : '-'})\n`;
    md += `- **Debut:** ${a.debutDate}\n`;
    md += `- **Fisik & Postur:** Tinggi ${a.heightCm} cm, Tipe ${a.typeCode}, Ukuran ${a.measurements.cupSize} Cup (${a.measurements.bustCm}-${a.measurements.waistCm}-${a.measurements.hipCm} cm)\n`;
    md += `- **Appeal:** Maturity: *${a.appeal.maturity}*, Vibe: *${a.appeal.vibe}*, Style: *${a.appeal.style}*, Body Shape: *${a.appeal.bodyShape}*\n`;
    if (a.attributes && a.attributes.length > 0) {
      md += `- **Special Attributes:** ${a.attributes.join(', ')}\n`;
    }
    if (a.specialty && a.specialty.length > 0) {
      md += `- **Specialty:** ${a.specialty.join(', ')}\n`;
    }
    if (a.notes) {
      md += `- **Catatan:** ${a.notes}\n`;
    }
    md += `\n`;
  });

  md += `\n\n<!-- IDOL_PRO_BACKUP_JSON_START\n${jsonString}\nIDOL_PRO_BACKUP_JSON_END -->\n`;

  triggerFileDownload(
    md,
    `idol_pro_database_backup_${dateStr}.md`,
    'text/markdown'
  );
}

export function parseMarkdownBackup(rawText: string): ParseResult {
  try {
    // 1. Try to find embedded JSON comment block
    const commentMatch = rawText.match(
      /<!--\s*IDOL_PRO_BACKUP_JSON_START([\s\S]*?)IDOL_PRO_BACKUP_JSON_END\s*-->/i
    );
    if (commentMatch && commentMatch[1]) {
      const jsonStr = commentMatch[1].trim();
      return parseJSONBackup(jsonStr);
    }

    // 2. Fallback: Parse markdown table rows
    const lines = rawText.split('\n');
    const tableRows = lines.filter(
      line => line.startsWith('|') && !line.includes('---|') && !line.includes('| # |')
    );

    if (tableRows.length > 0) {
      const parsedArtists: Artist[] = [];
      tableRows.forEach((row, idx) => {
        const parts = row
          .split('|')
          .map(p => p.trim())
          .filter(Boolean);
        if (parts.length >= 4) {
          const rawName = parts[1].replace(/\*\*/g, '').trim();
          const nameParts = rawName.split(' ');
          const firstName = nameParts[0] || `Artist ${idx + 1}`;
          const lastName = nameParts.slice(1).join(' ') || '';

          const newArtist: Artist = {
            id: `imported_md_${Date.now()}_${idx}`,
            firstName,
            lastName,
            avatarUrl: '',
            country: 'Indonesia',
            countryCode: 'ID',
            bornDate: '2000-01-01',
            debutDate: '2020-01-01',
            heightCm: 165,
            typeCode: 'AK',
            measurements: { cupSize: 'C', bustCm: 86, waistCm: 60, hipCm: 88 },
            attributes: [],
            appeal: { maturity: 'Teen / Young', vibe: 'Girl Next Door (GND)', style: 'Elegant / Glamour', bodyShape: 'Slim / Langsing' },
            specialty: [],
            appearanceScores: { face: 85, skin: 85, breast: 85, butt: 85, v: 85, thighCalve: 85 },
            impressionScores: { voice: 85, expression: 85, sexAppeal: 85, authenticity: 85, chemistry: 85, aura: 85 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          parsedArtists.push(newArtist);
        }
      });

      if (parsedArtists.length > 0) {
        return {
          success: true,
          artists: parsedArtists,
          count: parsedArtists.length,
        };
      }
    }

    return {
      success: false,
      error: 'Tidak dapat menemukan data entri artis dalam file Markdown ini.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Gagal membaca file Markdown: ${err.message}`,
    };
  }
}

// ----------------------------------------------------------------------------
// 4. CSV EXPORT
// ----------------------------------------------------------------------------
export function exportDatabaseAsCSV(artists: Artist[], schema?: DatabaseSchema) {
  const headers = [
    'No',
    'ID',
    'Nama Depan',
    'Nama Belakang',
    'Status',
    'Negara',
    'Kode Negara',
    'Overall Rating',
    'Appearance Score',
    'Impression Score',
    'Proportional Rating',
    'Tinggi (cm)',
    'Cup Size',
    'Bust (cm)',
    'Waist (cm)',
    'Hip (cm)',
    'Tipe Tubuh',
    'Tanggal Lahir',
    'Usia',
    'Tanggal Debut',
    'Maturity',
    'Vibe',
    'Style',
    'Body Shape',
    'Atribut Khusus',
    'Spesialisasi',
    'Face',
    'Skin',
    'Breast',
    'Butt',
    'V',
    'Thigh & Calve',
    'Voice',
    'Expression',
    'Sex Appeal',
    'Authenticity',
    'Chemistry',
    'Aura',
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = artists.map((a, idx) => {
    const app = calculateAppearanceScore(a.appearanceScores);
    const imp = calculateImpressionScore(a.impressionScores);
    const overall = calculateOverallRating(app, imp);
    const prop = calculateProportionalRating(a.measurements);
    const age = calculateAge(a.bornDate);
    const isSpecial = (a.attributes?.length || 0) > 0;
    const status = a.artistStatus || (isSpecial ? 'Special' : 'Standard');

    return [
      idx + 1,
      escapeCSV(a.id),
      escapeCSV(a.firstName),
      escapeCSV(a.lastName || ''),
      escapeCSV(status),
      escapeCSV(a.country),
      escapeCSV(a.countryCode),
      overall,
      app.toFixed(1),
      imp.toFixed(1),
      prop,
      a.heightCm || '',
      escapeCSV(a.measurements?.cupSize || ''),
      a.measurements?.bustCm || '',
      a.measurements?.waistCm || '',
      a.measurements?.hipCm || '',
      escapeCSV(a.typeCode),
      escapeCSV(a.bornDate || ''),
      age,
      escapeCSV(a.debutDate || ''),
      escapeCSV(a.appeal?.maturity || ''),
      escapeCSV(a.appeal?.vibe || ''),
      escapeCSV(a.appeal?.style || ''),
      escapeCSV(a.appeal?.bodyShape || ''),
      escapeCSV((a.attributes || []).join('; ')),
      escapeCSV((a.specialty || []).join('; ')),
      a.appearanceScores?.face || '',
      a.appearanceScores?.skin || '',
      a.appearanceScores?.breast || '',
      a.appearanceScores?.butt || '',
      a.appearanceScores?.v || '',
      a.appearanceScores?.thighCalve || '',
      a.impressionScores?.voice || '',
      a.impressionScores?.expression || '',
      a.impressionScores?.sexAppeal || '',
      a.impressionScores?.authenticity || '',
      a.impressionScores?.chemistry || '',
      a.impressionScores?.aura || '',
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  triggerFileDownload(
    csvContent,
    `idol_pro_database_${dateStr}.csv`,
    'text/csv'
  );
}
