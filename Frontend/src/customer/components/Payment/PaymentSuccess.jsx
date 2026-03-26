import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import api from "../../../config/api";
import { clearCart } from "../../../Redux/Customers/Cart/Action";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("updating");
  const [orderData, setOrderData] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  useEffect(() => {
    // 1. Instantly trigger the clearCart action which drops the DB and Redux state
    dispatch(clearCart());

    if (orderId) {
      const fetchOrderDetails = async () => {
        try {
          // 2. Wait 1.5s to ensure the Stripe Webhook has finished updating the DB
          setTimeout(async () => {
            try {
              const res = await api.get(`/api/orders/${orderId}`);
              setOrderData(res.data);
              setStatus("success");
            } catch (err) {
              console.error("Order not found yet, retrying...");
              setStatus("error");
            }
          }, 1500);
        } catch (err) {
          setStatus("error");
        }
      };

      fetchOrderDetails();
    }
  }, [orderId, dispatch]);

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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span className="text-sm font-medium hidden sm:block">Print Receipt</span>
          </button>
        )}

        {status === "updating" ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-6" style={{ borderColor: "#fdf0e6", borderTopColor: "#c8742a" }} />
            <h1 className="text-xl font-bold text-gray-700">Securing your order...</h1>
            <p className="text-sm text-gray-400 mt-2 text-center px-4">Verifying your payment with Stripe.</p>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 text-center">Order processing...</h1>
            <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">If payment was successful, your order will appear in your account history shortly.</p>
            <button onClick={() => navigate("/account/orders")} className="mt-8 text-indigo-600 font-bold hover:underline">Go to My Orders &rarr;</button>
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
              A confirmation email will be sent shortly.
            </p>

            {/* Tracker */}
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
                      <div className={`absolute top-14 text-center w-24 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isActive ? "text-[#c8742a]" : "text-gray-400 font-medium"}`}>
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="w-full bg-[#fff9f4] border border-[#fdf0e6] rounded-2xl p-4 mb-8 flex items-center justify-center gap-3 text-[#c8742a]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="font-semibold text-sm sm:text-base">Expected Delivery: <span className="font-black">{getExpectedDelivery()}</span></p>
            </motion.div>

            {/* Summary Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Items in this order</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar print:max-h-none print:overflow-visible">
                  {orderData?.orderItems?.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl">
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                        <img src={item?.product?.imageUrl} alt="product" className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="font-bold text-gray-900 text-sm line-clamp-2">{item?.product?.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Size: {item?.size} | Qty: {item?.quantity}</p>
                        <p className="font-bold text-gray-900 mt-1">₹{item?.discountedPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Payment Summary</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <p>Subtotal</p>
                      <p className="font-medium text-gray-900">₹{orderData?.totalPrice}</p>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <p>Discount</p>
                      <p className="font-medium">-₹{orderData?.totalPrice - orderData?.totalDiscountedPrice}</p>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3 mt-3">
                      <p className="font-bold text-gray-900">Total Paid</p>
                      <p className="text-xl font-black text-[#c8742a]">₹{orderData?.totalDiscountedPrice}</p>
                    </div>
                  </div>
                </div>

                {orderData?.shippingAddress && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 text-gray-400 uppercase tracking-widest">
                      Address
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-bold text-gray-900">{orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}</p>
                      <p>{orderData.shippingAddress.streetAddress}</p>
                      <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}</p>
                      <p className="pt-2 font-medium">Phone: {orderData.shippingAddress.mobile}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mx-auto print:hidden">
              <button
                onClick={() => navigate("/account/orders")}
                className="flex-1 py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-[#c8742a] bg-[#fdf0e6] hover:bg-[#fae6d5] transition-colors"
              >
                Track Order
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)" }}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}