import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/api";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function UpdateProduct() {
    const { productId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true); // True initially while we fetch
    const [submitting, setSubmitting] = useState(false);
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
        // We leave categories empty as updating nested categories is complex 
        // and usually handled via a separate category management system in enterprise apps.
        sizes: [
            { name: "S", quantity: "" },
            { name: "M", quantity: "" },
            { name: "L", quantity: "" },
            { name: "XL", quantity: "" },
        ],
    });

    // FETCH EXISTING PRODUCT DATA
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Ensure this endpoint exists and is public or you have the right headers
                const { data } = await api.get(`/api/products/id/${productId}`);
                
                // Map the existing sizes to our 4 fixed inputs, or leave blank if they don't exist
                const mergedSizes = [
                    { name: "S", quantity: data.sizes?.find(s => s.name === "S")?.quantity || "" },
                    { name: "M", quantity: data.sizes?.find(s => s.name === "M")?.quantity || "" },
                    { name: "L", quantity: data.sizes?.find(s => s.name === "L")?.quantity || "" },
                    { name: "XL", quantity: data.sizes?.find(s => s.name === "XL")?.quantity || "" },
                ];

                setProductData({
                    title: data.title || "",
                    brand: data.brand || "",
                    color: data.color || "",
                    description: data.description || "",
                    price: data.price || "",
                    discountedPrice: data.discountedPrice || "",
                    discountPercent: data.discountPercent || "",
                    quantity: data.quantity || "",
                    imageUrl: data.imageUrl || "",
                    sizes: mergedSizes,
                });
            } catch (err) {
                console.error("Error fetching product data:", err);
                setError("Failed to load product details. It may have been deleted.");
            } finally {
                setLoading(false);
            }
        };

        if (productId) fetchProduct();
    }, [productId]);

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
        setSubmitting(true);
        setError("");
        setSuccess(false);

        try {
            const cleanSizes = productData.sizes
                .filter(size => size.quantity !== "")
                .map(size => ({
                    name: size.name,
                    quantity: Number(size.quantity)
                }));

            const payload = {
                ...productData,
                price: Number(productData.price),
                discountedPrice: Number(productData.discountedPrice),
                discountPercent: Number(productData.discountPercent),
                quantity: Number(productData.quantity),
                sizes: cleanSizes
            };

            await api.put(`/api/admin/products/${productId}/update`, payload);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                navigate("/admin/products"); // Send them back to the inventory table
            }, 2000);
            
        } catch (err) {
            console.error("Error updating product:", err);
            setError(err.response?.data?.message || "Failed to update product. Please check your inputs.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all bg-white";
    const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2";

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#fdf0e6", borderTopColor: "#c8742a" }}></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
                        Update Product
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#9e8d7a" }}>Edit inventory details for Product #{productId}</p>
                </div>
                <button 
                    onClick={() => navigate("/admin/products")}
                    className="text-sm font-bold px-4 py-2 rounded-xl border hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "#e8ddd5", color: "#7a6a5a" }}
                >
                    Cancel
                </button>
            </motion.div>

            {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-bold">
                    Product updated successfully! Redirecting...
                </motion.div>
            )}

            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold">
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="bg-white p-8 rounded-2xl border" style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.03)" }}>
                    <h2 className="text-lg font-black text-gray-900 mb-6">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Image URL</label>
                            <input required type="text" name="imageUrl" value={productData.imageUrl} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Product Title</label>
                            <input required type="text" name="title" value={productData.title} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div>
                            <label className={labelClass}>Brand</label>
                            <input required type="text" name="brand" value={productData.brand} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div>
                            <label className={labelClass}>Color</label>
                            <input required type="text" name="color" value={productData.color} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Description</label>
                            <textarea required rows="4" name="description" value={productData.description} onChange={handleChange} className={`${inputClass} resize-none`} style={{ borderColor: "#e8ddd5" }} />
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="bg-white p-8 rounded-2xl border" style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.03)" }}>
                    <h2 className="text-lg font-black text-gray-900 mb-6">Pricing & Inventory</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className={labelClass}>Price (₹)</label>
                            <input required type="number" name="price" value={productData.price} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div>
                            <label className={labelClass}>Discounted (₹)</label>
                            <input required type="number" name="discountedPrice" value={productData.discountedPrice} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div>
                            <label className={labelClass}>Discount %</label>
                            <input required type="number" name="discountPercent" value={productData.discountPercent} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                        </div>
                        <div>
                            <label className={labelClass}>Total Stock</label>
                            <input required type="number" name="quantity" value={productData.quantity} onChange={handleChange} className={inputClass} style={{ borderColor: "#e8ddd5" }} />
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="bg-white p-8 rounded-2xl border flex flex-col h-full" style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.03)" }}>
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

                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="pt-4 pb-12">
                    <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl font-black text-white text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50" style={{ background: "#c8742a", boxShadow: "0 8px 24px rgba(200,116,42,0.25)" }}>
                        {submitting ? "Updating..." : "Save Changes"}
                    </button>
                </motion.div>
            </form>
        </div>
    );
}