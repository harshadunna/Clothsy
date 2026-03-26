import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { homeCarouselData } from "./MainCarouselData";

export default function MainCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const overlayRef = useRef(null);
  const progressRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);
  const gsapCtxRef = useRef(null);

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

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [goToNext, isPaused]);

  // GSAP: Progress bar animation on every slide change
  useEffect(() => {
    if (!progressRef.current || isPaused) return;
    gsap.fromTo(
      progressRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 5, ease: "none", transformOrigin: "left center" }
    );
  }, [currentIndex, isPaused]);

  // GSAP: Overlay entrance animation on slide change
  useEffect(() => {
    if (gsapCtxRef.current) gsapCtxRef.current.revert();

    gsapCtxRef.current = gsap.context(() => {
      if (!overlayRef.current) return;
      const children = overlayRef.current.querySelectorAll(".gsap-overlay-child");
      gsap.fromTo(
        children,
        { y: 30, opacity: 0, filter: "blur(4px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.3,
        }
      );
    });

    return () => gsapCtxRef.current?.revert();
  }, [currentIndex]);

  // GSAP: Magnetic button hover effect
  const handleBtnMouseMove = (e, btnRef) => {
    const rect = btnRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    gsap.to(btnRef.current, { x: dx, y: dy, duration: 0.3, ease: "power2.out" });
  };

  const handleBtnMouseLeave = (btnRef) => {
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.85, ease: [0.25, 1, 0.5, 1] },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: 0.85, ease: [0.25, 1, 0.5, 1] },
    }),
  };

  const slide = homeCarouselData[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden bg-[#f9f3ed]"
      style={{ height: "80vh", minHeight: "520px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Slide ── */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 cursor-pointer"
          onClick={() => navigate(slide.path)}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) goToNext();
            else if (info.offset.x > 60) goToPrev();
          }}
        >
          {/* Image with subtle Ken Burns */}
          <motion.img
            src={slide.image}
            alt={`Slide ${currentIndex + 1}`}
            draggable={false}
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
            className="w-full h-full object-cover object-top select-none"
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(10,6,2,0.65) 0%, rgba(10,6,2,0.1) 50%, transparent 100%)",
            }}
          />

          {/* GSAP-animated text overlay */}
          <div
            ref={overlayRef}
            className="absolute bottom-0 left-0 right-0 px-8 sm:px-16 pb-20 pointer-events-none"
          >
            {slide.category && (
              <p
                className="gsap-overlay-child text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 mb-2"
                style={{ opacity: 0 }}
              >
                {slide.category}
              </p>
            )}
            {slide.title && (
              <h2
                className="gsap-overlay-child text-3xl sm:text-5xl font-black text-white leading-tight mb-3"
                style={{
                  opacity: 0,
                  fontFamily: "'Georgia', serif",
                  textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                }}
              >
                {slide.title}
              </h2>
            )}
            {slide.subtitle && (
              <p
                className="gsap-overlay-child text-sm text-white/70 tracking-wide"
                style={{ opacity: 0 }}
              >
                {slide.subtitle}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-30 pointer-events-none">
        <div
          ref={progressRef}
          className="h-full bg-white/60 origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* ── Prev Button (magnetic) ── */}
      <button
        ref={prevBtnRef}
        onClick={(e) => {
          e.stopPropagation();
          goToPrev();
        }}
        onMouseMove={(e) => handleBtnMouseMove(e, prevBtnRef)}
        onMouseLeave={() => handleBtnMouseLeave(prevBtnRef)}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/20 hover:border-white/40 transition-colors duration-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ── Next Button (magnetic) ── */}
      <button
        ref={nextBtnRef}
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        onMouseMove={(e) => handleBtnMouseMove(e, nextBtnRef)}
        onMouseLeave={() => handleBtnMouseLeave(nextBtnRef)}
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/20 hover:border-white/40 transition-colors duration-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Slide counter (top-right) ── */}
      <div className="absolute top-6 right-7 z-20 flex items-center gap-2 pointer-events-none">
        <span className="text-white font-bold text-sm tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
          {String(currentIndex + 1).padStart(2, "0")}
        </span>
        <span className="text-white/30 text-xs">/</span>
        <span className="text-white/40 text-xs">
          {String(homeCarouselData.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Dots ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {homeCarouselData.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              goToIndex(index);
            }}
            className="transition-all duration-500 rounded-full"
            style={{
              width: currentIndex === index ? "24px" : "6px",
              height: "6px",
              background:
                currentIndex === index ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
              borderRadius: "3px",
            }}
          />
        ))}
      </div>
    </div>
  );
}