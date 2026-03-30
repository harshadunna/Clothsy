import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Contact() {
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Trigger the popup instead of the browser alert
    setShowPopup(true);
    
    // Automatically hide the popup after 4 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 4000);
  };

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] font-body min-h-screen pt-24 selection:bg-[#C8742A] selection:text-[#FFF8F5]">
      <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-6rem)] max-w-[1440px] mx-auto">
        
        {/* LEFT SIDE: VISUAL ANCHOR (Using your external image URL) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:w-1/2 relative h-[500px] md:h-auto overflow-hidden bg-[#E8E1DE]"
        >
          <img 
            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-[2s] ease-out" 
            src="https://select-tomato-tiswff7jbi.edgeone.app/solid-curvy-fabrics-curtains.jpg" 
            alt="Solid curvy luxury fabric" 
          />
          {/* Subtle darkening overlay so the white text remains readable */}
          <div className="absolute inset-0 bg-[#1A1109]/10 mix-blend-multiply"></div>
          
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <h1 className="font-headline italic text-5xl md:text-7xl text-[#FFF8F5] leading-none tracking-tighter drop-shadow-lg">
              The Concierge
            </h1>
            <p className="mt-4 text-[#FFF8F5] font-label tracking-[0.2em] text-[10px] max-w-xs uppercase font-bold drop-shadow-md">
              Bespoke assistance for the discerning collector.
            </p>
          </div>
        </motion.div>

        {/* RIGHT SIDE: CONTACT PORTAL */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:w-1/2 bg-[#FFF8F5] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-24"
        >
          <div className="max-w-xl w-full">
            <header className="mb-16">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#7F756E] uppercase block mb-4">
                Inquiries
              </span>
              <h2 className="font-headline italic text-4xl md:text-5xl text-[#1A1109] leading-tight tracking-tight">
                We await your correspondence.
              </h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Full Identity */}
              <div className="relative group">
                <label className="text-[10px] font-bold tracking-widest text-[#7F756E] uppercase block mb-2 transition-colors group-focus-within:text-[#C8742A]">
                  Full Identity
                </label>
                <input 
                  required
                  type="text"
                  placeholder="ALEXANDER VOGUE" 
                  className="w-full bg-transparent border-0 border-b border-[#D1C4BC] px-0 py-3 font-label text-xs tracking-widest uppercase placeholder:text-[#D1C4BC] text-[#1A1109] focus:ring-0 focus:border-[#C8742A] transition-colors outline-none" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Electronic Mail */}
                <div className="relative group">
                  <label className="text-[10px] font-bold tracking-widest text-[#7F756E] uppercase block mb-2 transition-colors group-focus-within:text-[#C8742A]">
                    Electronic Mail
                  </label>
                  <input 
                    required
                    type="email"
                    placeholder="OFFICE@CLOTHSY.COM" 
                    className="w-full bg-transparent border-0 border-b border-[#D1C4BC] px-0 py-3 font-label text-xs tracking-widest uppercase placeholder:text-[#D1C4BC] text-[#1A1109] focus:ring-0 focus:border-[#C8742A] transition-colors outline-none" 
                  />
                </div>

                {/* Subject of Interest */}
                <div className="relative group">
                  <label className="text-[10px] font-bold tracking-widest text-[#7F756E] uppercase block mb-2 transition-colors group-focus-within:text-[#C8742A]">
                    Subject of Interest
                  </label>
                  <select className="w-full bg-transparent border-0 border-b border-[#D1C4BC] px-0 py-3 font-label text-xs tracking-widest uppercase focus:ring-0 focus:border-[#C8742A] transition-colors appearance-none cursor-pointer text-[#1A1109] outline-none">
                    <option>Bespoke Commission</option>
                    <option>Archive Procurement</option>
                    <option>Press Relations</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="relative group">
                <label className="text-[10px] font-bold tracking-widest text-[#7F756E] uppercase block mb-2 transition-colors group-focus-within:text-[#C8742A]">
                  Message
                </label>
                <textarea 
                  required
                  rows="4"
                  placeholder="HOW MAY WE ASSIST YOUR JOURNEY?" 
                  className="w-full bg-transparent border-0 border-b border-[#D1C4BC] px-0 py-3 font-label text-xs tracking-widest uppercase placeholder:text-[#D1C4BC] text-[#1A1109] focus:ring-0 focus:border-[#C8742A] transition-colors resize-none outline-none" 
                ></textarea>
              </div>

              <div className="pt-8">
                <button 
                  type="submit"
                  className="w-full md:w-auto px-12 py-5 bg-[#1A1109] text-[#FFF8F5] font-label text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#C8742A] active:scale-95" 
                >
                  Dispatch Message
                </button>
              </div>
            </form>

            <footer className="mt-24 pt-12 border-t border-[#D1C4BC] grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#7F756E] uppercase mb-2">Direct Dial</p>
                <p className="font-headline italic text-2xl text-[#1A1109] tracking-tight">+44 20 7946 0123</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#7F756E] uppercase mb-2">Studio Location</p>
                <p className="font-headline italic text-2xl text-[#1A1109] tracking-tight">Mayfair, London</p>
              </div>
            </footer>

          </div>
        </motion.div>
      </div>

      {/* TOAST POPUP NOTIFICATION */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-8 right-8 bg-[#1A1109] text-[#FFF8F5] pl-5 pr-8 py-5 flex items-center gap-4 z-[9999] shadow-2xl border-l-[3px] border-[#C8742A]"
          >
            <span className="material-symbols-outlined text-[#C8742A] text-2xl">check_circle</span>
            <div>
              <p className="font-headline italic text-xl leading-none mb-1">Message Dispatched</p>
              <p className="font-label text-[9px] uppercase tracking-widest text-[#D1C4BC]">The Concierge will contact you shortly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}