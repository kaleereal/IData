import { DatabaseSchema, AppealCategoryDefinition, AppealOptionItem, ScoringTraitMetadata } from '../types';

/**
 * Escapes a cell value for standard CSV compatibility.
 * Quotes the string if it contains commas, semicolons, quotes, or newlines.
 */
function escapeCsvCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes(';') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Robust CSV parser that handles:
 * - Commas (,) or Semicolons (;)
 * - Quotes with escaped double quotes ("")
 * - Newlines inside quotes
 */
export function parseCsvRows(text: string): string[][] {
  // Strip BOM if present
  let cleanText = text;
  if (cleanText.charCodeAt(0) === 0xFEFF) {
    cleanText = cleanText.slice(1);
  }

  // Detect delimiter based on first line
  const firstLine = cleanText.split(/\r?\n/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentCell += '"';
          i++; // skip next quote
        } else {
          // Closing quote
          insideQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        // Skip carriage return
        continue;
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Last cell and row if file didn't terminate with newline
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows.filter(r => r.some(c => c.length > 0));
}

/**
 * Exports complete Dynamic Schema to CSV format
 * Ready for Google Sheets / Microsoft Excel editing with UTF-8 BOM
 */
export function exportSchemaToCsv(schema: DatabaseSchema): string {
  const headers = [
    'Type',
    'Section',
    'CategoryKey',
    'CategoryTitle',
    'CategoryDescription',
    'ItemKey',
    'ItemName',
    'ItemDescription',
    'ItemExtra',
  ];

  const lines: string[] = [headers.join(',')];

  // 1. SECTION TITLES
  const sectionList: Array<{ key: keyof DatabaseSchema['sectionTitles']; defaultLabel: string; desc: string }> = [
    { key: 'biodata', defaultLabel: 'BIODATA', desc: 'Judul Utama Bidang Biodata' },
    { key: 'appeal', defaultLabel: 'APPEAL', desc: 'Judul Utama Bidang Appeal' },
    { key: 'attributes', defaultLabel: 'ATTRIBUTES', desc: 'Judul Utama Bidang Attributes' },
    { key: 'specialty', defaultLabel: 'SPECIALTY', desc: 'Judul Utama Bidang Specialty' },
    { key: 'appearance', defaultLabel: 'APPEARANCE', desc: 'Judul Utama Bidang Appearance (Fisik)' },
    { key: 'impression', defaultLabel: 'IMPRESSION', desc: 'Judul Utama Bidang Impression (Karisma & Aura)' },
  ];

  for (const s of sectionList) {
    const titleVal = schema.sectionTitles?.[s.key] || s.defaultLabel;
    lines.push([
      'SECTION_TITLE',
      s.key,
      '',
      '',
      '',
      `sec_${s.key}`,
      escapeCsvCell(titleVal),
      escapeCsvCell(s.desc),
      '',
    ].join(','));
  }

  // 1.1 SCORING WEIGHTS
  lines.push([
    'SCORING_WEIGHTS',
    'scoring',
    '',
    '',
    '',
    'weights',
    `${schema.scoringWeights?.appearanceWeight ?? 60}`,
    `${schema.scoringWeights?.impressionWeight ?? 40}`,
    'Bobot Persentase Appearance vs Impression',
  ].join(','));

  // 1.2 BIODATA FIELDS
  const biodataFields = Object.entries(schema.fields || {}).filter(([_, f]) => f.category === 'biodata');
  for (const [fKey, fDef] of biodataFields) {
    lines.push([
      'BIODATA_FIELD',
      'biodata',
      '',
      '',
      '',
      escapeCsvCell(fKey),
      escapeCsvCell(fDef.label),
      escapeCsvCell(fDef.shortDescription),
      escapeCsvCell(fDef.editorGuidelines || ''),
    ].join(','));
  }

  // 2. CATEGORIES & OPTIONS (APPEAL, ATTRIBUTES, SPECIALTY)
  const categorySections: Array<{ section: 'appeal' | 'attributes' | 'specialty'; map?: Record<string, AppealCategoryDefinition> }> = [
    { section: 'appeal', map: schema.appealCategories },
    { section: 'attributes', map: schema.attributeCategories },
    { section: 'specialty', map: schema.specialtyCategories },
  ];

  for (const cs of categorySections) {
    if (!cs.map) continue;
    for (const [catKey, catDef] of Object.entries(cs.map)) {
      // Category Row
      lines.push([
        'CATEGORY',
        cs.section,
        catKey,
        escapeCsvCell(catDef.title),
        escapeCsvCell(catDef.shortDescription),
        '',
        '',
        '',
        '',
      ].join(','));

      // Option Rows
      for (const opt of catDef.options || []) {
        lines.push([
          'OPTION',
          cs.section,
          catKey,
          escapeCsvCell(catDef.title),
          '',
          escapeCsvCell(opt.id || opt.name),
          escapeCsvCell(opt.name),
          escapeCsvCell(opt.description || opt.guidelines || ''),
          '',
        ].join(','));
      }
    }
  }

  // 3. SCORING TRAITS (APPEARANCE & IMPRESSION)
  for (const trait of schema.scoringTraits?.appearance || []) {
    lines.push([
      'SCORING_TRAIT',
      'appearance',
      '',
      '',
      '',
      escapeCsvCell(trait.key),
      escapeCsvCell(trait.label),
      escapeCsvCell(trait.shortDescription),
      escapeCsvCell(trait.weightLabel || `${Math.round((trait.weight || 0) * 100)}%`),
    ].join(','));
  }

  for (const trait of schema.scoringTraits?.impression || []) {
    lines.push([
      'SCORING_TRAIT',
      'impression',
      '',
      '',
      '',
      escapeCsvCell(trait.key),
      escapeCsvCell(trait.label),
      escapeCsvCell(trait.shortDescription),
      escapeCsvCell(trait.weightLabel || `${Math.round((trait.weight || 0) * 100)}%`),
    ].join(','));
  }

  // Return with UTF-8 BOM so Excel opens with proper encoding
  return '\uFEFF' + lines.join('\r\n');
}

export interface ImportSchemaResult {
  success: boolean;
  schema: DatabaseSchema;
  summary: {
    sectionTitlesUpdated: number;
    categoriesUpdated: number;
    optionsUpdated: number;
    traitsUpdated: number;
    fieldsUpdated?: number;
    weightsUpdated?: number;
  };
  errors: string[];
}

/**
 * Imports CSV text and updates the DatabaseSchema
 */
export function importSchemaFromCsv(csvText: string, baseSchema: DatabaseSchema): ImportSchemaResult {
  const rows = parseCsvRows(csvText);
  const errors: string[] = [];

  if (rows.length < 2) {
    return {
      success: false,
      schema: baseSchema,
      summary: { sectionTitlesUpdated: 0, categoriesUpdated: 0, optionsUpdated: 0, traitsUpdated: 0 },
      errors: ['File CSV kosong atau tidak memiliki data baris yang valid.'],
    };
  }

  // Clone base schema deeply
  const newSchema: DatabaseSchema = JSON.parse(JSON.stringify(baseSchema));
  if (!newSchema.sectionTitles) {
    newSchema.sectionTitles = {
      biodata: 'BIODATA',
      measurements: 'MEASUREMENTS',
      appeal: 'APPEAL',
      scoring: 'SCORE',
      attributes: 'ATTRIBUTES',
      specialty: 'SPECIALTY',
      appearance: 'APPEARANCE',
      impression: 'IMPRESSION',
    };
  }
  if (!newSchema.appealCategories) newSchema.appealCategories = {} as any;
  if (!newSchema.attributeCategories) newSchema.attributeCategories = {} as any;
  if (!newSchema.specialtyCategories) newSchema.specialtyCategories = {} as any;
  if (!newSchema.scoringTraits) {
    newSchema.scoringTraits = { appearance: [], impression: [] };
  }

  let sectionTitlesUpdated = 0;
  let categoriesUpdated = 0;
  let optionsUpdated = 0;
  let traitsUpdated = 0;
  let fieldsUpdated = 0;
  let weightsUpdated = 0;

  // Header row detection
  const headerRow = rows[0].map(h => h.trim().toLowerCase());
  const typeIdx = headerRow.indexOf('type');
  const sectionIdx = headerRow.indexOf('section');
  const catKeyIdx = headerRow.indexOf('categorykey');
  const catTitleIdx = headerRow.indexOf('categorytitle');
  const catDescIdx = headerRow.indexOf('categorydescription');
  const itemKeyIdx = headerRow.indexOf('itemkey');
  const itemNameIdx = headerRow.indexOf('itemname');
  const itemDescIdx = headerRow.indexOf('itemdescription');
  const itemExtraIdx = headerRow.indexOf('itemextra');

  // If header doesn't match standard names, fallback to standard column indexes 0..8
  const colType = typeIdx >= 0 ? typeIdx : 0;
  const colSection = sectionIdx >= 0 ? sectionIdx : 1;
  const colCatKey = catKeyIdx >= 0 ? catKeyIdx : 2;
  const colCatTitle = catTitleIdx >= 0 ? catTitleIdx : 3;
  const colCatDesc = catDescIdx >= 0 ? catDescIdx : 4;
  const colItemKey = itemKeyIdx >= 0 ? itemKeyIdx : 5;
  const colItemName = itemNameIdx >= 0 ? itemNameIdx : 6;
  const colItemDesc = itemDescIdx >= 0 ? itemDescIdx : 7;
  const colItemExtra = itemExtraIdx >= 0 ? itemExtraIdx : 8;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length < 2) continue;

    const type = (row[colType] || '').trim().toUpperCase();
    const section = (row[colSection] || '').trim().toLowerCase();
    const catKey = (row[colCatKey] || '').trim();
    const catTitle = (row[colCatTitle] || '').trim();
    const catDesc = (row[colCatDesc] || '').trim();
    const itemKey = (row[colItemKey] || '').trim();
    const itemName = (row[colItemName] || '').trim();
    const itemDesc = (row[colItemDesc] || '').trim();

    try {
      if (type === 'SECTION_TITLE') {
        if (section && itemName) {
          newSchema.sectionTitles[section] = itemName;
          sectionTitlesUpdated++;
        }
      } else if (type === 'CATEGORY') {
        if (section && catKey) {
          const targetMap =
            section === 'appeal'
              ? newSchema.appealCategories
              : section === 'attributes'
              ? newSchema.attributeCategories
              : section === 'specialty'
              ? newSchema.specialtyCategories
              : null;

          if (targetMap) {
            if (!targetMap[catKey]) {
              targetMap[catKey] = {
                title: catTitle || catKey,
                icon: 'Tag',
                shortDescription: catDesc || `Kategori ${catTitle || catKey}`,
                options: [],
              };
            } else {
              if (catTitle) targetMap[catKey].title = catTitle;
              if (catDesc) targetMap[catKey].shortDescription = catDesc;
            }
            categoriesUpdated++;
          }
        }
      } else if (type === 'OPTION') {
        if (section && catKey && itemName) {
          const targetMap =
            section === 'appeal'
              ? newSchema.appealCategories
              : section === 'attributes'
              ? newSchema.attributeCategories
              : section === 'specialty'
              ? newSchema.specialtyCategories
              : null;

          if (targetMap) {
            if (!targetMap[catKey]) {
              targetMap[catKey] = {
                title: catTitle || catKey,
                icon: 'Tag',
                shortDescription: catDesc || `Kategori ${catTitle || catKey}`,
                options: [],
              };
            }

            const existingIdx = targetMap[catKey].options.findIndex(
              o => (itemKey && o.id === itemKey) || o.name.toLowerCase() === itemName.toLowerCase()
            );

            const optItem: AppealOptionItem = {
              id: itemKey || `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: itemName,
              description: itemDesc,
              guidelines: itemDesc,
            };

            if (existingIdx >= 0) {
              targetMap[catKey].options[existingIdx] = optItem;
            } else {
              targetMap[catKey].options.push(optItem);
            }
            optionsUpdated++;
          }
        }
      } else if (type === 'BIODATA_FIELD') {
        if (itemKey && newSchema.fields && newSchema.fields[itemKey]) {
          if (itemName) newSchema.fields[itemKey].label = itemName;
          if (itemDesc) newSchema.fields[itemKey].shortDescription = itemDesc;
          const extraGuidelines = (row[colItemExtra] || '').trim();
          if (extraGuidelines) newSchema.fields[itemKey].editorGuidelines = extraGuidelines;
          fieldsUpdated++;
        }
      } else if (type === 'SCORING_WEIGHTS') {
        const appW = parseInt(itemName, 10);
        const impW = parseInt(itemDesc, 10);
        if (!isNaN(appW) && !isNaN(impW)) {
          newSchema.scoringWeights = {
            appearanceWeight: appW,
            impressionWeight: impW,
          };
          weightsUpdated++;
        }
      } else if (type === 'SCORING_TRAIT') {
        if ((section === 'appearance' || section === 'impression') && itemKey && itemName) {
          const traitList = section === 'appearance' ? newSchema.scoringTraits.appearance : newSchema.scoringTraits.impression;
          const existingIdx = traitList.findIndex(t => t.key.toLowerCase() === itemKey.toLowerCase());
          const extraWeightStr = (row[colItemExtra] || '').replace('%', '').trim();
          const parsedWeight = parseFloat(extraWeightStr);
          const validWeight = !isNaN(parsedWeight) && parsedWeight > 0 ? parsedWeight / 100 : undefined;
          const validWeightLabel = !isNaN(parsedWeight) && parsedWeight > 0 ? `${Math.round(parsedWeight)}%` : undefined;

          if (existingIdx >= 0) {
            traitList[existingIdx].label = itemName;
            if (itemDesc) traitList[existingIdx].shortDescription = itemDesc;
            if (validWeight !== undefined) {
              traitList[existingIdx].weight = validWeight;
              traitList[existingIdx].weightLabel = validWeightLabel;
            }
            traitsUpdated++;
          } else {
            const newTrait: ScoringTraitMetadata = {
              key: itemKey,
              label: itemName,
              category: section,
              weight: validWeight || 0.15,
              weightLabel: validWeightLabel || '15%',
              shortDescription: itemDesc || itemName,
              rubricGuide: {
                sTier: '90-99 (Sempurna)',
                aTier: '80-89 (Sangat Bagus)',
                bTier: '70-79 (Bagus/Standar)',
                cTier: '<70 (Cukup)',
              },
            };
            traitList.push(newTrait);
            traitsUpdated++;
          }
        }
      }
    } catch (rowErr) {
      errors.push(`Baris ${r + 1}: Gagal memproses data (${(rowErr as Error).message})`);
    }
  }

  const hasChanges =
    sectionTitlesUpdated > 0 ||
    categoriesUpdated > 0 ||
    optionsUpdated > 0 ||
    traitsUpdated > 0 ||
    fieldsUpdated > 0 ||
    weightsUpdated > 0;

  return {
    success: hasChanges,
    schema: newSchema,
    summary: {
      sectionTitlesUpdated,
      categoriesUpdated,
      optionsUpdated,
      traitsUpdated,
      fieldsUpdated,
      weightsUpdated,
    },
    errors,
  };
}

/**
 * Initiates direct browser download of CSV string
 */
export function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
