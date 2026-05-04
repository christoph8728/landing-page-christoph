"use client";

import { useEffect, useRef, useState } from "react";

interface ImageLightboxProps {
  children: React.ReactNode;
}

export default function ImageLightbox({ children }: ImageLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const images = containerRef.current.querySelectorAll("img");

    const handleImageClick = (e: MouseEvent) => {
      const img = e.currentTarget as HTMLImageElement;
      setLightbox({
        src: img.src,
        alt: img.alt || "",
      });
    };

    images.forEach((img) => {
      img.addEventListener("click", handleImageClick);
      img.style.cursor = "zoom-in";
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener("click", handleImageClick);
      });
    };
  }, []);

  useEffect(() => {
    if (!lightbox) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <>
      <div ref={containerRef}>{children}</div>
      {lightbox && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.alt && (
            <div className="lightbox-caption">{lightbox.alt}</div>
          )}
        </div>
      )}
    </>
  );
}
