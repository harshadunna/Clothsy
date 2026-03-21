import { useState } from "react";
import { motion } from "framer-motion";

const footerSections = [
  {
    title: "Shop",
    links: [
      { label: "Women", path: "/women" },
      { label: "Men", path: "/men" },
      { label: "New Arrivals", path: "/" },
      { label: "Sale", path: "/" },
      { label: "Gift Cards", path: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", path: "/" },
      { label: "Careers", path: "/" },
      { label: "Press", path: "/" },
      { label: "Blog", path: "/" },
      { label: "Partners", path: "/" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", path: "/" },
      { label: "Track Order", path: "/" },
      { label: "Returns", path: "/" },
      { label: "Size Guide", path: "/" },
      { label: "Contact Us", path: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", path: "/" },
      { label: "Terms of Service", path: "/" },
      { label: "Cookie Policy", path: "/" },
      { label: "Accessibility", path: "/" },
    ],
  },
];

const socialLinks = [
  {
    name: "Instagram",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

const paymentIcons = [
  { name: "Visa", label: "VISA" },
  { name: "Mastercard", label: "MC" },
  { name: "UPI", label: "UPI" },
  { name: "Razorpay", label: "RPay" },
  { name: "COD", label: "COD" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer
      className="relative mt-20 overflow-hidden"
      style={{ background: "#0d0906" }}
    >
      {/* ── Top gradient line ── */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #c8742a 40%, #d4832f 60%, transparent)" }}
      />

      {/* ── Ambient glow ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(200,116,42,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10">

        {/* ── Newsletter Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-8 sm:p-10 mb-16 flex flex-col sm:flex-row items-center justify-between gap-8"
          style={{
            background: "linear-gradient(135deg, rgba(200,116,42,0.15), rgba(212,131,47,0.08))",
            border: "1px solid rgba(200,116,42,0.2)",
          }}
        >
          <div>
            <h3
              className="text-xl sm:text-2xl font-black text-white tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Stay in the loop
            </h3>
            <p className="mt-1 text-sm" style={{ color: "#9e8d7a" }}>
              Get early access to new drops, exclusive offers and style tips.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex gap-2 w-full sm:w-auto">
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "rgba(22,163,74,0.15)", color: "#4ade80", border: "1px solid rgba(22,163,74,0.2)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                You're subscribed!
              </motion.div>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    caretColor: "#c8742a",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(200,116,42,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #d4832f, #c8742a)",
                    boxShadow: "0 4px 16px rgba(200,116,42,0.35)",
                  }}
                >
                  Subscribe
                </motion.button>
              </>
            )}
          </form>
        </motion.div>

        {/* ── Main Footer Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 pb-14 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          {/* Brand column */}
          <motion.div variants={itemVariants} className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shrink-0"
                style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)" }}
              >
                S
              </div>
              <span
                className="font-black text-2xl tracking-tight text-white"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Shophive
              </span>
            </div>

            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#7a6a5a" }}>
              India's favorite destination for ethnic and contemporary fashion. Shop confidently, dress brilliantly.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <motion.a
                  key={s.name}
                  href="#"
                  whileHover={{ scale: 1.12, color: "#c8742a" }}
                  whileTap={{ scale: 0.95 }}
                  title={s.name}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#7a6a5a",
                  }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>

            {/* App download hint */}
            <div className="flex gap-2">
              {["App Store", "Google Play"].map((store) => (
                <div
                  key={store}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#9e8d7a",
                  }}
                >
                  {store === "App Store" ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3.18 23.76c.3.17.64.24.99.2l12.6-12.6-3.18-3.18L3.18 23.76zm17.35-10.3L17.79 12l2.74-2.74c.78-.44.78-1.82 0-2.26L17 5.24c-.44-.25-.97-.25-1.41 0L3.18.24C2.83.2 2.49.27 2.18.44 1.47.85 1.47 2.15 2.18 2.56L14.21 9l-3.18 3.18L2.18 21.44c-.71.41-.71 1.71 0 2.12.31.17.65.24.99.2l13.41-7.76 2.74-2.74c.39-.22.67-.61.67-1.13.01-.52-.28-.91-.66-1.13z" />
                    </svg>
                  )}
                  {store}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <motion.div key={section.title} variants={itemVariants} className="space-y-4">
              <h3
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: "#c8742a" }}
              >
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.path}
                      className="text-sm font-medium relative group inline-flex items-center gap-1 transition-colors duration-200"
                      style={{ color: "#7a6a5a" }}
                      onMouseEnter={(e) => (e.target.style.color = "#e8d5c0")}
                      onMouseLeave={(e) => (e.target.style.color = "#7a6a5a")}
                    >
                      {link.label}
                      <span
                        className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300 rounded-full"
                        style={{ background: "#c8742a" }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Bottom Bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          {/* Copyright */}
          <p className="text-xs" style={{ color: "#4a3d30" }}>
            © {new Date().getFullYear()} Shophive Inc. All rights reserved.
          </p>

          {/* Payment methods */}
          <div className="flex items-center gap-2">
            <span className="text-xs mr-1" style={{ color: "#4a3d30" }}>We accept</span>
            {paymentIcons.map((p) => (
              <div
                key={p.name}
                title={p.name}
                className="px-2 py-1 rounded-md text-[10px] font-black"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#9e8d7a",
                  letterSpacing: "0.03em",
                }}
              >
                {p.label}
              </div>
            ))}
          </div>

          {/* Made by */}
          <p className="text-xs flex items-center gap-1.5" style={{ color: "#4a3d30" }}>
            Made with
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ color: "#c8742a" }}
            >
              ♥
            </motion.span>
            by{" "}
            <span className="font-bold" style={{ color: "#7a6a5a" }}>Harsha</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}