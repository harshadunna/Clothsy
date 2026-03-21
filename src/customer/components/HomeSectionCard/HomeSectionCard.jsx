import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function HomeSectionCard({ product }) {
    const navigate = useNavigate();

    const discountPercent = product?.discountPersent;
    const hasDiscount = discountPercent > 0;

    return (
        <motion.div
            whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(200,116,42,0.14)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate(`/product/${product?.id}`)}
            className="cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden w-full"
            style={{
                border: "1px solid #e8ddd5",
                boxShadow: "0 2px 12px rgba(180,140,90,0.08)",
            }}
        >
            {/* ── Image ── */}
            <div
                className="relative overflow-hidden"
                style={{ height: "14rem", background: "#f9f3ed" }}
            >
                <motion.img
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    src={product?.imageUrl}
                    alt={product?.title || ""}
                    draggable={false}
                    className="w-full h-full object-cover object-top select-none"
                />

                {/* Discount badge */}
                {hasDiscount && (
                    <div
                        className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: "#c8742a", color: "#fff" }}
                    >
                        {discountPercent}% OFF
                    </div>
                )}
            </div>

            {/* ── Info ── */}
            <div className="p-4 space-y-0.5">
                <p
                    className="text-[11px] font-black uppercase tracking-widest truncate"
                    style={{ color: "#c8742a" }}
                >
                    {product?.brand}
                </p>
                <h3
                    className="text-sm font-semibold leading-snug truncate"
                    style={{ color: "#1a1109" }}
                >
                    {product?.title}
                </h3>

                {/* Price row */}
                {product?.discountedPrice && (
                    <div className="flex items-center gap-2 pt-1.5">
                        <span className="text-sm font-black" style={{ color: "#1a1109" }}>
                            ₹{product.discountedPrice}
                        </span>
                        {product?.price && (
                            <span className="text-xs line-through" style={{ color: "#b5a89a" }}>
                                ₹{product.price}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}