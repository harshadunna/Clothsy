import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function OrderCard({ item, order }) {
  const navigate = useNavigate();
  
  const returnStatuses = ["RETURN_REQUESTED", "RETURN_PICKED", "RETURN_RECEIVED", "REFUND_INITIATED", "REFUND_COMPLETED", "RETURNED"];
  
  const effectiveStatus = 
    item?.itemStatus === "CANCELLED" ? "CANCELLED" : 
    returnStatuses.includes(item?.itemStatus) ? item?.itemStatus :
    order?.orderStatus;
  
  const isDelivered = effectiveStatus === "DELIVERED";
  const isCancelled = effectiveStatus === "CANCELLED";

  return (
    <div className="mb-16 relative group">
      {/* ── Timeline Dot ── */}
      <div className={`absolute -left-[41px] top-0 w-4 h-4 ${isDelivered ? 'bg-primary' : isCancelled ? 'bg-error' : 'bg-outline-variant'}`}></div>
      
      {/* ── Card Content ── */}
      <div 
        onClick={() => navigate(`/account/order/${order?.id}`)}
        className="flex flex-col md:flex-row gap-8 bg-surface p-8 border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer"
      >
        {/* Image */}
        <div className={`w-32 h-40 bg-surface-container flex-shrink-0 overflow-hidden ${isCancelled ? 'grayscale opacity-60' : 'grayscale-[20%] group-hover:grayscale-0 transition-all duration-500'}`}>
          <img
            src={item?.product?.imageUrl}
            alt={item?.product?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label text-[10px] tracking-[0.2em] text-outline uppercase mb-2">
                Order #{order?.id || "CLS-000"}
              </p>
              <h3 className={`font-headline text-2xl italic ${isCancelled ? 'line-through text-outline' : 'text-on-surface'}`}>
                {item?.product?.title}
              </h3>
              <p className="font-body text-sm mt-1 text-on-surface-variant">
                Size: {item?.size} • Qty: {item?.quantity}
              </p>
            </div>
            
            {/* Minimalist Status Badge */}
            <span className={`font-label text-[10px] px-3 py-1 font-bold tracking-widest uppercase border ${
              isDelivered ? 'bg-surface-container-low text-primary border-primary/20' : 
              isCancelled ? 'bg-error-container text-error border-error/20' : 
              'bg-surface-container text-on-surface-variant border-outline-variant'
            }`}>
              {effectiveStatus?.replace(/_/g, " ") || "PROCESSING"}
            </span>
          </div>

          <div className="flex justify-between items-end mt-8">
            <p className={`font-body font-bold text-lg ${isCancelled ? 'line-through text-outline' : 'text-on-surface'}`}>
              ₹{item?.discountedPrice || item?.price}
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if(isDelivered) navigate(`/product/${item?.product?.id}/rate`);
              }}
              className="font-label text-[10px] tracking-widest border-b border-primary text-primary pb-1 uppercase hover:opacity-70 transition-opacity"
            >
              {isDelivered ? "Leave a Narrative" : "View Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}