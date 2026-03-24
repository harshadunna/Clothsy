import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../../config/api"; 

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("updating");

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  useEffect(() => {
    if (orderId) {
      api.get(`/api/payments/update_payment?order_id=${orderId}`)
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    }
  }, [orderId]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-white p-10 rounded-3xl border shadow-xl flex flex-col items-center text-center max-w-md w-full"
        style={{ borderColor: "#e8ddd5" }}
      >
        {status === "updating" ? (
           <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-6" style={{ borderColor: "#fdf0e6", borderTopColor: "#c8742a" }} />
        ) : (
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
          >
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}

        <h1 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Georgia', serif" }}>
          {status === "updating" ? "Verifying Payment..." : "Payment Successful!"}
        </h1>
        
        <p className="text-gray-500 text-sm mb-8">
          {status === "updating" 
            ? "Please wait while we secure your transaction." 
            : `Your order #${orderId} has been placed. We'll send you a shipping confirmation shortly.`}
        </p>

        <button 
          onClick={() => navigate("/")}
          disabled={status === "updating"}
          className="w-full py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-white disabled:opacity-50 transition-transform active:scale-95"
          style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)" }}
        >
          Continue Shopping
        </button>
      </motion.div>
    </div>
  );
}