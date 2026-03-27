import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../config/api";

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
    if (!window.confirm("CONFIRM DELETION: Are YOU sure you want to permanently erase this piece from the archive?")) return;

    try {
      await api.delete(`/api/admin/products/${productId}/delete`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFF8F5]">
        <div className="w-12 h-12 border-2 border-t-transparent border-[#1A1109] animate-spin rounded-none" />
      </div>
    );
  }

  return (
    <div className="p-12 max-w-[1440px] mx-auto min-h-screen bg-[#FFF8F5]">

      <div className="flex justify-between items-end mb-16 border-b border-[#D1C4BC] pb-8">
        <div>
          <h1 className="text-6xl font-headline italic text-[#1A1109] tracking-tight leading-none mb-4">
            Inventory Ledger
          </h1>
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#C8742A]">
            Current Archive Stock
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/product/create")}
          className="px-10 py-5 bg-[#1A1109] text-white font-label text-[0.75rem] font-bold uppercase tracking-[0.2em] hover:bg-[#C8742A] transition-colors rounded-none"
        >
          Draft New Piece
        </button>
      </div>

      <div className="bg-[#FFF8F5] border-t-2 border-[#1A1109]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D1C4BC] bg-[#F9F2EF]">
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">
                Identity / Silhouette
              </th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">
                Classification
              </th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">
                Value
              </th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">
                Status
              </th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center font-label text-[0.75rem] tracking-widest uppercase text-[#7F756E]">
                  No pieces recorded in ledger.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#D1C4BC] hover:bg-[#F9F2EF] transition-colors group"
                >

                  <td className="py-6 px-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-20 bg-[#F3ECEA] overflow-hidden border border-[#D1C4BC]">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover object-top grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                      </div>
                      <div>
                        <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#C8742A] mb-1">
                          {product.brand}
                        </p>
                        <p className="font-headline text-xl text-[#1A1109] line-clamp-1">
                          {product.title}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-6 px-6 font-label text-[0.7rem] font-bold uppercase tracking-widest text-[#1A1109]">
                    {product.category?.name || "Uncategorized"}
                  </td>

                  <td className="py-6 px-6">
                    <div className="flex flex-col">
                      <span className="font-headline text-xl font-bold text-[#1A1109]">
                        ₹{product.discountedPrice}
                      </span>
                      {product.discountPercent > 0 && (
                        <span className="font-label text-[0.65rem] font-bold tracking-widest text-[#7F756E] line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-6 px-6">
                    <span
                      className={`inline-block whitespace-nowrap px-3 py-1 font-label text-[0.6rem] font-black uppercase tracking-widest border ${
                        product.quantity > 0
                          ? "text-[#1A1109] border-[#1A1109]"
                          : "text-[#BA1A1A] border-[#BA1A1A] bg-[#FFDAD6]/30"
                      }`}
                    >
                      {product.quantity > 0
                        ? `${product.quantity} IN STOCK`
                        : "OUT OF STOCK"}
                    </span>
                  </td>

                  <td className="py-6 px-6 text-right space-x-6">
                    <button
                      onClick={() => navigate(`/admin/product/update/${product.id}`)}
                      className="font-label text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#1A1109] hover:text-[#C8742A] border-b border-transparent hover:border-[#C8742A] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="font-label text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#BA1A1A] hover:opacity-60 transition-opacity"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}