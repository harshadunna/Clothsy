import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/Product/ProductCard";
import api from "../../config/api"; 

const curationMeta = {
  "the-monolith-edit": {
    subtitle: "001 // ACHROMATIC",
    description: "A study in shadow and light. A strictly monochrome selection of architectural silhouettes designed for the minimalist inhabitant."
  },
  "monolith-edit": {
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
  },
  "core-foundations": {
    subtitle: "004 // FOUNDATIONAL",
    description: "The essential building blocks of the modern uniform. Crisp shirting, tailored trousers, and heavy knits designed for autonomous layering."
  },
  "nocturnal": {
    subtitle: "005 // AFTER-DARK",
    description: "Engineered specifically for a commanding, nocturnal presence. Sweeping silhouettes, light-absorbing fabrics, and structural accents."
  },
  "archive-sale": {
    subtitle: "006 // THE ARCHIVE",
    description: "A rare selection of past-season silhouettes and architectural hardware. Released from the vault for a limited time."
  }
};

const CurationPage = () => {
  const { editName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const safeEditName = editName || "editorial";
  const title = safeEditName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const meta = curationMeta[safeEditName] || { subtitle: "EDITORIAL", description: "A selective compilation of structural garments." };

  useEffect(() => {
    const fetchCuration = async () => {
      window.scrollTo(0, 0);
      setLoading(true);
      try {
        const { data } = await api.get(`/api/products/curations/${safeEditName}`);

        console.log("PRODUCTS COUNT:", data.length);
        console.log(
          "FIRST PRODUCT:",
          data[0]?.title,
          data[0]?.category?.parentCategory?.parentCategory?.name
        );

        setProducts(data);
      } catch (e) {
        console.error("Curation API Error:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCuration();
  }, [safeEditName]);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
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
          {products.map((item, index) => (
            <ProductCard key={item?.id || index} product={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CurationPage;