import { Artist, DatabaseSchema, AppealData } from '../types';

/**
 * Synchronizes artist entries with database schema changes:
 * 1. Renamed attribute / specialty options are automatically updated across all artist entries.
 * 2. Deleted attribute / specialty options or entire categories are removed from artist entries.
 * 3. If an artist had attributes and all are deleted, attributes becomes [] making the card Standard.
 */
export function syncArtistsWithSchema(
  artists: Artist[],
  newSchema: DatabaseSchema,
  oldSchema?: DatabaseSchema
): Artist[] {
  if (!artists || !Array.isArray(artists)) return [];
  if (!newSchema) return artists;

  // 1. Collect all valid attribute names in newSchema
  const validAttributes = new Set<string>();
  Object.values(newSchema.attributeCategories || {}).forEach(cat => {
    if (cat && Array.isArray(cat.options)) {
      cat.options.forEach(opt => {
        if (opt && typeof opt.name === 'string' && opt.name.trim()) {
          validAttributes.add(opt.name.trim());
        }
      });
    }
  });
  if (Array.isArray(newSchema.presetAttributes)) {
    newSchema.presetAttributes.forEach(attr => {
      if (attr && typeof attr === 'string' && attr.trim()) {
        validAttributes.add(attr.trim());
      }
    });
  }

  // 2. Collect all valid specialty names in newSchema
  const validSpecialties = new Set<string>();
  Object.values(newSchema.specialtyCategories || {}).forEach(cat => {
    if (cat && Array.isArray(cat.options)) {
      cat.options.forEach(opt => {
        if (opt && typeof opt.name === 'string' && opt.name.trim()) {
          validSpecialties.add(opt.name.trim());
        }
      });
    }
  });
  if (Array.isArray(newSchema.presetSpecialties)) {
    newSchema.presetSpecialties.forEach(spec => {
      if (spec && typeof spec === 'string' && spec.trim()) {
        validSpecialties.add(spec.trim());
      }
    });
  }

  // 3. Build rename lookup maps if oldSchema is provided
  const attributeRenameMap = new Map<string, string>();
  const specialtyRenameMap = new Map<string, string>();

  if (oldSchema) {
    // Attributes renames: match by categoryKey and option ID or option index
    Object.entries(oldSchema.attributeCategories || {}).forEach(([catKey, oldCat]) => {
      const newCat = newSchema.attributeCategories?.[catKey];
      if (newCat && Array.isArray(oldCat.options) && Array.isArray(newCat.options)) {
        oldCat.options.forEach((oldOpt, idx) => {
          if (!oldOpt || typeof oldOpt.name !== 'string') return;
          const byId = oldOpt.id ? newCat.options.find(o => o.id === oldOpt.id) : undefined;
          const newOpt = byId || newCat.options[idx];
          if (
            newOpt &&
            typeof newOpt.name === 'string' &&
            oldOpt.name.trim() !== newOpt.name.trim()
          ) {
            attributeRenameMap.set(oldOpt.name.trim(), newOpt.name.trim());
          }
        });
      }
    });

    // Specialty renames: match by categoryKey and option ID or option index
    Object.entries(oldSchema.specialtyCategories || {}).forEach(([catKey, oldCat]) => {
      const newCat = newSchema.specialtyCategories?.[catKey];
      if (newCat && Array.isArray(oldCat.options) && Array.isArray(newCat.options)) {
        oldCat.options.forEach((oldOpt, idx) => {
          if (!oldOpt || typeof oldOpt.name !== 'string') return;
          const byId = oldOpt.id ? newCat.options.find(o => o.id === oldOpt.id) : undefined;
          const newOpt = byId || newCat.options[idx];
          if (
            newOpt &&
            typeof newOpt.name === 'string' &&
            oldOpt.name.trim() !== newOpt.name.trim()
          ) {
            specialtyRenameMap.set(oldOpt.name.trim(), newOpt.name.trim());
          }
        });
      }
    });
  }

  // 4. Synchronize all artist entries
  return artists.map(artist => {
    let changed = false;

    // Attributes synchronization
    const currentAttrs = artist.attributes || [];
    const updatedAttrs: string[] = [];
    currentAttrs.forEach(attr => {
      const trimmed = (attr || '').trim();
      const mapped = attributeRenameMap.get(trimmed) || trimmed;
      if (validAttributes.has(mapped)) {
        if (!updatedAttrs.includes(mapped)) {
          updatedAttrs.push(mapped);
        }
        if (mapped !== trimmed) {
          changed = true;
        }
      } else {
        // Attribute was deleted in database schema
        changed = true;
      }
    });

    if (currentAttrs.length !== updatedAttrs.length) {
      changed = true;
    }

    // Specialty synchronization
    const currentSpecs = artist.specialty || [];
    const updatedSpecs: string[] = [];
    currentSpecs.forEach(spec => {
      const trimmed = (spec || '').trim();
      const mapped = specialtyRenameMap.get(trimmed) || trimmed;
      if (validSpecialties.has(mapped)) {
        if (!updatedSpecs.includes(mapped)) {
          updatedSpecs.push(mapped);
        }
        if (mapped !== trimmed) {
          changed = true;
        }
      } else {
        // Specialty was deleted in database schema
        changed = true;
      }
    });

    if (currentSpecs.length !== updatedSpecs.length) {
      changed = true;
    }

    // Appeal synchronization (handles all dynamic category keys in appealCategories)
    const updatedAppeal: AppealData = {
      maturity: artist.appeal?.maturity || '',
      vibe: artist.appeal?.vibe || '',
      style: artist.appeal?.style || '',
      bodyShape: artist.appeal?.bodyShape || '',
      ...(artist.appeal || {}),
    };
    const allAppealKeys = Array.from(
      new Set([
        ...Object.keys(newSchema.appealCategories || {}),
        ...Object.keys(oldSchema?.appealCategories || {}),
        ...Object.keys(artist.appeal || {}),
      ])
    );

    allAppealKeys.forEach(k => {
      const currentVal = artist.appeal?.[k];
      const newCat = newSchema.appealCategories?.[k];

      if (!newCat) {
        // Entire category was deleted
        if (currentVal) {
          delete updatedAppeal[k];
          changed = true;
        }
        return;
      }

      if (currentVal && Array.isArray(newCat.options)) {
        const validOptions = newCat.options.map(o => (o?.name || '').trim()).filter(Boolean);
        if (validOptions.length > 0 && !validOptions.includes(currentVal.trim())) {
          // Check if it was renamed in oldSchema
          const oldCat = oldSchema?.appealCategories?.[k];
          let foundRename = false;
          if (oldCat && Array.isArray(oldCat.options)) {
            oldCat.options.forEach((oldOpt, idx) => {
              if (oldOpt && oldOpt.name.trim() === currentVal.trim()) {
                const byId = oldOpt.id ? newCat.options.find(o => o.id === oldOpt.id) : undefined;
                const newOpt = byId || newCat.options[idx];
                if (newOpt && newOpt.name && newOpt.name.trim()) {
                  updatedAppeal[k] = newOpt.name.trim();
                  foundRename = true;
                  changed = true;
                }
              }
            });
          }
          if (!foundRename) {
            // Item was deleted
            updatedAppeal[k] = '';
            changed = true;
          }
        }
      }
    });

    // TypeCode synchronization
    let updatedTypeCode = artist.typeCode;
    if (newSchema.artistTypes && newSchema.artistTypes.length > 0) {
      const validCodes = new Set(newSchema.artistTypes.map(t => t.code));
      if (artist.typeCode && !validCodes.has(artist.typeCode)) {
        // Check if there's a fallback or first option
        updatedTypeCode = newSchema.artistTypes[0]?.code || 'AA';
        changed = true;
      }
    }

    if (!changed) {
      return artist;
    }

    return {
      ...artist,
      attributes: updatedAttrs,
      specialty: updatedSpecs,
      appeal: updatedAppeal,
      typeCode: updatedTypeCode,
      updatedAt: new Date().toISOString(),
    };
  });
}
