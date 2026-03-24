import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PaymentCancel() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Grab the order ID just in case we want to show it
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 bg-gray-50/50">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="bg-white p-8 sm:p-12 rounded-[2rem] border shadow-xl flex flex-col items-center w-full max-w-lg text-center"
        style={{ borderColor: "#f3e8e8" }}
      >
        {/* Animated Icon */}
        <motion.div 
          initial={{ rotate: -180, scale: 0 }} 
          animate={{ rotate: 0, scale: 1 }} 
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner"
        >
          <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Georgia', serif" }}>
          Payment Cancelled
        </h1>
        
        <p className="text-gray-500 text-base mb-8">
          You cancelled the checkout process. <strong className="text-gray-700">No charges were made to your card.</strong>
          {orderId && <span className="block mt-2 text-sm text-gray-400">Order Reference: #{orderId}</span>}
        </p>

        <div className="w-full bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
          <p className="text-sm text-gray-600">
            Your items are still safely saved in your cart. You can come back and complete your purchase anytime!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={() => navigate("/cart")}
            className="w-full py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-white shadow-lg transition-transform active:scale-95 hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)" }}
          >
            Return to Cart
          </button>
          
          <button 
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-gray-500 bg-white border-2 border-gray-100 hover:bg-gray-50 hover:text-gray-700 transition-colors active:scale-95"
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>
    </div>
  );
}