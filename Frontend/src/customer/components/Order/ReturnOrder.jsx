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
    window.scrollTo(0,0);
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
      // SUBMISSION LOGIC 
      console.log("Submitting return for items:", selectedItems);
      
      const response = await api.put(`/api/orders/${orderId}/return-items`, selectedItems);
      console.log("Backend Response to Return Request:", response.data);
      
      // Navigate directly to our new tracking dashboard!
      navigate(`/returns`, { state: { returnSuccess: true }});
    } catch (error) {
      console.error("Error returning items. Did the backend accept the array?", error);
      alert("There was an issue processing your return. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FFF8F5]">
        <div className="w-12 h-12 border-2 border-t-transparent border-[#1A1109] animate-spin rounded-full"></div>
      </div>
    );
  }

  // Filter items that are actually delivered and eligible
  const eligibleItems = order?.orderItems?.filter(item => {
    if (item.itemStatus !== "DELIVERED") return false;
    return checkReturnEligibility(item.deliveryDate || order.deliveryDate).isEligible;
  }) || [];

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] font-body min-h-screen pt-32 pb-24 px-6 md:px-12 selection:bg-[#C8742A] selection:text-[#FFF8F5]">
      <main className="max-w-[1440px] mx-auto">
      
        {/* Header Section */}
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#D1C4BC] pb-12">
          <div className="max-w-2xl">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-[#7F756E] hover:text-[#C8742A] transition-colors mb-8 font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Back to Order
            </button>
            <h1 className="font-headline text-5xl md:text-7xl italic tracking-tighter mb-6 leading-none text-[#1A1109]">
              Returns & <br/>Exchanges.
            </h1>
            <p className="font-body text-[#7F756E] max-w-md tracking-wide leading-relaxed">
              Our commitment to craftsmanship extends beyond the point of purchase. Select the items you wish to return or exchange from your recent archive.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-left md:text-right mt-8 md:mt-0">
            <span className="font-label text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#7F756E]">Order Reference</span>
            <span className="font-headline text-2xl italic text-[#1A1109]">#{order?.id}</span>
          </div>
        </header>

        {eligibleItems.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-[#D1C4BC] mb-4">inventory_2</span>
            <h2 className="font-headline text-3xl md:text-4xl italic text-[#1A1109] tracking-tighter">No eligible items.</h2>
            <p className="font-label text-[10px] uppercase tracking-widest text-[#7F756E] mt-4 font-bold">The return window has closed for this order.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: Purchases Grid */}
            <div className="lg:col-span-7 space-y-12">
              <h2 className="font-label text-[0.65rem] font-black uppercase tracking-[0.2em] border-b border-[#D1C4BC] pb-4 mb-8 text-[#7F756E]">
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
                      <div className={`aspect-[3/4] overflow-hidden bg-[#E8E1DE] mb-6 relative border-2 transition-colors duration-300 ${isSelected ? 'border-[#1A1109]' : 'border-transparent'}`}>
                        <img 
                          src={item.product?.imageUrl} 
                          alt={item.product?.title} 
                          className={`w-full h-full object-cover object-top transition-all duration-[1.5s] ${isSelected ? 'grayscale-0 scale-105' : 'grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105'}`} 
                        />
                        {/* Selection Checkmark */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }} 
                              animate={{ scale: 1, opacity: 1 }} 
                              exit={{ scale: 0, opacity: 0 }} 
                              className="absolute top-4 right-4 bg-[#1A1109] text-[#FFF8F5] p-1.5 flex items-center justify-center shadow-lg"
                            >
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex justify-between items-start flex-grow">
                        <div>
                          <h3 className="font-headline text-2xl italic mb-1 line-clamp-2 text-[#1A1109]">{item.product?.title}</h3>
                          <p className="font-label text-[0.65rem] font-bold tracking-widest text-[#7F756E] uppercase mt-2">
                            Size {item.size} / Qty {item.quantity}
                          </p>
                        </div>
                        <span className="font-body text-sm font-bold ml-4 text-[#1A1109]">₹{item.discountedPrice?.toLocaleString('en-IN') || item.price?.toLocaleString('en-IN')}</span>
                      </div>
                      <button 
                        className={`mt-6 w-full py-4 border font-label text-[0.65rem] font-black uppercase tracking-[0.15em] transition-all duration-300 ${isSelected ? 'border-[#1A1109] bg-[#1A1109] text-[#FFF8F5]' : 'border-[#D1C4BC] text-[#1A1109] hover:border-[#1A1109]'}`}
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
                className="bg-[#E8E1DE] p-8 md:p-12 shadow-[0_20px_60px_rgba(26,17,9,0.05)]"
              >
                <div className="flex items-center justify-between mb-12">
                  <span className="font-label text-[0.65rem] font-black tracking-[0.25em] text-[#1A1109] uppercase">Step 01 / 01</span>
                  <div className="flex gap-1.5">
                    <div className="w-8 h-[2px] bg-[#1A1109]"></div>
                    <div className="w-8 h-[2px] bg-[#D1C4BC]"></div>
                    <div className="w-8 h-[2px] bg-[#D1C4BC]"></div>
                  </div>
                </div>
                
                <h2 className="font-headline text-3xl md:text-4xl italic mb-8 text-[#1A1109] tracking-tighter">Reason for Return.</h2>
                
                <form onSubmit={handleReturnSubmit} className="space-y-8">
                  <div className="space-y-4">
                    {["Size too large", "Size too small", "Fabric feel", "Changed mind"].map((reason) => (
                      <label 
                        key={reason} 
                        className={`flex items-center justify-between p-5 bg-[#FFF8F5] border cursor-pointer transition-colors group ${returnReason === reason ? 'border-[#1A1109]' : 'border-transparent hover:border-[#D1C4BC]'}`}
                      >
                        <span className={`font-label text-[0.75rem] font-bold uppercase tracking-widest ${returnReason === reason ? 'text-[#1A1109]' : 'text-[#7F756E]'}`}>{reason}</span>
                        <input 
                          type="radio" 
                          name="reason" 
                          value={reason}
                          checked={returnReason === reason}
                          onChange={(e) => setReturnReason(e.target.value)}
                          className="w-4 h-4 text-[#1A1109] border-[#D1C4BC] focus:ring-0 rounded-none cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="pt-4">
                    <label className="font-label text-[0.65rem] font-bold uppercase tracking-widest text-[#7F756E] mb-4 block">
                      Additional Observations
                    </label>
                    <textarea 
                      value={returnNotes}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      placeholder="OPTIONAL DETAILS..." 
                      rows="3"
                      className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#D1C4BC] focus:border-[#C8742A] outline-none px-0 py-3 resize-none font-label text-xs uppercase tracking-widest transition-all placeholder:text-[#D1C4BC] focus:ring-0" 
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={selectedItems.length === 0 || submitting}
                    className="w-full bg-[#1A1109] text-[#FFF8F5] py-6 font-label text-[0.65rem] font-black uppercase tracking-[0.2em] hover:bg-[#C8742A] transition-colors mt-8 disabled:opacity-50 disabled:hover:bg-[#1A1109]" 
                  >
                    {submitting ? "Processing..." : selectedItems.length === 0 ? "Select Items to Return" : "Submit Request"}
                  </button>
                </form>

                <p className="mt-8 text-center font-label text-[0.55rem] text-[#7F756E] tracking-[0.1em] uppercase font-bold">
                  All returns are subject to standard processing inspections.
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}