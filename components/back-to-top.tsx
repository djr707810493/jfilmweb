"use client";

import { useEffect, useState } from "react";
import { QuoteModal } from "@/components/quote/quote-modal";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      // Show back-to-top when the page is scrolled past the first screen
      setIsVisible(window.scrollY > 400);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
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
    <>
      <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={() => setQuoteOpen(true)}
          aria-label="Get an instant quote"
          className="group flex items-center gap-2 rounded-full bg-soft-black py-3 pr-4 pl-3 text-ivory shadow-xl transition-all duration-300 hover:scale-105 hover:bg-soft-black/85 focus:outline-none sm:py-3.5 sm:pr-5 sm:pl-3.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.6}
            stroke="currentColor"
            className="size-5 sm:size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 8.25h6M9 12h6M9 15.75h3.75M6 3.75h8.25L18 7.5v12.75a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5V5.25a1.5 1.5 0 0 1 1.5-1.5Z"
            />
          </svg>
          <span className="text-[0.625rem] font-semibold tracking-[0.14em] uppercase sm:text-[0.6875rem]">
            Quote
          </span>
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

      {quoteOpen ? (
        <QuoteModal source="floating_button" onClose={() => setQuoteOpen(false)} />
      ) : null}
    </>
  );
}
