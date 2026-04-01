import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RegisterUserForm from "./RegisterForm";
import LoginUserForm from "./LoginForm";

export default function AuthModel({ handleClose, open }) {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useSelector((store) => store.auth);
  const isLogin = location.pathname === "/login";

  useEffect(() => {
    if (auth.user && open) {
      const userRole = String(auth.user?.role || "").toUpperCase();

      if (userRole === "ADMIN" || userRole === "ROLE_ADMIN") {
        handleClose();
        navigate("/admin");
        return;
      }

      // Check if we need to securely redirect to checkout after merging cart!
      const redirectTarget = localStorage.getItem("postLoginRedirect");
      if (redirectTarget) {
        localStorage.removeItem("postLoginRedirect"); 
        navigate(redirectTarget);
      } else {
        handleClose(); 
      }
    }
  }, [auth.user, open, navigate, handleClose]);

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
        <motion.div
          key="auth-fullscreen"
          initial={{ opacity: 0, y: "10%" }}
          animate={{ opacity: 1, y: "0%" }}
          exit={{ opacity: 0, y: "10%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex min-h-screen w-full bg-background"
        >
          <section className="hidden lg:block lg:w-[60%] h-screen relative bg-surface-container-highest overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
              alt="Avant-garde high fashion model"
              className="w-full h-full object-cover grayscale-[20%]"
            />
            <div className="absolute top-12 left-12">
              <h1 className="font-headline font-bold tracking-tighter text-5xl text-white mix-blend-difference">CLOTHSY</h1>
              <p className="font-headline italic text-white mix-blend-difference mt-2 text-xl">The Architectural Monolith</p>
            </div>
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
              <div className="max-w-xs">
                <span className="font-label uppercase tracking-[0.2em] text-[10px] text-white/70 block mb-2">Editorial Series 04</span>
                <p className="font-headline text-2xl text-white leading-tight">Exploring the intersection of brutalism and drape.</p>
              </div>
              <div className="text-white font-label text-[10px] tracking-widest">VOL. 24 / ISSUE 02</div>
            </div>
          </section>

          <section className="w-full lg:w-[40%] h-screen bg-surface relative overflow-y-auto">
            <button
              onClick={handleClose}
              className="fixed top-8 right-8 z-[110] w-10 h-10 flex items-center justify-center text-outline hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[28px]">close</span>
            </button>

            <div className="min-h-full flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-24">
              <div className="lg:hidden mb-12">
                <h1 className="font-headline font-bold tracking-tighter text-3xl text-primary">CLOTHSY</h1>
              </div>

              <div className="w-full max-w-md mx-auto">
                <nav className="flex gap-8 mb-16 items-baseline border-b border-outline-variant/30">
                  <button
                    onClick={() => navigate("/login")}
                    className={`font-headline text-3xl focus:outline-none transition-colors pb-3 relative ${isLogin ? 'italic text-on-surface' : 'text-outline hover:text-on-surface'}`}
                  >
                    Login
                    {isLogin && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className={`font-headline text-3xl focus:outline-none transition-colors pb-3 relative ${!isLogin ? 'italic text-on-surface' : 'text-outline hover:text-on-surface'}`}
                  >
                    Register
                    {!isLogin && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
                  </button>
                </nav>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? "login" : "register"}
                    initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {isLogin ? <LoginUserForm /> : <RegisterUserForm />}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-20">
                  <p className="font-body text-[10px] text-outline leading-relaxed max-w-xs uppercase tracking-widest">
                    By entering, you agree to our <a className="underline hover:text-primary underline-offset-4" href="#">Terms of Service</a> and <a className="underline hover:text-primary underline-offset-4" href="#">Editorial Guidelines</a>.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}