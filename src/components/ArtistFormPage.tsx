import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Artist,
  ArtistLink,
  DatabaseSchema,
  AppealData,
  Measurements,
  AppearanceScores,
  ImpressionScores,
  CountryOption,
  AppealCategoryDefinition,
  AppealOptionItem,
  CustomPageEntry,
} from '../types';
import {
  calculateAge,
  calculateAgeAtDebut,
  calculateAppearanceScore,
  calculateImpressionScore,
  calculateOverallRating,
  calculateProportionalRating,
  getCountryFlag,
  getScoreStatus,
  getTypeInfo,
} from '../utils/calculations';
import {
  Sparkles,
  Check,
  Plus,
  Trash2,
  Globe,
  HelpCircle,
  Upload,
  ArrowLeft,
  X,
  Save,
  Link as LinkIcon,
  ExternalLink,
  Image as ImageIcon,
  Award,
  Layers,
  User,
  Ruler,
  Smile,
  Eye,
  Activity,
  FileText,
  ChevronRight,
  Sparkle,
  Sliders,
  SlidersHorizontal,
  Folder,
  Tag,
} from 'lucide-react';
import { FieldInfoModal } from './FieldInfoModal';
import { DragOnlySlider } from './DragOnlySlider';
import { CustomPageForm } from './CustomPageForm';
import { DynamicSchemaModal, DynamicSchemaTab } from './DynamicSchemaModal';
import {
  getStoredMasterTaxonomy,
  MasterTaxonomyData,
  TaxonomyItem,
  getMasterTaxonomySection,
  getMasterTaxonomyCategory,
  getMasterTaxonomyItem,
  getArtistFormCustomOrder,
  getArtistFormLayoutStructure,
  FormTabGroup,
} from '../utils/taxonomyManager';

interface ArtistFormPageProps {
  onCancel: () => void;
  onSave: (artistData: Artist, customPageId?: string | null) => void;
  artistToEdit?: Artist | null;
  schema: DatabaseSchema;
  onAddNewCountry?: (country: CountryOption) => void;
  customPages?: CustomPageEntry[];
  onUpdateSchema?: (updatedSchema: DatabaseSchema) => void;
  onSaveCustomPageDirect?: (entry: CustomPageEntry) => void;
  onOpenDynamicSchema?: (tab?: DynamicSchemaTab) => void;
}

type FormTab = string;

type CharacterSubTab = 'appeal' | 'attributes' | 'specialty';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop',
];

export const ArtistFormPage: React.FC<ArtistFormPageProps> = ({
  onCancel,
  onSave,
  artistToEdit,
  schema,
  onAddNewCountry,
  customPages = [],
  onUpdateSchema,
  onSaveCustomPageDirect,
  onOpenDynamicSchema,
}) => {
  // Master Taxonomy & Layout Sort Order Dynamic Synchronization
  const [masterTaxonomy, setMasterTaxonomy] = useState<MasterTaxonomyData>(() => getStoredMasterTaxonomy());
  const [layoutStructure, setLayoutStructure] = useState<FormTabGroup[]>(() => getArtistFormLayoutStructure());
  const [formOrderMap, setFormOrderMap] = useState<Record<string, number>>(() => getArtistFormCustomOrder());

  // Navigation Tabs State (Dynamic Tab matching layoutStructure)
  const [activeTab, setActiveTab] = useState<FormTab>(() => {
    const struct = getArtistFormLayoutStructure();
    return struct[0]?.id || 'custom_entry';
  });
  const [activeCharacterSubTab, setActiveCharacterSubTab] = useState<CharacterSubTab>('appeal');

  useEffect(() => {
    const handleTaxonomySync = (e: any) => {
      setMasterTaxonomy(e.detail || getStoredMasterTaxonomy());
    };
    const handleOrderSync = (e: any) => {
      if (e.detail?.structure) {
        setLayoutStructure(e.detail.structure);
      } else {
        setLayoutStructure(getArtistFormLayoutStructure());
      }
      setFormOrderMap(e.detail?.orderMap || getArtistFormCustomOrder());
    };

    window.addEventListener('applet:taxonomy_updated', handleTaxonomySync);
    window.addEventListener('applet:form_layout_reordered', handleOrderSync);

    return () => {
      window.removeEventListener('applet:taxonomy_updated', handleTaxonomySync);
      window.removeEventListener('applet:form_layout_reordered', handleOrderSync);
    };
  }, []);

  // Lookup helpers for 4-tier taxonomy item metadata, titles, and descriptions
  const getFieldMeta = (key: string): TaxonomyItem | null => {
    return getMasterTaxonomyItem(key, masterTaxonomy);
  };

  const getFieldLabel = (key: string, fallback: string): string => {
    const meta = getFieldMeta(key);
    return meta?.formLabel || meta?.appLabel || fallback;
  };

  const getFieldDesc = (key: string, fallback: string): string => {
    const meta = getFieldMeta(key);
    return meta?.description || fallback;
  };

  const getSectionTitle = (secKey: string, fallback: string): string => {
    const sec = getMasterTaxonomySection(secKey, masterTaxonomy);
    return sec?.formLabel || sec?.appLabel || fallback;
  };

  const getSectionDesc = (secKey: string, fallback: string): string => {
    const sec = getMasterTaxonomySection(secKey, masterTaxonomy);
    return sec?.description || fallback;
  };

  const getItemOrder = (key: string, id?: string, defaultIdx: number = 0): number => {
    if (id && formOrderMap[id] !== undefined) return formOrderMap[id];
    if (formOrderMap[key] !== undefined) return formOrderMap[key];
    const meta = getFieldMeta(key);
    if (meta) {
      if (formOrderMap[meta.id] !== undefined) return formOrderMap[meta.id];
      if (formOrderMap[meta.systemKey] !== undefined) return formOrderMap[meta.systemKey];
      if (meta.orderIndex !== undefined) return meta.orderIndex;
    }
    return defaultIdx;
  };

  // Form Fields State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [bornDate, setBornDate] = useState('');
  const [debutDate, setDebutDate] = useState('');
  const [heightCm, setHeightCm] = useState<number | string>('');
  const [typeCode, setTypeCode] = useState('');
  const [selectedCustomPageId, setSelectedCustomPageId] = useState<string>('');
  const [links, setLinks] = useState<ArtistLink[]>([]);
  const [notes, setNotes] = useState('');

  // Measurements
  const [measurements, setMeasurements] = useState<{
    cupSize: string;
    bustCm: number | string;
    waistCm: number | string;
    hipCm: number | string;
  }>({
    cupSize: '',
    bustCm: '',
    waistCm: '',
    hipCm: '',
  });

  // Appeal Data
  const [appeal, setAppeal] = useState<Record<string, string>>({
    maturity: '',
    vibe: '',
    style: '',
    bodyShape: '',
  });

  // Artist Status state ('Amatir' | 'Profesional')
  const [artistStatus, setArtistStatus] = useState<string>('Amatir');

  // Structured Attributes dictionary (multi-select: string[])
  const [structuredAttributes, setStructuredAttributes] = useState<Record<string, string[]>>({});

  // Structured Specialty dictionary (multi-select: string[])
  const [structuredSpecialty, setStructuredSpecialty] = useState<Record<string, string[]>>({});

  // Appearance Scores (6 Traits)
  const [appearanceScores, setAppearanceScores] = useState<AppearanceScores>({
    face: 0,
    skin: 0,
    breast: 0,
    butt: 0,
    v: 0,
    thighCalve: 0,
  });

  // Impression Scores (6 Traits)
  const [impressionScores, setImpressionScores] = useState<ImpressionScores>({
    voice: 0,
    expression: 0,
    sexAppeal: 0,
    authenticity: 0,
    chemistry: 0,
    aura: 0,
  });

  // Modals & Sub-actions State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [customCountryName, setCustomCountryName] = useState('');
  const [customCountryCode, setCustomCountryCode] = useState('');

  // Modal Buat Entri Custom Baru
  const [isCreatingCustomPage, setIsCreatingCustomPage] = useState(false);

  // Modal Tambah Opsi Attribute Baru
  const [newOptionModal, setNewOptionModal] = useState<{
    type: 'attribute' | 'specialty';
    categoryKey: string;
    name: string;
    guidelines: string;
  } | null>(null);

  // Field Info Modal (FAQ ? Guidance Modal)
  const [fieldInfoModal, setFieldInfoModal] = useState<{
    key: string;
    itemName?: string;
  } | null>(null);

  // Dynamic Schema & Form Refactor Customization Modal State
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [schemaModalInitialTab, setSchemaModalInitialTab] = useState<DynamicSchemaTab>('appeal');

  // Auto-save form draft so navigating to DynamicSchemaPage doesn't clear in-progress form
  const DRAFT_STORAGE_KEY = `artist_form_draft_${artistToEdit ? artistToEdit.id : 'new'}`;

  const saveCurrentDraft = () => {
    try {
      const draft = {
        firstName,
        lastName,
        avatarUrl,
        country,
        countryCode,
        bornDate,
        debutDate,
        heightCm,
        typeCode,
        artistStatus,
        selectedCustomPageId,
        links,
        notes,
        measurements,
        appeal,
        structuredAttributes,
        structuredSpecialty,
        appearanceScores,
        impressionScores,
        activeTab,
        activeCharacterSubTab,
      };
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Could not save form draft', e);
    }
  };

  // Restore draft if user is returning from Dynamic Schema page
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d && (d.firstName || d.lastName || d.avatarUrl || d.country || d.bornDate)) {
          if (d.firstName !== undefined) setFirstName(d.firstName);
          if (d.lastName !== undefined) setLastName(d.lastName);
          if (d.avatarUrl !== undefined) setAvatarUrl(d.avatarUrl);
          if (d.country !== undefined) setCountry(d.country);
          if (d.countryCode !== undefined) setCountryCode(d.countryCode);
          if (d.bornDate !== undefined) setBornDate(d.bornDate);
          if (d.debutDate !== undefined) setDebutDate(d.debutDate);
          if (d.heightCm !== undefined) setHeightCm(d.heightCm);
          if (d.typeCode !== undefined) setTypeCode(d.typeCode);
          if (d.artistStatus !== undefined) setArtistStatus(d.artistStatus);
          if (d.selectedCustomPageId !== undefined) setSelectedCustomPageId(d.selectedCustomPageId);
          if (d.links) setLinks(d.links);
          if (d.notes !== undefined) setNotes(d.notes);
          if (d.measurements) setMeasurements(d.measurements);
          if (d.appeal) setAppeal(d.appeal);
          if (d.structuredAttributes) setStructuredAttributes(d.structuredAttributes);
          if (d.structuredSpecialty) setStructuredSpecialty(d.structuredSpecialty);
          if (d.appearanceScores) setAppearanceScores(d.appearanceScores);
          if (d.impressionScores) setImpressionScores(d.impressionScores);
          if (d.activeTab) setActiveTab(d.activeTab);
          if (d.activeCharacterSubTab) setActiveCharacterSubTab(d.activeCharacterSubTab);
        }
      }
    } catch (e) {
      console.warn('Could not restore form draft', e);
    }
  }, []);

  const handleOpenSchemaModal = (tab: DynamicSchemaTab = 'appeal') => {
    saveCurrentDraft();
    if (onOpenDynamicSchema) {
      onOpenDynamicSchema(tab);
    } else {
      setSchemaModalInitialTab(tab);
      setIsSchemaModalOpen(true);
    }
  };

  const handleSaveDynamicSchema = (newSchema: DatabaseSchema) => {
    onUpdateSchema?.(newSchema);
    try {
      localStorage.setItem('database_schema_v2', JSON.stringify(newSchema));
      window.dispatchEvent(new CustomEvent('applet:schema_updated', { detail: newSchema }));
    } catch (e) {
      console.error('Error saving dynamic schema', e);
    }
  };

  // Helper lists from schema
  const getAppealCategoryList = () => {
    return (Object.entries(schema.appealCategories || {}) as [string, AppealCategoryDefinition][])
      .map(([key, def], idx) => ({
        key,
        title: def.title,
        icon: def.icon,
        shortDescription: def.shortDescription,
        options: def.options || [],
        sortIdx: getItemOrder(key, undefined, idx),
      }))
      .sort((a, b) => a.sortIdx - b.sortIdx);
  };

  const getAttributeCategoryList = () => {
    return (Object.entries(schema.attributeCategories || {}) as [string, AppealCategoryDefinition][])
      .map(([key, def], idx) => ({
        key,
        title: def.title,
        icon: def.icon,
        shortDescription: def.shortDescription,
        options: def.options || [],
        sortIdx: getItemOrder(key, undefined, idx),
      }))
      .sort((a, b) => a.sortIdx - b.sortIdx);
  };

  const getSpecialtyCategoryList = () => {
    return (Object.entries(schema.specialtyCategories || {}) as [string, AppealCategoryDefinition][])
      .map(([key, def], idx) => ({
        key,
        title: def.title,
        icon: def.icon,
        shortDescription: def.shortDescription,
        options: def.options || [],
        sortIdx: getItemOrder(key, undefined, idx),
      }))
      .sort((a, b) => a.sortIdx - b.sortIdx);
  };

  // Populate data when editing or reset for new creation
  useEffect(() => {
    if (artistToEdit) {
      setFirstName(artistToEdit.firstName || '');
      setLastName(artistToEdit.lastName || '');
      setAvatarUrl(artistToEdit.avatarUrl || '');
      setCountry(artistToEdit.country || '');
      setCountryCode(artistToEdit.countryCode || '');
      setBornDate(artistToEdit.bornDate || '');
      setDebutDate(artistToEdit.debutDate || '');
      setHeightCm(artistToEdit.heightCm || '');
      setTypeCode(artistToEdit.typeCode || '');
      setArtistStatus(artistToEdit.artistStatus || 'Amatir');

      if (artistToEdit.links && artistToEdit.links.length > 0) {
        setLinks(artistToEdit.links);
      } else if (artistToEdit.externalUrl) {
        setLinks([{ id: `link-1`, name: 'Profil Web', url: artistToEdit.externalUrl }]);
      } else {
        setLinks([]);
      }

      setMeasurements({
        cupSize: artistToEdit.measurements?.cupSize || '',
        bustCm: artistToEdit.measurements?.bustCm || '',
        waistCm: artistToEdit.measurements?.waistCm || '',
        hipCm: artistToEdit.measurements?.hipCm || '',
      });

      setAppeal({
        maturity: artistToEdit.appeal?.maturity || '',
        vibe: artistToEdit.appeal?.vibe || '',
        style: artistToEdit.appeal?.style || '',
        bodyShape: artistToEdit.appeal?.bodyShape || '',
      });

      const attrList = getAttributeCategoryList();
      const attrDict: Record<string, string[]> = {};
      attrList.forEach(cat => {
        attrDict[cat.key] = [];
      });
      (artistToEdit.attributes || []).forEach(attr => {
        let placed = false;
        for (const cat of attrList) {
          if (cat.options.some(opt => opt.name === attr || opt.id === attr)) {
            attrDict[cat.key].push(attr);
            placed = true;
            break;
          }
        }
        if (!placed && attrList[0]) {
          attrDict[attrList[0].key].push(attr);
        }
      });
      setStructuredAttributes(attrDict);

      const specList = getSpecialtyCategoryList();
      const specDict: Record<string, string[]> = {};
      specList.forEach(cat => {
        specDict[cat.key] = [];
      });
      (artistToEdit.specialty || []).forEach(spec => {
        let placed = false;
        for (const cat of specList) {
          if (cat.options.some(opt => opt.name === spec || opt.id === spec)) {
            specDict[cat.key].push(spec);
            placed = true;
            break;
          }
        }
        if (!placed && specList[0]) {
          specDict[specList[0].key].push(spec);
        }
      });
      setStructuredSpecialty(specDict);

      setAppearanceScores(
        artistToEdit.appearanceScores || {
          face: 0,
          skin: 0,
          breast: 0,
          butt: 0,
          v: 0,
          thighCalve: 0,
        }
      );
      setImpressionScores(
        artistToEdit.impressionScores || {
          voice: 0,
          expression: 0,
          sexAppeal: 0,
          authenticity: 0,
          chemistry: 0,
          aura: 0,
        }
      );
      setNotes(artistToEdit.notes || '');

      const linkedPage = customPages.find(p => p.linkedArtistId === artistToEdit.id);
      setSelectedCustomPageId(linkedPage ? linkedPage.id : '');
    } else {
      setFirstName('');
      setLastName('');
      setAvatarUrl('');
      setCountry('');
      setCountryCode('');
      setBornDate('');
      setDebutDate('');
      setHeightCm('');
      setTypeCode('');
      setArtistStatus('Amatir');
      setSelectedCustomPageId('');
      setLinks([]);
      setMeasurements({
        cupSize: '',
        bustCm: '',
        waistCm: '',
        hipCm: '',
      });
      setAppeal({
        maturity: '',
        vibe: '',
        style: '',
        bodyShape: '',
      });
      const initialAttrDict: Record<string, string[]> = {};
      getAttributeCategoryList().forEach(cat => {
        initialAttrDict[cat.key] = [];
      });
      setStructuredAttributes(initialAttrDict);

      const initialSpecDict: Record<string, string[]> = {};
      getSpecialtyCategoryList().forEach(cat => {
        initialSpecDict[cat.key] = [];
      });
      setStructuredSpecialty(initialSpecDict);

      setAppearanceScores({
        face: 0,
        skin: 0,
        breast: 0,
        butt: 0,
        v: 0,
        thighCalve: 0,
      });
      setImpressionScores({
        voice: 0,
        expression: 0,
        sexAppeal: 0,
        authenticity: 0,
        chemistry: 0,
        aura: 0,
      });
      setNotes('');
    }
  }, [artistToEdit]);

  // Live Score Calculations
  const calculatedAppearance = useMemo(
    () => calculateAppearanceScore(appearanceScores),
    [appearanceScores]
  );
  const calculatedImpression = useMemo(
    () => calculateImpressionScore(impressionScores),
    [impressionScores]
  );
  const overallRating = useMemo(
    () => calculateOverallRating(calculatedAppearance, calculatedImpression),
    [calculatedAppearance, calculatedImpression]
  );
  const scoreStatus = useMemo(() => getScoreStatus(overallRating), [overallRating]);
  const isSpecialBanner = overallRating >= 90;

  const currentAge = useMemo(() => (bornDate ? calculateAge(bornDate) : null), [bornDate]);
  const ageAtDebut = useMemo(
    () => (bornDate && debutDate ? calculateAgeAtDebut(bornDate, debutDate) : null),
    [bornDate, debutDate]
  );
  const proportionalRating = useMemo(
    () =>
      calculateProportionalRating({
        cupSize: measurements.cupSize,
        bustCm: Number(measurements.bustCm) || 0,
        waistCm: Number(measurements.waistCm) || 0,
        hipCm: Number(measurements.hipCm) || 0,
      }),
    [measurements]
  );

  // Link Handlers
  const handleAddLink = () => {
    setLinks(prev => [
      ...prev,
      { id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, name: '', url: 'https://' },
    ]);
  };

  const handleUpdateLink = (id: string, field: 'name' | 'url', value: string) => {
    setLinks(prev => prev.map(l => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleRemoveLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  // Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Country Creation
  const handleSaveCustomCountry = () => {
    if (customCountryName.trim()) {
      const code = customCountryCode.trim().toUpperCase() || 'UN';
      const newCountry: CountryOption = {
        name: customCountryName.trim(),
        code: code,
      };
      onAddNewCountry?.(newCountry);
      setCountry(newCountry.name);
      setCountryCode(newCountry.code);
      setIsAddingCountry(false);
      setCustomCountryName('');
      setCustomCountryCode('');
    }
  };

  // Attributes Multi-Select Toggle
  const handleToggleAttribute = (categoryKey: string, optionName: string) => {
    setStructuredAttributes(prev => {
      const currentList = prev[categoryKey] || [];
      const exists = currentList.includes(optionName);
      const updatedList = exists
        ? currentList.filter(item => item !== optionName)
        : [...currentList, optionName];
      return {
        ...prev,
        [categoryKey]: updatedList,
      };
    });
  };

  // Specialty Multi-Select Toggle
  const handleToggleSpecialty = (categoryKey: string, optionName: string) => {
    setStructuredSpecialty(prev => {
      const currentList = prev[categoryKey] || [];
      const exists = currentList.includes(optionName);
      const updatedList = exists
        ? currentList.filter(item => item !== optionName)
        : [...currentList, optionName];
      return {
        ...prev,
        [categoryKey]: updatedList,
      };
    });
  };

  // Tambah Opsi Attribute / Specialty Baru
  const handleOpenAddOptionModal = (type: 'attribute' | 'specialty', defaultCategoryKey?: string) => {
    const defaultCat =
      defaultCategoryKey ||
      (type === 'attribute'
        ? getAttributeCategoryList()[0]?.key || 'visual_traits'
        : getSpecialtyCategoryList()[0]?.key || 'signature_acts');
    setNewOptionModal({
      type,
      categoryKey: defaultCat,
      name: '',
      guidelines: '',
    });
  };

  const handleSaveNewOption = () => {
    if (!newOptionModal || !newOptionModal.name.trim()) return;

    const trimmedName = newOptionModal.name.trim();
    const catKey = newOptionModal.categoryKey;
    const newOpt: AppealOptionItem = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      guidelines: newOptionModal.guidelines.trim() || '',
      description: newOptionModal.guidelines.trim() || '',
    };

    if (newOptionModal.type === 'attribute') {
      const updatedSchema: DatabaseSchema = {
        ...schema,
        attributeCategories: {
          ...schema.attributeCategories,
          [catKey]: {
            ...schema.attributeCategories[catKey],
            options: [...(schema.attributeCategories[catKey]?.options || []), newOpt],
          },
        },
      };
      onUpdateSchema?.(updatedSchema);
      try {
        localStorage.setItem('database_schema_v2', JSON.stringify(updatedSchema));
      } catch (e) {
        console.error(e);
      }
      // Automatically select the new option for this artist!
      handleToggleAttribute(catKey, trimmedName);
    } else {
      const updatedSchema: DatabaseSchema = {
        ...schema,
        specialtyCategories: {
          ...schema.specialtyCategories,
          [catKey]: {
            ...schema.specialtyCategories[catKey],
            options: [...(schema.specialtyCategories[catKey]?.options || []), newOpt],
          },
        },
      };
      onUpdateSchema?.(updatedSchema);
      try {
        localStorage.setItem('database_schema_v2', JSON.stringify(updatedSchema));
      } catch (e) {
        console.error(e);
      }
      // Automatically select the new option for this artist!
      handleToggleSpecialty(catKey, trimmedName);
    }

    setNewOptionModal(null);
  };

  // Direct Custom Page Creation Handler
  const handleSaveCreatedCustomPage = (newCustomPage: CustomPageEntry) => {
    onSaveCustomPageDirect?.(newCustomPage);
    setSelectedCustomPageId(newCustomPage.id);
    setIsCreatingCustomPage(false);
  };

  // Form Submit Handler
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const flattenedAttributes: string[] = [];
    Object.keys(structuredAttributes).forEach(k => {
      const arr = structuredAttributes[k];
      if (Array.isArray(arr)) {
        flattenedAttributes.push(...arr);
      }
    });

    const flattenedSpecialty: string[] = [];
    Object.keys(structuredSpecialty).forEach(k => {
      const arr = structuredSpecialty[k];
      if (Array.isArray(arr)) {
        flattenedSpecialty.push(...arr);
      }
    });

    const artistData: Artist = {
      id: artistToEdit ? artistToEdit.id : `artist-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      avatarUrl: avatarUrl.trim() || DEFAULT_AVATARS[0],
      country: country.trim(),
      countryCode: countryCode.trim(),
      bornDate: bornDate.trim(),
      debutDate: debutDate.trim(),
      heightCm: Number(heightCm) || 0,
      typeCode: typeCode.trim(),
      artistStatus: artistStatus.trim() || 'Amatir',
      links: links.filter(l => l.name.trim() || l.url.trim()),
      externalUrl: links.length > 0 ? links[0].url : '',
      measurements: {
        cupSize: measurements.cupSize.trim(),
        bustCm: Number(measurements.bustCm) || 0,
        waistCm: Number(measurements.waistCm) || 0,
        hipCm: Number(measurements.hipCm) || 0,
      },
      appeal: {
        maturity: appeal.maturity || '',
        vibe: appeal.vibe || '',
        style: appeal.style || '',
        bodyShape: appeal.bodyShape || '',
      },
      attributes: flattenedAttributes,
      specialty: flattenedSpecialty,
      appearanceScores: appearanceScores,
      impressionScores: impressionScores,
      notes: notes.trim(),
      createdAt: artistToEdit ? artistToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      // ignore
    }

    onSave(artistData, selectedCustomPageId || null);
  };

  // Tab Item Configuration - Dynamically Bound to Master Taxonomy and Folder System (Icon & Label Only)
  const navTabs = useMemo(() => {
    return layoutStructure.map((group, idx) => {
      let icon: React.ReactNode = <Layers className="w-4 h-4" />;

      if (group.id === 'custom_entry' || group.type === 'system_custom_entry') {
        icon = <Layers className="w-4 h-4" />;
      } else if (group.id === 'folder_biodata' || group.id === 'biodata') {
        icon = <User className="w-4 h-4" />;
      } else if (group.id === 'folder_measurements' || group.id === 'measurements') {
        icon = <Ruler className="w-4 h-4" />;
      } else if (group.id === 'folder_appeal' || group.id === 'character_dimensions') {
        icon = <Sparkle className="w-4 h-4" />;
      } else if (group.id === 'appearance') {
        icon = <Smile className="w-4 h-4" />;
      } else if (group.id === 'impression') {
        icon = <Eye className="w-4 h-4" />;
      } else if (group.type === 'folder') {
        icon = <Folder className="w-4 h-4 text-amber-400" />;
      } else {
        icon = <Tag className="w-4 h-4" />;
      }

      return {
        id: group.id,
        label: group.title,
        icon,
        sortIdx: group.orderIndex ?? idx,
      };
    }).sort((a, b) => a.sortIdx - b.sortIdx);
  }, [layoutStructure]);

  return (
    <div
      className="w-full max-w-5xl mx-auto pb-36 text-stone-100 space-y-4 animate-in fade-in duration-300 min-w-0"
    >
      {/* ========================================================================= */}
      {/* 1. STICKY TOP CONTAINER: PREVIEW PENILAIAN & 3-COLUMN NAVIGATION TABS    */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-30 space-y-2.5 bg-stone-950/95 backdrop-blur-md pt-2 pb-3 border-b border-stone-800 shadow-xl px-1 sm:px-2 rounded-b-2xl">
        {/* Section Preview Penilaian (Center Alignment & High Contrast) */}
        <div
          className={`w-full max-w-4xl mx-auto rounded-2xl p-3 sm:p-4 border transition-all duration-300 ${
            isSpecialBanner
              ? 'bg-[#001f29] border-[#00BCD5]/60 text-cyan-100 shadow-cyan-900/30'
              : 'bg-stone-900 border-stone-800 text-stone-100'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            {/* Overall Rating & Grade (Center / Left) */}
            <div className="flex items-center gap-3.5 justify-center">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-black border shadow-lg shrink-0 ${
                  isSpecialBanner
                    ? 'bg-[#00BCD5] text-stone-950 border-cyan-200'
                    : 'bg-amber-500 text-stone-950 border-amber-300'
                }`}
              >
                <span className="text-xl sm:text-2xl leading-none">{overallRating}</span>
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold mt-0.5">
                  {scoreStatus.grade} TIER
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400 font-bold">
                    PREVIEW PENILAIAN ARTIS
                  </span>
                  <button
                    type="button"
                    onClick={() => setFieldInfoModal({ key: 'overallRating' })}
                    className="p-0.5 text-stone-400 hover:text-amber-400 transition-colors"
                    title="Panduan Overall Rating"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start mt-0.5">
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wide">
                    {scoreStatus.label}
                  </h2>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                      isSpecialBanner
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                        : 'bg-stone-800 text-stone-300 border-stone-700'
                    }`}
                  >
                    {isSpecialBanner ? 'SPECIAL BANNER (#00BCD5)' : 'STANDARD BANNER'}
                  </span>
                </div>
              </div>
            </div>

            {/* Container Pratinjau Nama Artis & Metrics Chips Grid (Center Aligned) */}
            <div className="flex flex-col items-center justify-center gap-2 w-full md:w-auto">
              {/* Pratinjau Nama Artis (Center Alignment di atas pratinjau Usia, Debut, etc) */}
              {[firstName.trim(), lastName.trim()].filter(Boolean).join(' ') ? (
                <div className="text-center w-full">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-amber-400 uppercase font-display truncate">
                    {[firstName.trim(), lastName.trim()].filter(Boolean).join(' ')}
                  </h2>
                </div>
              ) : null}

              {/* Metrics Chips Grid (Center Aligned) */}
              <div className="flex items-center justify-center flex-wrap gap-2 text-xs font-mono">
                <div className="px-2.5 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-1.5">
                  <span className="text-stone-400 text-[10px]">USIA:</span>
                  <span className="font-bold text-white">{currentAge ? `${currentAge} thn` : '-'}</span>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-1.5">
                  <span className="text-stone-400 text-[10px]">DEBUT:</span>
                  <span className="font-bold text-white">{ageAtDebut ? `${ageAtDebut} thn` : '-'}</span>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-1.5">
                  <span className="text-stone-400 text-[10px]">PROPORSI:</span>
                  <span className="font-bold text-emerald-400">{proportionalRating} PTS</span>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-center gap-1.5">
                  <span className="text-cyan-300 text-[10px]">APPEARANCE (60%):</span>
                  <span className="font-bold text-cyan-400">{calculatedAppearance}</span>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-pink-950/50 border border-pink-500/30 flex items-center gap-1.5">
                  <span className="text-pink-300 text-[10px]">IMPRESSION (40%):</span>
                  <span className="font-bold text-pink-400">{calculatedImpression}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigasi Tab Per Section (Desain Ringkas Berbentuk List Compact, Sticky Top & Center Aligned) */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-1.5 p-1 rounded-xl bg-stone-900/90 border border-stone-800/90 backdrop-blur-sm shadow-sm">
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] tracking-wide transition-all border cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm font-black'
                      : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 border-stone-800/80 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="shrink-0 scale-90">{tab.icon}</div>
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FORM TAB CONTENT CONTAINERS                                            */}
      {/* ========================================================================= */}
      <div className="max-w-4xl mx-auto w-full space-y-4">
        {/* ----------------------------------------------------------------------- */}
        {/* TAB 1: ENTRI CUSTOM (Tautan ke Halaman Custom)                          */}
        {/* ----------------------------------------------------------------------- */}
        {(activeTab === 'custom_entry' || activeTab === 'sec_custom_page') && (
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    TAUTKAN KE ENTRI HALAMAN CUSTOM
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Hubungkan artis ini ke entri galeri foto kustom, set photoshoot eksklusif, dan tombol interaktif.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFieldInfoModal({ key: 'custom_entry' })}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Petunjuk Tautan Halaman Custom"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                {/* Fitur Tombol (+) Buat Entri Custom Baru */}
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomPage(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  title="Buat Entri Custom Baru Sekarang"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Buat Entri Custom Baru</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                  PILIH ENTRI HALAMAN CUSTOM UNTUK DITAUTKAN:
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    value={selectedCustomPageId}
                    onChange={e => setSelectedCustomPageId(e.target.value)}
                    className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-100 font-semibold focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                  >
                    <option value="">-- Tanpa Tautan (Belum Ditautkan) --</option>
                    {customPages.map(page => {
                      const isLinkedToAnother =
                        page.linkedArtistId &&
                        page.linkedArtistId !== (artistToEdit?.id || '') &&
                        page.linkedArtistId !== '';
                      return (
                        <option
                          key={page.id}
                          value={page.id}
                          disabled={Boolean(isLinkedToAnother)}
                        >
                          {page.title} {isLinkedToAnother ? ' (Sudah ditautkan artis lain)' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {selectedCustomPageId && (
                    <button
                      type="button"
                      onClick={() => setSelectedCustomPageId('')}
                      className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
                    >
                      Lepas Tautan
                    </button>
                  )}
                </div>
              </div>

              {selectedCustomPageId ? (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-400 uppercase">
                    <Check className="w-4 h-4" />
                    <span>Halaman Custom Berhasil Dipilih</span>
                  </div>
                  <p className="text-stone-300 leading-relaxed">
                    Artis ini akan otomatis terhubung ke halaman <strong>"{customPages.find(p => p.id === selectedCustomPageId)?.title}"</strong>. Tombol navigasi menuju galeri dan tombol interaktif akan tampil di tab Galeri Detail Artis.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 text-stone-400 text-xs flex items-center gap-3">
                  <Layers className="w-5 h-5 text-stone-500 shrink-0" />
                  <span>
                    Belum ada entri custom yang dipilih. Anda dapat memilih dari daftar di atas atau klik tombol <strong>(+) Buat Entri Custom Baru</strong> untuk membuat album dan layout kustom langsung dari sini.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* TAB 2: BIODATA & NOTES (Gabungan Informasi Biodata + Notes)             */}
        {/* ----------------------------------------------------------------------- */}
        {(activeTab === 'biodata' || activeTab === 'folder_biodata') && (
          <div className="space-y-4">
            {/* Card Biodata Utama */}
            <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5 shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      {getSectionTitle('sec_biodata_notes', 'INFORMASI BIODATA ARTIS')}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {getSectionDesc('sec_biodata_notes', 'Identitas panggung, nama lengkap, negara asal, tanggal lahir, dan status karier.')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFieldInfoModal({ key: 'biodata' })}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Petunjuk Biodata"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Grid Form Fields Biodata with Master Taxonomy Dynamic Sorting and Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    key: 'firstName',
                    sortIdx: getItemOrder('firstName', undefined, 0),
                    node: (
                      <div key="firstName">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                            {getFieldLabel('firstName', 'NAMA DEPAN')} <span className="text-amber-400 font-bold">*Wajib</span>:
                          </label>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: 'firstName' })}
                            className="text-stone-500 hover:text-amber-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Yua, Karen, Eimi"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition-colors"
                        />
                      </div>
                    ),
                  },
                  {
                    key: 'lastName',
                    sortIdx: getItemOrder('lastName', undefined, 1),
                    node: (
                      <div key="lastName">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                            {getFieldLabel('lastName', 'NAMA BELAKANG')} (Opsional):
                          </label>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: 'lastName' })}
                            className="text-stone-500 hover:text-amber-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Contoh: Mikami, Kaede, Fukada"
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition-colors"
                        />
                      </div>
                    ),
                  },
                  {
                    key: 'country',
                    sortIdx: getItemOrder('country', undefined, 2),
                    node: (
                      <div key="country" className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                            {getFieldLabel('country', 'NEGARA / ASAL')}:
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsAddingCountry(true)}
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Negara</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFieldInfoModal({ key: 'country' })}
                              className="text-stone-500 hover:text-amber-400"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {!isAddingCountry ? (
                          <select
                            value={country}
                            onChange={e => {
                              const selected = (schema.countries || []).find(c => c.name === e.target.value);
                              setCountry(e.target.value);
                              setCountryCode(selected ? selected.code : '');
                            }}
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 font-semibold focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                          >
                            <option value="">-- Pilih Negara Asal --</option>
                            {(schema.countries || []).map(c => (
                              <option key={c.code} value={c.name}>
                                {getCountryFlag(c.code)} {c.name} ({c.code})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/40 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-400 uppercase">Tambah Negara Baru</span>
                              <button
                                type="button"
                                onClick={() => setIsAddingCountry(false)}
                                className="text-stone-400 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <input
                                type="text"
                                placeholder="Nama Negara (Contoh: South Korea)"
                                value={customCountryName}
                                onChange={e => setCustomCountryName(e.target.value)}
                                className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-white"
                              />
                              <input
                                type="text"
                                maxLength={3}
                                placeholder="Kode ISO (Contoh: KR, JP, ID)"
                                value={customCountryCode}
                                onChange={e => setCustomCountryCode(e.target.value)}
                                className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsAddingCountry(false)}
                                className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveCustomCountry}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold"
                              >
                                Simpan Negara
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'bornDate',
                    sortIdx: getItemOrder('bornDate', undefined, 3),
                    node: (
                      <div key="bornDate">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                            {getFieldLabel('bornDate', 'TANGGAL LAHIR')}:
                          </label>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: 'bornDate' })}
                            className="text-stone-500 hover:text-amber-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="date"
                          value={bornDate}
                          onChange={e => setBornDate(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 font-semibold focus:outline-none focus:border-amber-400"
                        />
                        {currentAge !== null && (
                          <span className="text-[11px] font-mono text-amber-400 font-bold mt-1 block">
                            Usia saat ini: {currentAge} Tahun
                          </span>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'debutDate',
                    sortIdx: getItemOrder('debutDate', undefined, 4),
                    node: (
                      <div key="debutDate">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                            {getFieldLabel('debutDate', 'TANGGAL DEBUT')}:
                          </label>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: 'debutDate' })}
                            className="text-stone-500 hover:text-amber-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="date"
                          value={debutDate}
                          onChange={e => setDebutDate(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 font-semibold focus:outline-none focus:border-amber-400"
                        />
                        {ageAtDebut !== null && (
                          <span className="text-[11px] font-mono text-amber-400 font-bold mt-1 block">
                            Usia saat debut: {ageAtDebut} Tahun
                          </span>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'heightCm',
                    sortIdx: getItemOrder('heightCm', undefined, 5),
                    node: (
                      <div key="heightCm">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                            {getFieldLabel('heightCm', 'TINGGI BADAN (CM)')}:
                          </label>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: 'heightCm' })}
                            className="text-stone-500 hover:text-amber-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="number"
                          min={100}
                          max={220}
                          placeholder="Contoh: 162"
                          value={heightCm}
                          onChange={e => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                          className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    ),
                  },
                  {
                    key: 'typeCode',
                    sortIdx: getItemOrder('typeCode', undefined, 6),
                    node: (
                      <div key="typeCode">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                            {getFieldLabel('typeCode', 'TIPE TUBUH (BODY TYPE)')}:
                          </label>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: 'typeCode' })}
                            className="text-stone-500 hover:text-amber-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <select
                          value={typeCode}
                          onChange={e => setTypeCode(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="">-- Pilih Tipe Tubuh (Body Type) --</option>
                          {(schema.artistTypes || (schema as any).types || []).map((t: any) => {
                            const info = getTypeInfo(t.code);
                            const indoText = info.indonesia ? info.indonesia.toUpperCase() : '';
                            const engText = info.english ? info.english : (t.label || '');
                            return (
                              <option key={t.code} value={t.code}>
                                {t.code} - {indoText ? `${indoText} (${engText})` : t.label || t.code}
                              </option>
                            );
                          })}
                        </select>

                        {/* Keterangan Terjemahan Bahasa Indonesia & Detail Singkatan */}
                        {typeCode && (
                          <div className="mt-2 p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-amber-400">Kode: {typeCode}</span>
                              <span className="text-[11px] text-stone-400">
                                Arti / Bahasa Indonesia: <strong className="text-white capitalize">{getTypeInfo(typeCode).indonesia || '-'}</strong>
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400">
                              Istilah Asli: <span className="text-stone-300 capitalize">{getTypeInfo(typeCode).english || '-'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'artistStatus',
                    sortIdx: getItemOrder('artistStatus', undefined, 7),
                    node: (
                      <div key="artistStatus" className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                            {getFieldLabel('artistStatus', 'STATUS ARTIS')}:
                          </label>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: 'artistStatus' })}
                            className="text-stone-500 hover:text-amber-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {['Amatir', 'Profesional'].map(st => {
                            const isSel = artistStatus === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setArtistStatus(st)}
                                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                  isSel
                                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                                    : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                                }`}
                              >
                                {st === 'Amatir' ? 'Amatir (Independen)' : 'Profesional (Resmi)'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'avatarUrl',
                    sortIdx: getItemOrder('avatarUrl', undefined, 8),
                    node: (
                      <div key="avatarUrl" className="sm:col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                            {getFieldLabel('avatarUrl', 'FOTO PROFIL / AVATAR')}:
                          </label>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: 'avatarUrl' })}
                            className="text-stone-500 hover:text-amber-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {/* Avatar Preview */}
                          <div className="w-20 h-20 rounded-2xl bg-stone-950 border border-stone-700 overflow-hidden shrink-0 shadow-md">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={e => {
                                  (e.target as HTMLImageElement).src = DEFAULT_AVATARS[0];
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-600">
                                <ImageIcon className="w-8 h-8" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 w-full space-y-2">
                            <input
                              type="url"
                              placeholder="Tempel URL Foto Profil (https://...)"
                              value={avatarUrl}
                              onChange={e => setAvatarUrl(e.target.value)}
                              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                            />
                            {/* Preset Avatars */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                              <span className="text-[10px] text-stone-500 font-bold shrink-0">Preset:</span>
                              {DEFAULT_AVATARS.map((p, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setAvatarUrl(p)}
                                  className={`w-7 h-7 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                                    avatarUrl === p
                                      ? 'border-amber-400 scale-110'
                                      : 'border-stone-800 hover:border-stone-600 opacity-60 hover:opacity-100'
                                  }`}
                                >
                                  <img src={p} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-amber-400" />
                                <span>Unggah dari Perangkat</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]
                  .sort((a, b) => a.sortIdx - b.sortIdx)
                  .map(item => item.node)}
              </div>
            </div>

            {/* Card Daftar Tautan / External Links */}
            <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    DAFTAR TAUTAN & SOSIAL MEDIA ({links.length})
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFieldInfoModal({ key: 'links' })}
                    className="p-1 text-stone-500 hover:text-white"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Link</span>
                  </button>
                </div>
              </div>

              {links.length === 0 ? (
                <p className="text-xs text-stone-400 italic">
                  Belum ada tautan ditambahkan. Klik tombol di atas untuk menambah tautan resmi.
                </p>
              ) : (
                <div className="space-y-2">
                  {links.map((link, idx) => (
                    <div
                      key={link.id}
                      className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                    >
                      <span className="w-6 h-6 rounded-full bg-stone-800 text-stone-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Nama Label (Contoh: Instagram, X, Portfolio)"
                        value={link.name}
                        onChange={e => handleUpdateLink(link.id, 'name', e.target.value)}
                        className="w-full sm:w-1/3 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                      />
                      <input
                        type="url"
                        placeholder="URL Lengkap (https://...)"
                        value={link.url}
                        onChange={e => handleUpdateLink(link.id, 'url', e.target.value)}
                        className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.id)}
                        className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-white border border-rose-800/60 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card Notes (Catatan Kurator / Ringkasan Evaluasi) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    CATATAN KURATOR / RINGKASAN EVALUASI (NOTES)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setFieldInfoModal({ key: 'notes' })}
                  className="p-1 text-stone-500 hover:text-white"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              <textarea
                rows={4}
                placeholder="Tuliskan catatan evaluasi lengkap, sorotan khusus, rekam jejak, atau keunggulan performa artis ini..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* TAB 3: MEASUREMENTS (Ukuran Tubuh & Proporsi)                           */}
        {/* ----------------------------------------------------------------------- */}
        {(activeTab === 'measurements' || activeTab === 'folder_measurements') && (
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    {getSectionTitle('sec_measurements', 'MEASUREMENTS (UKURAN TUBUH)')}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {getSectionDesc('sec_measurements', 'Data lingkar tubuh (Cup, Bust, Waist, Hip) untuk kalkulasi indeks proporsi tubuh (Proportional Rating).')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFieldInfoModal({ key: 'measurements' })}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Petunjuk Measurements"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Proportional Rating Live Card */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-stone-950 font-black flex items-center justify-center text-lg">
                  {proportionalRating}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                    PROPORTIONAL RATING
                  </span>
                  <span className="text-xs text-stone-300 font-semibold">
                    Keseimbangan Golden Ratio (Waist-to-Hip & Bust-to-Waist)
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-300 font-bold">
                Skala: 60 - 99 PTS
              </span>
            </div>

            {/* Inputs Grid with Dynamic Sorting and Master Taxonomy Labels */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  key: 'cupSize',
                  defaultLabel: 'CUP SIZE',
                  sortIdx: getItemOrder('cupSize', undefined, 0),
                  node: (
                    <div key="cupSize">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                          {getFieldLabel('cupSize', 'CUP SIZE')}:
                        </label>
                        <button
                          type="button"
                          onClick={() => setFieldInfoModal({ key: 'cupSize' })}
                          className="text-stone-500 hover:text-amber-400"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <select
                        value={measurements.cupSize}
                        onChange={e => setMeasurements(prev => ({ ...prev, cupSize: e.target.value }))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="">-- Pilih Cup --</option>
                        {(schema.cupSizes || []).map(c => (
                          <option key={c} value={c}>
                            Cup {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  ),
                },
                {
                  key: 'bustCm',
                  defaultLabel: 'BUST (CM)',
                  sortIdx: getItemOrder('bustCm', undefined, 1),
                  node: (
                    <div key="bustCm">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                          {getFieldLabel('bustCm', 'BUST (CM)')}:
                        </label>
                        <button
                          type="button"
                          onClick={() => setFieldInfoModal({ key: 'bustCm' })}
                          className="text-stone-500 hover:text-amber-400"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="number"
                        placeholder="Contoh: 88"
                        value={measurements.bustCm}
                        onChange={e =>
                          setMeasurements(prev => ({
                            ...prev,
                            bustCm: e.target.value ? Number(e.target.value) : '',
                          }))
                        }
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ),
                },
                {
                  key: 'waistCm',
                  defaultLabel: 'WAIST (CM)',
                  sortIdx: getItemOrder('waistCm', undefined, 2),
                  node: (
                    <div key="waistCm">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                          {getFieldLabel('waistCm', 'WAIST (CM)')}:
                        </label>
                        <button
                          type="button"
                          onClick={() => setFieldInfoModal({ key: 'waistCm' })}
                          className="text-stone-500 hover:text-amber-400"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="number"
                        placeholder="Contoh: 58"
                        value={measurements.waistCm}
                        onChange={e =>
                          setMeasurements(prev => ({
                            ...prev,
                            waistCm: e.target.value ? Number(e.target.value) : '',
                          }))
                        }
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ),
                },
                {
                  key: 'hipCm',
                  defaultLabel: 'HIP (CM)',
                  sortIdx: getItemOrder('hipCm', undefined, 3),
                  node: (
                    <div key="hipCm">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                          {getFieldLabel('hipCm', 'HIP (CM)')}:
                        </label>
                        <button
                          type="button"
                          onClick={() => setFieldInfoModal({ key: 'hipCm' })}
                          className="text-stone-500 hover:text-amber-400"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="number"
                        placeholder="Contoh: 89"
                        value={measurements.hipCm}
                        onChange={e =>
                          setMeasurements(prev => ({
                            ...prev,
                            hipCm: e.target.value ? Number(e.target.value) : '',
                          }))
                        }
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ),
                },
              ]
                .sort((a, b) => a.sortIdx - b.sortIdx)
                .map(item => item.node)}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* TAB 4: DIMENSI KARAKTER (Sub-tabs: APPEAL, ATTRIBUTES, SPECIALTY)      */}
        {/* ----------------------------------------------------------------------- */}
        {(activeTab === 'character_dimensions' || activeTab === 'folder_appeal') && (
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5 shadow-xl animate-in fade-in duration-200">
            {/* Header & Sub-Tab Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    DIMENSI KARAKTER TALENTA
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Pilih parameter pesona, karakteristik visual/performa, dan keahlian signature artis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Sub-Tab Buttons with dynamic labels */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-stone-950 border border-stone-800">
                  {(
                    [
                      { id: 'appeal', label: schema?.sectionTitles?.appeal || 'APPEAL' },
                      { id: 'attributes', label: schema?.sectionTitles?.attributes || 'ATTRIBUTES' },
                      { id: 'specialty', label: schema?.sectionTitles?.specialty || 'SPECIALTY' },
                    ] as { id: CharacterSubTab; label: string }[]
                  ).map(sub => {
                    const isSubActive = activeCharacterSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setActiveCharacterSubTab(sub.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                          isSubActive
                            ? 'bg-amber-500 text-stone-950 shadow-sm'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tombol Kustomisasi Skema untuk Karakter */}
                <button
                  type="button"
                  onClick={() => handleOpenSchemaModal(activeCharacterSubTab)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-850 text-stone-300 hover:text-amber-400 border border-stone-800 text-xs font-bold transition-all cursor-pointer shrink-0"
                  title="Kustomisasi Skema & Opsi (Dynamic Schema)"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Kustomisasi</span>
                </button>
              </div>
            </div>

            {/* Sub-Tab 1: APPEAL */}
            {activeCharacterSubTab === 'appeal' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getAppealCategoryList().map(cat => {
                    const selectedVal = appeal[cat.key];
                    const selectedOpt = (cat.options || []).find(o => o.name === selectedVal);

                    return (
                      <div key={cat.key} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            {cat.title}:
                          </label>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: cat.key })}
                            className="text-stone-500 hover:text-amber-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <select
                          value={appeal[cat.key] || ''}
                          onChange={e => setAppeal(prev => ({ ...prev, [cat.key]: e.target.value }))}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="">-- Pilih {cat.title} --</option>
                          {(cat.options || []).map(opt => (
                            <option key={opt.name} value={opt.name}>
                              {opt.name}
                            </option>
                          ))}
                        </select>

                        {/* Deskripsi Dinamis: Muncul otomatis saat opsi dipilih */}
                        {selectedOpt ? (
                          <div className="p-2.5 rounded-lg bg-stone-900 border border-amber-500/30 text-[11px] text-stone-300 flex items-start gap-1.5 animate-in fade-in">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="leading-tight">
                              <span className="font-bold text-amber-400 mr-1.5">{selectedOpt.name}:</span>
                              <span>{selectedOpt.description || selectedOpt.guidelines || 'Kriteria kualitatif terpasang.'}</span>
                            </div>
                          </div>
                        ) : cat.shortDescription ? (
                          <div className="p-2 rounded-lg bg-stone-900/40 border border-stone-850 text-[11px] text-stone-400 italic leading-tight">
                            {cat.shortDescription}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-Tab 2: ATTRIBUTES (Multi-Select per Category + (+) Tombol Buat Opsi Baru) */}
            {activeCharacterSubTab === 'attributes' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    KATEGORI {schema?.sectionTitles?.attributes || 'ATTRIBUTES'} (MULTI-SELECT)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAddOptionModal('attribute')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Opsi Attribute Baru</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {getAttributeCategoryList().map(cat => {
                    const selectedArr = structuredAttributes[cat.key] || [];
                    const lastSelectedName = selectedArr[selectedArr.length - 1];
                    const lastSelectedOpt = (cat.options || []).find(o => o.name === lastSelectedName);

                    return (
                      <div key={cat.key} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                              {cat.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenAddOptionModal('attribute', cat.key)}
                              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>(+) Opsi Kategori Ini</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFieldInfoModal({ key: cat.key })}
                              className="text-stone-500 hover:text-amber-400"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(cat.options || []).map(opt => {
                            const isSelected = selectedArr.includes(opt.name);
                            return (
                              <button
                                key={opt.name}
                                type="button"
                                onClick={() => handleToggleAttribute(cat.key, opt.name)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-cyan-500 text-stone-950 border-cyan-400 shadow-md'
                                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                <span>{opt.name}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Deskripsi Dinamis untuk Attribute yang aktif */}
                        {lastSelectedOpt ? (
                          <div className="p-2.5 rounded-lg bg-stone-900 border border-cyan-500/30 text-[11px] text-stone-300 flex items-start gap-1.5 animate-in fade-in">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <div className="leading-tight">
                              <span className="font-bold text-cyan-400 mr-1.5">{lastSelectedOpt.name}:</span>
                              <span>{lastSelectedOpt.description || lastSelectedOpt.guidelines || 'Karakteristik aktif.'}</span>
                            </div>
                          </div>
                        ) : cat.shortDescription ? (
                          <div className="p-2 rounded-lg bg-stone-900/40 border border-stone-850 text-[11px] text-stone-400 italic leading-tight">
                            {cat.shortDescription}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-Tab 3: SPECIALTY (Multi-Select per Category + (+) Tombol Buat Opsi Baru) */}
            {activeCharacterSubTab === 'specialty' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    KATEGORI {schema?.sectionTitles?.specialty || 'SPECIALTY'} (MULTI-SELECT)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAddOptionModal('specialty')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Opsi Specialty Baru</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {getSpecialtyCategoryList().map(cat => {
                    const selectedArr = structuredSpecialty[cat.key] || [];
                    const lastSelectedName = selectedArr[selectedArr.length - 1];
                    const lastSelectedOpt = (cat.options || []).find(o => o.name === lastSelectedName);

                    return (
                      <div key={cat.key} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-pink-400" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                              {cat.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenAddOptionModal('specialty', cat.key)}
                              className="text-[10px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>(+) Opsi Kategori Ini</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFieldInfoModal({ key: cat.key })}
                              className="text-stone-500 hover:text-amber-400"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(cat.options || []).map(opt => {
                            const isSelected = selectedArr.includes(opt.name);
                            return (
                              <button
                                key={opt.name}
                                type="button"
                                onClick={() => handleToggleSpecialty(cat.key, opt.name)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-pink-500 text-stone-950 border-pink-400 shadow-md'
                                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                <span>{opt.name}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Deskripsi Dinamis untuk Specialty yang aktif */}
                        {lastSelectedOpt ? (
                          <div className="p-2.5 rounded-lg bg-stone-900 border border-pink-500/30 text-[11px] text-stone-300 flex items-start gap-1.5 animate-in fade-in">
                            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                            <div className="leading-tight">
                              <span className="font-bold text-pink-400 mr-1.5">{lastSelectedOpt.name}:</span>
                              <span>{lastSelectedOpt.description || lastSelectedOpt.guidelines || 'Keahlian khusus aktif.'}</span>
                            </div>
                          </div>
                        ) : cat.shortDescription ? (
                          <div className="p-2 rounded-lg bg-stone-900/40 border border-stone-850 text-[11px] text-stone-400 italic leading-tight">
                            {cat.shortDescription}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* TAB 5: APPEARANCE (6 Protected Sliders: Face, Skin, Breast, Butt, V, Thigh) */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'appearance' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    {schema?.sectionTitles?.appearance ? `${schema.sectionTitles.appearance.toUpperCase()} SCORING (60% BOBOT OVERALL)` : getSectionTitle('sec_appearance_scoring', 'APPEARANCE SCORING (60% BOBOT OVERALL)')}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {getSectionDesc('sec_appearance_scoring', 'Evaluasi 6 dimensi fisik visual (0–99). Geser titik bulat slider untuk mengubah nilai (Protected Drag-Only).')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs">
                  Skor: {calculatedAppearance}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenSchemaModal('appearance')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-cyan-400 border border-stone-800 text-xs font-bold transition-all cursor-pointer"
                  title="Kustomisasi Trait & Parameter Appearance"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Kustomisasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFieldInfoModal({ key: 'appearanceScore' })}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Petunjuk Appearance"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 6 Appearance Sliders with DragOnlySlider protection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  { key: 'face', label: 'Face / Wajah', desc: 'Struktur wajah, mata, bibir, senyuman, daya tarik' },
                  { key: 'skin', label: 'Skin / Kulit', desc: 'Kemulusan, kecerahan, tekstur, higienitas' },
                  { key: 'breast', label: 'Breast / Payudara', desc: 'Bentuk, kekenyalan, posisi, simetri' },
                  { key: 'butt', label: 'Butt / Pinggul & Pantat', desc: 'Ketegangan, kelengkungan, proporsi gluteus' },
                  { key: 'v', label: 'V / Area Intim', desc: 'Kerapian estetika, kebersihan, tone' },
                  { key: 'thighCalve', label: 'Thigh & Calve / Kaki', desc: 'Kencang, garis kaki, jenjang, proporsional' },
                ] as { key: keyof AppearanceScores; label: string; desc: string }[]
              )
                .map((item, idx) => ({
                  ...item,
                  dynamicLabel: getFieldLabel(item.key, item.label),
                  dynamicDesc: getFieldDesc(item.key, item.desc),
                  sortOrder: getItemOrder(item.key, undefined, idx),
                }))
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(item => {
                  const val = appearanceScores[item.key] || 0;
                  const status = getScoreStatus(val);
                  return (
                    <div key={item.key} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white uppercase">{item.dynamicLabel}</span>
                          <p className="text-[10px] text-stone-400">{item.dynamicDesc}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${status.bgColor} ${status.color} ${status.borderColor}`}
                          >
                            {status.label}
                          </span>
                          <span className="font-mono font-bold text-sm text-cyan-400 w-7 text-right">
                            {val}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: item.key })}
                            className="text-stone-500 hover:text-cyan-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <DragOnlySlider
                        value={val}
                        min={0}
                        max={99}
                        onChange={newVal =>
                          setAppearanceScores(prev => ({ ...prev, [item.key]: newVal }))
                        }
                        accentColor="cyan"
                        ariaLabel={item.dynamicLabel}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* TAB 6: IMPRESSION (6 Protected Sliders: Voice, Expression, Sex Appeal, ...) */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'impression' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    {schema?.sectionTitles?.impression ? `${schema.sectionTitles.impression.toUpperCase()} SCORING (40% BOBOT OVERALL)` : getSectionTitle('sec_impression_scoring', 'IMPRESSION SCORING (40% BOBOT OVERALL)')}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {getSectionDesc('sec_impression_scoring', 'Evaluasi 6 dimensi performa, vokal, dan aura (0–99). Geser titik bulat slider untuk mengubah nilai (Protected Drag-Only).')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-pink-950 border border-pink-500/40 text-pink-300 font-mono font-bold text-xs">
                  Skor: {calculatedImpression}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenSchemaModal('impression')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-pink-400 border border-stone-800 text-xs font-bold transition-all cursor-pointer"
                  title="Kustomisasi Trait & Parameter Impression"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
                  <span className="hidden sm:inline">Kustomisasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFieldInfoModal({ key: 'impressionScore' })}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Petunjuk Impression"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 6 Impression Sliders with DragOnlySlider protection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  { key: 'voice', label: 'Voice / Vokal & Suara', desc: 'Desahan, intonasi, kejelasan suara' },
                  { key: 'expression', label: 'Expression / Ekspresi', desc: 'Mimik wajah, kontak mata, penghayatan' },
                  { key: 'sexAppeal', label: 'Sex Appeal / Daya Tarik', desc: 'Sensualitas alami, karisma menggoda' },
                  { key: 'authenticity', label: 'Authenticity / Keaslian', desc: 'Spontanitas, ketulusan reaksi' },
                  { key: 'chemistry', label: 'Chemistry / Kerjasama', desc: 'Sinkronisasi lawan main, respon panggung' },
                  { key: 'aura', label: 'Aura / Kehadiran Panggung', desc: 'Pesona dominan, impresi bintang' },
                ] as { key: keyof ImpressionScores; label: string; desc: string }[]
              )
                .map((item, idx) => ({
                  ...item,
                  dynamicLabel: getFieldLabel(item.key, item.label),
                  dynamicDesc: getFieldDesc(item.key, item.desc),
                  sortOrder: getItemOrder(item.key, undefined, idx),
                }))
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(item => {
                  const val = impressionScores[item.key] || 0;
                  const status = getScoreStatus(val);
                  return (
                    <div key={item.key} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white uppercase">{item.dynamicLabel}</span>
                          <p className="text-[10px] text-stone-400">{item.dynamicDesc}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${status.bgColor} ${status.color} ${status.borderColor}`}
                          >
                            {status.label}
                          </span>
                          <span className="font-mono font-bold text-sm text-pink-400 w-7 text-right">
                            {val}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFieldInfoModal({ key: item.key })}
                            className="text-stone-500 hover:text-pink-400"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <DragOnlySlider
                        value={val}
                        min={0}
                        max={99}
                        onChange={newVal =>
                          setImpressionScores(prev => ({ ...prev, [item.key]: newVal }))
                        }
                        accentColor="pink"
                        ariaLabel={item.dynamicLabel}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* FALLBACK: CUSTOM FOLDER / CUSTOM STANDALONE TAB CONTENT                 */}
        {/* ----------------------------------------------------------------------- */}
        {!['custom_entry', 'sec_custom_page', 'biodata', 'folder_biodata', 'measurements', 'folder_measurements', 'character_dimensions', 'folder_appeal', 'appearance', 'impression'].includes(activeTab) && (
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    {layoutStructure.find(g => g.id === activeTab)?.title || 'TAB KUSTOM'}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Field dan parameter yang dikelompokkan ke dalam folder/tab ini.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 text-xs text-stone-300 space-y-2">
              <p className="font-bold text-stone-200">
                Item dalam Tab ini ({layoutStructure.find(g => g.id === activeTab)?.fieldKeys.length || 0} Field):
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(layoutStructure.find(g => g.id === activeTab)?.fieldKeys || []).map(fk => (
                  <span key={fk} className="px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 font-mono text-xs">
                    {fk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. FIXED FLOATING BOTTOM ACTION BAR (Batal & Simpan Entri)                 */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[calc(100%-1.5rem)] sm:w-full px-4 sm:px-6 py-3 rounded-2xl bg-stone-950/95 border border-stone-800 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
        {/* Left Side: Status Info & Non-Intrusive Schema Editor Button */}
        <div className="flex items-center gap-2.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <div className="hidden sm:block">
            <span className="font-bold text-stone-300 uppercase font-mono">
              {artistToEdit ? 'Mode Edit Artis' : 'Mode Entri Baru'}:
            </span>{' '}
            <span className="font-bold text-white truncate max-w-[140px] md:max-w-xs">
              {firstName || 'Artis Tanpa Nama'} {lastName}
            </span>
          </div>

          {/* Tombol Akses Dynamic Schema (Disesuaikan agar tidak mengganggu entri/simpan) */}
          <button
            type="button"
            onClick={() => handleOpenSchemaModal(activeCharacterSubTab || 'appeal')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-700/80 text-xs font-bold transition-all shadow-sm cursor-pointer ml-0 sm:ml-1"
            title="Kustomisasi Skema Dinamis (APPEAL, ATTRIBUTES, SPECIALTY, APPEARANCE, IMPRESSION)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Kustomisasi Skema</span>
            <span className="md:hidden">Skema</span>
          </button>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Batal</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-102 active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Entri</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS (FieldInfo, Add Custom Page, Add Option)                       */}
      {/* ========================================================================= */}

      {/* FAQ (?) Guidance Modal */}
      {fieldInfoModal && (
        <FieldInfoModal
          isOpen={true}
          fieldKey={fieldInfoModal.key}
          itemName={fieldInfoModal.itemName}
          schema={schema}
          isEditorMode={true}
          onClose={() => setFieldInfoModal(null)}
        />
      )}

      {/* Modal Buat Entri Custom Baru */}
      {isCreatingCustomPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CustomPageForm
              onCancel={() => setIsCreatingCustomPage(false)}
              onSave={handleSaveCreatedCustomPage}
              entryToEdit={null}
              artists={artistToEdit ? [artistToEdit] : []}
              customPages={customPages}
            />
          </div>
        </div>
      )}

      {/* Modal Tambah Opsi Attribute / Specialty Baru */}
      {newOptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl p-5 sm:p-6 text-stone-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-white uppercase">
                  TAMBAH OPSI {newOptionModal.type.toUpperCase()} BARU
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewOptionModal(null)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1">
                  NAMA OPSI <span className="text-amber-400 font-bold">*Wajib</span>:
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Contoh: Dimples, Twin Tail, Pole Dancing, dsb."
                  value={newOptionModal.name}
                  onChange={e =>
                    setNewOptionModal(prev => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1">
                  KATEGORI OPSI:
                </label>
                <select
                  value={newOptionModal.categoryKey}
                  onChange={e =>
                    setNewOptionModal(prev =>
                      prev ? { ...prev, categoryKey: e.target.value } : null
                    )
                  }
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {(newOptionModal.type === 'attribute'
                    ? getAttributeCategoryList()
                    : getSpecialtyCategoryList()
                  ).map(cat => (
                    <option key={cat.key} value={cat.key}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1">
                  DESKRIPSI / PANDUAN (Opsional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat mengenai kriteria pilihan ini..."
                  value={newOptionModal.guidelines}
                  onChange={e =>
                    setNewOptionModal(prev =>
                      prev ? { ...prev, guidelines: e.target.value } : null
                    )
                  }
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setNewOptionModal(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewOption}
                disabled={!newOptionModal.name.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  newOptionModal.name.trim()
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                }`}
              >
                Tambah & Pilih Opsi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Schema & Form Refactor Customization Modal */}
      <DynamicSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        schema={schema}
        onSaveSchema={handleSaveDynamicSchema}
        initialTab={schemaModalInitialTab}
      />
    </div>
  );
};
