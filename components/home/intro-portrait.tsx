"use client";

import { useEffect, useState } from "react";
import { SiteImage } from "@/components/site-image";
import { introContent } from "@/data/homepage";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  createDefaultIntroImage,
  getIntroImage,
} from "@/lib/firebase/website";
import type { IntroImage } from "@/types/website";

export function IntroPortrait() {
  const [image, setImage] = useState<IntroImage>(createDefaultIntroImage());

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    let cancelled = false;

    getIntroImage()
      .then((result) => {
        if (!cancelled) setImage(result);
      })
      .catch(() => {
        // Keep the built-in studio portrait
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative ml-auto aspect-[3/4] w-full max-w-[9rem] sm:max-w-xs md:max-w-md lg:max-w-none">
      <SiteImage
        src={image.src}
        alt={image.alt || introContent.image.alt}
        fill
        sizes="(max-width: 640px) 35vw, (max-width: 1024px) 40vw, 33vw"
        className="object-cover image-hover"
      />
    </div>
  );
}
