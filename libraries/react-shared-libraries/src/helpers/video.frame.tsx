'use client';

import { FC, useEffect, useState } from 'react';
export const VideoFrame: FC<{
  url: string;
  autoplay?: boolean;
  thumbnail?: string;
}> = (props) => {
  const { url, thumbnail } = props;
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    setHasError(false);
  }, [url]);
  return (
    <div className="relative w-full h-full">
      <video
        className="w-full h-full object-cover rounded-[4px]"
        src={url + '#t=0.1'}
        poster={thumbnail}
        preload="metadata"
        autoPlay={!!props?.autoplay}
        onError={() => setHasError(true)}
      />
      {hasError && (
        <div
          role="status"
          className="absolute inset-0 flex items-center justify-center rounded-[4px] bg-black/70 p-2 text-center text-xs text-white"
        >
          This video cannot be previewed in this browser.
        </div>
      )}
    </div>
  );
};
