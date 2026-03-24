import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../../config/api";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("updating");
  const [orderData, setOrderData] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  useEffect(() => {
    if (orderId) {
      api.get(`/api/payments/update_payment?order_id=${orderId}`)
        .then(() => api.get(`/api/orders/${orderId}`))
        .then((res) => {
          setOrderData(res.data);
          setStatus("success");
        })
        .catch((err) => {
          console.error("Error fetching order:", err);
          setStatus("error");
        });
    }
  }, [orderId]);

  const steps = ["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];
  const currentStepIndex = 1;

  const getExpectedDelivery = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 bg-gray-50/50 print:bg-white print:py-0">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-white p-6 sm:p-10 rounded-[2rem] border shadow-xl flex flex-col items-center w-full max-w-5xl print:shadow-none print:border-none print:p-0 relative"
        style={{ borderColor: "#e8ddd5" }}
      >

        {status === "success" && (
          <button
            onClick={handlePrint}
            className="absolute top-6 right-6 sm:top-8 sm:right-8 text-gray-400 hover:text-[#c8742a] flex items-center gap-2 transition-colors print:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            <span className="text-sm font-medium hidden sm:block">Print Receipt</span>
          </button>
        )}

        {status === "updating" ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-6" style={{ borderColor: "#fdf0e6", borderTopColor: "#c8742a" }} />
            <h1 className="text-xl font-bold text-gray-700">Securing your order...</h1>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-[#fdf0e6] rounded-full flex items-center justify-center mb-4 shadow-inner"
            >
              <svg className="w-10 h-10 text-[#c8742a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <h1 className="text-3xl font-black text-gray-900 mb-2 text-center" style={{ fontFamily: "'Georgia', serif" }}>
              Order Confirmed!
            </h1>
            <p className="text-gray-500 text-sm mb-1 text-center">
              Order <span className="font-bold text-[#c8742a]">#{orderId}</span> placed on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-gray-400 text-xs mb-8 text-center print:hidden">
              A confirmation email will be sent to your registered email address.
            </p>

            {/* --- ANIMATED TRACKER --- */}
            {/* FIXED OVERLAP: Changed mb-10 to mb-20 to give the two-line text plenty of room */}
            <div className="w-full max-w-2xl relative mb-20 px-2 sm:px-6 print:hidden">
              <div className="absolute left-[10%] right-[10%] top-5 h-1.5 bg-gray-100 rounded-full"></div>
              <motion.div
                initial={{ width: "0%" }} animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                transition={{ delay: 0.6, duration: 1, ease: "easeInOut" }}
                className="absolute left-[10%] top-5 h-1.5 rounded-full origin-left"
                style={{ background: "linear-gradient(90deg, #d4832f, #c8742a)" }}
              />
              <div className="relative flex justify-between w-full">
                {steps.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  return (
                    <div key={index} className="flex flex-col items-center relative z-10 w-1/5">
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + (index * 0.15), type: "spring" }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-4 shadow-sm transition-colors duration-300 ${isActive ? "bg-[#c8742a] border-white text-white" : "bg-white border-gray-100 text-gray-300"}`}
                      >
                        {isActive ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                        )}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + (index * 0.1) }}
                        className={`absolute top-14 text-center w-24 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isActive ? "text-[#c8742a]" : "text-gray-400 font-medium"}`}
                      >
                        {step}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- DELIVERY BANNER --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="w-full bg-[#fff9f4] border border-[#fdf0e6] rounded-2xl p-4 mb-8 flex items-center justify-center gap-3 text-[#c8742a]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="font-semibold text-sm sm:text-base">Expected Delivery: <span className="font-black">{getExpectedDelivery()}</span></p>
            </motion.div>

            {/* --- ORDER DETAILS & SUMMARY GRID --- */}
            {orderData && (
              <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Items in this order</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar print:max-h-none print:overflow-visible">
                    {orderData?.orderItems?.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => navigate(`/product/${item?.product?.id}`)}
                        className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-[#c8742a]/30 transition-all cursor-pointer group"
                      >
                        <div className="w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 relative">
                          <img src={item?.product?.imageUrl} alt="product" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-[#c8742a] transition-colors">{item?.product?.title}</p>
                          <p className="text-xs text-gray-500 mt-1">Size: {item?.size} | Qty: {item?.quantity}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className="font-bold text-gray-900">₹{item?.discountedPrice}</p>
                            {item?.price !== item?.discountedPrice && (
                              <p className="text-xs text-gray-400 line-through">₹{item?.price}</p>
                            )}
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <svg className="w-5 h-5 text-[#c8742a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="space-y-6">

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Payment Summary</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p className="font-medium text-gray-900">₹{orderData?.totalPrice}</p>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <p>Discount</p>
                        {/* FIXED DISCOUNT: Fallback calculation ensures it never goes blank */}
                        <p className="font-medium">-₹{orderData?.discount || (orderData?.totalPrice - orderData?.totalDiscountedPrice)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Delivery Charges</p>
                        <p className="font-medium text-green-600">Free</p>
                      </div>
                      <div className="border-t pt-3 mt-3 flex justify-between items-center">
                        <p className="font-bold text-gray-900">Total Paid</p>
                        <p className="text-xl font-black text-[#c8742a]">₹{orderData?.totalDiscountedPrice}</p>
                      </div>
                    </div>
                  </div>

                  {orderData?.shippingAddress && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-fit print:border-none print:shadow-none print:p-0 print:mt-6">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Shipping Address
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1 break-words pr-2">
                        <p className="font-bold text-gray-900">{orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}</p>
                        <p>{orderData.shippingAddress.streetAddress}</p>
                        <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}</p>
                        <p className="pt-2 font-medium">Phone: {orderData.shippingAddress.mobile}</p>
                      </div>
                    </div>
                  )}

                </motion.div>
              </div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mx-auto print:hidden">
              <button
                onClick={() => navigate("/account/orders")}
                className="flex-1 py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-[#c8742a] bg-[#fdf0e6] hover:bg-[#fae6d5] transition-colors active:scale-95"
              >
                Track Order
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-white shadow-lg transition-transform active:scale-95 hover:shadow-xl hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)" }}
              >
                Continue Shopping
              </button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}