"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed right-6 bottom-6 z-50 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-soft-black text-ivory shadow-xl transition-all duration-300 hover:bg-soft-black/80 hover:scale-105 focus:outline-none ${
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
  );
}
