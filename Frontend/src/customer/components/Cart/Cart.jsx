import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import CartItem from "./CartItem";
import { getCart } from "../../../Redux/Customers/Cart/Action";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, loading } = useSelector((store) => store.cart);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const isEmpty = !cartItems || cartItems.length === 0;

  const totalPrice = (cartItems || []).reduce((sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 1), 0);
  const totalDiscountedPrice = (cartItems || []).reduce((sum, item) => sum + (item?.product?.discountedPrice || 0) * (item?.quantity || 1), 0);
  const discount = totalPrice - totalDiscountedPrice;

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Editorial Header */}
        <header className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-headline italic text-5xl md:text-7xl tracking-tight text-on-surface"
          >
            Your Bag
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="font-label uppercase tracking-[0.2em] text-[11px] mt-4 opacity-60"
          >
            Selection & Editorial Archive / {new Date().getFullYear()}
          </motion.p>
        </header>

        {loading ? (
          <div className="w-full flex justify-center py-24">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
          </div>
        ) : isEmpty ? (
          /* "A Quiet Collection" Empty State */
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center py-24 relative w-full text-center border-t border-outline-variant/30"
          >
            <div className="mb-12 flex justify-center">
              <span className="material-symbols-outlined text-[80px] text-primary/30" style={{ fontVariationSettings: "'wght' 100" }}>shopping_bag</span>
            </div>
            <div className="space-y-8 relative z-10">
              <h2 className="font-headline italic text-5xl md:text-6xl tracking-tight text-on-surface">
                A Quiet Collection.
              </h2>
              <p className="max-w-md mx-auto text-on-surface-variant font-body text-sm tracking-[0.05rem] opacity-70 leading-relaxed">
                Your bag is currently empty. Seek inspiration in our curated silhouettes and artisanal fabrics.
              </p>
              <div className="pt-10">
                <button 
                  onClick={() => navigate('/products')} 
                  className="bg-on-background text-background px-12 py-5 font-label font-bold text-[0.6875rem] tracking-[0.15em] uppercase border-0 rounded-none hover:bg-primary transition-all duration-500 group relative overflow-hidden"
                >
                  <span className="relative z-10">DISCOVER PIECES</span>
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                </button>
              </div>
            </div>
            {/* Subtle Backdrop Texture */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square opacity-30 pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-fixed/50 via-transparent to-transparent"></div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: Shopping Cart Items List */}
            <section className="lg:col-span-8">
              <div className="flex flex-col">
                
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-6 pb-4 border-b border-outline-variant/30 font-label uppercase tracking-[0.15em] text-[10px] text-on-surface/50">
                  <div className="col-span-3">Product Detail</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-right col-span-2">Total Price</div>
                </div>

                {/* Items */}
                <motion.div variants={staggerContainer} initial="hidden" animate="show">
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item) => (
                      <CartItem key={item.id} item={item} showButton />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
                <button onClick={() => navigate('/products')} className="flex items-center space-x-2 group">
                  <span className="material-symbols-outlined text-primary group-hover:-translate-x-1 transition-transform text-sm">arrow_back</span>
                  <span className="font-label uppercase tracking-[0.2em] text-[11px] font-bold">Return to Archive</span>
                </button>
                <div className="w-full md:w-1/2">
                  <p className="font-label uppercase tracking-[0.1em] text-[10px] mb-2 opacity-50">Add a note to your order</p>
                  <textarea 
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 resize-none font-body text-sm py-2 px-0" 
                    rows="1"
                    placeholder="Enter instructions here..."
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Right: Sticky Order Summary */}
            <aside className="lg:col-span-4 lg:sticky lg:top-32">
              <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="bg-surface-container-low p-8 border border-outline-variant/10"
              >
                <h2 className="font-headline text-3xl mb-8 italic">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
                    <span className="font-label uppercase tracking-[0.15em] text-[10px] text-on-surface/60">Subtotal</span>
                    <span className="font-body text-sm font-semibold">₹{totalPrice}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
                      <span className="font-label uppercase tracking-[0.15em] text-[10px] text-on-surface/60">Discount</span>
                      <span className="font-label uppercase tracking-[0.15em] text-[10px] text-primary">-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
                    <span className="font-label uppercase tracking-[0.15em] text-[10px] text-on-surface/60">Shipping</span>
                    <span className="font-label uppercase tracking-[0.15em] text-[10px] text-primary">Calculated next</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4">
                    <span className="font-label uppercase tracking-[0.2em] text-[11px] font-extrabold">Estimated Total</span>
                    <span className="font-headline text-3xl">₹{totalDiscountedPrice}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate("/checkout?step=2")}
                  className="w-full py-6 bg-primary text-on-primary font-label uppercase tracking-[0.3em] text-xs font-bold hover:bg-primary-container transition-colors duration-300"
                >
                  Checkout Securely
                </button>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start space-x-4 opacity-70">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <p className="text-[10px] font-label uppercase tracking-widest leading-relaxed">Encrypted Transaction Security Protocol V.2.1</p>
                  </div>
                  <div className="flex items-start space-x-4 opacity-70">
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                    <p className="text-[10px] font-label uppercase tracking-widest leading-relaxed">Complementary Architectural Packaging on premium orders.</p>
                  </div>
                </div>
              </motion.div>
            </aside>

          </div>
        )}

        {/* Cross-sell Section (Always Visible if not loading) */}
        {!loading && (
          <section className={`mt-32 pt-16 ${isEmpty ? '' : 'border-t border-outline-variant/30'}`}>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="font-label text-[0.6875rem] font-bold tracking-[0.2em] text-primary uppercase">Essentials</span>
                <h2 className="font-headline italic text-4xl mt-2">Seasonless Objects</h2>
              </div>
              <button onClick={() => navigate('/products')} className="font-label text-[0.6875rem] font-bold tracking-[0.1em] border-b border-outline-variant hover:border-primary transition-colors pb-1">
                VIEW ALL
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { title: "Pleated Trousers", price: "₹2450", img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80" },
                { title: "Structured Blazer", price: "₹6980", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80" },
                { title: "Heavy Shell", price: "₹1120", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80" },
                { title: "Archive Boot", price: "₹4640", img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80" },
              ].map((item, i) => (
                <div key={i} className={`space-y-4 cursor-pointer group ${i % 2 !== 0 && isEmpty ? 'md:translate-y-8' : ''}`} onClick={() => navigate('/products')}>
                  <div className="aspect-[3/4] bg-surface-container overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-label uppercase tracking-[0.15em] text-[9px] font-bold text-outline">{item.title}</p>
                    <p className="font-headline text-lg italic text-on-surface">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}