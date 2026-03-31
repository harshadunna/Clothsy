import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getUser, login } from "../../../Redux/Auth/Action";
import api from "../../../config/api"; 

export default function LoginForm() {
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState("success");
  
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false); 
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [isSendingReset, setIsSendingReset] = useState(false);

  const auth = useSelector((store) => store.auth);

  useEffect(() => {
    if (jwt) dispatch(getUser(jwt));
  }, [jwt, dispatch]);

  useEffect(() => {
    if (auth.user || auth.error) {
      setSnackType(auth.error ? "error" : "success");
      setSnackMessage(auth.error ? auth.error : "Authentication Successful.");
      setOpenSnackBar(true);
    }
  }, [auth.user, auth.error]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    dispatch(login({ email: data.get("email"), password: data.get("password") }));
  };

  const handleForgotSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");

    setIsSendingReset(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSnackType("success");
      setSnackMessage("If this identity exists, a recovery link has been dispatched.");
      setOpenSnackBar(true);
      setIsForgotPassword(false); // Switch back to login view
    } catch (error) {
      setSnackType("error");
      setSnackMessage("System error. Please try again later.");
      setOpenSnackBar(true);
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isForgotPassword ? (
          // FORGOT PASSWORD VIEW 
          <motion.form 
            key="forgot"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-10" 
            onSubmit={handleForgotSubmit}
          >
            <div>
              <h2 className="font-headline text-2xl mb-2 text-[#1A1109]">Recover Identity</h2>
              <p className="font-label text-[10px] uppercase tracking-widest text-outline">Enter your registered email to receive a secure recovery link.</p>
            </div>

            <div className="group">
              <label className="font-label uppercase tracking-[0.15em] text-[11px] text-outline group-focus-within:text-primary transition-colors">
                Identifier
              </label>
              <div className="relative mt-2 border-b border-outline-variant/40 pb-1">
                <input
                  required id="email" name="email" type="email"
                  onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-0 px-0 py-2 text-on-surface placeholder:text-outline/40 focus:ring-0 focus:outline-none outline-none shadow-none font-body text-sm"
                  placeholder="email@architect.com"
                />
                <motion.div
                  className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-primary origin-center"
                  initial={{ scaleX: 0 }} animate={{ scaleX: focusedField === "email" ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={isSendingReset}
                className="relative overflow-hidden group w-full bg-on-surface text-surface font-label uppercase tracking-[0.2em] text-[12px] py-5 font-bold focus:outline-none disabled:opacity-50"
              >
                <span className="relative z-10">{isSendingReset ? "Dispatching..." : "Send Recovery Link"}</span>
                <div className="absolute inset-0 bg-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
              </button>
              
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full font-label uppercase tracking-widest text-[10px] text-outline hover:text-primary transition-colors py-4"
              >
                Return to Login
              </button>
            </div>
          </motion.form>
        ) : (
          // STANDARD LOGIN VIEW 
          <motion.form 
            key="login"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-10" 
            onSubmit={handleSubmit}
          >
            {/* Email Field */}
            <div className="group">
              <label className="font-label uppercase tracking-[0.15em] text-[11px] text-outline group-focus-within:text-primary transition-colors">
                Identifier
              </label>
              <div className="relative mt-2 border-b border-outline-variant/40 pb-1">
                <input
                  required id="email" name="email" type="email"
                  onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-0 px-0 py-2 text-on-surface placeholder:text-outline/40 focus:ring-0 focus:outline-none outline-none shadow-none font-body text-sm"
                  placeholder="email@architect.com"
                />
                <motion.div
                  className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-primary origin-center"
                  initial={{ scaleX: 0 }} animate={{ scaleX: focusedField === "email" ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex justify-between items-center">
                <label className="font-label uppercase tracking-[0.15em] text-[11px] text-outline group-focus-within:text-primary transition-colors">
                  Access Key
                </label>
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="font-label uppercase tracking-[0.1em] text-[9px] text-outline-variant hover:text-primary transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative mt-2 flex items-center border-b border-outline-variant/40 pb-1">
                <input
                  required id="password" name="password" type={showPassword ? "text" : "password"} 
                  onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-0 px-0 py-2 text-on-surface placeholder:text-outline/40 focus:ring-0 focus:outline-none outline-none shadow-none font-body text-sm"
                  placeholder="••••••••"
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)} 
                  className="p-2 text-outline-variant hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
                <motion.div
                  className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-primary origin-center"
                  initial={{ scaleX: 0 }} animate={{ scaleX: focusedField === "password" ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-6">
              <button
                type="submit"
                className="relative overflow-hidden group w-full bg-on-surface text-surface font-label uppercase tracking-[0.2em] text-[12px] py-5 font-bold focus:outline-none"
              >
                <span className="relative z-10">Enter Workspace</span>
                <div className="absolute inset-0 bg-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Snackbar */}
      <AnimatePresence>
        {openSnackBar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-10 right-10 z-[9999] px-6 py-4 border font-label text-[10px] uppercase tracking-widest font-bold shadow-2xl
              ${snackType === "error" ? "bg-error-container text-error border-error/30" : "bg-surface-container text-primary border-primary/30"}`}
          >
            {snackMessage}
            <button onClick={() => setOpenSnackBar(false)} className="ml-6 underline">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}