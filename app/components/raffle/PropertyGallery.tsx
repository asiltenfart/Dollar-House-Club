"use client";

import React, { useState } from "react";
import Image from "next/image";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const total = images.length;

  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  const next = () => setCurrent((c) => (c === total - 1 ? 0 : c + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    const startX = e.touches[0].clientX;
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const diff = startX - endEvent.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
      document.removeEventListener("touchend", handleTouchEnd);
    };
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      className="relative z-0 w-full overflow-hidden bg-[#F7F7F7] group md:rounded-[16px]"
      style={{ height: "400px" }}
      onTouchStart={handleTouchStart}
    >
      {/* Images */}
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {!loaded[i] && (
            <div className="absolute inset-0 bg-[#F7F7F7] flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 8L40 22V40H32V28H16V40H8V22L24 8Z" fill="#DDDDDD" />
              </svg>
            </div>
          )}
          <Image
            src={src}
            alt={`${title} — photo ${i + 1}`}
            fill
            className="object-cover"
            style={{ opacity: loaded[i] ? 1 : 0, transition: "opacity 300ms ease" }}
            onLoad={() => setLoaded((prev) => ({ ...prev, [i]: true }))}
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Prev / Next arrows — visible on hover (desktop) */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105"
            aria-label="Previous image"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105"
            aria-label="Next image"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Image count pill — bottom right */}
      <div className="absolute bottom-3 right-3 z-10 px-2 py-1 rounded-full text-xs text-white font-semibold" style={{ background: "rgba(0,0,0,0.6)", letterSpacing: "0.01em" }}>
        {current + 1} / {total}
      </div>

      {/* Dot indicators — bottom center */}
      {total > 1 && total <= 10 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-1.5 h-1.5 rounded-full transition-all duration-200"
              style={{
                background: i === current ? "white" : "rgba(255,255,255,0.5)",
                transform: i === current ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
