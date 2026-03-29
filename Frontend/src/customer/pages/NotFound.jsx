import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound({ productImage }) {
  const navigate = useNavigate();

  // Fallback to default editorial image if no product image is passed
  const displayImage = productImage || "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=800&q=80";

  return (
    <main className="relative min-h-screen flex items-center justify-center pt-24 px-8 overflow-hidden bg-background">
      
      {/* ghosted Architectural Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 flex justify-center items-center">
        <span className="font-headline italic font-bold text-[30rem] md:text-[40rem] text-outline-variant select-none leading-none">
          404
        </span>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: SYNCED IMAGE */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-5 relative group overflow-hidden"
        >
          <div className="aspect-[3/4] bg-surface-container-low overflow-hidden border border-outline-variant/20">
            <img 
              className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-105" 
              src={displayImage}
              alt="Archived piece"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary px-6 py-4">
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em]">Archived Piece</p>
          </div>
        </motion.div>

        {/* Right Side: Message */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-6 md:col-start-7 flex flex-col items-start"
        >
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6">Archive Notice</p>
          
          <h1 className="font-headline text-6xl md:text-8xl leading-[0.9] tracking-tighter font-bold mb-8 italic text-on-surface">
            This look is <br/>
            <span className="text-outline-variant" style={{ WebkitTextStroke: "1px #8f4a00", color: "transparent" }}>
              out of stock.
            </span>
          </h1>
          
          <p className="font-body text-lg text-on-surface-variant max-w-md mb-12 leading-relaxed opacity-80">
            The piece you are seeking has been archived or is currently unavailable. We suggest returning to the main floor to discover our current collection.
          </p>

          {/* Sharp CTA */}
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <button 
              onClick={() => navigate("/")}
              className="bg-primary text-on-primary px-12 py-5 font-label text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-primary-container active:scale-[0.98] text-center"
            >
              Back to Home
            </button>
            <button 
              onClick={() => navigate("/products")}
              className="border border-outline-variant px-12 py-5 font-label text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:border-primary hover:text-primary active:scale-[0.98] text-center"
            >
              Shop Products
            </button>
          </div>

        </motion.div>
      </div>

      {/* Decorative Lines */}
      <div className="absolute top-[20%] right-[10%] w-32 h-32 border border-primary/10 pointer-events-none rotate-45"></div>
      <div className="absolute bottom-[15%] left-[5%] w-64 h-[1px] bg-primary/20 pointer-events-none"></div>
    </main>
  );
}