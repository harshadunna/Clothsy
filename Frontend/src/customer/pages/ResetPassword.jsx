import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      setError("Access keys do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setMessage("Identity secured. Access key successfully updated.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired link. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FFF8F5] text-[#1A1109] p-6">
        <h1 className="font-headline text-3xl mb-4 text-[#BA1A1A]">Invalid Credentials</h1>
        <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#7F756E]">No secure token provided in the URL.</p>
        <button onClick={() => navigate("/")} className="mt-8 border-b border-[#1A1109] font-label text-[0.65rem] font-black uppercase tracking-widest pb-1 hover:text-[#C8742A] hover:border-[#C8742A] transition-colors">Return to Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FFF8F5] py-24 px-6 relative">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white p-10 md:p-14 border border-[#D1C4BC]"
      >
        <div className="mb-10 text-center">
          <p className="font-label text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#C8742A] mb-4">Security Protocol</p>
          <h1 className="text-4xl font-headline italic leading-tight tracking-tighter text-[#1A1109]">Reset Access Key</h1>
        </div>

        {message ? (
          <div className="text-center py-8">
            <p className="font-label text-[0.7rem] font-black uppercase tracking-widest text-[#16a34a] mb-6">{message}</p>
            <p className="font-body text-sm text-[#7F756E] italic">Redirecting to login workspace...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="font-label text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#7F756E]">New Access Key</label>
              <input
                required type="password" name="newPassword"
                className="w-full bg-[#F9F2EF] border border-[#D1C4BC] px-4 py-3 font-body text-sm text-[#1A1109] focus:outline-none focus:border-[#C8742A] transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#7F756E]">Confirm Key</label>
              <input
                required type="password" name="confirmPassword"
                className="w-full bg-[#F9F2EF] border border-[#D1C4BC] px-4 py-3 font-body text-sm text-[#1A1109] focus:outline-none focus:border-[#C8742A] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="font-label text-[0.65rem] font-black uppercase tracking-[0.1em] text-[#BA1A1A] text-center">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-5 bg-[#1A1109] text-[#FFF8F5] font-label text-[0.7rem] font-black tracking-[0.3em] uppercase hover:bg-[#C8742A] transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? "Processing..." : "Secure Identity"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}