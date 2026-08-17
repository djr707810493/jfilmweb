"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { siteConfig } from "@/data/site";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const portalHref = user ? "/studio/dashboard" : "/studio/login";
  const portalLabel = user ? "My Account" : "Client Login";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    if (menuOpen) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header className="safe-top sticky top-0 z-50 border-b border-taupe/40 bg-ivory/95 backdrop-blur-sm">
        <div className="container-editorial flex items-center justify-between py-4 md:py-5">
          <Link
            href="/"
            className="font-display max-w-[60%] text-base tracking-[0.14em] text-soft-black uppercase sm:max-w-none sm:text-lg md:tracking-[0.18em] md:text-xl"
            onClick={() => setMenuOpen(false)}
          >
            {siteConfig.name}
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="label-editorial link-editorial text-[0.625rem] text-soft-black-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {!authLoading && (
                <li>
                  <Link
                    href={portalHref}
                    className="label-editorial link-editorial text-[0.625rem] text-soft-black"
                  >
                    {portalLabel}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="tap-target relative z-[60] -mr-2 flex flex-col justify-center gap-1.5 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span
              className={`block h-px w-6 bg-soft-black transition-transform duration-300 ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-6 bg-soft-black transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-px w-6 bg-soft-black transition-transform duration-300 ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </header>

      {/* Mobile nav — rendered outside sticky header so fixed positioning works */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          className={`absolute inset-0 bg-soft-black/20 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
        />

        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className={`absolute inset-x-0 bottom-0 top-[3.75rem] overflow-y-auto overscroll-contain bg-ivory shadow-lg transition-[transform,opacity,visibility] duration-300 ease-out md:top-[4.25rem] ${menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}
        >
          <ul className="flex flex-col px-5 pb-8 pt-6">
            {siteConfig.nav.map((item) => (
              <li key={item.href} className="border-b border-taupe/25">
                <Link
                  href={item.href}
                  className="tap-link font-display py-4 text-2xl text-soft-black sm:text-3xl"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {!authLoading && (
              <li className="border-b border-taupe/25">
                <Link
                  href={portalHref}
                  className="tap-link font-display py-4 text-2xl text-soft-black sm:text-3xl"
                  onClick={() => setMenuOpen(false)}
                >
                  {portalLabel}
                </Link>
              </li>
            )}
          </ul>

          <div className="safe-bottom border-t border-taupe/25 px-5 py-6">
            <Link
              href="/#contact"
              className="label-editorial flex min-h-[3rem] w-full items-center justify-center border border-soft-black/20 bg-soft-black px-6 py-3 text-ivory transition-colors duration-300 active:bg-soft-black-muted"
              onClick={() => setMenuOpen(false)}
            >
              Send an Inquiry
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
