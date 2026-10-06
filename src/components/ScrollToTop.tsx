"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white p-3 rounded-full shadow-lg border border-[#2f4553] transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
