import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PaymentCancel() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Grab the order ID if it was passed back by the payment gateway
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  return (
    <div className="min-h-screen bg-background text-on-background font-body pt-20 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 py-12 lg:py-0">
        
        {/* Hero Image Column (Asymmetric Layout) */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-12 lg:col-span-7 h-[400px] lg:h-[750px] relative overflow-hidden order-2 lg:order-1 bg-surface-container"
        >
          <img 
            src="https://images.unsplash.com/photo-1600165328224-8175b5b00c82?auto=format&fit=crop&w=1200&q=80" 
            alt="Draped linen fabric" 
            className="w-full h-full object-cover grayscale-[20%] opacity-90 transition-transform duration-1000 hover:scale-105" 
          />
          <div className="absolute inset-0 bg-primary/5 mix-blend-multiply"></div>
        </motion.div>

        {/* Content Column */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-12 lg:col-span-5 flex flex-col justify-center lg:pl-16 order-1 lg:order-2"
        >
          <div className="flex flex-col space-y-12">
            
            {/* Minimalist Close Icon */}
            <div className="flex justify-start">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-none border border-outline-variant/40 flex items-center justify-center p-0">
                <span className="material-symbols-outlined text-on-background text-[40px] md:text-[48px]" style={{ fontVariationSettings: "'wght' 100" }}>
                  close
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="font-headline italic text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-on-background tracking-tighter leading-tight">
                A Momentary <br className="hidden lg:block"/> Pause.
              </h1>
              <p className="text-on-surface-variant font-body text-sm md:text-base tracking-[0.05rem] leading-relaxed max-w-sm">
                Your selection is still reserved in your bag. Our systems encountered a brief interruption during the secure processing of your transaction. No charges were made.
              </p>
            </div>

            {/* CTA Section */}
            <div className="flex flex-col space-y-4 pt-4">
              <button 
                onClick={() => navigate("/checkout?step=2")}
                className="w-full md:w-80 bg-on-background text-surface font-label font-bold text-[11px] uppercase tracking-[0.2em] py-5 px-8 transition-transform active:scale-[0.98] hover:bg-primary"
              >
                Retry Payment
              </button>
              <button 
                onClick={() => navigate("/cart")}
                className="w-full md:w-80 border border-outline-variant text-on-background font-label font-bold text-[11px] uppercase tracking-[0.2em] py-5 px-8 hover:bg-surface-container-low hover:border-primary transition-colors duration-300"
              >
                Return to Bag
              </button>
            </div>

            {/* Metadata / Help */}
            <div className="pt-8 border-t border-outline-variant/30 flex flex-col space-y-2">
              {orderId && (
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Reference ID: #{orderId}
                </p>
              )}
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Need assistance? <button onClick={() => navigate("/contact")} className="underline decoration-primary/30 hover:decoration-primary transition-colors">Contact Editorial Support</button>
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}