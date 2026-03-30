import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../config/api"; 

export default function Returns() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // FETCH ORDERS AND EXTRACT RETURN ITEMS 
    api.get("/api/orders/user") 
      .then((res) => {
        const allOrders = res.data || [];
        const extractedReturns = [];

        // Loop through all orders and aggressively catch any return/refund status
        allOrders.forEach(order => {
          if (order.orderItems && Array.isArray(order.orderItems)) {
            order.orderItems.forEach(item => {
              const statusStr = String(item.itemStatus || "").toUpperCase();
              
              // If the status contains RETURN or REFUND, it belongs on this dashboard
              if (statusStr.includes("RETURN") || statusStr.includes("REFUND")) {
                extractedReturns.push({ item, order });
              }
            });
          }
        });

        // Sort newest first based on the order ID
        const sortedReturns = extractedReturns.sort((a, b) => (b.order?.id || 0) - (a.order?.id || 0));
        
        setReturns(sortedReturns);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders for returns:", err);
        setLoading(false);
      });
  }, []);

  const isEmpty = !returns || returns.length === 0;

  // Animation Variant
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  // PROGRESS BAR COMPONENT 
  const ReturnProgress = ({ currentStatus }) => {
    const statusString = String(currentStatus).toUpperCase();
    
    // Map backend statuses to display steps
    const steps = ["RETURN_REQUESTED", "RETURN_PICKED", "RETURN_RECEIVED", "REFUND_COMPLETED"];
    const displaySteps = ["Requested", "In Transit", "Inspected", "Refunded"];
    
    // Determine the active step
    let currentIndex = steps.findIndex(step => statusString.includes(step));
    
    // Edge case fallbacks
    if (currentIndex === -1 && statusString.includes("REFUND_INITIATED")) currentIndex = 2; 
    if (currentIndex === -1 && statusString === "RETURNED") currentIndex = 3; 
    if (currentIndex === -1) currentIndex = 0; 

    return (
      <div className="mt-10 relative w-full max-w-2xl">
        {/* Background Track */}
        <div className="absolute top-[5px] left-0 w-full h-[1px] bg-[#D1C4BC]"></div>
        
        {/* Active Track */}
        <div 
          className="absolute top-[5px] left-0 h-[1px] bg-[#1A1109] transition-all duration-1000 ease-out" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        <div className="relative flex justify-between z-10">
          {displaySteps.map((step, i) => {
            const isCompleted = i <= currentIndex;
            const isActive = i === currentIndex;
            return (
              <div key={step} className="flex flex-col items-center gap-3 bg-[#FFF8F5] px-2 -ml-2">
                <div 
                  className={`w-2.5 h-2.5 rounded-full border transition-colors duration-500 
                    ${isCompleted ? 'border-[#1A1109] bg-[#1A1109]' : 'border-[#D1C4BC] bg-[#FFF8F5]'}`
                  }
                ></div>
                <span className={`font-label uppercase tracking-[0.2em] text-[8px] font-black transition-colors duration-300
                  ${isActive ? 'text-[#1A1109]' : isCompleted ? 'text-[#1A1109]/60' : 'text-[#7F756E]'}`
                }>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#FFF8F5] min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin border-[#1A1109]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] font-body min-h-screen pt-32 pb-24 px-6 md:px-12 selection:bg-[#C8742A] selection:text-[#FFF8F5]">
      <main className="max-w-[1000px] mx-auto">
        
        {/* HEADER */}
        <header className="mb-16 md:mb-24">
          <motion.h1 
            initial="hidden" animate="visible" variants={fadeUp}
            className="font-headline text-5xl md:text-7xl italic tracking-tighter mb-4 text-[#1A1109]"
          >
            Returns Archive.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="font-label uppercase tracking-[0.2em] text-[10px] text-[#7F756E] font-bold"
          >
            Track and manage your return requests
          </motion.p>
        </header>

        {/* CONDITIONAL RENDERING */}
        {isEmpty ? (
          /* EMPTY STATE */
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center py-24 relative w-full text-center border-t border-[#D1C4BC]"
          >
            <div className="mb-10 flex justify-center">
              <span className="material-symbols-outlined text-[60px] text-[#1A1109]/20">assignment_return</span>
            </div>
            <div className="space-y-6 relative z-10">
              <h2 className="font-headline italic text-4xl md:text-5xl tracking-tighter text-[#1A1109]">
                No Active Returns.
              </h2>
              <p className="max-w-md mx-auto text-[#7F756E] font-body text-sm tracking-wide leading-relaxed">
                Your returns archive is currently empty. If you need to initiate a return, please visit your Orders history.
              </p>
              <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/account/orders')} 
                  className="bg-[#1A1109] text-[#FFF8F5] px-10 py-4 font-label font-black text-[0.65rem] tracking-[0.2em] uppercase border border-[#1A1109] hover:bg-[#C8742A] hover:border-[#C8742A] transition-colors duration-500"
                >
                  View Orders
                </button>
                <button 
                  onClick={() => navigate('/products')} 
                  className="bg-transparent text-[#1A1109] px-10 py-4 font-label font-black text-[0.65rem] tracking-[0.2em] uppercase border border-[#D1C4BC] hover:border-[#1A1109] transition-colors duration-500"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* POPULATED RETURNS LIST */
          <motion.div 
            initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="space-y-16"
          >
            {returns.map(({ item, order }) => {
              const productObj = item?.product || {};
              const imageUrl = productObj.imageUrl || "https://static.zara.net/assets/public/599e/c48f/016a474398ac/012b767d2fd5/02949310800-p/02949310800-p.jpg?w=1024";
              const title = productObj.title || "Archive Silhouette";
              const size = item?.size || "Standard";
              const color = productObj.color || "As Pictured";
              const date = order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : "Recent";
              const amount = item?.discountedPrice || item?.price || 0;
              const status = item?.itemStatus || "RETURN_REQUESTED";

              return (
                <motion.div 
                  key={`${order?.id}-${item?.id}`} variants={fadeUp}
                  className="flex flex-col md:flex-row gap-8 md:gap-12 border-t border-[#D1C4BC] pt-12"
                >
                  {/* Left: Image */}
                  <div className="w-full md:w-48 aspect-[3/4] flex-shrink-0 bg-[#E8E1DE] overflow-hidden cursor-pointer group" onClick={() => navigate(`/product/${productObj.id || ''}`)}>
                    <img 
                      src={imageUrl} 
                      alt={title} 
                      className="w-full h-full object-cover object-top grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]" 
                    />
                  </div>

                  {/* Right: Details & Tracking */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                        <div>
                          <span className="font-label text-[0.6rem] font-bold uppercase tracking-[0.25em] text-[#7F756E] mb-2 block">
                            Return Ref: {order?.id ? `RTN-${order.id}` : 'PENDING'}
                          </span>
                          <h3 
                            onClick={() => navigate(`/product/${productObj.id || ''}`)}
                            className="font-headline text-3xl italic text-[#1A1109] tracking-tight mb-2 hover:text-[#C8742A] transition-colors cursor-pointer"
                          >
                            {title}
                          </h3>
                          <p className="font-label text-[0.65rem] font-bold tracking-widest text-[#7F756E] uppercase">
                            {color} / Size {size}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <span className="font-label text-[0.6rem] font-bold uppercase tracking-[0.25em] text-[#7F756E] mb-2 block">
                            Est. Refund
                          </span>
                          <span className="font-headline text-2xl text-[#1A1109]">
                            ₹{amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <p className="font-label text-[10px] text-[#7F756E] tracking-widest uppercase mt-4">
                        Order Placed on {date}
                      </p>
                    </div>

                    {/* Progress Tracker */}
                    <ReturnProgress currentStatus={status} />

                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

      </main>
    </div>
  );
}