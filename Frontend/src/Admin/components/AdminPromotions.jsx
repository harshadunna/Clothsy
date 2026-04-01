import React, { useState, useEffect } from "react";
import api from "../../config/api";

// The official Clothsy categories. Anything not on this list will be ignored.
const ALLOWED_CATEGORIES = [
  "women", "men", "clothing", "accessories", "featured",
  "silk-dresses", "evening-dresses", "blouses", "outerwear", "knits", 
  "womens-trousers", "jumpers", "bags", "footwear", "jewelry", 
  "scarves", "eyewear", "overcoats", "suits", "poplin-shirts", 
  "fine-knits", "raw-denim", "trousers", "belts", "boots", "watches"
];

// Helper function to beautifully format DB slugs (e.g., "women" -> "Women", "silk-dresses" -> "Silk Dresses")
const formatName = (name) => {
  if (!name) return "All";
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
    categoryId: "",
  });

  // Fetch active promotions and categories on load
  useEffect(() => {
    fetchPromotions();
    fetchCategories();
  }, []);

  const fetchPromotions = async () => {
    try {
      const { data } = await api.get("/api/admin/promotions/");
      setPromotions(data);
    } catch (error) {
      console.error("Failed to fetch promotions", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/api/admin/promotions/categories");
      
      // 1. Filter out old template junk (like kurtas) by checking our whitelist
      const cleanData = data.filter((cat) => 
        cat.name && ALLOWED_CATEGORIES.includes(cat.name.toLowerCase())
      );

      // 2. Sort categories so Level 1 (Men/Women) is at the top, then Level 2, etc.
      const sortedData = cleanData.sort((a, b) => a.level - b.level);
      setCategories(sortedData);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/api/admin/promotions/?categoryId=${formData.categoryId}`, {
        name: formData.name,
        discountPercent: parseInt(formData.discountPercent),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      setFormData({ name: "", discountPercent: "", startDate: "", endDate: "", categoryId: "" });
      fetchPromotions();
    } catch (error) {
      console.error("Failed to create promotion", error);
      alert("Failed to create promotion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/promotions/${id}`);
      fetchPromotions();
    } catch (error) {
      console.error("Failed to delete promotion", error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-widest uppercase text-[#1A1109] font-headline">
          Flash Sales
        </h1>
        <p className="text-xs font-bold text-[#C8742A] tracking-[0.2em] font-label mt-1 uppercase">
          Dynamic Pricing Engine
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* CREATE PROMOTION FORM */}
        <div className="xl:col-span-1 bg-white p-8 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold tracking-widest uppercase text-[#1A1109] mb-6 border-b border-gray-100 pb-4">
            Launch New Sale
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
                Sale Name
              </label>
              <input
                type="text" name="name" required value={formData.name} onChange={handleInputChange}
                className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm transition-colors"
                placeholder="e.g., Weekend Menswear Event"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
                Discount Percentage (%)
              </label>
              <input
                type="number" name="discountPercent" required min="1" max="99" value={formData.discountPercent} onChange={handleInputChange}
                className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm transition-colors"
                placeholder="e.g., 20"
              />
            </div>

            {/* NEAT CATEGORY DROPDOWN */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
                Target Category
              </label>
              <select
                name="categoryId" required value={formData.categoryId} onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2 bg-white text-sm focus:outline-none focus:border-[#C8742A] focus:ring-1 focus:ring-[#C8742A] transition-colors cursor-pointer"
              >
                <option value="" disabled>Select a Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {formatName(cat.name)}{" "}
                    {cat.level === 1 ? "— (Entire Gender)" : cat.level === 2 ? "— (Category Group)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-2 italic">
                Note: Selecting "Men" will discount all men's items. Selecting "Overcoats" will only discount overcoats.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
                Start Date & Time
              </label>
              <input
                type="datetime-local" name="startDate" required value={formData.startDate} onChange={handleInputChange}
                className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local" name="endDate" required value={formData.endDate} onChange={handleInputChange}
                className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm transition-colors"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#1A1109] text-[#FFF8F5] font-label text-[0.7rem] font-black uppercase tracking-[0.2em] py-4 hover:bg-[#C8742A] transition-colors mt-4 disabled:opacity-50"
            >
              {loading ? "Launching..." : "Launch Sale"}
            </button>
          </form>
        </div>

        {/* ACTIVE PROMOTIONS LIST */}
        <div className="xl:col-span-2 bg-white p-8 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold tracking-widest uppercase text-[#1A1109] mb-6 border-b border-gray-100 pb-4">
            Active & Upcoming Sales
          </h2>
          
          {promotions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-3 opacity-50">local_offer</span>
              <p className="italic text-sm">No promotions currently active.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Sale Name</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Discount</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Target Category</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Ends At</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50/50 border-b border-gray-100 transition-colors group">
                      <td className="p-4 font-semibold text-sm text-[#1A1109]">{promo.name}</td>
                      <td className="p-4">
                        <span className="bg-[#C8742A]/10 text-[#C8742A] px-2 py-1 rounded text-xs font-bold">
                          -{promo.discountPercent}%
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatName(promo.targetCategory?.name)}
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(promo.endDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="text-[#C0392B] border border-[#C0392B] hover:bg-[#C0392B] hover:text-white px-3 py-1 text-xs uppercase tracking-wider font-bold transition-colors opacity-0 group-hover:opacity-100"
                        >
                          End Early
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}