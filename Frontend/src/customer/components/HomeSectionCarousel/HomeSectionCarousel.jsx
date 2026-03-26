import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HomeSectionCard from "../HomeSectionCard/HomeSectionCard";

gsap.registerPlugin(ScrollTrigger);

export default function HomeSectionCarousel({ data, sectionName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsPerPage = 5;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < data.length - itemsPerPage;

  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const gsapCtxRef = useRef(null);

  const slidePrev = () => setActiveIndex((prev) => Math.max(prev - 1, 0));
  const slideNext = () =>
    setActiveIndex((prev) => Math.min(prev + 1, data.length - itemsPerPage));

  // GSAP: Header + cards stagger on scroll into view
  useEffect(() => {
    if (gsapCtxRef.current) gsapCtxRef.current.revert();

    gsapCtxRef.current = gsap.context(() => {
      // Header line reveal
      gsap.fromTo(
        headerRef.current,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Cards stagger
      const cards = cardsRef.current?.querySelectorAll(".gsap-card");
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => gsapCtxRef.current?.revert();
  }, [data]);

  // GSAP: Arrow button hover
  const handleArrowEnter = (el) => {
    gsap.to(el, { scale: 1.12, duration: 0.2, ease: "power2.out" });
  };
  const handleArrowLeave = (el) => {
    gsap.to(el, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.6)" });
  };
  const handleArrowDown = (el) => {
    gsap.to(el, { scale: 0.9, duration: 0.1, ease: "power2.out" });
  };
  const handleArrowUp = (el) => {
    gsap.to(el, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <div ref={sectionRef} className="px-4 sm:px-6 lg:px-8 py-4">

      {/* ── Section Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div ref={headerRef} className="flex items-center gap-4" style={{ opacity: 0 }}>
          {/* Decorative accent line */}
          <span
            className="hidden sm:block h-6 w-[3px] rounded-full"
            style={{ background: "#c8742a" }}
          />
          <h2
            className="text-xl sm:text-2xl font-black tracking-tight"
            style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
          >
            {sectionName}
          </h2>
        </div>

        {/* Arrow buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onMouseEnter={(e) => handleArrowEnter(e.currentTarget)}
            onMouseLeave={(e) => handleArrowLeave(e.currentTarget)}
            onMouseDown={(e) => handleArrowDown(e.currentTarget)}
            onMouseUp={(e) => handleArrowUp(e.currentTarget)}
            onClick={slidePrev}
            disabled={!canGoPrev}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors duration-200"
            style={{
              borderColor: canGoPrev ? "#e8ddd5" : "#f0ebe6",
              background: canGoPrev ? "#fff" : "#faf6f2",
              color: canGoPrev ? "#c8742a" : "#d9cfc6",
              cursor: canGoPrev ? "pointer" : "not-allowed",
            }}
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onMouseEnter={(e) => handleArrowEnter(e.currentTarget)}
            onMouseLeave={(e) => handleArrowLeave(e.currentTarget)}
            onMouseDown={(e) => handleArrowDown(e.currentTarget)}
            onMouseUp={(e) => handleArrowUp(e.currentTarget)}
            onClick={slideNext}
            disabled={!canGoNext}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors duration-200"
            style={{
              borderColor: canGoNext ? "#e8ddd5" : "#f0ebe6",
              background: canGoNext ? "#fff" : "#faf6f2",
              color: canGoNext ? "#c8742a" : "#d9cfc6",
              cursor: canGoNext ? "pointer" : "not-allowed",
            }}
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Carousel Track ── */}
      <div
        className="relative rounded-2xl overflow-hidden border"
        style={{ borderColor: "#e8ddd5", background: "#fdf8f4" }}
      >
        <div ref={cardsRef} className="overflow-hidden px-4 py-5">
          <motion.div
            animate={{ x: `-${activeIndex * (100 / itemsPerPage)}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex"
          >
            {data.map((item, index) => (
              <div
                key={index}
                className="gsap-card flex justify-center px-2"
                style={{
                  minWidth: `${100 / itemsPerPage}%`,
                  flexShrink: 0,
                  opacity: 0, // starts hidden, GSAP reveals
                }}
              >
                <HomeSectionCard product={item} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Left fade + mobile arrow ── */}
        <AnimatePresence>
          {canGoPrev && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-y-0 left-0 flex items-center z-10"
              style={{
                background:
                  "linear-gradient(to right, rgba(253,248,244,0.95) 0%, transparent 100%)",
                width: "4rem",
              }}
            >
              <button
                onClick={slidePrev}
                className="ml-2 w-9 h-9 rounded-full flex items-center justify-center sm:hidden"
                style={{
                  background: "#fff",
                  border: "1px solid #e8ddd5",
                  color: "#c8742a",
                  boxShadow: "0 2px 12px rgba(200,116,42,0.12)",
                }}
                aria-label="Previous"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Right fade + mobile arrow ── */}
        <AnimatePresence>
          {canGoNext && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-y-0 right-0 flex items-center justify-end z-10"
              style={{
                background:
                  "linear-gradient(to left, rgba(253,248,244,0.95) 0%, transparent 100%)",
                width: "4rem",
              }}
            >
              <button
                onClick={slideNext}
                className="mr-2 w-9 h-9 rounded-full flex items-center justify-center sm:hidden"
                style={{
                  background: "#fff",
                  border: "1px solid #e8ddd5",
                  color: "#c8742a",
                  boxShadow: "0 2px 12px rgba(200,116,42,0.12)",
                }}
                aria-label="Next"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Dot indicators ── */}
      {data.length > itemsPerPage && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: data.length - itemsPerPage + 1 }).map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setActiveIndex(i)}
              animate={{
                width: activeIndex === i ? 20 : 6,
                background: activeIndex === i ? "#c8742a" : "#e8ddd5",
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-1.5 rounded-full"
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}