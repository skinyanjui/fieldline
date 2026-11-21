import type { DirectoryOrganization, SeedOuting } from '@/src/data/seedOrganizations';

function escapeCsvCell(value: string): string {
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

export function downloadOrganizationsCsv(orgs: DirectoryOrganization[]): void {
  const headers = [
    'Name',
    'Discipline',
    'Organization Type',
    'Region',
    'Location',
    'Founded',
    'Footprint',
    'Website',
    'Instagram',
    'Summary',
  ];

  const rows = orgs.map((org) =>
    [
      org.name,
      org.discipline,
      org.orgType,
      org.region,
      org.location,
      org.founded,
      org.chapterCount,
      org.website,
      org.instagram,
      org.summary,
    ]
      .map((cell) => escapeCsvCell(cell || ''))
      .join(',')
  );

  const csvContent = [headers.map(escapeCsvCell).join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `fieldline-directory-${orgs.length}-clubs.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function downloadOutingIcs(outing: SeedOuting): void {
  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const start = new Date(now.getTime() + 7 * 86_400_000);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 3 * 3_600_000);

  const formatUtc = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fieldline//Outdoor Community Network//EN',
    'BEGIN:VEVENT',
    `UID:${outing.id}@fieldline.community`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${escapeIcsText(`${outing.title} — ${outing.orgName}`)}`,
    `LOCATION:${escapeIcsText(outing.location)}`,
    `DESCRIPTION:${escapeIcsText(`${outing.dateLabel} | ${outing.difficulty} | Host: ${outing.hostName}\\n\\n${outing.description}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${outing.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
