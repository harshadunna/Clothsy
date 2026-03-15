import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";

import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid";

// MUI Components
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FilterListIcon from '@mui/icons-material/FilterList';

import ProductCard from "./ProductCard";
import { mens_kurta } from "../../../Data/Men/men_kurta";

import { filters, singleFilter, sortOptions } from "./FilterData";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 120, damping: 15 },
    },
};

export default function Product() {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [activeSort, setActiveSort] = useState("popular");

    // State for Multi-select (Checkboxes)
    const [checkedFilters, setCheckedFilters] = useState({});

    // State for Single-select (Radio Buttons)
    const [radioFilters, setRadioFilters] = useState({});

    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

    // Handler for Checkboxes (Multi-select)
    const toggleFilter = (sectionId, value) => {
        setCheckedFilters((prev) => {
            const current = prev[sectionId] || [];
            return {
                ...prev,
                [sectionId]: current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value],
            };
        });
    };

    // Handler for Radio Buttons (Single-select)
    const handleRadioFilter = (e, sectionId) => {
        setRadioFilters((prev) => ({
            ...prev,
            [sectionId]: e.target.value,
        }));
    };

    const isChecked = (sectionId, value) =>
        (checkedFilters[sectionId] || []).includes(value);

    const clearFilters = () => {
        setCheckedFilters({});
        setRadioFilters({});
    };

    const hasActiveFilters = Object.keys(checkedFilters).some(k => checkedFilters[k].length > 0) || Object.keys(radioFilters).length > 0;

    const FilterSidebar = () => (
        <div>
            {/* 1. Multi-Select Filters (Checkboxes) */}
            {filters.map((section) => (
                <Disclosure key={section.id} as="div" className="border-b border-gray-200 py-4">
                    {({ open }) => (
                        <>
                            <DisclosureButton className="flex w-full items-center justify-between py-1">
                                <span className="text-sm font-semibold text-gray-800">
                                    {section.name}
                                </span>
                                {open ? (
                                    <MinusIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <PlusIcon className="h-4 w-4 text-gray-400" />
                                )}
                            </DisclosureButton>
                            <DisclosurePanel className="pt-4 space-y-3">
                                {section.options.map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
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

            {/* 2. Single-Select Filters (MUI Radio Buttons) */}
            {singleFilter.map((section) => (
                <Disclosure key={section.id} as="div" className="border-b border-gray-200 py-4">
                    {({ open }) => (
                        <>
                            <DisclosureButton className="flex w-full items-center justify-between py-1">
                                <span className="text-sm font-semibold text-gray-800">
                                    {section.name}
                                </span>
                                {open ? (
                                    <MinusIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <PlusIcon className="h-4 w-4 text-gray-400" />
                                )}
                            </DisclosureButton>
                            <DisclosurePanel className="pt-4">
                                <FormControl>
                                    <RadioGroup
                                        aria-labelledby={`radio-group-${section.id}`}
                                        name={section.id}
                                        value={radioFilters[section.id] || ""}
                                        onChange={(e) => handleRadioFilter(e, section.id)}
                                    >
                                        {section.options.map((option) => (
                                            <FormControlLabel
                                                key={option.value}
                                                value={option.value}
                                                control={
                                                    <Radio
                                                        size="small"
                                                        sx={{
                                                            color: '#d1d5db',
                                                            '&.Mui-checked': {
                                                                color: '#4f46e5',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                        {option.label}
                                                    </span>
                                                }
                                            />
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>
            ))}

            {/* Clear Filters Button */}
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
                                {/* Used MUI FilterListIcon here */}
                                <div className="flex items-center gap-2">
                                    <FilterListIcon className="text-gray-500" fontSize="small" />
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
                        <h1 className="text-2xl font-bold text-gray-900">Men's Kurta</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {mens_kurta.length} products
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sort Dropdown */}
                        <div className="relative">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-indigo-300 transition shadow-sm"
                            >
                                Sort
                                <ChevronDownIcon
                                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${sortDropdownOpen ? "rotate-180" : ""
                                        }`}
                                />
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
                                                onClick={() => {
                                                    setActiveSort(option.query);
                                                    setSortDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${activeSort === option.query
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

                        {/* Mobile Filter Button */}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setMobileFiltersOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-indigo-300 transition shadow-sm"
                        >
                            {/* Used MUI FilterListIcon here */}
                            <FilterListIcon fontSize="small" />
                            Filters
                        </motion.button>
                    </div>
                </div>

                {/* Sidebar + Grid */}
                <div className="flex flex-row gap-8 items-start">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            {/*  Used MUI FilterListIcon here */}
                            <div className="flex items-center gap-2 mb-4">
                                <FilterListIcon className="text-gray-500" fontSize="small" />
                                <h2 className="font-semibold text-gray-900">Filters</h2>
                            </div>
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1 min-w-0">
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {mens_kurta.map((item, index) => (
                                <motion.div
                                    key={item.id || index}
                                    variants={cardVariants}
                                    className="flex w-full h-full"
                                >
                                    <ProductCard product={item} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}