import { FC } from 'react';
import { clsx } from 'clsx';
import { hasExtension } from '@gitroom/helpers/utils/has.extension';

export const VideoOrImage: FC<{
  src: string;
  autoplay: boolean;
  interactive?: boolean;
  isContain?: boolean;
  imageClassName?: string;
  videoClassName?: string;
}> = (props) => {
  const {
    src,
    autoplay,
    interactive = false,
    isContain,
    imageClassName,
    videoClassName,
  } = props;

  if (hasExtension(src, 'mp4')) {
    return (
      <video
        src={src}
        autoPlay={interactive ? false : autoplay}
        controls={interactive}
        muted={!interactive}
        loop={!interactive}
        playsInline
        preload="metadata"
        aria-label={interactive ? 'Video preview' : undefined}
        className={clsx('w-full h-full', videoClassName)}
      />
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
