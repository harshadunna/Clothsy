import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { findProducts } from "../../Redux/Customers/Product/Action";

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customersProduct } = useSelector((store) => store);
  const gridRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    dispatch(
      findProducts({
        category: "mens_kurta", colors: "", sizes: "", minPrice: 0, maxPrice: 10000,
        minDiscount: 0, stock: "", sort: "price_low", pageNumber: 0, pageSize: 10,
      })
    );
  }, [dispatch]);

  // GSAP: Hero Parallax & Reveal
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

  // GSAP: Asymmetrical Grid Stagger Reveal
  useEffect(() => {
    if (customersProduct?.loading || !gridRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".product-card");
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, gridRef);
    return () => ctx.revert();
  }, [customersProduct?.loading, customersProduct?.products?.content]);

  // Safely grab top 4 products for the grid
  const products = customersProduct?.products?.content || [];
  const top4 = products.slice(0, 4);

  // Fallback structural layout for the 4 grid spots
  const gridSpans = [
    "md:col-span-7", 
    "md:col-span-4 md:col-start-9 md:mt-32", 
    "md:col-span-5", 
    "md:col-span-6 md:col-start-7"
  ];

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col">
      <main className="flex-grow">
        
        {/* Hero Section (Full Bleed) */}
        <section ref={heroRef} className="relative w-full h-[870px] bg-surface-container-highest overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
              backgroundImage: "linear-gradient(rgba(35, 26, 17, 0.2), rgba(35, 26, 17, 0.6)), url('https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2000&auto=format&fit=crop')" 
            }}
          />
          <div className="relative h-full flex flex-col justify-center px-10 md:px-24 lg:w-1/2">
            <h1 className="hero-text font-headline text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.1] text-white mb-6 tracking-[-0.02em]">
              The Fall<br/>Monolith.
            </h1>
            <p className="hero-text text-white/90 text-lg max-w-md mb-10 font-body tracking-wider">
              Structured silhouettes and uncompromising lines for the modern aesthetic.
            </p>
            <div className="hero-text">
              <button 
                onClick={() => navigate("/products")}
                className="inline-flex items-center justify-center bg-primary text-on-primary px-10 py-4 font-label text-sm font-bold uppercase tracking-widest hover:bg-primary-container transition-colors duration-300"
              >
                Explore Collection
              </button>
            </div>
          </div>
        </section>

        {/* Asymmetrical Product Grid */}
        <section className="py-24 px-10 md:px-24 bg-background" ref={gridRef}>
          <div className="flex items-end justify-between mb-16 border-b border-outline-variant/30 pb-4">
            <h2 className="font-headline text-4xl text-on-background font-bold tracking-tight">Curated Pieces</h2>
            <button 
              onClick={() => navigate("/products")}
              className="text-sm font-bold uppercase tracking-widest text-primary hover:text-primary-container flex items-center gap-2"
            >
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-24">
            {top4.map((product, index) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className={`product-card ${gridSpans[index]} group cursor-pointer`}
              >
                <div className="aspect-[3/4] overflow-hidden bg-surface-container-low mb-6 relative">
                  <img 
                    alt={product.title} 
                    src={product.imageUrl} 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  {/* Subtle hover overlay to match Stitch aesthetic */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>
                <div className="flex justify-between items-start pr-4">
                  <div>
                    <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-outline mb-2">
                      {product.brand}
                    </span>
                    <h3 className="font-headline text-2xl text-on-background font-bold mb-1 truncate max-w-[250px]">
                      {product.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm font-body tracking-wide">
                      ₹{product.discountedPrice}
                    </p>
                  </div>
                  <button className="text-primary hover:text-primary-container transition-colors flex items-center justify-center w-10 h-10 border border-transparent group-hover:border-primary">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-surface-container py-32 px-10 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-6">Join the Editorial</h2>
            <p className="text-on-surface-variant mb-12 font-body tracking-wide">
              Subscribe to receive curated collections, architectural insights, and early access to the monolith series.
            </p>
            <form className="flex flex-col md:flex-row gap-4 justify-center items-center" onSubmit={(e) => e.preventDefault()}>
              <div className="relative w-full md:w-96">
                <input 
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-outline transition-colors outline-none" 
                  placeholder="Email Address" 
                  required 
                  type="email"
                />
              </div>
              <button 
                className="w-full md:w-auto bg-primary text-on-primary px-8 py-3 font-label text-sm font-bold uppercase tracking-widest hover:bg-primary-container transition-colors" 
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