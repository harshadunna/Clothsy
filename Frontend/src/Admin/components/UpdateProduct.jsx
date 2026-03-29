import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../config/api";

export default function UpdateProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [productData, setProductData] = useState({
    title: "", brand: "", color: "", description: "", price: "", discountedPrice: "",
    discountPercent: "", quantity: "", imageUrl: "",
    topLevelCategory: "", secondLevelCategory: "", thirdLevelCategory: "",
    sizes: [
      { name: "S", quantity: "" }, { name: "M", quantity: "" },
      { name: "L", quantity: "" }, { name: "XL", quantity: "" },
    ],
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/id/${productId}`);
        const mergedSizes = [
          { name: "S", quantity: data.sizes?.find(s => s.name === "S")?.quantity || "" },
          { name: "M", quantity: data.sizes?.find(s => s.name === "M")?.quantity || "" },
          { name: "L", quantity: data.sizes?.find(s => s.name === "L")?.quantity || "" },
          { name: "XL", quantity: data.sizes?.find(s => s.name === "XL")?.quantity || "" },
        ];
        
        setProductData({
          title: data.title || "", brand: data.brand || "", color: data.color || "",
          description: data.description || "", price: data.price || "",
          discountedPrice: data.discountedPrice || "", discountPercent: data.discountPercent || "",
          quantity: data.quantity || "", imageUrl: data.imageUrl || "", 
          topLevelCategory: data.category?.parentCategory?.parentCategory?.name || "", 
          secondLevelCategory: data.category?.parentCategory?.name || "", 
          thirdLevelCategory: data.category?.name || "",
          sizes: mergedSizes,
        });
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Failed to load product details. Manifest missing.");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSizeChange = (e, index) => {
    const { value } = e.target;
    const newSizes = [...productData.sizes];
    newSizes[index].quantity = value;
    setProductData((prevState) => ({ ...prevState, sizes: newSizes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const cleanSizes = productData.sizes
        .filter(size => size.quantity !== "")
        .map(size => ({ name: size.name, quantity: Number(size.quantity) }));

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
        navigate("/admin/products");
      }, 2000);
      
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.response?.data?.message || "Failed to update blueprint. Check requirements.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-transparent border-0 border-b border-[#D1C4BC] py-3 font-headline text-xl focus:ring-0 focus:border-[#C8742A] transition-colors px-0 placeholder:opacity-30 text-[#1A1109]";
  const labelClass = "block font-label font-bold text-[0.65rem] tracking-[0.2em] uppercase text-[#7F756E] mb-1";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFF8F5]">
        <div className="w-12 h-12 border-2 border-t-transparent border-[#1A1109] animate-spin rounded-none" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#1A1109] flex flex-col md:flex-row">
      
      {/* LEFT PANE: SPECIFICATIONS  */}
      <section className="w-full md:w-[400px] border-r border-[#D1C4BC] bg-[#F9F2EF] flex flex-col h-screen sticky top-0 overflow-y-auto shrink-0">
        <div className="p-10 border-b border-[#D1C4BC] bg-[#FFF8F5]">
          <h2 className="font-label font-bold text-[0.7rem] tracking-[0.15em] uppercase text-[#7F756E] mb-2">Atelier Components</h2>
          <p className="font-headline italic text-4xl">Blueprint Rev.</p>
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#C8742A] mt-2">Ref: #{productId}</p>
        </div>

        <div className="p-10 space-y-10">
          <div>
            <h3 className="font-label font-bold text-[0.7rem] tracking-[0.2em] uppercase text-[#1A1109] border-b border-[#1A1109] pb-2 mb-6">Classification</h3>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Top Level (Department)</label>
                <select required name="topLevelCategory" value={productData.topLevelCategory} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="" disabled>Select Department...</option>
                  <option value="collections">Womenswear (Collections)</option>
                  <option value="atelier">Menswear (Atelier)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Second Level (Structure)</label>
                <select required name="secondLevelCategory" value={productData.secondLevelCategory} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="" disabled>Select Structure...</option>
                  <option value="silhouettes">Silhouettes (Clothing)</option>
                  <option value="accents">Accents (Accessories)</option>
                  <option value="curations">Curations (Featured)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Third Level (Specific Identity)</label>
                <select required name="thirdLevelCategory" value={productData.thirdLevelCategory} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="" disabled>Select Exact Category...</option>
                  
                  <optgroup label="--- Womenswear Silhouettes ---">
                    <option value="outerwear">Architectural Outerwear</option>
                    <option value="silk-dresses">Heavy Silk Drapes</option>
                    <option value="trousers">Tailored Trousers</option>
                    <option value="knits">Essential Knits</option>
                    <option value="gowns">Evening Gowns</option>
                    <option value="cashmere">Cashmere Sweaters</option>
                    <option value="blouses">Sculpted Blouses</option>
                  </optgroup>

                  <optgroup label="--- Menswear Silhouettes ---">
                    <option value="overcoats">Wool Overcoats</option>
                    <option value="poplin-shirts">Crisp Poplin Shirts</option>
                    <option value="fine-knits">Fine Gauge Knits</option>
                    <option value="raw-denim">Raw Denim</option>
                    <option value="suits">Structural Suits</option>
                  </optgroup>

                  <optgroup label="--- Shared Accents ---">
                    <option value="bags">Structured Bags</option>
                    <option value="footwear">Monolith Footwear</option>
                    <option value="jewelry">Artisan Jewelry</option>
                    <option value="scarves">Silk Foulards</option>
                    <option value="eyewear">Oversized Eyewear</option>
                    <option value="watches">Chronograph Watches</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT PANE: DRAFTING AREA */}
      <section className="flex-1 p-12 md:p-20 overflow-y-auto">
        <div className="flex justify-end mb-8">
          <button onClick={() => navigate("/admin/products")} className="font-label text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#1A1109] hover:text-[#C8742A] border-b border-[#1A1109] pb-1 transition-colors">
            Discard Changes
          </button>
        </div>

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-6 bg-[#1A1109] text-[#FFF8F5] border-l-4 border-[#C8742A] font-label font-bold text-[0.7rem] tracking-widest uppercase">
            Manifest revision secured. Returning to ledger...
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-6 bg-[#FFDAD6] text-[#BA1A1A] border-l-4 border-[#BA1A1A] font-label font-bold text-[0.7rem] tracking-widest uppercase">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-16">
          {/* Identity */}
          <div>
            <label className="font-label font-bold text-[0.75rem] tracking-[0.2em] uppercase text-[#7F756E] block mb-4">Product Identity</label>
            <input required type="text" name="title" value={productData.title} onChange={handleChange} className="w-full border-0 border-b-2 border-[#1A1109] bg-transparent font-headline italic text-5xl md:text-6xl py-4 focus:ring-0 focus:border-[#C8742A] mb-8 text-[#1A1109]" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <label className={labelClass}>Asset URL</label>
                <input required type="text" name="imageUrl" value={productData.imageUrl} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Brand</label>
                <input required type="text" name="brand" value={productData.brand} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Color Palette</label>
                <input required type="text" name="color" value={productData.color} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-label font-bold text-[0.75rem] tracking-[0.2em] uppercase text-[#7F756E] block mb-4">Editorial Copy</label>
            <textarea required rows="4" name="description" value={productData.description} onChange={handleChange} className="w-full border-0 border-b border-[#D1C4BC] bg-transparent font-headline text-2xl leading-relaxed focus:ring-0 focus:border-[#C8742A] resize-none p-0 text-[#1A1109]" />
          </div>

          {/* Technical Values */}
          <div>
            <label className="font-label font-bold text-[0.75rem] tracking-[0.2em] uppercase text-[#7F756E] block mb-8 border-b border-[#D1C4BC] pb-2">Technical Values & Inventory</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <label className={labelClass}>Retail Value (₹)</label>
                <input required type="number" name="price" value={productData.price} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Archive Value (₹)</label>
                <input required type="number" name="discountedPrice" value={productData.discountedPrice} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Reduction %</label>
                <input required type="number" name="discountPercent" value={productData.discountPercent} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Total Units</label>
                <input required type="number" name="quantity" value={productData.quantity} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <label className={labelClass}>Proportional Inventory (Sizes)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-4">
              {productData.sizes.map((size, index) => (
                <div key={size.name} className="flex flex-col border-b border-[#D1C4BC] py-2">
                  <div className="flex justify-between items-end">
                    <span className="font-headline italic text-3xl text-[#1A1109]">{size.name}</span>
                    <input type="number" placeholder="QTY" value={size.quantity} onChange={(e) => handleSizeChange(e, index)} className="w-20 bg-transparent border-none font-label font-bold text-lg text-right p-0 focus:ring-0 text-[#1A1109]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12">
            <button type="submit" disabled={submitting} className="w-full py-6 bg-[#1A1109] text-[#FFF8F5] font-label text-[0.8rem] font-black tracking-[0.3em] uppercase hover:bg-[#C8742A] transition-colors disabled:opacity-50">
              {submitting ? "Applying Revisions..." : "Update Blueprint"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}