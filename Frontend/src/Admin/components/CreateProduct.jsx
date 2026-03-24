import { useState } from "react";
import { motion } from "framer-motion";
import api from "../../config/api";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function CreateProduct() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [productData, setProductData] = useState({
        title: "",
        brand: "",
        color: "",
        description: "",
        price: "",
        discountedPrice: "",
        discountPercent: "",
        quantity: "",
        imageUrl: "",
        topLevelCategory: "",
        secondLevelCategory: "",
        thirdLevelCategory: "",
        sizes: [
            { name: "S", quantity: "" },
            { name: "M", quantity: "" },
            { name: "L", quantity: "" },
            { name: "XL", quantity: "" },
        ],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSizeChange = (e, index) => {
        const { value } = e.target;
        const newSizes = [...productData.sizes];
        newSizes[index].quantity = value;
        setProductData((prevState) => ({
            ...prevState,
            sizes: newSizes,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            // 1. Clean up sizes and force the quantity to be a strict Number
            const cleanSizes = productData.sizes
                .filter(size => size.quantity !== "")
                .map(size => ({
                    name: size.name,
                    quantity: Number(size.quantity)
                }));

            // 2. Force all pricing and inventory fields to be strict Numbers
            const payload = {
                ...productData,
                price: Number(productData.price),
                discountedPrice: Number(productData.discountedPrice),
                discountPercent: Number(productData.discountPercent),
                quantity: Number(productData.quantity),
                sizes: cleanSizes
            };

            console.log("Sending payload to backend:", payload); // Helpful for debugging!

            // 3. Make the API call (Removed the trailing slash just in case it caused a 404)
            await api.post("/api/admin/products", payload);

            setSuccess(true);

            // Reset form on success
            setProductData({
                title: "", brand: "", color: "", description: "",
                price: "", discountedPrice: "", discountPercent: "", quantity: "",
                imageUrl: "", topLevelCategory: "", secondLevelCategory: "", thirdLevelCategory: "",
                sizes: [
                    { name: "S", quantity: "" },
                    { name: "M", quantity: "" },
                    { name: "L", quantity: "" },
                    { name: "XL", quantity: "" }
                ],
            });

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Error creating product:", err);
            // Show the EXACT error message from the backend if it exists
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to create product. Please check your inputs."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all bg-white";
    const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2";

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-8">
                <h1 className="text-3xl font-black" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
                    Add New Product
                </h1>
                <p className="text-sm mt-1" style={{ color: "#9e8d7a" }}>Create a new item in your catalog.</p>
            </motion.div>

            {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-bold">
                    Product successfully added to your store!
                </motion.div>
            )}

            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold">
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── Basic Info ── */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="bg-white p-8 rounded-2xl border" style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.03)" }}>
                    <h2 className="text-lg font-black text-gray-900 mb-6">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Image URL</label>
                            <input required type="text" name="imageUrl" value={productData.imageUrl} onChange={handleChange} className={inputClass} placeholder="https://example.com/image.jpg" style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Product Title</label>
                            <input required type="text" name="title" value={productData.title} onChange={handleChange} className={inputClass} placeholder="Men Printed Pure Cotton Straight Kurta" style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div>
                            <label className={labelClass}>Brand</label>
                            <input required type="text" name="brand" value={productData.brand} onChange={handleChange} className={inputClass} placeholder="Majestic Man" style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div>
                            <label className={labelClass}>Color</label>
                            <input required type="text" name="color" value={productData.color} onChange={handleChange} className={inputClass} placeholder="Green" style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Description</label>
                            <textarea required rows="4" name="description" value={productData.description} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="A traditional garment embodying elegance..." style={{ borderColor: "#e8ddd5" }} />
                        </div>
                    </div>
                </motion.div>

                {/* ── Pricing & Inventory ── */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="bg-white p-8 rounded-2xl border" style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.03)" }}>
                    <h2 className="text-lg font-black text-gray-900 mb-6">Pricing & Inventory</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className={labelClass}>Price (₹)</label>
                            <input required type="number" name="price" value={productData.price} onChange={handleChange} className={inputClass} placeholder="1499" style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div>
                            <label className={labelClass}>Discounted (₹)</label>
                            <input required type="number" name="discountedPrice" value={productData.discountedPrice} onChange={handleChange} className={inputClass} placeholder="499" style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div>
                            <label className={labelClass}>Discount %</label>
                            <input required type="number" name="discountPercent" value={productData.discountPercent} onChange={handleChange} className={inputClass} placeholder="66" style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div>
                            <label className={labelClass}>Total Stock</label>
                            <input required type="number" name="quantity" value={productData.quantity} onChange={handleChange} className={inputClass} placeholder="100" style={{ borderColor: "#e8ddd5" }} />
                        </div>
                    </div>
                </motion.div>

                {/* ── Categories & Sizes ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="bg-white p-8 rounded-2xl border" style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.03)" }}>
                        <h2 className="text-lg font-black text-gray-900 mb-6">Categories</h2>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Top Level (e.g., men)</label>
                                <input required type="text" name="topLevelCategory" value={productData.topLevelCategory} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                            </div>
                            <div>
                                <label className={labelClass}>Second Level (e.g., clothing)</label>
                                <input required type="text" name="secondLevelCategory" value={productData.secondLevelCategory} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                            </div>
                            <div>
                                <label className={labelClass}>Third Level (e.g., mens_kurta)</label>
                                <input required type="text" name="thirdLevelCategory" value={productData.thirdLevelCategory} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="bg-white p-8 rounded-2xl border flex flex-col h-full" style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.03)" }}>
                        <h2 className="text-lg font-black text-gray-900 mb-6">Size Quantities</h2>
                        <div className="space-y-4 flex-1">
                            {productData.sizes.map((size, index) => (
                                <div key={size.name} className="flex items-center gap-4">
                                    <div className="w-16 h-12 flex items-center justify-center rounded-xl font-black text-[#c8742a]" style={{ background: "#fdf0e6" }}>
                                        {size.name}
                                    </div>
                                    <input type="number" placeholder={`Stock for ${size.name}`} value={size.quantity} onChange={(e) => handleSizeChange(e, index)} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ── Submit Button ── */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="pt-4 pb-12">
                    <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-black text-white text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50" style={{ background: "#c8742a", boxShadow: "0 8px 24px rgba(200,116,42,0.25)" }}>
                        {loading ? "Adding Product..." : "Create Product"}
                    </button>
                </motion.div>
            </form>
        </div>
    );
}