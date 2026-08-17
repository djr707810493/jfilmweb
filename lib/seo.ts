import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

/** Social preview image — JPG for max compatibility (Facebook, iMessage, LinkedIn) */
export const ogImagePath = "/og.jpg";

const defaultOgImage = {
  url: ogImagePath,
  secureUrl: new URL(ogImagePath, siteConfig.url).toString(),
  type: "image/jpeg",
  width: 1200,
  height: 630,
  alt: "J FILM STUDIO — budget-friendly candid wedding photo & video in Utah",
};

const facebookAppId = process.env.NEXT_PUBLIC_FB_APP_ID?.trim();

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Utah wedding photographer",
    "Utah wedding videographer",
    "budget friendly wedding photographer",
    "candid wedding photography",
    "documentary wedding photographer",
    "Park City wedding photography",
    "Moab elopement photographer",
    "Zion wedding photography",
    siteConfig.address.addressLocality,
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [defaultOgImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(facebookAppId && {
    other: {
      "fb:app_id": facebookAppId,
    },
  }),
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path = "",
  ogImage,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const image = ogImage ?? defaultOgImage.url;
  const absoluteImage = new URL(image, siteConfig.url).toString();

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title,
      description,
      url,
      images: [
        {
          ...defaultOgImage,
          url: absoluteImage,
          secureUrl: absoluteImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage],
    },
    ...(facebookAppId && {
      other: {
        "fb:app_id": facebookAppId,
      },
    }),
    ...(noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}
