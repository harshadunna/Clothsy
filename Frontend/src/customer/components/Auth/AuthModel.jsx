import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import RegisterUserForm from "./RegisterForm";
import LoginUserForm from "./LoginForm";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25, delay: 0.1 } },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    y: 30,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 20,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

export default function AuthModel({ handleClose, open }) {
  const location = useLocation();
  const auth = useSelector((store) => store.auth);
  const isLogin = location.pathname === "/login";

  useEffect(() => {
    if (auth.user) handleClose();
  }, [auth.user]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto relative w-full max-w-md"
            >
              {/* Glow ring */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-pink-500/30 blur-sm" />

              {/* Card */}
              <div className="relative rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">

                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all duration-200"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Header */}
                <div className="px-8 pt-8 pb-2">
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                  >
                    <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
                      {isLogin ? "Welcome back" : "Get started"}
                    </p>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {isLogin ? "Sign in to your account" : "Create an account"}
                    </h2>
                  </motion.div>
                </div>

                {/* Form content */}
                <motion.div
                  className="px-8 pt-4 pb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.22, duration: 0.3 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isLogin ? "login" : "register"}
                      initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isLogin ? 16 : -16 }}
                      transition={{ duration: 0.22 }}
                    >
                      {isLogin ? <LoginUserForm /> : <RegisterUserForm />}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}