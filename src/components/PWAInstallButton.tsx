import { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/src/hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export function PWAInstallButton({ compact = false }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <Button
        type="button"
        variant="outline"
        size={compact ? 'sm' : 'default'}
        onClick={() => void install()}
        className="gap-1.5 whitespace-nowrap shrink-0 bg-card border-border text-foreground hover:bg-secondary"
      >
        <Download className="size-3.5" aria-hidden="true" />
        Install App
      </Button>
    );
  }

  if (isIOS) {
    return (
      <div className="relative inline-flex flex-col items-end">
        <Button
          type="button"
          variant="outline"
          size={compact ? 'sm' : 'default'}
          onClick={() => setShowIOSGuide((prev) => !prev)}
          className="gap-1.5 whitespace-nowrap shrink-0 bg-card border-border text-foreground hover:bg-secondary"
        >
          <Smartphone className="size-3.5" aria-hidden="true" />
          Install on iOS
        </Button>

        {showIOSGuide && (
          <div
            role="region"
            aria-label="iOS installation instructions"
            className="mt-2 w-72 rounded-lg border border-border bg-card p-4 text-left shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-serif text-sm font-medium text-foreground">
                Add Fieldline to Home Screen
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                aria-label="Dismiss iOS instructions"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground leading-relaxed">
              <li>
                Tap the <strong className="text-foreground">Share</strong> icon in Safari&apos;s
                toolbar.
              </li>
              <li>
                Scroll down and select{' '}
                <strong className="text-foreground">Add to Home Screen</strong> for offline
                trailhead access.
              </li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  return null;
}
