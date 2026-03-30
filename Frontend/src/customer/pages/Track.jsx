import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";

export default function Track() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [activeShipments, setActiveShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchActiveOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/orders/user");
        const active = data.filter(order => 
          ["PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(order.orderStatus)
        );
        setActiveShipments(active);
      } catch (err) {
        console.error("Error fetching active shipments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveOrders();
  }, []);

  const handleTrackSearch = (e) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      navigate(`/account/order/${orderIdInput.trim()}`);
    }
  };

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] font-body min-h-screen pt-32 pb-24 px-6 md:px-12">
      <main className="max-w-[1000px] mx-auto">
        
        <header className="mb-24">
          <h1 className="font-headline text-5xl md:text-7xl italic tracking-tighter mb-4">Shipment Radar.</h1>
          <p className="font-label uppercase tracking-[0.2em] text-[10px] text-[#7F756E] font-bold">Trace your silhouettes in real-time</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          <div>
            <h2 className="font-label text-[0.65rem] font-black uppercase tracking-[0.25em] border-b border-[#D1C4BC] pb-4 mb-8">Quick Lookup</h2>
            <form onSubmit={handleTrackSearch} className="space-y-6">
              <div className="group relative">
                <input 
                  type="text"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  placeholder="ENTER ORDER REFERENCE (e.g. 5)"
                  className="w-full bg-transparent border-b border-[#D1C4BC] py-4 outline-none font-label text-xs tracking-widest focus:border-[#1A1109] transition-colors"
                />
              </div>
              <button className="w-full bg-[#1A1109] text-[#FFF8F5] py-6 font-label text-[0.65rem] font-black uppercase tracking-[0.2em] hover:bg-[#C8742A] transition-colors">
                Locate Order
              </button>
            </form>
          </div>

          <div>
            <h2 className="font-label text-[0.65rem] font-black uppercase tracking-[0.25em] border-b border-[#D1C4BC] pb-4 mb-8">Active Shipments</h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-[#E8E1DE]"></div>
                <div className="h-20 bg-[#E8E1DE]"></div>
              </div>
            ) : activeShipments.length > 0 ? (
              <div className="space-y-6">
                {activeShipments.map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => navigate(`/account/order/${order.id}`)}
                    className="flex justify-between items-center p-6 bg-[#E8E1DE] cursor-pointer hover:bg-[#D1C4BC] transition-colors"
                  >
                    <div>
                      <p className="font-label text-[10px] font-bold uppercase tracking-widest">Order #{order.id}</p>
                      <p className="font-headline italic text-lg mt-1">{order.orderStatus}</p>
                    </div>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-label text-[10px] uppercase tracking-widest text-[#7F756E] leading-loose">
                No silhouettes currently in transit. All recent archives have been settled.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}