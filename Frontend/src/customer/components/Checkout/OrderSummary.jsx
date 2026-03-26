import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById, createPayment } from "../../../Redux/Customers/Order/Action";

export default function OrderSummary({ handleNext }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { order: orderState } = useSelector((store) => store);

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  useEffect(() => {
    if (orderId) dispatch(getOrderById(orderId));
  }, [orderId, dispatch]);

  const order = orderState?.order;
  const discount = order?.discount ?? order?.discounte ?? 0;

  const handleCreatePayment = () => {
    dispatch(createPayment(orderId));
  };

  if (orderState?.loading || !order) {
    return <div className="py-32 flex justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
      
      {/* ── Left: Items ── */}
      <div className="lg:col-span-7">
        <h2 className="font-label text-xs uppercase tracking-[0.15em] mb-8 border-b border-outline-variant/30 pb-2 text-on-surface">Order Contents</h2>
        
        <div className="space-y-12">
          {order.orderItems?.map((item) => (
            <div key={item.id} className="flex space-x-6 items-start">
              <div className="w-24 h-32 bg-surface-container overflow-hidden flex-shrink-0">
                <img src={item.product?.imageUrl} alt={item.product?.title} className="w-full h-full object-cover grayscale-[30%]" />
              </div>
              <div className="flex-grow pt-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-label text-[11px] uppercase tracking-widest font-bold text-on-surface max-w-[70%]">{item.product?.title}</h4>
                  <span className="font-body text-sm font-bold">₹{item.discountedPrice}</span>
                </div>
                <p className="text-outline-variant text-[10px] uppercase tracking-wider mt-2">{item.product?.brand} / {item.size}</p>
                <p className="text-outline-variant text-[10px] uppercase tracking-wider mt-1">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Summary Panel ── */}
      <div className="lg:col-span-5">
        <div className="bg-surface-container-low p-10 sticky top-32">
          <h3 className="font-headline text-3xl italic tracking-tighter mb-10 text-on-surface">Order Summary</h3>
          
          <div className="space-y-4 pt-8 border-t border-outline-variant/30">
            <div className="flex justify-between items-center font-label text-[10px] uppercase tracking-widest text-on-surface">
              <span className="text-outline">Subtotal</span>
              <span className="font-body text-sm font-bold">₹{order.totalPrice}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between items-center font-label text-[10px] uppercase tracking-widest">
                <span className="text-outline">Discount</span>
                <span className="font-body text-sm font-bold text-primary">-₹{discount}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center font-label text-[10px] uppercase tracking-widest">
              <span className="text-outline">Shipping</span>
              <span className="font-body text-sm italic">Calculated at payment</span>
            </div>

            <div className="flex justify-between items-center pt-6 font-headline text-2xl border-t border-outline-variant/30 mt-4 text-on-surface">
              <span>Total</span>
              <span className="text-primary font-bold">₹{order.totalDiscountedPrice}</span>
            </div>
          </div>

          <button 
            onClick={handleCreatePayment}
            className="mt-12 w-full bg-on-background text-surface py-5 font-label text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-colors duration-300"
          >
            PROCEED TO PAYMENT
          </button>
          
          <div className="mt-6 flex justify-center items-center gap-2 text-outline">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span className="font-label text-[9px] uppercase tracking-[0.2em]">SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>

    </div>
  );
}