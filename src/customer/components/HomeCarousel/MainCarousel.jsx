import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { homeCarouselData } from "./MainCarouselData";

export default function MainCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) =>
      prev === homeCarouselData.length - 1 ? 0 : prev + 1
    );
  }, []);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? homeCarouselData.length - 1 : prev - 1
    );
  }, []);

  const goToIndex = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, [goToNext, isPaused]);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height: "30rem" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Slides ── */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 cursor-pointer"
          onClick={() => navigate(homeCarouselData[currentIndex].path)}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) goToNext();
            else if (info.offset.x > 60) goToPrev();
          }}
        >
          <img
            src={homeCarouselData[currentIndex].image}
            alt={`Slide ${currentIndex + 1}`}
            draggable={false}
            className="w-full h-full object-cover select-none"
          />

          {/* Subtle gradient overlay at bottom for dots readability */}
          <div
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Prev Button ── */}
      <motion.button
        whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.95)" }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => { e.stopPropagation(); goToPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(6px)" }}
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5" style={{ color: "#1a1109" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      {/* ── Next Button ── */}
      <motion.button
        whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.95)" }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => { e.stopPropagation(); goToNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(6px)" }}
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" style={{ color: "#1a1109" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* ── Dots ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {homeCarouselData.map((_, index) => (
          <motion.button
            key={index}
            onClick={(e) => { e.stopPropagation(); goToIndex(index); }}
            animate={{
              width: currentIndex === index ? 24 : 8,
              background: currentIndex === index ? "#fff" : "rgba(255,255,255,0.5)",
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-2 rounded-full"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* ── Autoplay Progress Bar ── */}
      {!isPaused && (
        <div className="absolute bottom-0 inset-x-0 z-20 h-0.5" style={{ background: "rgba(255,255,255,0.2)" }}>
          <motion.div
            key={currentIndex}
            className="h-full"
            style={{ background: "rgba(255,255,255,0.7)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}