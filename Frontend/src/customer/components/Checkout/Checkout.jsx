import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DeliveryAddress from "./DeliveryAddress";
import OrderSummary from "./OrderSummary";

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: (direction) => ({ x: direction > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const step = parseInt(queryParams.get("step") || "2", 10);
  const direction = 1; 

  const handleNext = () => navigate(`/checkout?step=${step + 1}`);

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Editorial Header & Minimalist Stepper */}
        <header className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-headline italic text-5xl md:text-6xl tracking-tighter mb-4"
          >
            Finalizing the Silhouette
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center space-x-4 overflow-x-auto pb-2 hide-scrollbar"
          >
            <span className={`font-label text-[10px] uppercase tracking-[0.2em] whitespace-nowrap ${step === 2 ? 'text-primary font-bold' : 'text-outline'}`}>
              01 Shipping
            </span>
            <div className={`h-[1px] w-8 ${step > 2 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
            <span className={`font-label text-[10px] uppercase tracking-[0.2em] whitespace-nowrap ${step === 3 ? 'text-primary font-bold' : 'text-outline'}`}>
              02 Summary
            </span>
            <div className={`h-[1px] w-8 ${step > 3 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
            <span className={`font-label text-[10px] uppercase tracking-[0.2em] whitespace-nowrap ${step === 4 ? 'text-primary font-bold' : 'text-outline'}`}>
              03 Payment
            </span>
          </motion.div>
        </header>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                <div className="lg:col-span-7"><DeliveryAddress handleNext={handleNext} /></div>
                {/* Dark Mode Placeholder for Step 1 */}
                <div className="hidden lg:block lg:col-span-5">
                  <div className="bg-on-background text-surface p-10 sticky top-32 border border-on-background">
                    <h3 className="font-label text-xs tracking-[0.4em] uppercase font-bold mb-10 border-b border-stone-700 pb-4">Order Summary</h3>
                    <p className="font-label text-[10px] uppercase tracking-widest text-stone-500">Summary available in the next step.</p>
                  </div>
                </div>
              </div>
            )}
            {step === 3 && <OrderSummary handleNext={handleNext} />}
            {step === 4 && (
              <div className="py-32 flex flex-col items-center justify-center border-t border-outline-variant/30 text-center">
                <span className="material-symbols-outlined text-4xl mb-4 opacity-50">credit_card</span>
                <h2 className="font-headline text-3xl italic tracking-tighter mb-2">Secure Payment</h2>
                <p className="font-label text-[10px] uppercase tracking-widest text-outline">Payment Gateway Integration Required</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}