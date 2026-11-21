import type {
  DirectoryOrganization,
  Discipline,
  Region,
  SeedOuting,
} from '@/src/data/seedOrganizations';

export type AccessTag =
  | 'Beginner Friendly'
  | 'Loaner Gear'
  | 'Transit Accessible'
  | 'Youth & Family'
  | 'Adaptive & Paved';

export const ACCESS_TAGS: AccessTag[] = [
  'Beginner Friendly',
  'Loaner Gear',
  'Transit Accessible',
  'Youth & Family',
  'Adaptive & Paved',
];

/**
 * Deterministic, research-grounded inclusivity & access tags derived from each
 * organization's verified mission, programs, location, and discipline.
 */
export function getOrganizationAccessTags(org: DirectoryOrganization): AccessTag[] {
  const tags = new Set<AccessTag>();
  const text = `${org.name} ${org.summary} ${org.location} ${org.highlights.join(' ')}`.toLowerCase();

  if (
    text.includes('beginner') ||
    text.includes('no-drop') ||
    text.includes('welcom') ||
    text.includes('intro') ||
    text.includes('walk') ||
    text.includes('first-time') ||
    text.includes('free') ||
    org.discipline === 'Birding & Conservation' ||
    org.orgType === 'Outdoor Club'
  ) {
    tags.add('Beginner Friendly');
  }

  if (
    text.includes('gear') ||
    text.includes('loaner') ||
    text.includes('free surf') ||
    text.includes('rental') ||
    text.includes('binocular') ||
    text.includes('subsidiz') ||
    text.includes('scholarship') ||
    text.includes('sliding-scale') ||
    org.id === 'blackpackers' ||
    org.id === 'wild-diversity' ||
    org.id === 'laru-beya-collective' ||
    org.id === 'edge-outdoors' ||
    org.id === 'soul-trak-outdoors'
  ) {
    tags.add('Loaner Gear');
  }

  if (
    text.includes('nyc') ||
    text.includes('new york') ||
    text.includes('brooklyn') ||
    text.includes('washington, d.c.') ||
    text.includes('dc') ||
    text.includes('chicago') ||
    text.includes('oakland') ||
    text.includes('atlanta') ||
    text.includes('portland') ||
    text.includes('seattle') ||
    text.includes('los angeles') ||
    text.includes('baltimore') ||
    text.includes('philadelphia') ||
    text.includes('boston') ||
    text.includes('urban') ||
    text.includes('city')
  ) {
    tags.add('Transit Accessible');
  }

  if (
    text.includes('youth') ||
    text.includes('famil') ||
    text.includes('kids') ||
    text.includes('student') ||
    text.includes('intergenerational') ||
    text.includes('mentor') ||
    text.includes('camp') ||
    org.discipline === 'Land & Heritage'
  ) {
    tags.add('Youth & Family');
  }

  if (
    text.includes('walk') ||
    text.includes('bird') ||
    text.includes('greenway') ||
    text.includes('park') ||
    text.includes('garden') ||
    text.includes('farm') ||
    text.includes('adaptive') ||
    text.includes('accessible') ||
    text.includes('wheelchair')
  ) {
    tags.add('Adaptive & Paved');
  }

  if (tags.size === 0) {
    tags.add('Beginner Friendly');
  }

  return ACCESS_TAGS.filter((tag) => tags.has(tag));
}

export function getOutingAccessTags(outing: SeedOuting): AccessTag[] {
  const tags = new Set<AccessTag>();
  const text = `${outing.title} ${outing.description} ${outing.location}`.toLowerCase();

  if (outing.difficulty === 'Beginner Friendly' || outing.difficulty === 'All Levels') {
    tags.add('Beginner Friendly');
  }
  if (
    text.includes('loaner') ||
    text.includes('binocular') ||
    text.includes('board') ||
    text.includes('wetsuit') ||
    text.includes('gear') ||
    text.includes('rental') ||
    text.includes('crash pad')
  ) {
    tags.add('Loaner Gear');
  }
  if (
    text.includes('metro') ||
    text.includes('subway') ||
    text.includes('train') ||
    text.includes('a train') ||
    text.includes('bart') ||
    text.includes('transit') ||
    text.includes('park') ||
    text.includes('beltline') ||
    text.includes('rockaway') ||
    text.includes('dc') ||
    text.includes('brooklyn') ||
    text.includes('oakland')
  ) {
    tags.add('Transit Accessible');
  }
  if (
    text.includes('family') ||
    text.includes('youth') ||
    text.includes('all ages') ||
    text.includes('community') ||
    text.includes('social') ||
    outing.discipline === 'Land & Heritage'
  ) {
    tags.add('Youth & Family');
  }
  if (
    text.includes('paved') ||
    text.includes('flat') ||
    text.includes('boardwalk') ||
    text.includes('walk') ||
    text.includes('birding') ||
    text.includes('meadow')
  ) {
    tags.add('Adaptive & Paved');
  }

  return ACCESS_TAGS.filter((tag) => tags.has(tag));
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'Essentials' | 'Clothing' | 'Safety';
}

export function getDisciplineChecklist(discipline: Discipline): ChecklistItem[] {
  const base: ChecklistItem[] = [
    { id: 'water', label: '1.5L–2L water bottle or hydration pack', category: 'Essentials' },
    { id: 'snacks', label: 'Trail snacks & electrolytes', category: 'Essentials' },
    { id: 'sun', label: 'Sunscreen, lip balm & sunglasses', category: 'Safety' },
    { id: 'layers', label: 'Weather-appropriate breathable layers & shell', category: 'Clothing' },
    { id: 'contact', label: 'Fully charged phone & emergency contact card', category: 'Safety' },
  ];

  switch (discipline) {
    case 'Hiking & Camping':
      return [
        ...base,
        { id: 'boots', label: 'Broken-in trail shoes or hiking boots + wool socks', category: 'Clothing' },
        { id: 'headlamp', label: 'Headlamp or flashlight (extra batteries)', category: 'Safety' },
        { id: 'firstaid', label: 'Compact personal first-aid & blister kit', category: 'Safety' },
      ];
    case 'Climbing & Snow':
      return [
        ...base,
        { id: 'harness', label: 'Climbing shoes, chalk bag & harness (or request loaner)', category: 'Essentials' },
        { id: 'warm-layer', label: 'Insulated mid-layer & warm beanie for belay/summit', category: 'Clothing' },
        { id: 'tape', label: 'Athletic finger tape & personal safety check', category: 'Safety' },
      ];
    case 'Water, Surf & Dive':
      return [
        ...base,
        { id: 'swim', label: 'Swimwear, rash guard or wetsuit (check loaner board)', category: 'Clothing' },
        { id: 'towel', label: 'Dry towel, warm change of clothes & dry bag', category: 'Essentials' },
        { id: 'reef-safe', label: 'Reef-safe mineral sunscreen & water shoes', category: 'Safety' },
      ];
    case 'Cycling & Running':
      return [
        ...base,
        { id: 'helmet', label: 'Certified helmet & front/rear visibility lights', category: 'Safety' },
        { id: 'spare', label: 'Spare tube, tire levers & mini pump (for riders)', category: 'Essentials' },
        { id: 'gloves', label: 'Reflective layer or cycling gloves', category: 'Clothing' },
      ];
    case 'Birding & Conservation':
      return [
        ...base,
        { id: 'optics', label: 'Binoculars (or claim a loaner pair below)', category: 'Essentials' },
        { id: 'notebook', label: 'Field notebook / birding app downloaded offline', category: 'Essentials' },
        { id: 'muted', label: 'Comfortable walking shoes & muted earth-tone layers', category: 'Clothing' },
      ];
    case 'Land & Heritage':
      return [
        ...base,
        { id: 'gloves-work', label: 'Closed-toe boots & gardening/work gloves', category: 'Clothing' },
        { id: 'hat', label: 'Wide-brim sun hat & bug repellent', category: 'Safety' },
        { id: 'reusable', label: 'Reusable mug or bowl for post-stewardship meal', category: 'Essentials' },
      ];
  }
}

export interface RegionAtlasHub {
  region: Region;
  shortLabel: string;
  tagline: string;
  anchorCities: string;
  /** Positioned on our 800x460 editorial atlas SVG canvas */
  x: number;
  y: number;
}

export const REGION_ATLAS_HUBS: RegionAtlasHub[] = [
  {
    region: 'West',
    shortLabel: 'West & Pacific NW',
    tagline: 'Cascade summits, Redwoods, Oakland trails & Pacific swells',
    anchorCities: 'Oakland · Portland · Seattle · Los Angeles',
    x: 148,
    y: 196,
  },
  {
    region: 'Southwest',
    shortLabel: 'Southwest & Rockies',
    tagline: 'Front Range peaks, desert canyons & high-altitude chapters',
    anchorCities: 'Denver · Phoenix · Austin · Albuquerque',
    x: 288,
    y: 282,
  },
  {
    region: 'Midwest',
    shortLabel: 'Midwest & Great Lakes',
    tagline: 'Lakefront run crews, driftless trails & cycling brotherhoods',
    anchorCities: 'Chicago · Detroit · Minneapolis · Cleveland',
    x: 454,
    y: 174,
  },
  {
    region: 'South',
    shortLabel: 'South & Gulf Coast',
    tagline: 'Blue Ridge trails, Atlanta BeltLine, Black farms & Gulf waters',
    anchorCities: 'Atlanta · Houston · Charlotte · New Orleans',
    x: 526,
    y: 306,
  },
  {
    region: 'Northeast',
    shortLabel: 'Northeast & Mid-Atlantic',
    tagline: 'Rockaway surf lineups, Hudson Valley farms & D.C. trail networks',
    anchorCities: 'New York · Washington, D.C. · Baltimore · Boston',
    x: 646,
    y: 162,
  },
  {
    region: 'National',
    shortLabel: 'National Networks',
    tagline: 'Multi-chapter organizations spanning 50+ cities nationwide',
    anchorCities: 'Nationwide Chapters · 50 States',
    x: 396,
    y: 94,
  },
  {
    region: 'International',
    shortLabel: 'Global Diaspora',
    tagline: 'UK, Canada, Caribbean & international Black outdoor collectives',
    anchorCities: 'London · Toronto · Caribbean · Global',
    x: 696,
    y: 344,
  },
];
