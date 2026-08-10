import { FC, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { hasExtension } from '@gitroom/helpers/utils/has.extension';

export const VideoOrImage: FC<{
  src: string;
  autoplay: boolean;
  interactive?: boolean;
  isContain?: boolean;
  imageClassName?: string;
  videoClassName?: string;
  thumbnail?: string;
}> = (props) => {
  const {
    src,
    autoplay,
    interactive = false,
    isContain,
    imageClassName,
    videoClassName,
    thumbnail,
  } = props;
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasExtension(src, 'mp4')) {
    return (
      <div className="relative w-full h-full">
        <video
          src={src}
          poster={thumbnail}
          autoPlay={interactive ? false : autoplay}
          controls={interactive}
          muted={!interactive}
          loop={!interactive}
          playsInline
          preload="metadata"
          aria-label={interactive ? 'Video preview' : undefined}
          className={clsx('w-full h-full', videoClassName)}
          onError={() => setHasError(true)}
        />
        {hasError && (
          <div
            role="status"
            className="absolute inset-0 flex items-center justify-center bg-black/70 p-2 text-center text-xs text-white"
          >
            This video cannot be previewed in this browser.
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      className={clsx(
        isContain ? 'object-contain' : 'object-cover',
        'w-full h-full',
        imageClassName
      )}
      src={src}
      alt="Post media preview"
    />
  );
};
