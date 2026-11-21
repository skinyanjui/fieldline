import { toast } from 'sonner';

interface RouteSeoOptions {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown> | null;
}

const DEFAULT_TITLE = 'Fieldline – Black Outdoor Clubs Directory & Network';
const DEFAULT_DESCRIPTION =
  'Discover 42+ Black outdoor clubs, hiking groups, surf & ski crews, and land stewardship organizations. Join clubs, share trail notes, and RSVP to outings.';

export function updateRouteSeo({ title, description, jsonLd }: RouteSeoOptions) {
  const fullTitle = title ? `${title} · Fieldline` : DEFAULT_TITLE;
  document.title = fullTitle;

  const desc = description || DEFAULT_DESCRIPTION;
  const setMeta = (selector: string, content: string) => {
    const el = document.querySelector<HTMLMetaElement>(selector);
    if (el) el.content = content;
  };

  setMeta('meta[name="description"]', desc);
  setMeta('meta[property="og:title"]', fullTitle);
  setMeta('meta[property="og:description"]', desc);
  setMeta('meta[name="twitter:title"]', fullTitle);
  setMeta('meta[name="twitter:description"]', desc);

  const scriptId = 'fieldline-route-ld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!jsonLd) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    ...jsonLd,
  });
}

export async function copyShareLink(label = 'Link', customUrl?: string) {
  const url = customUrl || window.location.href;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    toast.success(`${label} copied to clipboard.`);
  } catch {
    toast.error('Could not copy link automatically. Copy the URL from your address bar.');
  }
}
