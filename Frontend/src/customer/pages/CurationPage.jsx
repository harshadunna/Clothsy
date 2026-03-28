import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/Product/ProductCard";
import api from "../../config/api"; 

const curationMeta = {
  "the-monolith-edit": {
    subtitle: "001 // ACHROMATIC",
    description: "A study in shadow and light. A strictly monochrome selection of architectural silhouettes designed for the minimalist inhabitant."
  },
  "urban-brutalism": {
    subtitle: "002 // UTILITARIAN",
    description: "Raw textures and industrial earth tones. Engineered for the modern terrain using heavyweight materials and structural rigidity."
  },
  "heritage-tailoring": {
    subtitle: "003 // SARTORIAL",
    description: "The intersection of tradition and precision. Sharp geometry meets classic sartorial palettes for a refined, authoritative presence."
  }
};

const CurationPage = () => {
  const { editName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-format the URL slug into a clean Title string
  const title = editName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const meta = curationMeta[editName] || { subtitle: "EDITORIAL", description: "A selective compilation of structural garments." };

  useEffect(() => {
    const fetchCuration = async () => {
      window.scrollTo(0, 0);
      setLoading(true);
      try {
        const { data } = await api.get(`/api/products/curations/${editName}`);
        setProducts(data);
      } catch (e) {
        console.error("Curation Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCuration();
  }, [editName]);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <header className="mb-20 border-b border-[#1A1109]/10 pb-12">
        <span className="text-[10px] tracking-[0.4em] text-[#FEA052] font-semibold uppercase block mb-6">
          {meta.subtitle}
        </span>
        <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-[#1A1109] mb-8">
          {title}
        </h1>
        <p className="max-w-xl text-[#1A1109]/60 text-lg font-light leading-relaxed italic">
          "{meta.description}"
        </p>
      </header>

      {/* Dynamic Grid Rendering */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-[1px] bg-[#1A1109]/20 animate-pulse" />
          <p className="text-[10px] tracking-[0.3em] text-[#1A1109]/40 uppercase">Loading Edit</p>
        </div>
      ) : products.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-[10px] tracking-[0.3em] text-[#1A1109]/40 uppercase">Archive Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CurationPage;