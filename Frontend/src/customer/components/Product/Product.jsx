import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { XMarkIcon, ChevronDownIcon, AdjustmentsHorizontalIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ProductCard from "./ProductCard";
import { filters, singleFilter, sortOptions } from "./FilterData";
import { findProducts } from "../../../Redux/Customers/Product/Action";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 },
  },
};

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
  const totalPages = customersProduct?.products?.totalPages || 1;
  const totalProducts = customersProduct?.products?.totalElements || 0;
  const products = customersProduct?.products?.content || [];

  useEffect(() => {
    const priceRange = searchParams.get("price");
    const [minPrice, maxPrice] = priceRange
      ? priceRange.split("-").map(Number)
      : [0, 10000];

    const reqData = {
      category: levelThree || "",
      colors: searchParams.get("color") || "",
      sizes: searchParams.get("size") || "",
      minPrice,
      maxPrice,
      minDiscount: searchParams.get("discount") || 0,
      stock: searchParams.get("stock") || "",
      sort: activeSort,
      pageNumber: pageNumber - 1,
      pageSize: 12,
    };
    dispatch(findProducts(reqData));
  }, [location.search, activeSort, levelThree]);

  const toggleFilter = (sectionId, value) => {
    let filterValues = searchParams.getAll(sectionId);
    if (filterValues.length > 0 && filterValues[0].split(",").includes(value)) {
      filterValues = filterValues[0].split(",").filter((item) => item !== value);
      if (filterValues.length === 0) {
        searchParams.delete(sectionId);
      } else {
        searchParams.set(sectionId, filterValues.join(","));
      }
    } else {
      filterValues = filterValues.length === 0
        ? [value]
        : [...filterValues[0].split(","), value];
      searchParams.set(sectionId, filterValues.join(","));
    }
    searchParams.set("page", "1");
    navigate({ search: `?${searchParams.toString()}` });
  };

  const handleRadioFilter = (e, sectionId) => {
    searchParams.set(sectionId, e.target.value);
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
    if (!sectionValues) return false;
    return sectionValues.split(",").includes(value);
  };

  const clearFilters = () => navigate({ search: "" });

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "sort" && key !== "page"
  );

  const FilterSidebar = () => (
    <div>
      {filters.map((section) => (
        <Disclosure key={section.id} as="div" className="border-b border-gray-200 py-4">
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full items-center justify-between py-1">
                <span className="text-sm font-semibold text-gray-800">{section.name}</span>
                {open
                  ? <MinusIcon className="h-4 w-4 text-gray-400" />
                  : <PlusIcon className="h-4 w-4 text-gray-400" />}
              </DisclosureButton>
              <DisclosurePanel className="pt-4 space-y-3">
                {section.options.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isChecked(section.id, option.value)}
                      onChange={() => toggleFilter(section.id, option.value)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}

      {singleFilter.map((section) => (
        <Disclosure key={section.id} as="div" className="border-b border-gray-200 py-4">
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full items-center justify-between py-1">
                <span className="text-sm font-semibold text-gray-800">{section.name}</span>
                {open
                  ? <MinusIcon className="h-4 w-4 text-gray-400" />
                  : <PlusIcon className="h-4 w-4 text-gray-400" />}
              </DisclosureButton>
              <DisclosurePanel className="pt-4 space-y-3">
                {section.options.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name={section.id}
                      value={option.value}
                      checked={searchParams.get(section.id) === option.value}
                      onChange={(e) => handleRadioFilter(e, section.id)}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="mt-6 w-full py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <FilterSidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {levelThree?.replace(/_/g, " ") || "Products"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">{totalProducts} products</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-indigo-300 transition shadow-sm"
              >
                {sortOptions.find((o) => o.query === activeSort)?.name || "Sort"}
                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${sortDropdownOpen ? "rotate-180" : ""}`} />
              </motion.button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.query}
                        onClick={() => { setActiveSort(option.query); setSortDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          activeSort === option.query
                            ? "bg-indigo-50 text-indigo-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-indigo-300 transition shadow-sm"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              Filters
            </motion.button>
          </div>
        </div>

        {/* Sidebar + Grid */}
        <div className="flex flex-row gap-8 items-start">

          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Filters</h2>
              </div>
              <FilterSidebar />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {customersProduct?.loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-gray-200 animate-pulse aspect-[3/4]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {products.map((item, index) => (
                  <motion.div key={item.id || index} variants={cardVariants} className="flex w-full h-full">
                    <ProductCard product={item} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber === 1}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  const isActive = page === pageNumber;
                  if (page === 1 || page === totalPages || Math.abs(page - pageNumber) <= 1) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-md"
                            : "border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (Math.abs(page - pageNumber) === 2) {
                    return <span key={page} className="text-gray-400 px-1">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber === totalPages}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}