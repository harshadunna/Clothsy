import React from "react";
import { motion } from "framer-motion";

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Dispatched. The Concierge will contact you shortly.");
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-20">
      <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-5rem)]">
        
        {/* Left Side: Visual Anchor */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:w-1/2 relative h-[500px] md:h-auto overflow-hidden bg-surface-container"
        >
          <img 
            className="absolute inset-0 w-full h-full object-cover grayscale-[20%] hover:scale-105 transition-transform duration-1000 ease-out" 
            src="https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&w=1200&q=80" 
            alt="Luxury fabric texture" 
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
          <div className="absolute bottom-12 left-12 right-12">
            <h1 className="font-headline italic text-5xl md:text-7xl text-surface leading-none tracking-tighter">
              The Concierge
            </h1>
            <p className="mt-4 text-surface/80 font-label tracking-[0.2em] text-[10px] max-w-xs uppercase font-bold">
              Bespoke assistance for the discerning collector.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Contact Portal */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:w-1/2 bg-surface flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-24"
        >
          <div className="max-w-xl w-full">
            <header className="mb-16">
              <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase block mb-4">
                Inquiries
              </span>
              <h2 className="font-headline italic text-4xl md:text-5xl text-on-surface leading-tight">
                We await your correspondence.
              </h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="relative group">
                <label className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-2 transition-colors group-focus-within:text-primary">
                  Full Identity
                </label>
                <input 
                  required
                  type="text"
                  placeholder="ALEXANDER VOGUE" 
                  className="w-full bg-transparent border-0 border-b border-outline-variant/40 px-0 py-3 font-body text-sm tracking-widest uppercase placeholder:text-outline-variant/50 focus:ring-0 focus:border-primary transition-colors" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="relative group">
                  <label className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-2 transition-colors group-focus-within:text-primary">
                    Electronic Mail
                  </label>
                  <input 
                    required
                    type="email"
                    placeholder="OFFICE@CLOTHSY.COM" 
                    className="w-full bg-transparent border-0 border-b border-outline-variant/40 px-0 py-3 font-body text-sm tracking-widest uppercase placeholder:text-outline-variant/50 focus:ring-0 focus:border-primary transition-colors" 
                  />
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-2 transition-colors group-focus-within:text-primary">
                    Subject of Interest
                  </label>
                  <select className="w-full bg-transparent border-0 border-b border-outline-variant/40 px-0 py-3 font-body text-sm tracking-widest uppercase focus:ring-0 focus:border-primary transition-colors appearance-none cursor-pointer text-on-surface">
                    <option>Bespoke Commission</option>
                    <option>Archive Procurement</option>
                    <option>Press Relations</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="relative group">
                <label className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-2 transition-colors group-focus-within:text-primary">
                  Message
                </label>
                <textarea 
                  required
                  rows="4"
                  placeholder="HOW MAY WE ASSIST YOUR JOURNEY?" 
                  className="w-full bg-transparent border-0 border-b border-outline-variant/40 px-0 py-3 font-body text-sm tracking-widest uppercase placeholder:text-outline-variant/50 focus:ring-0 focus:border-primary transition-colors resize-none" 
                ></textarea>
              </div>

              <div className="pt-8">
                <button 
                  type="submit"
                  className="w-full md:w-auto px-12 py-5 bg-primary text-on-primary font-label text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-primary-container active:scale-95" 
                >
                  Dispatch Message
                </button>
              </div>
            </form>

            <footer className="mt-24 pt-12 border-t border-outline-variant/30 grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-outline uppercase mb-2">Direct Dial</p>
                <p className="font-headline italic text-2xl text-on-surface">+44 20 7946 0123</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-outline uppercase mb-2">Studio Location</p>
                <p className="font-headline italic text-2xl text-on-surface">Mayfair, London</p>
              </div>
            </footer>

          </div>
        </motion.div>
      </div>
    </div>
  );
}