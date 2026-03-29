import { useState, useRef } from "react";
import HomeSectionCard from "../HomeSectionCard/HomeSectionCard";

export default function HomeSectionCarousel({ data, sectionName, loading = false }) {
  const scrollRef       = useRef(null);
  const [showLeftBlur,  setShowLeftBlur]  = useState(false);
  const [showRightBlur, setShowRightBlur] = useState(true);

  const scrollAmount = 200;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftBlur(scrollLeft > 0);
    setShowRightBlur(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const slidePrev = () =>
    scrollRef.current?.scrollBy({ left: -scrollAmount, behavior: "smooth" });

  const slideNext = () =>
    scrollRef.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="bg-[#FFF8F5] py-10 overflow-hidden border-t border-[#D1C4BC]">
        <div className="px-6 md:px-12 mb-5 max-w-[1440px] mx-auto">
          <div className="w-12 h-2 bg-[#E8E1DE] rounded mb-2 animate-pulse" />
          <div className="w-32 h-4 bg-[#E8E1DE] rounded animate-pulse" />
        </div>
        <div className="flex gap-4 px-6 md:px-12 max-w-[1440px] mx-auto overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0" style={{ width: "180px" }}>
              <div
                className="bg-[#E8E1DE] animate-pulse rounded-none"
                style={{ width: "180px", height: "240px" }}
              />
              <div className="pt-2.5 space-y-1.5">
                <div className="h-2 bg-[#E8E1DE] rounded animate-pulse w-3/4" />
                <div className="h-2 bg-[#E8E1DE] rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className="bg-[#FFF8F5] py-10 overflow-hidden border-t border-[#D1C4BC]">

      {/* Header */}
      <div className="px-6 md:px-12 flex justify-between items-end mb-5 max-w-[1440px] mx-auto">
        <div>
          <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-[#7F756E]">
            {sectionName === "New Acquisitions" ? "Discover" : "Archive Sale"}
          </span>
          <h2 className="font-headline font-light text-lg italic text-[#1A1109] mt-1">
            {sectionName}
          </h2>
        </div>

        <div className="hidden md:flex space-x-2">
          <button
            onClick={slidePrev}
            className="w-7 h-7 flex items-center justify-center border border-[#1A1109] text-[#1A1109] hover:bg-[#1A1109] hover:text-[#FFF8F5] transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          </button>
          <button
            onClick={slideNext}
            className="w-7 h-7 flex items-center justify-center border border-[#1A1109] text-[#1A1109] hover:bg-[#1A1109] hover:text-[#FFF8F5] transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Scroll track */}
      <div className="relative max-w-[1440px] mx-auto">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 px-6 md:px-12 overflow-x-auto scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {data.map((item, index) => (
            <div key={`${item.id}-${index}`} className="snap-start shrink-0">
              <HomeSectionCard product={item} />
            </div>
          ))}
        </div>

        {showLeftBlur && (
          <div className="absolute top-0 left-0 bottom-0 w-10 bg-gradient-to-r from-[#FFF8F5] to-transparent pointer-events-none" />
        )}
        {showRightBlur && (
          <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-[#FFF8F5] to-transparent pointer-events-none" />
        )}
      </div>

    </section>
  );
}