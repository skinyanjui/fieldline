import { useState } from 'react';
import { Compass } from 'lucide-react';

interface EditorialImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export function EditorialImage({ src, alt, title, className = '' }: EditorialImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary via-accent to-secondary text-muted-foreground p-6 text-center ${className}`}
      >
        <Compass className="size-7 text-primary/70" aria-hidden="true" />
        {title && <span className="font-serif text-sm text-foreground/80">{title}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
