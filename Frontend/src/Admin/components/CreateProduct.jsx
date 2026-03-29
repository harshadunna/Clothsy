import { useState } from "react";
import { motion } from "framer-motion";
import api from "../../config/api";

export default function CreateProduct() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Array to hold multiple image URLs
  const [images, setImages] = useState([""]); 

  const [productData, setProductData] = useState({
    title: "",
    brand: "",
    color: "",
    description: "",
    materials: "", 
    fit: "",       
    price: "",
    discountedPrice: "",
    discountPercent: "",
    quantity: "",
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
    setProductData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSizeChange = (e, index) => {
    const { value } = e.target;
    const newSizes = [...productData.sizes];
    newSizes[index].quantity = value;
    setProductData((prevState) => ({ ...prevState, sizes: newSizes }));
  };

  // MULTIPLE IMAGES LOGIC
  const handleImageChange = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => {
    setImages([...images, ""]);
  };

  const removeImageField = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages.length > 0 ? newImages : [""]); // Keep at least one field
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const cleanSizes = productData.sizes
        .filter(size => size.quantity !== "")
        .map(size => ({ name: size.name, quantity: Number(size.quantity) }));

      // Clean up empty image strings
      const validImages = images.filter(img => img.trim() !== "");

      const payload = {
        ...productData,
        price: Number(productData.price),
        discountedPrice: Number(productData.discountedPrice),
        discountPercent: Number(productData.discountPercent),
        quantity: Number(productData.quantity),
        sizes: cleanSizes,
        // Backend compatibility: send first image as imageUrl, and full array as images
        imageUrl: validImages[0] || "",
        images: validImages 
      };

      console.log("Drafting Payload:", payload);

      await api.post("/api/admin/products", payload);
      setSuccess(true);

      // Reset
      setProductData({
        title: "", brand: "", color: "", description: "", materials: "", fit: "",
        price: "", discountedPrice: "", discountPercent: "", quantity: "",
        topLevelCategory: "", secondLevelCategory: "", thirdLevelCategory: "",
        sizes: [
          { name: "S", quantity: "" }, { name: "M", quantity: "" },
          { name: "L", quantity: "" }, { name: "XL", quantity: "" }
        ],
      });
      setImages([""]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to compile blueprint. Check requirements.");
    } finally {
      setLoading(false);
    }
  };

  // Minimalist Editorial Inputs
  const inputClass = "w-full bg-transparent border-0 border-b border-[#D1C4BC] py-3 font-headline text-xl focus:ring-0 focus:border-[#C8742A] transition-colors px-0 placeholder:opacity-30 text-[#1A1109]";
  const labelClass = "block font-label font-bold text-[0.65rem] tracking-[0.2em] uppercase text-[#7F756E] mb-1";

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#1A1109] flex flex-col md:flex-row">
      
      {/* LEFT PANE: SPECIFICATIONS */}
      <section className="w-full md:w-[400px] border-r border-[#D1C4BC] bg-[#F9F2EF] flex flex-col h-screen sticky top-0 overflow-y-auto shrink-0 custom-scrollbar">
        <div className="p-10 border-b border-[#D1C4BC] bg-[#FFF8F5]">
          <h2 className="font-label font-bold text-[0.7rem] tracking-[0.15em] uppercase text-[#7F756E] mb-2">Atelier Components</h2>
          <p className="font-headline italic text-4xl">Blueprint Draft</p>
        </div>

        <div className="p-10 space-y-10">
          {/* Visual Assets (Multiple Images) */}
          <div>
            <h3 className="font-label font-bold text-[0.7rem] tracking-[0.2em] uppercase text-[#1A1109] border-b border-[#1A1109] pb-2 mb-6">Visual Assets</h3>
            <div className="space-y-6">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <label className={labelClass}>Asset URL {index + 1}</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={img} 
                      onChange={(e) => handleImageChange(index, e.target.value)} 
                      className={inputClass} 
                      placeholder="https://..." 
                      required={index === 0} // Only first is strictly required
                    />
                    {images.length > 1 && (
                      <button type="button" onClick={() => removeImageField(index)} className="material-symbols-outlined text-[#BA1A1A] opacity-50 hover:opacity-100 pb-2">
                        close
                      </button>
                    )}
                  </div>
                  {/* Miniature Preview if URL exists */}
                  {img && (
                     <div className="mt-4 w-16 h-20 bg-[#E8E1DE] border border-[#D1C4BC]">
                       <img src={img} alt="Preview" className="w-full h-full object-cover grayscale" onError={(e) => e.target.style.display='none'}/>
                     </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={addImageField} className="flex items-center gap-2 font-label font-bold text-[0.65rem] tracking-[0.15em] uppercase text-[#C8742A] hover:text-[#924C00] transition-colors mt-2">
                <span className="material-symbols-outlined text-sm">add</span> Add Another Asset
              </button>
            </div>
          </div>

          {/* Categories (Strict Dropdowns) */}
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
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-6 bg-[#1A1109] text-[#FFF8F5] border-l-4 border-[#C8742A] font-label font-bold text-[0.7rem] tracking-widest uppercase">
            Manifest securely logged to archive.
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
            <input required type="text" name="title" value={productData.title} onChange={handleChange} className="w-full border-0 border-b-2 border-[#1A1109] bg-transparent font-headline italic text-5xl md:text-6xl py-4 focus:ring-0 focus:border-[#C8742A] mb-8 placeholder:opacity-20 text-[#1A1109]" placeholder="E.g. Structural Column Coat" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <label className={labelClass}>Brand / Atelier</label>
                <input required type="text" name="brand" value={productData.brand} onChange={handleChange} className={inputClass} placeholder="CLOTHSY" />
              </div>
              <div>
                <label className={labelClass}>Dominant Color</label>
                <input required type="text" name="color" value={productData.color} onChange={handleChange} className={inputClass} placeholder="Obsidian" />
              </div>
            </div>
          </div>

          {/* Description & Materials */}
          <div>
            <label className="font-label font-bold text-[0.75rem] tracking-[0.2em] uppercase text-[#7F756E] block mb-4 border-b border-[#D1C4BC] pb-2">Editorial Copy & Specifications</label>
            <div className="space-y-8 mt-6">
              
              <div>
                <label className={labelClass}>Narrative Description</label>
                <textarea required rows="3" name="description" value={productData.description} onChange={handleChange} className="w-full border-0 border-b border-[#D1C4BC] bg-transparent font-headline text-2xl leading-relaxed focus:ring-0 focus:border-[#C8742A] resize-none p-0 placeholder:opacity-20 text-[#1A1109]" placeholder="Begin narrative composition..." />
              </div>
              
              <div>
                <label className={labelClass}>Materials & Construction</label>
                <textarea rows="2" name="materials" value={productData.materials} onChange={handleChange} className="w-full border-0 border-b border-[#D1C4BC] bg-transparent font-body text-lg leading-relaxed focus:ring-0 focus:border-[#C8742A] resize-none p-0 placeholder:opacity-20 text-[#1A1109]" placeholder="E.g. 100% Virgin Wool. Matte horn buttons." />
              </div>
              
              <div>
                <label className={labelClass}>Fit & Silhouette</label>
                <textarea rows="2" name="fit" value={productData.fit} onChange={handleChange} className="w-full border-0 border-b border-[#D1C4BC] bg-transparent font-body text-lg leading-relaxed focus:ring-0 focus:border-[#C8742A] resize-none p-0 placeholder:opacity-20 text-[#1A1109]" placeholder="E.g. Oversized drop-shoulder profile." />
              </div>

            </div>
          </div>

          {/* Measurements & Value */}
          <div>
            <label className="font-label font-bold text-[0.75rem] tracking-[0.2em] uppercase text-[#7F756E] block mb-8 border-b border-[#D1C4BC] pb-2">Technical Values & Inventory</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <label className={labelClass}>Retail Value (₹)</label>
                <input required type="number" name="price" value={productData.price} onChange={handleChange} className={inputClass} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>Archive Value (₹)</label>
                <input required type="number" name="discountedPrice" value={productData.discountedPrice} onChange={handleChange} className={inputClass} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>Reduction %</label>
                <input required type="number" name="discountPercent" value={productData.discountPercent} onChange={handleChange} className={inputClass} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>Total Units</label>
                <input required type="number" name="quantity" value={productData.quantity} onChange={handleChange} className={inputClass} placeholder="0" />
              </div>
            </div>

            {/* Size Proportions */}
            <div>
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
          </div>

          {/* Action */}
          <div className="pt-12">
            <button type="submit" disabled={loading} className="w-full py-6 bg-[#1A1109] text-[#FFF8F5] font-label text-[0.8rem] font-black tracking-[0.3em] uppercase hover:bg-[#C8742A] transition-colors disabled:opacity-50">
              {loading ? "Compiling Blueprint..." : "Publish to Ledger"}
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}