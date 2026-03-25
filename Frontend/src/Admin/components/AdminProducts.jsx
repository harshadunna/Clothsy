import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import api from "../../config/api";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/products/all");
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/api/admin/products/${productId}/delete`);
      fetchProducts(); 
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-10 h-10 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: "#fdf0e6", borderTopColor: "#c8742a" }}></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
            Product Catalog
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9e8d7a" }}>Manage your store inventory, pricing, and stock.</p>
        </div>
        <button 
          onClick={() => navigate("/admin/product/create")}
          className="px-5 py-2.5 bg-[#c8742a] text-white text-sm font-bold rounded-xl hover:bg-[#b06522] transition-colors shadow-sm"
        >
          + Add New Product
        </button>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#e8ddd5" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b text-xs uppercase tracking-widest text-gray-500 font-bold" style={{ borderColor: "#e8ddd5" }}>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#f0e8e0" }}>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">No products found in inventory.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover object-top" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#c8742a" }}>{product.brand}</p>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.title}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {product.category?.name || "Uncategorized"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900">₹{product.discountedPrice}</span>
                        {product.discountPercent > 0 && (
                          <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${product.quantity > 10 ? 'bg-green-50 text-green-700 border-green-200' : product.quantity > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {product.quantity > 0 ? `${product.quantity} in stock` : "Out of Stock"}
                      </span>
                    </td>

                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/admin/product/update/${product.id}`)} 
                        className="p-2 text-gray-400 hover:text-[#c8742a] hover:bg-[#fdf0e6] rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}