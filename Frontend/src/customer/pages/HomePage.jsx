import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../../config/api";
import HomeSectionCarousel from "../components/HomeSectionCarousel/HomeSectionCarousel";

gsap.registerPlugin(ScrollTrigger);

// CATEGORY HELPERS
const getRootCategory = (product) => {
  let cur = product?.category;
  while (cur?.parentCategory) cur = cur.parentCategory;
  return cur?.name?.toLowerCase() || "";
};
const isMens   = (p) => getRootCategory(p) === "atelier";
const isWomens = (p) => getRootCategory(p) === "collections";

// All L3 category slugs in your DB
const ALL_MENS_CATS = [
  "overcoats", "suits", "raw-denim", "trousers",
  "poplin-shirts", "fine-knits", "jumpers", "knits",
];
const ALL_WOMENS_CATS = [
  "silk-dresses", "evening-dresses", "outerwear",
  "womens-trousers", "blouses",
];
// Every category available for the carousel (all genders, all types)
const ALL_CAROUSEL_CATS = [
  "jumpers", "trousers", "raw-denim", "evening-dresses", "blouses",
  "scarves", "eyewear", "fine-knits", "jewelry", "suits",
  "silk-dresses", "outerwear", "footwear", "womens-trousers", "knits",
  "boots", "bags", "watches", "belts", "poplin-shirts", "overcoats",
];

// Asymmetric 12-col spans for curated grid: W, M, W, M
const GRID_SPANS = [
  "md:col-span-5",
  "md:col-span-5 md:col-start-7 md:mt-20",
  "md:col-span-4 md:col-start-2",
  "md:col-span-5 md:col-start-7",
];

/** Fisher-Yates shuffle — returns a new shuffled array */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Pick up to `n` random items from an array */
const pickRandom = (arr, n) => shuffle(arr).slice(0, n);

const HomePage = () => {
  const navigate = useNavigate();
  const heroRef  = useRef(null);
  const gridRef  = useRef(null);

  const [curatedProducts,  setCuratedProducts]  = useState([]);
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [carouselLoading,  setCarouselLoading]  = useState(true);

  // Fetch curated grid: 2 random mens + 2 random womens
  useEffect(() => {
    const fetchCurated = async () => {
      try {
        const mensCatsOrdered   = shuffle(ALL_MENS_CATS);
        const womensCatsOrdered = shuffle(ALL_WOMENS_CATS);

        let mensItems   = [];
        let womensItems = [];

        for (const cat of mensCatsOrdered) {
          if (mensItems.length >= 2) break;
          const res  = await api.get("/api/products", {
            params: { category: cat, pageSize: 10, pageNumber: 0, minPrice: 0, maxPrice: 100000, minDiscount: 0, sort: "" },
          });
          const pool = res.data?.content || [];
          mensItems  = [...mensItems, ...pickRandom(pool, 2 - mensItems.length + 2)];
        }

        for (const cat of womensCatsOrdered) {
          if (womensItems.length >= 2) break;
          const res   = await api.get("/api/products", {
            params: { category: cat, pageSize: 10, pageNumber: 0, minPrice: 0, maxPrice: 100000, minDiscount: 0, sort: "" },
          });
          const pool  = res.data?.content || [];
          womensItems = [...womensItems, ...pickRandom(pool, 2 - womensItems.length + 2)];
        }

        const uniqueMens   = [...new Map(mensItems.map((p)   => [p.id, p])).values()].slice(0, 2);
        const uniqueWomens = [...new Map(womensItems.map((p) => [p.id, p])).values()].slice(0, 2);

        setCuratedProducts(
          [uniqueWomens[0], uniqueMens[0], uniqueWomens[1], uniqueMens[1]].filter(Boolean)
        );
      } catch (err) {
        console.error("Curated fetch error:", err);
      }
    };
    fetchCurated();
  }, []);

  // Fetch carousel: random sample across ALL categories
  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        setCarouselLoading(true);

        // Pick 4 random categories to sample from this visit
        const chosenCats = shuffle(ALL_CAROUSEL_CATS).slice(0, 4);

        // Fetch up to 5 random products from each chosen category in parallel
        const results = await Promise.all(
          chosenCats.map((cat) =>
            api.get("/api/products", {
              params: {
                category: cat, pageSize: 10, pageNumber: 0,
                minPrice: 0, maxPrice: 100000, minDiscount: 0, sort: "",
              },
            })
          )
        );

        // Flatten, shuffle each category's pool, take random picks, deduplicate
        const pool = results.flatMap((res) =>
          pickRandom(res.data?.content || [], 5)
        );
        const unique = [...new Map(pool.map((p) => [p.id, p])).values()];
        
        // Final shuffle of the merged pool so order varies too
        setCarouselProducts(shuffle(unique).slice(0, 16));
      } catch (err) {
        console.error("Carousel fetch error:", err);
      } finally {
        setCarouselLoading(false);
      }
    };
    fetchCarousel();
  }, []);

  // GSAP — Hero entrance
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-text",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", stagger: 0.2, delay: 0.2 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // GSAP — Curated grid scroll-in
  useEffect(() => {
    if (!curatedProducts.length || !gridRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".curated-card");
      if (cards.length > 0) {
        gsap.fromTo(cards, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.15,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, gridRef);
    return () => ctx.revert();
  }, [curatedProducts]);

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] antialiased min-h-screen flex flex-col selection:bg-[#C8742A] selection:text-[#FFF8F5]">
      <main className="flex-grow">

        {/* 1. HERO */}
        <section
          ref={heroRef}
          className="relative w-full h-[85vh] min-h-[600px] max-h-[900px] bg-[#1A1109] overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center grayscale-[15%]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(26,17,9,0.3), rgba(26,17,9,0.7)), url('https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2000&auto=format&fit=crop')",
            }}
          />
          <div className="relative h-full flex flex-col justify-center px-6 md:px-12 lg:px-24 lg:w-1/2 pt-16">
            <h1 className="hero-text font-headline italic text-5xl md:text-7xl lg:text-[6.5rem] font-light leading-[1.05] text-[#FFF8F5] mb-6 tracking-tighter">
              The Fall<br />Monolith.
            </h1>
            <p className="hero-text text-[#FFF8F5]/80 text-xs md:text-sm max-w-md mb-10 font-body tracking-[0.05em] uppercase leading-relaxed">
              Structured silhouettes and uncompromising lines for the modern aesthetic.
            </p>
            <div className="hero-text">
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center justify-center bg-[#FFF8F5] text-[#1A1109] px-10 py-5 font-label text-[0.7rem] font-black uppercase tracking-[0.2em] hover:bg-[#1A1109] hover:text-[#FFF8F5] border border-transparent hover:border-[#FFF8F5] transition-all duration-500"
              >
                Explore Collection
              </button>
            </div>
          </div>
        </section>

        {/* 2. CURATED EDIT */}
        {curatedProducts.length > 0 && (
          <section
            ref={gridRef}
            className="py-20 md:py-28 px-6 md:px-16 max-w-[1440px] mx-auto"
          >
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-14 border-b border-[#D1C4BC] pb-5">
              <div>
                <h2 className="font-headline text-3xl md:text-4xl text-[#1A1109] italic tracking-tighter">
                  Curated Edit
                </h2>
                <p className="text-[#7F756E] text-[0.6rem] uppercase tracking-[0.25em] mt-1">
                  2 Womens &nbsp;·&nbsp; 2 Mens
                </p>
              </div>
              <button
                onClick={() => navigate("/products")}
                className="mt-4 md:mt-0 text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#1A1109] hover:text-[#C8742A] transition-colors border-b border-[#1A1109] hover:border-[#C8742A] pb-1"
              >
                View Archive
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-16">
              {curatedProducts.map((product, index) => {
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
                        src={product.imageUrl}
                        className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105 grayscale-[15%] group-hover:grayscale-0"
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
                    <h3 className="font-headline italic text-lg md:text-xl text-[#1A1109] mb-1.5 leading-snug">
                      {product.title}
                    </h3>
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
        <HomeSectionCarousel
          data={carouselProducts}
          sectionName="New Acquisitions"
          loading={carouselLoading}
        />

        {/* 4. NEWSLETTER */}
        <section className="bg-[#E8E1DE] py-24 md:py-32 px-6 md:px-12 text-center border-t border-[#D1C4BC]">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-headline italic text-4xl md:text-5xl text-[#1A1109] mb-6 tracking-tighter">
              Join the Editorial
            </h2>
            <p className="text-[#7F756E] mb-10 font-body text-xs leading-relaxed max-w-md mx-auto">
              Subscribe to receive curated collections, architectural insights,
              and early access to the monolith series.
            </p>
            <form
              className="flex flex-col md:flex-row gap-4 justify-center items-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative w-full md:w-80">
                <input
                  className="w-full bg-transparent border-0 border-b border-[#1A1109] focus:ring-0 focus:border-[#C8742A] px-0 py-3 text-[#1A1109] placeholder:text-[#7F756E] font-label text-[10px] uppercase tracking-widest transition-colors outline-none"
                  placeholder="EMAIL ADDRESS"
                  required
                  type="email"
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
  );
};

export default HomePage;