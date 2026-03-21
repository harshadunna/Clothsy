import { motion } from "framer-motion";

const steps = [
  {
    label: "Placed",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: "Confirmed",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Shipped",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    label: "Out for Delivery",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414A1 1 0 0121 11.414V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    label: "Delivered",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
];

export default function OrderTracker({ activeStep }) {
  // activeStep is 1-indexed (1 = Placed, 5 = Delivered)
  const currentIndex = activeStep - 1;

  return (
    <div className="w-full">
      {/* Step nodes + connectors */}
      <div className="flex items-center">
        {steps.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;

          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">

              {/* Step node */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="w-10 h-10 rounded-full flex items-center justify-center relative z-10 border-2"
                  style={{
                    background: isCompleted
                      ? "#c8742a"
                      : isActive
                      ? "#fff"
                      : "#f5ede4",
                    borderColor: isCompleted || isActive ? "#c8742a" : "#e8ddd5",
                    boxShadow: isActive
                      ? "0 0 0 5px rgba(200,116,42,0.15)"
                      : isCompleted
                      ? "0 2px 10px rgba(200,116,42,0.25)"
                      : "none",
                    color: isCompleted ? "#fff" : isActive ? "#c8742a" : "#b5a89a",
                  }}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}

                  {/* Pulse ring on active step */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: "#c8742a" }}
                      animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 + 0.1, duration: 0.3 }}
                  className="mt-2 text-[11px] font-bold text-center whitespace-nowrap"
                  style={{
                    color: isActive
                      ? "#c8742a"
                      : isCompleted
                      ? "#7a5c3a"
                      : "#b5a89a",
                  }}
                >
                  {step.label}
                </motion.span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="flex-1 mx-1 mb-5 h-0.5 relative overflow-hidden" style={{ background: "#e8ddd5" }}>
                  <motion.div
                    className="absolute inset-y-0 left-0 h-full"
                    style={{ background: "linear-gradient(90deg, #c8742a, #d4832f)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}