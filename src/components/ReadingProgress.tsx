"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      const scrollPercentRounded = Math.min(100, Math.max(0, scrollPercent));

      setProgress(scrollPercentRounded);
    };

    // Use requestAnimationFrame for smooth updates
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial calculation
    updateProgress();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div
      className="reading-progress"
      style={{
        transform: `scaleX(${progress})`,
      }}
    />
  );
}
