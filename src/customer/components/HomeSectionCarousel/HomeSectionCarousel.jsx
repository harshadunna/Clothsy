import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeSectionCard from "../HomeSectionCard/HomeSectionCard";

export default function HomeSectionCarousel({ data, sectionName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsPerPage = 5;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < data.length - itemsPerPage;

  const slidePrev = () => setActiveIndex((prev) => Math.max(prev - 1, 0));
  const slideNext = () => setActiveIndex((prev) => Math.min(prev + 1, data.length - itemsPerPage));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">

      {/* ── Section Header ── */}
      <div className="flex items-center justify-between mb-5">
        <motion.h2
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-xl sm:text-2xl font-black tracking-tight"
          style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
        >
          {sectionName}
        </motion.h2>

        {/* Arrow buttons — also shown in header on wider screens */}
        <div className="hidden sm:flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={slidePrev}
            disabled={!canGoPrev}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200"
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
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={slideNext}
            disabled={!canGoNext}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200"
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
          </motion.button>
        </div>
      </div>

      {/* ── Carousel Track ── */}
      <div
        className="relative rounded-2xl overflow-hidden border"
        style={{ borderColor: "#e8ddd5", background: "#fdf8f4" }}
      >
        <div className="overflow-hidden px-4 py-5">
          <motion.div
            animate={{ x: `-${activeIndex * (100 / itemsPerPage)}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex"
          >
            {data.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % itemsPerPage) * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ minWidth: `${100 / itemsPerPage}%`, flexShrink: 0 }}
                className="flex justify-center px-2"
              >
                <HomeSectionCard product={item} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Left Fade + Arrow (mobile/overlay) ── */}
        <AnimatePresence>
          {canGoPrev && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-y-0 left-0 flex items-center z-10"
              style={{
                background: "linear-gradient(to right, rgba(253,248,244,0.95) 0%, transparent 100%)",
                width: "4rem",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.93 }}
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
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Right Fade + Arrow (mobile/overlay) ── */}
        <AnimatePresence>
          {canGoNext && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-y-0 right-0 flex items-center justify-end z-10"
              style={{
                background: "linear-gradient(to left, rgba(253,248,244,0.95) 0%, transparent 100%)",
                width: "4rem",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.93 }}
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
              </motion.button>
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