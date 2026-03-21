"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type FallbackImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK = "/placeholders/jewelry-fallback.svg";

const isRemote = (value: string) => /^https?:\/\//i.test(value);

export default function FallbackImage({ src, fallbackSrc = DEFAULT_FALLBACK, unoptimized, onError, alt, ...props }: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized ?? isRemote(currentSrc)}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }

        onError?.(event);
      }}
    />
  );
}
