import NextImage, { type ImageProps } from "next/image";

type SiteImageProps = ImageProps & {
  /** Skip Next.js server-side optimizer (fixes VPN/proxy DNS issues on localhost) */
  unoptimized?: boolean;
};

/**
 * Site image wrapper.
 * External URLs use unoptimized mode so the browser loads them directly —
 * Next.js image optimizer blocks upstream hosts that resolve to private IPs
 * (common with VPN/proxy tools like Surge/Clash).
 */
export function SiteImage({ src, unoptimized, ...props }: SiteImageProps) {
  const isExternal =
    typeof src === "string" &&
    (src.startsWith("http://") || src.startsWith("https://"));

  return (
    <NextImage
      src={src}
      unoptimized={unoptimized ?? isExternal}
      {...props}
    />
  );
}
