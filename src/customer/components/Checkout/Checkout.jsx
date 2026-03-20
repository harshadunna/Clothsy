import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DeliveryAddress from "./DeliveryAddress";
import OrderSummary from "./OrderSummary";

const STEPS = ["Login", "Delivery Address", "Order Summary", "Payment"];

const stepIcons = [
  // Login
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>,
  // Delivery
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
  // Order Summary
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>,
  // Payment
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>,
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Checkout() {
  const [activeStep, setActiveStep] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const step = parseInt(queryParams.get("step") || "2", 10);
  const direction = 1; // always moving forward in this flow

  const handleNext = () => {
    navigate(`/checkout?step=${step + 1}`);
  };

  const handleBack = () => {
    if (step > 2) navigate(`/checkout?step=${step - 1}`);
  };

  const isCompleted = (i) => i < step - 1;
  const isActive = (i) => i === step - 1;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* ── Page Title ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
          >
            Checkout
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "#9e8d7a" }}>
            Step {step} of {STEPS.length} — {STEPS[step - 1]}
          </p>
        </motion.div>

        {/* ── Stepper ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="bg-white rounded-2xl border px-6 py-5"
            style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 20px rgba(200,116,42,0.06)" }}
          >
            <div className="flex items-center justify-between">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center flex-1">

                  {/* Step Node */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{
                        background: isCompleted(i)
                          ? "#c8742a"
                          : isActive(i)
                            ? "#fff"
                            : "#f5ede4",
                        borderColor: isActive(i) ? "#c8742a" : "transparent",
                        scale: isActive(i) ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-9 h-9 rounded-full flex items-center justify-center border-2 relative z-10"
                      style={{
                        borderColor: isActive(i) ? "#c8742a" : "transparent",
                        background: isCompleted(i)
                          ? "#c8742a"
                          : isActive(i)
                            ? "#fff"
                            : "#f5ede4",
                        boxShadow: isActive(i)
                          ? "0 0 0 4px rgba(200,116,42,0.15)"
                          : "none",
                      }}
                    >
                      {isCompleted(i) ? (
                        // Checkmark for completed
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        // Icon for current/upcoming
                        <span style={{ color: isActive(i) ? "#c8742a" : "#b5a89a" }}>
                          {stepIcons[i]}
                        </span>
                      )}
                    </motion.div>

                    {/* Label */}
                    <span
                      className="mt-2 text-[11px] font-bold text-center hidden sm:block"
                      style={{
                        color: isActive(i)
                          ? "#c8742a"
                          : isCompleted(i)
                            ? "#7a5c3a"
                            : "#b5a89a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 mt-[-18px] sm:mt-[-18px] h-px relative">
                      <div className="w-full h-px" style={{ background: "#e8ddd5" }} />
                      <motion.div
                        className="absolute top-0 left-0 h-px"
                        style={{ background: "#c8742a" }}
                        animate={{ width: isCompleted(i) ? "100%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Back Button ── */}
        {step > 2 && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-sm font-bold transition-colors"
            style={{ color: "#c8742a" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
        )}

        {/* ── Step Content ── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 2 && <DeliveryAddress handleNext={handleNext} />}
            {step === 3 && <OrderSummary handleNext={handleNext} />}
            {step === 4 && (
              <div
                className="bg-white rounded-2xl border p-10 text-center"
                style={{ borderColor: "#e8ddd5" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#fdf0e6" }}
                >
                  <svg className="w-8 h-8" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-black mb-2" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
                  Payment
                </h2>
                <p className="text-sm" style={{ color: "#9e8d7a" }}>
                  Payment component coming soon.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}