import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getUser, register } from "../../../Redux/Auth/Action";

export default function RegisterForm() {
  const dispatch = useDispatch();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackType, setSnackType] = useState("success");
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useSelector((store) => store.auth);
  const jwt = localStorage.getItem("jwt");

  useEffect(() => {
    if (jwt) dispatch(getUser(jwt));
  }, [jwt, dispatch]);

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
      role: "ROLE_CUSTOMER",
    }));
  };

  // Helper function returning raw JSX (avoids React unmounting issues)
  const renderField = (id, label, placeholder, type = "text") => {
    const isPassword = id === "password";

    return (
      <div key={id} className="group w-full">
        <label className="font-label uppercase tracking-[0.15em] text-[11px] text-outline group-focus-within:text-primary transition-colors">
          {label}
        </label>
        <div className="relative mt-2 flex items-center border-b border-outline-variant/40 pb-1">
          <input
            required
            id={id}
            name={id}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            onFocus={() => setFocusedField(id)}
            onBlur={() => setFocusedField(null)}
            className="w-full bg-transparent border-0 px-0 py-2 text-on-surface placeholder:text-outline/40 focus:ring-0 focus:outline-none outline-none shadow-none font-body text-sm"
            placeholder={placeholder}
          />
          
          {/* Eye Icon for Password */}
          {isPassword && (
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-outline-variant hover:text-primary transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          )}

          {/* Animated Focus Line */}
          <motion.div
            className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-primary origin-center"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: focusedField === id ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <form className="space-y-8" onSubmit={handleSubmit}>
        
        {/* First & Last Name Grid */}
        <div className="grid grid-cols-2 gap-6">
          {renderField("firstName", "First Name", "Julian")}
          {renderField("lastName", "Last Name", "Mercer")}
        </div>

        {/* Email & Password */}
        {renderField("email", "Registry Email", "julian@architect.com", "email")}
        {renderField("password", "Access Key", "••••••••", "password")}

        {/* Actions */}
        <div className="pt-6 space-y-6">
          <button
            type="submit"
            className="relative overflow-hidden group w-full bg-on-surface text-surface font-label uppercase tracking-[0.2em] text-[12px] py-5 font-bold focus:outline-none"
          >
            <span className="relative z-10">Establish Identity</span>
            <div className="absolute inset-0 bg-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
          </button>
        </div>
      </form>

      {/* Snackbar */}
      <AnimatePresence>
        {openSnackBar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-10 right-10 z-[9999] px-6 py-4 border font-label text-[10px] uppercase tracking-widest font-bold shadow-2xl
              ${snackType === "error" ? "bg-error-container text-error border-error/30" : "bg-surface-container text-primary border-primary/30"}`}
          >
            {auth.error ? auth.error : auth.user ? "Identity Established." : ""}
            <button onClick={() => setOpenSnackBar(false)} className="ml-6 underline">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}