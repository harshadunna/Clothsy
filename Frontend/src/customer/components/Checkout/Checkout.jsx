import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
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
  const { cart } = useSelector((store) => store);

  const queryParams = new URLSearchParams(location.search);
  const step = parseInt(queryParams.get("step") || "2", 10);
  const direction = 1; 

  const handleNext = () => navigate(`/checkout?step=${step + 1}`);

  // Delivery Fee Logic for Step 2 (Based on Cart)
  const cartData = cart.cart;
  const deliveryFee = cartData?.totalDiscountedPrice >= 2999 ? 0 : 100;
  const finalTotal = (cartData?.totalDiscountedPrice || 0) + deliveryFee;

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] font-body min-h-screen pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Editorial Header & Minimalist Stepper */}
        <header className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-headline italic text-5xl md:text-6xl tracking-tighter mb-4 text-[#1A1109]"
          >
            Finalizing the Silhouette
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center space-x-4 overflow-x-auto pb-2 hide-scrollbar"
          >
            <span className={`font-label text-[10px] uppercase tracking-[0.2em] whitespace-nowrap ${step === 2 ? 'text-[#C8742A] font-bold' : 'text-[#7F756E]'}`}>
              01 Shipping
            </span>
            <div className={`h-[1px] w-8 ${step > 2 ? 'bg-[#C8742A]' : 'bg-[#D1C4BC]'}`}></div>
            <span className={`font-label text-[10px] uppercase tracking-[0.2em] whitespace-nowrap ${step === 3 ? 'text-[#C8742A] font-bold' : 'text-[#7F756E]'}`}>
              02 Summary
            </span>
            <div className={`h-[1px] w-8 ${step > 3 ? 'bg-[#C8742A]' : 'bg-[#D1C4BC]'}`}></div>
            <span className={`font-label text-[10px] uppercase tracking-[0.2em] whitespace-nowrap ${step === 4 ? 'text-[#C8742A] font-bold' : 'text-[#7F756E]'}`}>
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
                
                {/* LIVE CART SUMMARY (Light Theme) */}
                <div className="hidden lg:block lg:col-span-5">
                  <div className="bg-[#FFF8F5] p-10 sticky top-32 border border-[#D1C4BC]">
                    <h3 className="font-headline text-3xl italic tracking-tighter mb-10 text-[#1A1109]">Order Summary</h3>
                    
                    <div className="space-y-4 pt-8 border-t border-[#D1C4BC]">
                      <div className="flex justify-between items-center font-label text-[10px] uppercase tracking-widest text-[#1A1109]">
                        <span className="text-[#7F756E]">Subtotal ({cartData?.totalItem || 0} items)</span>
                        <span className="font-body text-sm font-bold">₹{cartData?.totalPrice || 0}</span>
                      </div>
                      
                      {(cartData?.discount > 0) && (
                        <div className="flex justify-between items-center font-label text-[10px] uppercase tracking-widest">
                          <span className="text-[#7F756E]">Discount</span>
                          <span className="font-body text-sm font-bold text-[#C8742A]">-₹{cartData?.discount}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center font-label text-[10px] uppercase tracking-widest">
                        <span className="text-[#7F756E]">Shipping</span>
                        <span className="font-body text-sm font-bold">
                          {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-6 font-headline text-2xl border-t border-[#D1C4BC] mt-4 text-[#1A1109]">
                        <span>Total</span>
                        <span className="text-[#C8742A] font-bold">₹{finalTotal}</span>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-center items-center gap-2 text-[#7F756E]">
                      <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                      <span className="font-label text-[9px] uppercase tracking-[0.2em]">
                        {deliveryFee === 0 ? "Free Shipping Applied" : "Add ₹" + (2999 - (cartData?.totalDiscountedPrice || 0)) + " more for Free Shipping"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 3 && <OrderSummary handleNext={handleNext} />}
            {step === 4 && (
              <div className="py-32 flex flex-col items-center justify-center border-t border-[#D1C4BC] text-center">
                <span className="material-symbols-outlined text-4xl mb-4 opacity-50 text-[#1A1109]">credit_card</span>
                <h2 className="font-headline text-3xl italic tracking-tighter mb-2 text-[#1A1109]">Secure Payment</h2>
                <p className="font-label text-[10px] uppercase tracking-widest text-[#7F756E]">Payment Gateway Integration Required</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}