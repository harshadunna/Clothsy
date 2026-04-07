import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getUser, register } from "../../../Redux/Auth/Action";
import { API_BASE_URL } from "../../../config/api";

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

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/github`;
  };

  const renderField = (id, label, placeholder, type = "text") => {
    const isPassword = id === "password";

    return (
      <div key={id} className="group w-full">
        <label className="font-label uppercase tracking-[0.15em] text-[11px] text-outline group-focus-within:text-primary transition-colors">
          {label}
        </label>
        <div className="relative mt-2 flex items-center border-b border-outline-variant/40 pb-1">
          <input
            required id={id} name={id} type={isPassword ? (showPassword ? "text" : "password") : type}
            onFocus={() => setFocusedField(id)} onBlur={() => setFocusedField(null)}
            className="w-full bg-transparent border-0 px-0 py-2 text-on-surface placeholder:text-outline/40 focus:ring-0 focus:outline-none outline-none shadow-none font-body text-sm"
            placeholder={placeholder}
          />
          {isPassword && (
            <button 
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-outline-variant hover:text-primary transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          )}
          <motion.div
            className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-primary origin-center"
            initial={{ scaleX: 0 }} animate={{ scaleX: focusedField === id ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {/* Social Logins */}
        <div className="flex gap-4">
          <button type="button" onClick={handleGoogleLogin} className="flex-1 flex justify-center items-center gap-2 border border-outline-variant py-3 font-label text-[10px] uppercase hover:bg-[#E8E1DE] transition-colors text-on-surface">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          <button type="button" onClick={handleGithubLogin} className="flex-1 flex justify-center items-center gap-2 border border-outline-variant py-3 font-label text-[10px] uppercase hover:bg-[#E8E1DE] transition-colors text-on-surface">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </button>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-outline-variant/40"></div>
          <span className="flex-shrink-0 mx-4 font-label text-[9px] uppercase tracking-[0.2em] text-outline">Or With Credentials</span>
          <div className="flex-grow border-t border-outline-variant/40"></div>
        </div>

        {/* First & Last Name Grid */}
        <div className="grid grid-cols-2 gap-6">
          {renderField("firstName", "First Name", "Julian")}
          {renderField("lastName", "Last Name", "Mercer")}
        </div>

        {/* Email & Password */}
        {renderField("email", "Registry Email", "julian@architect.com", "email")}
        {renderField("password", "Access Key", "••••••••", "password")}

        {/* Actions */}
        <div className="pt-4">
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