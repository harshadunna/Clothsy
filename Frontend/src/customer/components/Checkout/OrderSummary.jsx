import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById, createPayment } from "../../../Redux/Customers/Order/Action";

export default function OrderSummary({ handleNext }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const orderState = useSelector((store) => store.order);

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  useEffect(() => {
    if (orderId) dispatch(getOrderById(orderId));
  }, [orderId, dispatch]);

  if (orderState?.loading || !orderState?.order) {
    return (
      <div className="py-32 flex justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-[#1A1109] rounded-full"></div>
      </div>
    );
  }

  const order = orderState.order;
  const discount = order.discount || 0;

  // Fallbacks to prevent NaN if the backend is slow to update fields
  const totalDiscountedPrice = order.totalDiscountedPrice || order.totalPrice || 0;
  const deliveryFee = totalDiscountedPrice >= 2999 ? 0 : 100;
  const finalTotal = totalDiscountedPrice + deliveryFee;
  
  // Safe extraction of the items array
  const orderItems = order.orderItems || [];

  const handleCreatePayment = () => {
    dispatch(createPayment(orderId));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
      
      {/* Left: Items */}
      <div className="lg:col-span-7">
        <h2 className="font-label text-xs uppercase tracking-[0.15em] mb-8 border-b border-[#D1C4BC] pb-2 text-[#1A1109]">Order Contents</h2>
        
        <div className="space-y-12">
          {orderItems.map((item) => {
            const product = item.product || {};
            const imageSrc = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : "");
            const title = product.title || "Product Title";
            const brand = product.brand || "Brand";
            const price = item.discountedPrice || product.discountedPrice || 0;

            return (
              <div key={item.id} className="flex space-x-6 items-start">
                <div className="w-24 h-32 bg-[#E8E1DE] overflow-hidden flex-shrink-0">
                  {imageSrc ? (
                     <img src={imageSrc} alt={title} className="w-full h-full object-cover grayscale-[15%]" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-[#7F756E] text-[10px] uppercase">No Image</div>
                  )}
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-label text-[11px] uppercase tracking-widest font-bold text-[#1A1109] max-w-[70%]">{title}</h4>
                    <span className="font-body text-sm font-bold text-[#1A1109]">₹{price.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[#7F756E] text-[10px] uppercase tracking-wider mt-2">{brand} / {item.size || "M"}</p>
                  <p className="text-[#7F756E] text-[10px] uppercase tracking-wider mt-1">Qty: {item.quantity || 1}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Summary Panel */}
      <div className="lg:col-span-5">
        <div className="bg-[#FFF8F5] p-10 sticky top-32 border border-[#D1C4BC]">
          <h3 className="font-headline text-3xl italic tracking-tighter mb-10 text-[#1A1109]">Order Summary</h3>
          
          <div className="space-y-4 pt-8 border-t border-[#D1C4BC]">
            <div className="flex justify-between items-center font-label text-[10px] uppercase tracking-widest text-[#1A1109]">
              <span className="text-[#7F756E]">Subtotal</span>
              <span className="font-body text-sm font-bold">₹{(order.totalPrice || 0).toLocaleString("en-IN")}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between items-center font-label text-[10px] uppercase tracking-widest">
                <span className="text-[#7F756E]">Discount</span>
                <span className="font-body text-sm font-bold text-[#C8742A]">-₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center font-label text-[10px] uppercase tracking-widest">
              <span className="text-[#7F756E]">Shipping</span>
              <span className="font-body text-sm font-bold text-[#1A1109]">
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="flex justify-between items-center pt-6 font-headline text-2xl border-t border-[#D1C4BC] mt-4 text-[#1A1109]">
              <span>Total</span>
              <span className="text-[#C8742A] font-bold">₹{finalTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button 
            onClick={handleCreatePayment}
            className="mt-12 w-full bg-[#1A1109] text-[#FFF8F5] py-5 font-label text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#C8742A] transition-colors duration-300"
          >
            PROCEED TO PAYMENT
          </button>
          
          <div className="mt-6 flex justify-center items-center gap-2 text-[#7F756E]">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span className="font-label text-[9px] uppercase tracking-[0.2em]">SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>

    </div>
  );
}