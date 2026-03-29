import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();
  
  // Parallax Setup for Hero
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(heroScroll, [0, 1], [1, 0]);

  // Parallax Setup for Liquid Architecture (Section 2)
  const liquidRef = useRef(null);
  const { scrollYProgress: liquidScroll } = useScroll({ target: liquidRef, offset: ["start end", "end start"] });
  const liquidY = useTransform(liquidScroll, [0, 1], ["-20%", "20%"]);

  return (
    <div className="bg-background text-on-surface font-body overflow-x-hidden pt-20">
      
      {/* Hero Section: The Monolith Concept (Image kept same) */}
      <section ref={heroRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=1600&q=80" 
            alt="Macro texture of heavy architectural linen fabric" 
            className="w-full h-full object-cover scale-110 grayscale-[20%]" 
          />
          <div className="absolute inset-0 bg-stone-900/40"></div>
        </motion.div>
        
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-6xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="block mb-6 font-label text-[0.6875rem] uppercase tracking-[0.4rem] font-bold text-primary-fixed"
          >
            The Monolith Concept
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
            className="font-headline italic text-6xl md:text-9xl text-surface-bright tracking-tighter leading-none drop-shadow-2xl"
          >
            Unyielding <br/> Structure.
          </motion.h1>
          <motion.div 
            initial={{ height: 0 }} animate={{ height: 96 }} transition={{ duration: 1, delay: 1 }}
            className="mt-12 flex justify-center origin-top"
          >
            <div className="w-px bg-surface-bright/50"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: Archival Precision (Image kept same) */}
      <section className="bg-surface-container-low py-32 md:py-48 px-8 md:px-24">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-0 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
            className="md:col-span-5 md:pr-12 lg:pr-24"
          >
            <h2 className="font-headline italic text-4xl md:text-6xl text-on-surface mb-8 tracking-tight">Archival <br/>Precision.</h2>
            <p className="font-body text-on-surface-variant leading-relaxed text-lg mb-12 max-w-md">
              Our process begins with the microscopic analysis of fiber integrity. We reject 92% of raw materials presented to our atelier, selecting only those that exhibit the architectural strength required for the Clothsy silhouette.
            </p>
            <div className="inline-block border border-outline-variant/50 p-8 space-y-4">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-[20px]">architecture</span>
                <span className="font-label uppercase tracking-widest text-[0.6rem] font-black">Zero Tolerance Weave</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
                <span className="font-label uppercase tracking-widest text-[0.6rem] font-black">Heritage Silk Sources</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="md:col-span-7 relative h-[600px] md:h-[800px] overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80" 
              alt="Tailor working on fabrics" 
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 hover:scale-105 transition-all duration-1000" 
            />
            <div className="absolute bottom-12 -left-12 bg-surface p-12 hidden lg:block shadow-2xl">
              <p className="font-headline italic text-2xl text-on-surface leading-tight">
                "The garment must <br/> hold its own shadow."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Full Bleed Texture - Liquid Architecture (Image kept same) */}
      <section ref={liquidRef} className="relative h-[80vh] md:h-[1200px] w-full flex items-center overflow-hidden">
        <motion.div style={{ y: liquidY }} className="absolute inset-0 scale-125">
          <img 
            src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1600&q=80" 
            alt="Flowing raw silk texture" 
            className="w-full h-full object-cover grayscale brightness-75" 
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
        </motion.div>
        
        <div className="relative z-10 w-full px-8 md:px-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="max-w-3xl ml-auto text-right"
          >
            <h2 className="font-headline text-5xl md:text-8xl text-surface-bright tracking-tighter leading-none mb-8">
              Liquid <br/> Architecture.
            </h2>
            <p className="font-body text-surface-bright/80 text-xl md:text-2xl leading-relaxed font-light tracking-wide italic">
              Silk is our paradox. It flows like water yet retains the sharp memory of a fold. We treat silk as a structural element, not a mere covering.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Sourcing the Silhouette (Bento Grid) */}
      <section className="bg-surface py-32 md:py-48 px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl">
              <span className="block mb-4 font-label text-[0.6875rem] uppercase tracking-[0.4rem] font-bold text-primary">Sourcing the Silhouette</span>
              <h2 className="font-headline italic text-5xl md:text-7xl text-on-surface tracking-tight">The Global <br/> Fabric Map.</h2>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="font-body text-on-surface-variant max-w-sm pb-2">
              Traversing terrains from the high altitudes of the Andes to the humid valleys of Japan to secure the world's most disciplined fibers.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* ── REPLACED: Bento Item 1 (Okayama / Cotton) using Zara Poplin image ── */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-8 group relative overflow-hidden h-[500px] bg-surface-container">
              <img 
                src="https://static.zara.net/assets/public/bdc5/524f/a73f42059efa/6b56ec3fea18/06103407250-p/06103407250-p.jpg?ts=1770278470760&w=1024" 
                alt="Structure-First Cotton Minimalist Fabric" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] grayscale-[40%]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent flex flex-col justify-end p-12">
                <span className="text-white/60 font-label text-[0.6rem] uppercase tracking-widest mb-2">Origin 01: Okayama</span>
                <h3 className="text-white font-headline italic text-4xl">Structure-First Cotton</h3>
              </div>
            </motion.div>

            {/* ── REPLACED: Bento Item 2 (Biella / Wool) using H&M Architectural Tailoring image ── */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="md:col-span-4 group relative overflow-hidden h-[500px] bg-surface-container">
              <img 
                src="https://image.hm.com/assets/hm/dd/64/dd64de2cfe48fdb6c31636d39a28e49b6234e8d2.jpg?imwidth=2160" 
                alt="Architectural Heavy Wool weave" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] grayscale-[40%] object-top" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent flex flex-col justify-end p-12">
                <span className="text-white/60 font-label text-[0.6rem] uppercase tracking-widest mb-2">Origin 02: Biella</span>
                <h3 className="text-white font-headline italic text-4xl">Architectural Wool</h3>
              </div>
            </motion.div>

            {/* Bento Item 3 (Full Width Banner) */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-12 relative overflow-hidden h-[400px] bg-surface-container-low flex items-center justify-center p-12 text-center border border-outline-variant/30">
              <div className="max-w-2xl">
                <span className="material-symbols-outlined text-4xl text-primary mb-6">workspace_premium</span>
                <h3 className="font-headline italic text-4xl text-on-surface mb-6">The Clothsy Guarantee</h3>
                <p className="font-body text-on-surface-variant leading-relaxed uppercase tracking-[0.1rem] text-sm font-bold">
                  Every thread is tested for 48 hours under tension before entering our assembly line. If it fails by a micron, it is repurposed for secondary goods. We do not compromise on the monolith.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── REPLACED: CTA Section (Experience the Weight) using moody H&M Suiting Season image ── */}
      <section className="relative py-32 md:py-48 px-8 text-center overflow-hidden bg-on-surface">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://image.hm.com/assets/hm/54/e9/54e9bd506e4f7f2f267ce0da9fa92a52edd9a68b.jpg?imwidth=2160" 
            alt="Experience the weight silhouette" 
            className="w-full h-full object-cover grayscale-[30%] opacity-40 object-top" 
          />
          <div className="absolute inset-0 bg-stone-900/60"></div>
        </div>
        <motion.div className="relative z-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-headline italic text-4xl md:text-6xl text-surface mb-12 drop-shadow-lg">Experience the Weight.</h2>
          <button 
            onClick={() => navigate('/products')}
            className="bg-surface text-on-surface px-16 py-6 text-[0.6875rem] font-bold uppercase tracking-[0.2rem] transition-all hover:bg-primary hover:text-on-primary active:scale-95 duration-300 shadow-xl"
          >
            Explore The Collection
          </button>
        </motion.div>
      </section>

    </div>
  );
}