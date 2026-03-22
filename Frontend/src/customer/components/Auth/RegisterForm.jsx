import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser, register } from "../../../Redux/Auth/Action";

export default function RegisterForm({ handleNext }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackType, setSnackType] = useState("success");
  const [focusedField, setFocusedField] = useState(null);
  const { auth } = useSelector((store) => store);
  const jwt = localStorage.getItem("jwt");

  useEffect(() => {
    if (jwt) dispatch(getUser(jwt));
  }, [jwt]);

  useEffect(() => {
    if (auth.user || auth.error) {
      setSnackType(auth.error ? "error" : "success");
      setOpenSnackBar(true);
    }
  }, [auth.user, auth.error]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    dispatch(register({
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      password: data.get("password"),
      role: data.get("role"),
    }));
  };

  const floatingInputClass =
    "peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-transparent focus:outline-none focus:border-amber-400/70 focus:bg-white/8 transition-all duration-300";

  const floatingLabelClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40 pointer-events-none transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-amber-400 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-white/50";

  const fields = [
    { id: "email", name: "email", type: "email", label: "Email address", autoComplete: "email", full: true },
    { id: "password", name: "password", type: "password", label: "Password", autoComplete: "new-password", full: true },
  ];

  return (
    <div className="w-full">
      <form className="w-full space-y-4" onSubmit={handleSubmit}>

        {/* First + Last Name row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "firstName", name: "firstName", label: "First name", autoComplete: "given-name" },
            { id: "lastName", name: "lastName", label: "Last name", autoComplete: "family-name" },
          ].map((field, i) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.08, duration: 0.4, ease: "easeOut" }}
              className="relative"
            >
              <input
                required
                id={field.id}
                name={field.name}
                type="text"
                autoComplete={field.autoComplete}
                onFocus={() => setFocusedField(field.id)}
                onBlur={() => setFocusedField(null)}
                className={floatingInputClass}
                placeholder={field.label}
              />
              <label htmlFor={field.id} className={floatingLabelClass}>{field.label}</label>
              <motion.div
                className="absolute bottom-0 left-4 right-4 h-px bg-amber-400 rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: focusedField === field.id ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Email & Password */}
        {fields.map((field, i) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 + 0.2, duration: 0.4, ease: "easeOut" }}
            className="relative"
          >
            <input
              required
              id={field.id}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
              className={floatingInputClass}
              placeholder={field.label}
            />
            <label htmlFor={field.id} className={floatingLabelClass}>{field.label}</label>
            <motion.div
              className="absolute bottom-0 left-4 right-4 h-px bg-amber-400 rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: focusedField === field.id ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            />
          </motion.div>
        ))}

        {/* Role select */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4, ease: "easeOut" }}
          className="relative"
        >
          <select
            id="role"
            name="role"
            defaultValue="ROLE_CUSTOMER"
            onFocus={() => setFocusedField("role")}
            onBlur={() => setFocusedField(null)}
            className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/70 transition-all duration-300 cursor-pointer appearance-none"
            style={{ colorScheme: "dark" }}
          >
            <option value="ROLE_CUSTOMER" className="bg-zinc-900">Customer</option>
            <option value="ROLE_ADMIN" className="bg-zinc-900">Admin</option>
          </select>
          {/* Custom chevron */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <motion.div
            className="absolute bottom-0 left-4 right-4 h-px bg-amber-400 rounded-full origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: focusedField === "role" ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          />
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46, duration: 0.4, ease: "easeOut" }}
        >
          <motion.button
            type="submit"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.975 }}
            className="relative w-full py-3.5 rounded-xl font-semibold text-sm tracking-widest uppercase overflow-hidden"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <span className="relative z-10 text-zinc-900">Create Account</span>
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </motion.button>
        </motion.div>
      </form>

      {/* Login link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.54, duration: 0.4 }}
        className="mt-6 flex items-center justify-center gap-2 text-sm text-white/35"
      >
        <span>Already have an account?</span>
        <button
          onClick={() => navigate("/login")}
          className="text-amber-400 font-semibold hover:text-amber-300 transition-colors duration-150 underline underline-offset-2 decoration-amber-400/40 hover:decoration-amber-300"
        >
          Sign In
        </button>
      </motion.div>

      {/* Snackbar */}
      <AnimatePresence>
        {openSnackBar && (
          <motion.div
            key="snackbar"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] min-w-[320px]"
          >
            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium border backdrop-blur-xl
              ${snackType === "error"
                ? "bg-red-950/80 border-red-500/30 text-red-300"
                : "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0
                ${snackType === "error" ? "bg-red-500/20 ring-1 ring-red-500/40" : "bg-emerald-500/20 ring-1 ring-emerald-500/40"}`}
              >
                {snackType === "error" ? (
                  <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="flex-1 tracking-wide">
                {auth.error ? auth.error : auth.user ? "Registration successful!" : ""}
              </span>
              <button
                onClick={() => setOpenSnackBar(false)}
                className="opacity-40 hover:opacity-80 transition-opacity ml-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <motion.div
              className={`h-0.5 rounded-full mt-1.5 origin-left ${snackType === "error" ? "bg-red-500/60" : "bg-emerald-500/60"}`}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 6, ease: "linear" }}
              onAnimationComplete={() => setOpenSnackBar(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}