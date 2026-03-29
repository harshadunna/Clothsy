import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../config/api";

const checkReturnEligibility = (deliveryDateString) => {
  if (!deliveryDateString) return { isEligible: true, daysLeft: 7 };
  const deliveryDate = new Date(deliveryDateString);
  const today = new Date();
  const diffTime = today - deliveryDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysLeft = 7 - diffDays;
  return { isEligible: daysLeft >= 0, daysLeft: daysLeft < 0 ? 0 : daysLeft };
};

export default function ReturnOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState("Fabric feel");
  const [returnNotes, setReturnNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching order details:", err);
        setLoading(false);
      });
  }, [orderId]);

  const toggleItemSelection = (itemId) => {
    setSelectedItems((prev) => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;
    
    setSubmitting(true);
    try {
      await api.put(`/api/orders/${orderId}/return-items`, selectedItems);
      
      // Navigate back to the order page after success
      navigate(`/account/order/${orderId}`, { state: { returnSuccess: true }});
    } catch (error) {
      console.error("Error returning items:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-12 h-12 border-2 border-t-transparent border-primary animate-spin rounded-full"></div>
      </div>
    );
  }

  // Filter items that are actually delivered and eligible
  const eligibleItems = order?.orderItems?.filter(item => {
    if (item.itemStatus !== "DELIVERED") return false;
    return checkReturnEligibility(item.deliveryDate || order.deliveryDate).isEligible;
  }) || [];

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-32 pb-24 px-8 md:px-24 max-w-[1440px] mx-auto">
      
      {/* Header Section */}
      <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors mb-8">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to Order
          </button>
          <h1 className="font-headline text-5xl md:text-7xl italic tracking-tighter mb-6 leading-none">
            Returns & <br/>Exchanges.
          </h1>
          <p className="font-body text-on-surface-variant max-w-md tracking-wide leading-relaxed">
            Our commitment to craftsmanship extends beyond the point of purchase. Select the items you wish to return or exchange from your recent archive.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-left md:text-right mt-8 md:mt-0">
          <span className="font-label text-[0.6875rem] font-bold uppercase tracking-[0.2rem] text-primary">Order Reference</span>
          <span className="font-headline text-2xl italic">#{order?.id}</span>
        </div>
      </header>

      {eligibleItems.length === 0 ? (
        <div className="py-24 text-center border-t border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">inventory_2</span>
          <h2 className="font-headline text-3xl italic text-on-surface">No eligible items.</h2>
          <p className="font-label text-[10px] uppercase tracking-widest text-outline mt-4">The return window has closed for this order.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Purchases Grid */}
          <div className="lg:col-span-7 space-y-12">
            <h2 className="font-label text-[0.6875rem] font-bold uppercase tracking-[0.2rem] border-b border-outline-variant/20 pb-4 mb-8">
              Select Items
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16">
              
              {eligibleItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItemSelection(item.id)}
                    className="group cursor-pointer flex flex-col h-full"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-surface-container-low mb-6 relative">
                      <img 
                        src={item.product?.imageUrl} 
                        alt={item.product?.title} 
                        className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'grayscale-0 scale-105' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'}`} 
                      />
                      {/* Selection Checkmark */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0, opacity: 0 }} 
                            className="absolute top-4 right-4 bg-primary text-white p-2 flex items-center justify-center shadow-lg"
                          >
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex justify-between items-start flex-grow">
                      <div>
                        <h3 className="font-headline text-xl italic mb-1 line-clamp-2">{item.product?.title}</h3>
                        <p className="font-label text-[0.6875rem] tracking-widest text-on-surface-variant uppercase mt-2">
                          Size {item.size} / Qty {item.quantity}
                        </p>
                      </div>
                      <span className="font-body text-sm font-bold ml-4">₹{item.discountedPrice || item.price}</span>
                    </div>
                    <button 
                      className={`mt-6 w-full py-4 border font-label text-[0.6875rem] font-bold uppercase tracking-[0.15rem] transition-all duration-300 ${isSelected ? 'border-primary bg-primary text-white' : 'border-outline-variant text-on-surface-variant group-hover:border-primary group-hover:text-primary'}`}
                    >
                      {isSelected ? "Selected" : "Select Piece"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Return Form Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className="bg-surface-container p-8 md:p-12 shadow-sm"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="font-label text-[0.6875rem] font-bold tracking-[0.25rem] text-primary uppercase">Step 01 / 01</span>
                <div className="flex gap-1">
                  <div className="w-8 h-[2px] bg-primary"></div>
                  <div className="w-8 h-[2px] bg-outline-variant"></div>
                  <div className="w-8 h-[2px] bg-outline-variant"></div>
                </div>
              </div>
              
              <h2 className="font-headline text-3xl italic mb-8 text-on-surface">Reason for Return.</h2>
              
              <form onSubmit={handleReturnSubmit} className="space-y-8">
                <div className="space-y-4">
                  {["Size too large", "Size too small", "Fabric feel", "Changed mind"].map((reason) => (
                    <label 
                      key={reason} 
                      className={`flex items-center justify-between p-4 bg-surface-lowest border cursor-pointer transition-colors group ${returnReason === reason ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                    >
                      <span className="font-body text-sm uppercase tracking-wider text-on-surface">{reason}</span>
                      <input 
                        type="radio" 
                        name="reason" 
                        value={reason}
                        checked={returnReason === reason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-4 h-4 text-primary border-outline-variant focus:ring-0 rounded-none cursor-pointer"
                      />
                    </label>
                  ))}
                </div>

                <div className="pt-4">
                  <label className="font-label text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant mb-4 block">
                    Additional Observations
                  </label>
                  <textarea 
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="OPTIONAL DETAILS" 
                    rows="3"
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary outline-none px-0 py-2 resize-none font-body text-sm transition-all placeholder:text-outline-variant focus:ring-0" 
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={selectedItems.length === 0 || submitting}
                  className="w-full bg-on-surface text-surface py-6 font-label text-[0.75rem] font-bold uppercase tracking-[0.3rem] hover:bg-primary transition-colors mt-8 disabled:opacity-50 disabled:hover:bg-on-surface" 
                >
                  {submitting ? "Processing..." : selectedItems.length === 0 ? "Select Items to Return" : "Submit Request"}
                </button>
              </form>

              <p className="mt-8 text-center font-label text-[0.6rem] text-on-surface-variant tracking-[0.1rem] uppercase">
                All returns are subject to standard processing inspections.
              </p>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}