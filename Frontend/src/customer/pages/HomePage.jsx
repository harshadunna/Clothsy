import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api";
import HomeSectionCarousel from "../components/HomeSectionCarousel/HomeSectionCarousel";

gsap.registerPlugin(ScrollTrigger);

// CLOUDINARY HIGH-RESOLUTION INTERCEPTOR 
const getHighResImageUrl = (url) => {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const cleanUrl = url.replace(/\/upload\/([^/]+\/)*/, "/upload/");
    return cleanUrl.replace(
      "/upload/",
      "/upload/f_auto,q_auto:best,w_2400,c_limit,dpr_auto/"
    );
  }
  return url;
};

// CATEGORY HELPERS 
const getRootCategory = (product) => {
  let cur = product?.category;
  while (cur?.parentCategory) cur = cur.parentCategory;
  return cur?.name?.toLowerCase() || "";
};
const isMens   = (p) => getRootCategory(p) === "men";
const isWomens = (p) => getRootCategory(p) === "women";

const ALL_MENS_CATS = [
  "overcoats", "suits", "raw-denim", "trousers",
  "poplin-shirts", "fine-knits", "jumpers", "knits",
];
const ALL_WOMENS_CATS = [
  "silk-dresses", "evening-dresses", "outerwear",
  "womens-trousers", "blouses",
];
const ALL_CAROUSEL_CATS = [
  "jumpers", "trousers", "raw-denim", "evening-dresses", "blouses",
  "scarves", "eyewear", "fine-knits", "jewelry", "suits",
  "silk-dresses", "outerwear", "footwear", "womens-trousers", "knits",
  "boots", "bags", "watches", "belts", "poplin-shirts", "overcoats",
];
const ALL_HERO_CATS = [
  ...ALL_MENS_CATS, ...ALL_WOMENS_CATS,
  "boots", "bags", "footwear", "scarves",
];

const GRID_SPANS = [
  "md:col-span-5",
  "md:col-span-5 md:col-start-7 md:mt-20",
  "md:col-span-4 md:col-start-2",
  "md:col-span-5 md:col-start-7",
];

// Upgraded Editorial Copy for both layouts
const HERO_THEMES = [
  {
    eyebrow: "FW25 / Campaign",
    headline: ["Structural", "Integrity."],
    sub: "Garments engineered for the modern monolith. Stripped of excess.",
    cta: "Explore Campaign",
  },
  {
    eyebrow: "The Archive",
    headline: ["Form &", "Function."],
    sub: "Revisiting foundational pieces. Built to outlast the season.",
    cta: "Shop Archive",
  },
  {
    eyebrow: "New Arrivals",
    headline: ["Quiet", "Precision."],
    sub: "Luxury defined by what is absent. Discover the latest edit.",
    cta: "View Arrivals",
  },
  {
    eyebrow: "Editorial",
    headline: ["A Study in", "Proportion."],
    sub: "Redefining the silhouette through strict architectural lines.",
    cta: "Read Editorial",
  },
  {
    eyebrow: "The Atelier",
    headline: ["Considered", "Restraint."],
    sub: "Every stitch calculated. Every detail intentional.",
    cta: "Discover More",
  },
];

const KB_ANIMATIONS = [
  "kenburns-zoom-in",
  "kenburns-pan-left",
  "kenburns-pan-right",
  "kenburns-zoom-out",
  "kenburns-diagonal",
];

const SLIDE_DURATION = 6000;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pickRandom = (arr, n) => shuffle(arr).slice(0, n);

// COMPONENT 
const HomePage = () => {
  const navigate    = useNavigate();
  const gridRef     = useRef(null);
  
  // We use two refs because there are two distinct DOM trees (Mobile vs Desktop)
  const mobileTextRef = useRef(null);
  const desktopTextRef = useRef(null);

  // Hero State
  const [heroSlides,  setHeroSlides]  = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroLoading, setHeroLoading] = useState(true);

  const isPausedRef = useRef(false);
  const [isPausedUI, setIsPausedUI] = useState(false);

  // Other State
  const [curatedProducts,  setCuratedProducts]  = useState([]);
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [carouselLoading,  setCarouselLoading]  = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [email, setEmail] = useState("");

  // Text animation helper 
  // Animates whichever layout is currently visible
  const animateHeroText = useCallback(() => {
    const targets = [];
    if (mobileTextRef.current) targets.push(...mobileTextRef.current.querySelectorAll(".hero-line"));
    if (desktopTextRef.current) targets.push(...desktopTextRef.current.querySelectorAll(".hero-line"));

    if (targets.length > 0) {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.25 }
      );
    }
  }, []);

  const timerRef = useRef(null);
  const heroSlidesLenRef = useRef(0);
  heroSlidesLenRef.current = heroSlides.length;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setActiveSlide((prev) => {
        const next = (prev + 1) % heroSlidesLenRef.current;
        requestAnimationFrame(() => setTimeout(animateHeroText, 80));
        return next;
      });
    }, SLIDE_DURATION);
  }, [animateHeroText]);

  const goToSlide = useCallback((index) => {
    setActiveSlide(index);
    animateHeroText();
    startTimer();
  }, [animateHeroText, startTimer]);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [heroSlides.length, startTimer]);

  useEffect(() => {
    if (!heroLoading && heroSlides.length > 0) {
      setTimeout(animateHeroText, 350);
    }
  }, [heroLoading, heroSlides.length, animateHeroText]);

  // Fetch hero slides 
  useEffect(() => {
    const fetch = async () => {
      try {
        setHeroLoading(true);
        const chosenCats = shuffle(ALL_HERO_CATS).slice(0, 5);
        const results = await Promise.all(
          chosenCats.map((cat) =>
            api.get("/api/products", {
              params: { category: cat, pageSize: 10, pageNumber: 0, minPrice: 0, maxPrice: 100000, minDiscount: 0, sort: "" },
            })
          )
        );
        const slides = results
          .map((res, i) => {
            const pool = res.data?.content || [];
            if (!pool.length) return null;
            const product = pickRandom(pool, 1)[0];
            return {
              imageUrl:  getHighResImageUrl(product?.imageUrl),
              theme:     HERO_THEMES[i % HERO_THEMES.length],
              kbClass:   KB_ANIMATIONS[i % KB_ANIMATIONS.length],
              productId: product?.id,
            };
          })
          .filter((s) => s?.imageUrl);
        setHeroSlides(slides.length > 0 ? slides : null); 
      } catch {
        setHeroSlides(
          HERO_THEMES.map((theme, i) => ({
            imageUrl: [
              "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=100&w=2400&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=100&w=2400&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=100&w=2400&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=100&w=2400&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=100&w=2400&auto=format&fit=crop",
            ][i],
            theme,
            kbClass:   KB_ANIMATIONS[i],
            productId: null,
          }))
        );
      } finally {
        setHeroLoading(false);
      }
    };
    fetch();
  }, []);

  // Fetch curated grid 
  useEffect(() => {
    const fetch = async () => {
      try {
        const mensCats   = shuffle(ALL_MENS_CATS);
        const womensCats = shuffle(ALL_WOMENS_CATS);
        let mensItems = [], womensItems = [];
        for (const cat of mensCats) {
          if ((mensItems || []).length >= 2) break;
          const res = await api.get("/api/products", {
            params: { category: cat, pageSize: 10, pageNumber: 0, minPrice: 0, maxPrice: 100000, minDiscount: 0, sort: "" },
          });
          mensItems = [...mensItems, ...pickRandom(res.data?.content || [], 2)];
        }
        for (const cat of womensCats) {
          if ((womensItems || []).length >= 2) break;
          const res = await api.get("/api/products", {
            params: { category: cat, pageSize: 10, pageNumber: 0, minPrice: 0, maxPrice: 100000, minDiscount: 0, sort: "" },
          });
          womensItems = [...womensItems, ...pickRandom(res.data?.content || [], 2)];
        }
        const uM = [...new Map((mensItems || []).map((p)   => [p.id, p])).values()].slice(0, 2);
        const uW = [...new Map((womensItems || []).map((p) => [p.id, p])).values()].slice(0, 2);
        setCuratedProducts([uW[0], uM[0], uW[1], uM[1]].filter(Boolean));
      } catch (err) {
        console.error("Curated fetch error:", err);
      }
    };
    fetch();
  }, []);

  // Fetch carousel 
  useEffect(() => {
    const fetch = async () => {
      try {
        setCarouselLoading(true);
        const chosenCats = shuffle(ALL_CAROUSEL_CATS).slice(0, 4);
        const results = await Promise.all(
          chosenCats.map((cat) =>
            api.get("/api/products", {
              params: { category: cat, pageSize: 10, pageNumber: 0, minPrice: 0, maxPrice: 100000, minDiscount: 0, sort: "" },
            })
          )
        );
        const pool    = results.flatMap((res) => pickRandom(res.data?.content || [], 5));
        const unique  = [...new Map(pool.map((p) => [p.id, p])).values()];
        const optimized = unique.map((p) => ({ ...p, imageUrl: getHighResImageUrl(p.imageUrl) }));
        setCarouselProducts(shuffle(optimized).slice(0, 16));
      } catch (err) {
        console.error("Carousel fetch error:", err);
      } finally {
        setCarouselLoading(false);
      }
    };
    fetch();
  }, []);

  // GSAP curated scroll-in 
  useEffect(() => {
    if (!curatedProducts?.length || !gridRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".curated-card");
      if (cards.length > 0) {
        gsap.fromTo(cards, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.15,
          scrollTrigger: { trigger: gridRef.current, start: "top 85%", toggleActions: "play none none reverse" },
        });
      }
    }, gridRef);
    return () => ctx.revert();
  }, [curatedProducts]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setShowNotification(true);
    setEmail("");
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleHeroClick = () => {
    const s = heroSlides[activeSlide];
    navigate(s?.productId ? `/product/${s.productId}` : "/products");
  };

  const currentTheme = heroSlides[activeSlide]?.theme || HERO_THEMES[0];

  return (
    <>
      <style>{`
        @keyframes kb-zoom-in   { from{transform:scale(1.12)}          to{transform:scale(1.0)} }
        @keyframes kb-pan-left  { from{transform:scale(1.08) translateX(3%)}  to{transform:scale(1.04) translateX(0%)} }
        @keyframes kb-pan-right { from{transform:scale(1.08) translateX(-3%)} to{transform:scale(1.04) translateX(0%)} }
        @keyframes kb-zoom-out  { from{transform:scale(1.0)}           to{transform:scale(1.07)} }
        @keyframes kb-diagonal  { from{transform:scale(1.1) translate(2%,1%)} to{transform:scale(1.03) translate(0%,0%)} }

        .kenburns-zoom-in   { animation: kb-zoom-in   6.5s ease-out forwards; }
        .kenburns-pan-left  { animation: kb-pan-left  6.5s ease-out forwards; }
        .kenburns-pan-right { animation: kb-pan-right 6.5s ease-out forwards; }
        .kenburns-zoom-out  { animation: kb-zoom-out  6.5s ease-in  forwards; }
        .kenburns-diagonal  { animation: kb-diagonal  6.5s ease-out forwards; }

        @keyframes progress-fill { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        .progress-bar {
          transform-origin: left;
          animation: progress-fill ${SLIDE_DURATION / 1000}s linear forwards;
        }
      `}</style>

      <div className="bg-[#FFF8F5] text-[#1A1109] antialiased min-h-screen flex flex-col selection:bg-[#C8742A] selection:text-[#FFF8F5]">

        {/* NOTIFICATION */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-0 w-full flex justify-center z-[100] px-6 pointer-events-none"
            >
              <div className="bg-[#1A1109] text-[#FFF8F5] px-8 py-4 shadow-2xl border border-[#C8742A]/30 flex items-center gap-4">
                <span className="material-symbols-outlined text-sm text-[#C8742A]" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] font-black">
                  Archive Access Granted. Welcome to the Editorial.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-grow">

          {/* 1A. MOBILE HERO (Slow-Burn Crossfade) - Hidden on md+ */}
          <section
            className="flex md:hidden relative w-full h-[90vh] min-h-[600px] overflow-hidden bg-[#1A1109]"
            onMouseEnter={() => { isPausedRef.current = true;  setIsPausedUI(true);  }}
            onMouseLeave={() => { isPausedRef.current = false; setIsPausedUI(false); }}
          >
            {/* Background Images */}
            {heroLoading ? (
              <div className="absolute inset-0 bg-[#1A1109] animate-pulse" />
            ) : (
              heroSlides.map((slide, i) => (
                <div
                  key={`mobile-bg-${i}`}
                  onClick={handleHeroClick}
                  className="absolute inset-0 overflow-hidden cursor-pointer"
                  style={{
                    opacity:    i === activeSlide ? 1 : 0,
                    transition: "opacity 1.3s ease-in-out",
                    zIndex:     i === activeSlide ? 1 : 0,
                  }}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.theme?.headline?.join(" ") || "Clothsy Product"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    decoding="async"
                    className={`w-full h-full object-cover object-top ${i === activeSlide ? slide.kbClass : ""}`}
                    style={{ willChange: "transform", imageRendering: "high-quality" }}
                  />
                  {/* Gradients to make text readable on mobile */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(26,17,9,0.75) 0%, rgba(26,17,9,0.4) 60%, rgba(26,17,9,0.1) 100%)" }} />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(26,17,9,0.6) 0%, transparent 50%)" }} />
                </div>
              ))
            )}

            {/* Mobile Text Overlay */}
            <div ref={mobileTextRef} className="relative z-20 h-full w-full flex flex-col justify-center px-6 pt-12 pointer-events-none">
              
              <div className="hero-line flex items-center gap-3 mb-5">
                <div className="w-6 h-[1px] bg-[#C8742A]"></div>
                <p className="text-[#C8742A] text-[9px] uppercase tracking-[0.4em] font-label font-bold">
                  {currentTheme.eyebrow}
                </p>
              </div>

              <h1 className="font-headline italic text-[#FFF8F5] leading-[0.95] tracking-tighter mb-6">
                <span className="hero-line block text-[13vw] font-light">{currentTheme.headline[0]}</span>
                <span className="hero-line block text-[13vw] font-light">{currentTheme.headline[1]}</span>
              </h1>

              <div className="hero-line border-l border-[#FFF8F5]/20 pl-4 mb-8">
                <p className="text-[#FFF8F5]/70 text-[11px] font-body tracking-[0.05em] leading-relaxed max-w-[280px]">
                  {currentTheme.sub}
                </p>
              </div>

              <div className="hero-line flex items-center gap-5 pointer-events-auto">
                <button
                  onClick={handleHeroClick}
                  className="inline-flex items-center justify-center gap-3 bg-transparent border border-[#FFF8F5]/30 text-[#FFF8F5] px-6 py-3 font-label text-[0.6rem] font-black uppercase tracking-[0.25em] active:bg-[#FFF8F5] active:text-[#1A1109]"
                >
                  {currentTheme.cta}
                  <span className="text-xs leading-none font-light">→</span>
                </button>
              </div>
            </div>

            {/* Mobile Progress Indicators */}
            <div className="absolute bottom-8 left-6 z-20 flex items-center gap-3">
              <span className="text-white/50 text-[9px] font-label font-bold tracking-widest select-none w-4">
                {String(activeSlide + 1).padStart(2, "0")}
              </span>
              <div className="flex gap-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={`mob-btn-${i}`}
                    onClick={() => goToSlide(i)}
                    className="relative h-[2px] overflow-hidden transition-all duration-500"
                    style={{ width: i === activeSlide ? "32px" : "12px", background: "rgba(255,255,255,0.2)" }}
                  >
                    {i === activeSlide
                      ? <span className="absolute inset-0 bg-white progress-bar" />
                      : <span className="absolute inset-0 bg-white/40" />
                    }
                  </button>
                ))}
              </div>
            </div>
          </section>


          {/* 1B. DESKTOP HERO (50/50 Split) - Hidden on smaller screens    */}
          <section
            className="hidden md:flex relative w-full h-[90vh] min-h-[640px] overflow-hidden bg-[#1A1109]"
            onMouseEnter={() => { isPausedRef.current = true;  setIsPausedUI(true);  }}
            onMouseLeave={() => { isPausedRef.current = false; setIsPausedUI(false); }}
          >
            {/* Left Pane: Typography */}
            <div className="relative w-1/2 h-full flex flex-col justify-center px-12 lg:px-28 bg-[#1A1109] z-20 border-r border-[#FFF8F5]/10">
              <div ref={desktopTextRef} className="max-w-xl">
                
                {/* Eyebrow */}
                <div className="hero-line flex items-center gap-4 mb-6 lg:mb-8">
                  <div className="w-8 h-[1px] bg-[#C8742A]"></div>
                  <p className="text-[#C8742A] text-[10px] uppercase tracking-[0.4em] font-label font-bold">
                    {currentTheme.eyebrow}
                  </p>
                </div>

                {/* Main Headline */}
                <h1 className="font-headline italic text-[#FFF8F5] leading-[0.9] tracking-tighter mb-8 lg:mb-10">
                  <span className="hero-line block text-[6.5vw] lg:text-[5.5vw] font-light">
                    {currentTheme.headline[0]}
                  </span>
                  <span className="hero-line block text-[6.5vw] lg:text-[5.5vw] font-light">
                    {currentTheme.headline[1]}
                  </span>
                </h1>

                {/* Subtext with Border Accent */}
                <div className="hero-line border-l border-[#FFF8F5]/20 pl-5 mb-10 lg:mb-12">
                  <p className="text-[#FFF8F5]/70 text-[13px] font-body tracking-[0.05em] leading-relaxed max-w-sm">
                    {currentTheme.sub}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="hero-line flex items-center gap-6">
                  <button
                    onClick={handleHeroClick}
                    className="inline-flex items-center justify-center gap-4 bg-transparent border border-[#FFF8F5]/30 text-[#FFF8F5] px-10 py-4 font-label text-[0.7rem] font-black uppercase tracking-[0.25em] hover:bg-[#FFF8F5] hover:text-[#1A1109] hover:border-[#FFF8F5] transition-all duration-500"
                  >
                    {currentTheme.cta}
                    <span className="text-sm leading-none font-light">→</span>
                  </button>
                  <button
                    onClick={() => navigate("/products")}
                    className="text-[#FFF8F5]/50 hover:text-[#FFF8F5] text-[10px] uppercase tracking-[0.25em] font-label font-bold transition-colors"
                  >
                    View All
                  </button>
                </div>
              </div>

              {/* Progress indicators (Desktop Bottom Left) */}
              <div className="absolute bottom-10 left-12 lg:left-28 z-20 flex items-center gap-4">
                <span className="text-white/40 text-[10px] font-label font-bold tracking-widest select-none w-4">
                  {String(activeSlide + 1).padStart(2, "0")}
                </span>
                <div className="flex gap-2">
                  {heroSlides.map((_, i) => (
                    <button
                      key={`desk-btn-${i}`}
                      onClick={() => goToSlide(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className="relative h-[2px] overflow-hidden transition-all duration-500 cursor-pointer"
                      style={{ width: i === activeSlide ? "40px" : "16px", background: "rgba(255,255,255,0.15)" }}
                    >
                      {i === activeSlide
                        ? <span className="absolute inset-0 bg-white progress-bar" />
                        : <span className="absolute inset-0 bg-white/40 hover:bg-white/80 transition-colors" />
                      }
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pane: Image Box */}
            <div className="relative w-1/2 h-full overflow-hidden bg-[#E8E1DE] cursor-pointer group" onClick={handleHeroClick}>
              {heroLoading ? (
                <div className="absolute inset-0 bg-[#1A1109] animate-pulse" />
              ) : (
                heroSlides.map((slide, i) => (
                  <div
                    key={`desk-bg-${i}`}
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      opacity:    i === activeSlide ? 1 : 0,
                      transition: "opacity 1.3s ease-in-out",
                      zIndex:     i === activeSlide ? 1 : 0,
                    }}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.theme?.headline?.join(" ") || "Clothsy Product"}
                      fetchPriority={i === 0 ? "high" : "low"}
                      decoding="async"
                      className={`w-full h-full object-cover object-top ${i === activeSlide ? slide.kbClass : ""}`}
                      style={{ willChange: "transform", imageRendering: "high-quality" }}
                    />
                  </div>
                ))
              )}

              {/* Subtle gradient to blend image into the text section softly */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1109]/30 to-transparent pointer-events-none z-10" />

              {/* Paused label */}
              <AnimatePresence>
                {isPausedUI && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute top-8 right-10 z-20 text-[#FFF8F5] border border-[#FFF8F5]/30 bg-[#1A1109]/40 backdrop-blur-md px-4 py-2 text-[9px] uppercase tracking-[0.3em] font-label font-bold pointer-events-none"
                  >
                    Paused
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 2. CURATED EDIT */}
          {curatedProducts?.length > 0 && (
            <section ref={gridRef} className="py-20 md:py-28 px-6 md:px-16 max-w-[1440px] mx-auto">
              <div className="flex flex-col md:flex-row items-baseline justify-between mb-14 border-b border-[#D1C4BC] pb-5">
                <div>
                  <h2 className="font-headline text-3xl md:text-4xl text-[#1A1109] italic tracking-tighter">Curated Edit</h2>
                  <p className="text-[#7F756E] text-[0.6rem] uppercase tracking-[0.25em] mt-1">2 Womens &nbsp;·&nbsp; 2 Mens</p>
                </div>
                <button
                  onClick={() => navigate("/products")}
                  className="mt-4 md:mt-0 text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#1A1109] hover:text-[#C8742A] transition-colors border-b border-[#1A1109] hover:border-[#C8742A] pb-1"
                >
                  View Archive
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-16">
                {(curatedProducts || []).map((product, index) => {
                  const genderLabel = isMens(product) ? "Mens" : isWomens(product) ? "Womens" : null;
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className={`curated-card ${GRID_SPANS[index % 4]} group cursor-pointer`}
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-[#E8E1DE] mb-4 relative">
                        <img
                          alt={product.title}
                          src={getHighResImageUrl(product.imageUrl)}
                          decoding="async"
                          sizes="(max-width: 768px) 100vw, 40vw"
                          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105 grayscale-[15%] group-hover:grayscale-0"
                          style={{ imageRendering: "high-quality" }}
                        />
                        {genderLabel && (
                          <span className="absolute bottom-3 left-3 text-[0.5rem] font-black uppercase tracking-[0.25em] bg-[#1A1109]/80 text-[#FFF8F5] px-2.5 py-1">
                            {genderLabel}
                          </span>
                        )}
                        {product.discountPercent > 0 && (
                          <span className="absolute top-3 right-3 text-[0.5rem] font-black uppercase tracking-wider bg-[#C8742A] text-[#FFF8F5] px-2.5 py-1">
                            −{product.discountPercent}%
                          </span>
                        )}
                      </div>
                      <span className="block text-[0.55rem] font-bold uppercase tracking-[0.3em] text-[#7F756E] mb-1">
                        {product.brand || "CLOTHSY ATELIER"}
                      </span>
                      <h3 className="font-headline italic text-lg md:text-xl text-[#1A1109] mb-1.5 leading-snug">{product.title}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[#1A1109] font-label font-bold tracking-widest text-[11px]">
                          ₹{(product.discountedPrice || product.price).toLocaleString("en-IN")}
                        </p>
                        {product.discountPercent > 0 && (
                          <p className="text-[#7F756E] line-through text-[10px]">
                            ₹{product.price.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 3. NEW ACQUISITIONS CAROUSEL */}
          <HomeSectionCarousel data={carouselProducts} sectionName="New Acquisitions" loading={carouselLoading} />

          {/* 4. NEWSLETTER */}
          <section className="bg-[#E8E1DE] py-24 md:py-32 px-6 md:px-12 text-center border-t border-[#D1C4BC]">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-headline italic text-4xl md:text-5xl text-[#1A1109] mb-6 tracking-tighter">Join the Editorial</h2>
              <p className="text-[#7F756E] mb-10 font-body text-xs leading-relaxed max-w-md mx-auto">
                Subscribe to receive curated collections, architectural insights, and early access to new arrivals.
              </p>
              <form className="flex flex-col md:flex-row gap-4 justify-center items-center" onSubmit={handleSubscribe}>
                <div className="relative w-full md:w-80">
                  <input
                    className="w-full bg-transparent border-0 border-b border-[#1A1109] focus:ring-0 focus:border-[#C8742A] px-0 py-3 text-[#1A1109] placeholder:text-[#7F756E] font-label text-[10px] uppercase tracking-widest transition-colors outline-none"
                    placeholder="EMAIL ADDRESS" required type="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  className="w-full md:w-auto bg-[#1A1109] text-[#FFF8F5] px-8 py-3.5 font-label text-[0.65rem] font-black uppercase tracking-[0.2em] hover:bg-[#C8742A] transition-colors"
                  type="submit"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </section>

        </main>
      </div>
    </>
  );
};

export default HomePage;