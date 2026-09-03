import React, { memo, useMemo } from 'react';

/**
 * Escapes regex special characters in a search term
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface SearchHighlightProps {
  text: string | number | undefined | null;
  query?: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * SearchHighlight Component:
 * Renders text with search keyword matches wrapped in a styled highlight element.
 */
export const SearchHighlight: React.FC<SearchHighlightProps> = memo(({
  text,
  query = '',
  className = '',
  highlightClassName = 'search-highlight-mark',
}) => {
  const strText = text !== undefined && text !== null ? String(text) : '';
  const cleanQuery = query ? query.trim() : '';

  const parts = useMemo(() => {
    if (!strText || !cleanQuery) {
      return null;
    }

    // Split multi-word query into individual non-empty tokens if spaced
    const tokens = cleanQuery
      .split(/\s+/)
      .filter((t) => t.length > 0)
      .map(escapeRegExp);

    if (tokens.length === 0) return null;

    // Build regex pattern matching any of the tokens
    const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
    return strText.split(regex);
  }, [strText, cleanQuery]);

  if (!parts) {
    return <span className={className}>{strText}</span>;
  }

  // Check which parts match any tokens
  const cleanTokensLower = cleanQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = cleanTokensLower.some((t) => part.toLowerCase() === t);
        if (isMatch) {
          return (
            <mark key={index} className={highlightClassName}>
              {part}
            </mark>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
});

SearchHighlight.displayName = 'SearchHighlight';

/**
 * jumpToTarget:
 * Smoothly scrolls to an element by ID, opens tabs/drawers if needed,
 * and triggers a vibrant flash/pulse highlight animation.
 */
export function jumpToTarget(
  elementId: string,
  options?: {
    pulseDuration?: number;
    block?: ScrollLogicalPosition;
    offset?: number;
  }
): boolean {
  if (typeof document === 'undefined') return false;

  const findAndScroll = () => {
    const el =
      document.getElementById(elementId) ||
      document.getElementById(`artist-card-${elementId}`) ||
      document.getElementById(`artist-${elementId}`);
    if (!el) return false;

    // Smooth scroll into center view
    el.scrollIntoView({
      behavior: 'smooth',
      block: options?.block || 'center',
      inline: 'nearest',
    });

    // Remove pulse class on any other elements
    document.querySelectorAll('.search-target-pulse').forEach((node) => {
      node.classList.remove('search-target-pulse');
    });

    // Add vibrant pulse animation class to the target
    el.classList.add('search-target-pulse');

    const duration = options?.pulseDuration || 2200;
    setTimeout(() => {
      el.classList.remove('search-target-pulse');
    }, duration);

    return true;
  };

  const found = findAndScroll();
  if (!found) {
    // Retry shortly in case virtual list, modal transition, or tab render completes
    setTimeout(() => {
      findAndScroll();
    }, 120);
  }

  return true;
}

/**
 * Extracts a contextual preview snippet highlighting where the query matched in an artist
 */
export function getArtistSearchMatchPreview(
  artist: any,
  query?: string
): { label: string; snippet: string; matchedField: string } | null {
  if (!artist || !query || typeof query !== 'string' || !query.trim()) return null;
  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter((t: string) => t.length > 0);
  if (tokens.length === 0) return null;

  const matches = (val?: any): boolean => {
    if (val === undefined || val === null) return false;
    const str = String(val).toLowerCase();
    return tokens.some((t: string) => str.includes(t));
  };

  const makeSnippet = (fullText: string, maxLen = 80): string => {
    const lower = fullText.toLowerCase();
    let bestIdx = -1;
    for (const t of tokens) {
      const idx = lower.indexOf(t);
      if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
        bestIdx = idx;
      }
    }
    if (bestIdx === -1 || fullText.length <= maxLen) return fullText;
    const start = Math.max(0, bestIdx - 20);
    const end = Math.min(fullText.length, start + maxLen);
    let snippet = fullText.substring(start, end).trim();
    if (start > 0) snippet = '...' + snippet;
    if (end < fullText.length) snippet = snippet + '...';
    return snippet;
  };

  // 1. Notes (Catatan)
  if (artist.notes && matches(artist.notes)) {
    return { label: 'Catatan', snippet: makeSnippet(artist.notes), matchedField: 'notes' };
  }

  // 2. Specialty (Spesialisasi)
  if (Array.isArray(artist.specialty) && artist.specialty.some((s: string) => matches(s))) {
    const matched = artist.specialty.find((s: string) => matches(s)) || artist.specialty.join(', ');
    return { label: 'Spesialisasi', snippet: matched, matchedField: 'specialty' };
  }

  // 3. Attributes (Atribut)
  if (Array.isArray(artist.attributes) && artist.attributes.some((a: string) => matches(a))) {
    const matched = artist.attributes.find((a: string) => matches(a)) || artist.attributes.join(', ');
    return { label: 'Atribut', snippet: matched, matchedField: 'attributes' };
  }

  // 4. Appeal / Daya Tarik
  if (artist.appeal) {
    const { maturity, vibe, style, bodyShape } = artist.appeal;
    if (matches(maturity)) return { label: 'Maturity', snippet: maturity, matchedField: 'appeal.maturity' };
    if (matches(vibe)) return { label: 'Vibe', snippet: vibe, matchedField: 'appeal.vibe' };
    if (matches(style)) return { label: 'Gaya', snippet: style, matchedField: 'appeal.style' };
    if (matches(bodyShape)) return { label: 'Bentuk Tubuh', snippet: bodyShape, matchedField: 'appeal.bodyShape' };
  }

  // 5. Country / Negara
  if (matches(artist.country) || matches(artist.countryCode)) {
    return { label: 'Negara', snippet: `${artist.country || ''} (${artist.countryCode || ''})`.trim(), matchedField: 'country' };
  }

  // 6. Measurements / Ukuran
  if (artist.measurements) {
    if (matches(artist.measurements.cupSize) || matches(`${artist.measurements.cupSize} cup`)) {
      return {
        label: 'Ukuran Cup',
        snippet: `${artist.measurements.cupSize} Cup (${artist.measurements.bustCm || '-'}/${artist.measurements.waistCm || '-'}/${artist.measurements.hipCm || '-'})`,
        matchedField: 'measurements',
      };
    }
  }

  // 7. Height
  if (matches(artist.heightCm) || matches(`${artist.heightCm}cm`)) {
    return { label: 'Tinggi Badan', snippet: `${artist.heightCm} cm`, matchedField: 'height' };
  }

  // 8. Status & Tipe
  if (artist.artistStatus && matches(artist.artistStatus)) {
    return { label: 'Status', snippet: artist.artistStatus, matchedField: 'status' };
  }
  if (artist.typeCode && matches(artist.typeCode)) {
    return { label: 'Kode Tipe', snippet: artist.typeCode, matchedField: 'typeCode' };
  }

  // 9. Links
  if (Array.isArray(artist.links) && artist.links.length > 0) {
    const matchedLink = artist.links.find((l: any) => matches(l.name) || matches(l.url));
    if (matchedLink) {
      return { label: 'Tautan Link', snippet: `${matchedLink.name}: ${matchedLink.url}`, matchedField: 'links' };
    }
  }

  // 10. Dates
  if (artist.debutDate && matches(artist.debutDate)) {
    return { label: 'Tanggal Debut', snippet: artist.debutDate, matchedField: 'debutDate' };
  }
  if (artist.bornDate && matches(artist.bornDate)) {
    return { label: 'Tanggal Lahir', snippet: artist.bornDate, matchedField: 'bornDate' };
  }

  // 11. Name
  const fullName = `${artist.firstName || ''} ${artist.lastName || ''}`.trim();
  if (matches(fullName)) {
    return { label: 'Nama Artis', snippet: fullName, matchedField: 'name' };
  }

  return null;
}

