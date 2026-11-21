import { useState } from 'react';
import type { Discipline } from '@/src/data/seedOrganizations';

interface OrgLogoProps {
  orgId: string;
  name: string;
  discipline?: Discipline;
  logoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const KNOWN_MONOGRAMS: Record<string, string> = {
  'outdoor-afro': 'OA',
  'national-brotherhood-of-skiers': 'NBS',
  'nabs-scuba': 'NABS',
  'black-girls-trekkin': 'BGT',
  'brothers-of-climbing': 'BOC',
  'brown-girls-climb': 'BGC',
  'camp-yoshi': 'CY',
  'soul-trak-outdoors': 'STO',
  'black-girls-do-bike': 'BGDB',
  'major-taylor-cycling': 'MTC',
  'laru-beya-collective': 'LBC',
  'black-surfers-collective': 'BSC',
  'blackafinstem-birders': 'STEM',
  'backyard-basecamp': 'BB',
  'black-folks-camp-too': 'BFCT',
  'black-people-who-hike': 'BPWH',
  'blackpackers': 'BP',
  'vibe-tribe-adventures': 'VTA',
  'edge-outdoors': 'EDGE',
  'climbers-of-color': 'COC',
  'diving-with-a-purpose': 'DWP',
  'universal-sailing-club': 'USC',
  'brown-folks-fishing': 'BFF',
  'girltrek': 'GT',
  'black-trail-runners': 'BTR',
  'all-mountain-brothers': 'AMB',
  'black-outside': 'BO',
  'soul-fire-farm': 'SFF',
  'compton-cowboys': 'CC',
  'melanin-base-camp': 'MBC',
  'black-in-marine-science': 'BIMS',
  'minorities-in-shark-sciences': 'MISS',
  'greening-youth-foundation': 'GYF',
  'black-girls-run': 'BGR',
  'black-men-run': 'BMR',
  'full-circle-everest': 'FCE',
  'outdoor-journal-tour': 'OJT',
  'wild-diversity': 'WD',
  'braided-seeds': 'BS',
  'federation-of-black-cowboys': 'FBC',
  'african-american-owned-campgrounds': 'AAOC',
  'diversify-outdoors': 'DO',
};

const PALETTES: { bg: string; stroke: string; accent: string }[] = [
  { bg: '#1B4332', stroke: '#D8E2DC', accent: '#95D5B2' }, // Deep Forest
  { bg: '#1D3557', stroke: '#E0EAFC', accent: '#A8DADC' }, // Coastal Navy
  { bg: '#3A4D39', stroke: '#ECE3CE', accent: '#C4D7B2' }, // Pine Moss
  { bg: '#4A3728', stroke: '#F4EDE4', accent: '#D4A373' }, // Cedar Umber
  { bg: '#2B3A42', stroke: '#E8EEF1', accent: '#9DB4C0' }, // Alpine Slate
  { bg: '#5C3D2E', stroke: '#F5EBE0', accent: '#E0B18B' }, // Clay Bronze
  { bg: '#264653', stroke: '#E9F5F5', accent: '#8AB17D' }, // Deep Tidal
  { bg: '#2F3E46', stroke: '#EDF2F4', accent: '#CAD2C5' }, // Granite Ink
];

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function getMonogram(orgId: string, name: string): string {
  if (KNOWN_MONOGRAMS[orgId]) return KNOWN_MONOGRAMS[orgId];
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0 && !['the', 'of', 'and', 'in', 'inc'].includes(w.toLowerCase()));
  if (words.length === 0) return 'FL';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function renderDisciplineMotif(discipline: Discipline | undefined, accent: string) {
  switch (discipline) {
    case 'Climbing & Snow':
      return (
        <path
          d="M8 31 L19 14 L26 24 L31 17 L40 31"
          fill="none"
          stroke={accent}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
      );
    case 'Water, Surf & Dive':
      return (
        <>
          <path
            d="M8 29 Q14 23 20 29 T32 29 T40 29"
            fill="none"
            stroke={accent}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M11 35 Q17 30 23 35 T37 35"
            fill="none"
            stroke={accent}
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.35"
          />
        </>
      );
    case 'Cycling & Running':
      return (
        <>
          <circle
            cx="24"
            cy="24"
            r="16"
            fill="none"
            stroke={accent}
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.42"
          />
          <path
            d="M12 34 L36 34"
            stroke={accent}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.4"
          />
        </>
      );
    case 'Birding & Conservation':
      return (
        <path
          d="M11 16 Q17 11 24 16 Q31 11 37 16"
          fill="none"
          stroke={accent}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.5"
        />
      );
    case 'Land & Heritage':
      return (
        <>
          <path
            d="M8 32 Q24 25 40 32"
            fill="none"
            stroke={accent}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.45"
          />
          <path
            d="M12 37 Q24 32 36 37"
            fill="none"
            stroke={accent}
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.35"
          />
        </>
      );
    case 'Hiking & Camping':
    default:
      return (
        <>
          <path
            d="M10 33 L24 12 L38 33 Z"
            fill="none"
            stroke={accent}
            strokeWidth="1.4"
            strokeLinejoin="round"
            opacity="0.38"
          />
          <circle cx="34" cy="14" r="2.2" fill={accent} opacity="0.45" />
        </>
      );
  }
}

const SIZE_CLASSES: Record<NonNullable<OrgLogoProps['size']>, string> = {
  xs: 'size-6 rounded',
  sm: 'size-8 rounded-md',
  md: 'size-11 rounded-md',
  lg: 'size-14 rounded-lg',
};

export function OrgLogo({
  orgId,
  name,
  discipline,
  logoUrl,
  size = 'md',
  className = '',
}: OrgLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (logoUrl && !imgFailed) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${SIZE_CLASSES[size]} shrink-0 object-cover border border-border bg-card ${className}`}
      />
    );
  }

  const monogram = getMonogram(orgId, name);
  const hash = hashString(`${orgId}:${name}`);
  const palette = PALETTES[hash % PALETTES.length];
  const fontSize = monogram.length >= 4 ? 11 : monogram.length === 3 ? 13 : 16;

  return (
    <div
      role="img"
      aria-label={`${name} emblem logo`}
      className={`${SIZE_CLASSES[size]} shrink-0 overflow-hidden border border-black/10 select-none ${className}`}
      style={{ backgroundColor: palette.bg }}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="5"
          fill="none"
          stroke={palette.stroke}
          strokeWidth="1"
          opacity="0.28"
        />
        {renderDisciplineMotif(discipline, palette.accent)}
        <text
          x="24"
          y="25.5"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#F8F6F1"
          fontFamily="Fraunces, Georgia, serif"
          fontWeight="600"
          fontSize={fontSize}
          letterSpacing={monogram.length >= 3 ? '0.04em' : '0.02em'}
        >
          {monogram}
        </text>
      </svg>
    </div>
  );
}
