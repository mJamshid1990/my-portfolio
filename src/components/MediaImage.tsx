import { useState } from 'react';
import { Layers } from 'lucide-react';

interface MediaImageProps {
  src?: string;
  alt: string;
  fallbackTitle: string;
  className?: string;
}

export function MediaImage({
  src,
  alt,
  fallbackTitle,
  className = '',
}: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Layers className="w-7 h-7 mb-2 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 max-w-[20ch] truncate">
          {fallbackTitle}
        </span>
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
