import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ProductCard from "./ProductCard";
import { filters, singleFilter, sortOptions } from "./FilterData";
import { findProducts } from "../../../Redux/Customers/Product/Action";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

export default function Product() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("price_low");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { levelThree } = useParams();
  const customersProduct = useSelector((store) => store.customersProduct);

  const searchParams = new URLSearchParams(location.search);
  const pageNumber = parseInt(searchParams.get("page") || "1");
  
  // FIX: Safely read the new Spring Boot 3.3 VIA_DTO pagination structure
  const totalPages = customersProduct?.products?.page?.totalPages || customersProduct?.products?.totalPages || 1;
  const totalProducts = customersProduct?.products?.page?.totalElements || customersProduct?.products?.totalElements || 0;
  const products = customersProduct?.products?.content || [];

  useEffect(() => {
    const priceRange = searchParams.get("price");
    const [minPrice, maxPrice] = priceRange ? priceRange.split("-").map(Number) : [0, 100000];

    const reqData = {
      category: levelThree || "",
      colors: searchParams.get("color") || "",
      sizes: searchParams.get("size") || "",
      minPrice, maxPrice,
      minDiscount: searchParams.get("discount") || 0,
      stock: searchParams.get("stock") || "",
      sort: activeSort,
      pageNumber: pageNumber - 1,
      pageSize: 12,
      search: searchParams.get("search") || "",
    };
    dispatch(findProducts(reqData));
  }, [location.search, activeSort, levelThree, dispatch]);

  const toggleFilter = (sectionId, value) => {
    let filterValues = searchParams.getAll(sectionId);
    if (filterValues.length > 0 && filterValues[0].split(",").includes(value)) {
      filterValues = filterValues[0].split(",").filter((item) => item !== value);
      if (filterValues.length === 0) searchParams.delete(sectionId);
      else searchParams.set(sectionId, filterValues.join(","));
    } else {
      filterValues = filterValues.length === 0 ? [value] : [...filterValues[0].split(","), value];
      searchParams.set(sectionId, filterValues.join(","));
    }
    searchParams.set("page", "1");
    navigate({ search: `?${searchParams.toString()}` });
  };

  const handleRadioFilter = (value, sectionId) => {
    searchParams.set(sectionId, value);
    searchParams.set("page", "1");
    navigate({ search: `?${searchParams.toString()}` });
  };

  const handlePageChange = (newPage) => {
    searchParams.set("page", newPage);
    navigate({ search: `?${searchParams.toString()}` });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isChecked = (sectionId, value) => {
    const sectionValues = searchParams.get(sectionId);
    return sectionValues ? sectionValues.split(",").includes(value) : false;
  };

  const clearFilters = () => navigate({ search: "" });
  const hasActiveFilters = Array.from(searchParams.keys()).some((key) => key !== "sort" && key !== "page" && key !== "search");

  // Keep the title clean without hyphens for the UI
  const pageTitle = searchParams.get("search")
    ? `Results for "${searchParams.get("search")}"`
    : (levelThree ? levelThree.replace(/-/g, " ") : "The Archive");

  // Brutalist Architectural Filters
  const FilterSidebar = () => (
    <div className="space-y-12 pr-8">
      {filters.map((section) => (
        <section key={section.id} className="border-b border-[#D1C4BC] pb-8">
          <h3 className="font-label uppercase tracking-[0.2em] text-[0.65rem] font-black mb-6 text-[#1A1109]">
            {section.name}
          </h3>
          <ul className="space-y-3 font-label text-xs uppercase tracking-widest text-[#7F756E]">
            {section.options.map((option) => (
              <li key={option.value} className="flex items-center group cursor-pointer" onClick={() => toggleFilter(section.id, option.value)}>
                <span className={`w-full transition-colors ${isChecked(section.id, option.value) ? "text-[#1A1109] font-black" : "hover:text-[#1A1109]"}`}>
                  {isChecked(section.id, option.value) ? "[ x ] " : "[   ] "} {option.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {singleFilter.map((section) => (
        <section key={section.id} className="border-b border-[#D1C4BC] pb-8">
          <h3 className="font-label uppercase tracking-[0.2em] text-[0.65rem] font-black mb-6 text-[#1A1109]">
            {section.name}
          </h3>
          <ul className="space-y-3 font-label text-xs uppercase tracking-widest text-[#7F756E]">
            {section.options.map((option) => {
              const active = searchParams.get(section.id) === option.value;
              return (
                <li key={option.value} className="flex items-center group cursor-pointer" onClick={() => handleRadioFilter(option.value, section.id)}>
                  <span className={`w-full transition-colors ${active ? "text-[#1A1109] font-black" : "hover:text-[#1A1109]"}`}>
                    {active ? "[ x ] " : "[   ] "} {option.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {hasActiveFilters && (
        <button onClick={clearFilters} className="w-full py-4 border border-[#1A1109] text-[0.65rem] uppercase tracking-[0.2em] font-black hover:bg-[#1A1109] hover:text-[#FFF8F5] transition-colors text-[#1A1109]">
          Clear Architecture
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] min-h-screen pt-32 px-8 md:px-12 pb-24 font-body selection:bg-[#C8742A] selection:text-[#FFF8F5]">

      {/* Header Area */}
      <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-[#D1C4BC] pb-12">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-headline italic text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-none capitalize"
          >
            {pageTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-8 font-label text-xs uppercase tracking-widest text-[#7F756E] max-w-md"
          >
            Architectural silhouettes and artisanal craftsmanship. A curated selection of modern essentials.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto"
        >
          <span className="font-label uppercase tracking-[0.2em] text-[0.65rem] font-black text-[#C8742A]">
            Catalog: {totalProducts} Pieces
          </span>

          <div className="flex gap-4 w-full md:w-auto">
            {/* Sort Dropdown */}
            <div className="relative w-1/2 md:w-auto">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="w-full px-8 py-4 border border-[#1A1109] bg-transparent text-[0.65rem] uppercase tracking-[0.2em] font-black hover:bg-[#F9F2EF] transition-colors flex justify-between items-center gap-4"
              >
                Sort: {sortOptions.find((o) => o.query === activeSort)?.name.split(':')[0] || "Newest"}
                <span className="material-symbols-outlined text-[14px]">{sortDropdownOpen ? 'expand_less' : 'expand_more'}</span>
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-0 bg-[#FFF8F5] border border-[#1A1109] border-t-0 z-20 shadow-2xl"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.query}
                        onClick={() => { setActiveSort(option.query); setSortDropdownOpen(false); }}
                        className={`w-full text-left px-6 py-4 text-[0.65rem] font-label font-black uppercase tracking-[0.2em] transition-colors ${activeSort === option.query ? "bg-[#1A1109] text-[#FFF8F5]" : "text-[#1A1109] hover:bg-[#F9F2EF]"
                          }`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden w-1/2 px-6 py-4 bg-[#1A1109] text-[#FFF8F5] text-[0.65rem] uppercase tracking-[0.2em] font-black flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[14px]">filter_list</span> Filters
            </button>
          </div>
        </motion.div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-[#D1C4BC]">
          <div className="sticky top-32">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFiltersOpen(false)} className="fixed inset-0 bg-[#1A1109]/40 z-[100] lg:hidden backdrop-blur-sm" />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 z-[110] w-[85vw] max-w-sm bg-[#FFF8F5] flex flex-col lg:hidden border-l border-[#1A1109]">
                <div className="flex items-center justify-between px-8 py-6 border-b border-[#D1C4BC]">
                  <h2 className="font-headline text-3xl text-[#1A1109] italic">Architecture</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="text-[#1A1109]">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-8 py-8">
                  <FilterSidebar />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <section className="flex-grow min-w-0">
          {customersProduct?.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#E8E1DE] animate-pulse aspect-[3/4] w-full border border-[#D1C4BC]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-[#7F756E]">
              <span className="material-symbols-outlined text-4xl mb-4 opacity-50">inventory_2</span>
              <p className="font-headline text-4xl italic text-[#1A1109]">Archive Depleted.</p>
              <p className="font-label text-xs mt-4 uppercase tracking-[0.2em]">Adjust architectural parameters.</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
              {products.map((item) => (
                <motion.div key={item.id} variants={cardVariants}>
                  <ProductCard product={item} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Brutalist Pagination */}
          {totalPages > 1 && (
            <div className="mt-32 flex justify-between items-center border-t border-[#D1C4BC] pt-12">
              <button
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber === 1}
                className="font-label uppercase tracking-[0.2em] text-[0.65rem] font-black text-[#1A1109] hover:text-[#C8742A] transition-colors disabled:opacity-20 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Prev
              </button>

              <div className="flex gap-6 items-end">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  const isActive = page === pageNumber;
                  if (page === 1 || page === totalPages || Math.abs(page - pageNumber) <= 1) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`font-label text-sm transition-colors ${isActive
                            ? "font-black border-b-2 border-[#1A1109] pb-1 text-[#1A1109]"
                            : "text-[#7F756E] hover:text-[#1A1109]"
                          }`}
                      >
                        {page.toString().padStart(2, '0')}
                      </button>
                    );
                  }
                  if (Math.abs(page - pageNumber) === 2) {
                    return <span key={page} className="font-headline text-lg text-[#7F756E] italic">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={pageNumber === totalPages}
                className="font-label uppercase tracking-[0.2em] text-[0.65rem] font-black text-[#1A1109] hover:text-[#C8742A] transition-colors disabled:opacity-20 flex items-center gap-2"
              >
                Next <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}