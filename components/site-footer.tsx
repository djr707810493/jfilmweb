import Link from "next/link";
import { siteConfig } from "@/data/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="safe-bottom border-t border-taupe/40 bg-ivory-dark">
      <div className="container-editorial py-12 md:py-16 lg:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-xl tracking-wide text-soft-black uppercase md:text-2xl">
              {siteConfig.name}
            </p>
            <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted md:mt-4 md:text-sm">
              {siteConfig.tagline}
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <p className="label-editorial mb-3 md:mb-4">Navigate</p>
            <ul className="space-y-1">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="tap-link text-[0.9375rem] text-soft-black-muted transition-colors duration-300 active:text-soft-black md:text-sm md:hover:text-soft-black"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/studio/login"
                  className="tap-link text-[0.9375rem] text-soft-black-muted transition-colors duration-300 active:text-soft-black md:text-sm md:hover:text-soft-black"
                >
                  Client Login
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="label-editorial mb-3 md:mb-4">Contact</p>
            <ul className="space-y-1 text-[0.9375rem] text-soft-black-muted md:text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="tap-link break-all transition-colors duration-300 active:text-soft-black md:hover:text-soft-black"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
                  className="tap-link transition-colors duration-300 active:text-soft-black md:hover:text-soft-black"
                >
                  {siteConfig.phone}
                </a>
                <span className="text-muted"> · Text preferred</span>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phoneSecondary.replace(/\D/g, "")}`}
                  className="tap-link transition-colors duration-300 active:text-soft-black md:hover:text-soft-black"
                >
                  {siteConfig.phoneSecondary}
                </a>
                <span className="text-muted"> · Text preferred</span>
              </li>
              <li>
                {siteConfig.address.addressLocality},{" "}
                {siteConfig.address.addressRegion}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-taupe/30 pt-6 text-xs text-muted md:mt-16 md:flex-row md:items-center md:justify-between md:pt-8">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          {siteConfig.social.instagram && (
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="label-editorial tap-link transition-colors duration-300 active:text-soft-black md:hover:text-soft-black"
            >
              Instagram
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
