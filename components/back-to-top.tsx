"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleScroll() {
      // Show button when page is scrolled down more than 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check initial state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToContact() {
    if (pathname === "/") {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/#contact");
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={goToContact}
        aria-label="Contact us"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-ivory text-soft-black shadow-xl ring-1 ring-soft-black/15 transition-all duration-300 hover:scale-105 hover:bg-ivory-dark focus:outline-none sm:h-12 sm:w-12"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 sm:h-6 sm:w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={scrollToTop}
        className={`flex h-11 w-11 items-center justify-center rounded-full bg-soft-black text-ivory shadow-xl transition-all duration-300 hover:bg-soft-black/80 hover:scale-105 focus:outline-none sm:h-12 sm:w-12 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 sm:h-6 sm:w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
          />
        </svg>
      </button>
    </div>
  );
}
