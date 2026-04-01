import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createProduct } from "../../Redux/Customers/Product/Action";

export default function CreateProduct() {
  const dispatch = useDispatch();

  const [productData, setProductData] = useState({
    imageFile: null, 
    imagePreview: null,
    brand: "",
    title: "",
    color: "",
    discountedPrice: "",
    price: "",
    discountPersent: "",
    size: [
      { name: "S", quantity: 0 },
      { name: "M", quantity: 0 },
      { name: "L", quantity: 0 },
    ],
    quantity: "",
    topLavelCategory: "",
    secondLavelCategory: "",
    thirdLavelCategory: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSizeChange = (e, index) => {
    let { name, value } = e.target;
    name === "size_quantity" ? (name = "quantity") : (name = e.target.name);
    const sizes = [...productData.size];
    sizes[index][name] = value;
    setProductData((prevState) => ({
      ...prevState,
      size: sizes,
    }));
  };

  // Handle physical file selection and create a temporary URL for preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData((prevState) => ({
        ...prevState,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Create a Multipart FormData object
    const formData = new FormData();

    // 2. Append the physical image file if it exists
    if (productData.imageFile) {
      formData.append("image", productData.imageFile);
    }

    // 3. Clean up the JSON payload (remove file data from it)
    const reqData = { ...productData };
    delete reqData.imageFile;
    delete reqData.imagePreview;

    // 4. Append the JSON payload as a Blob
    formData.append("req", new Blob([JSON.stringify(reqData)], { type: "application/json" }));

    // Dispatch the action with FormData!
    dispatch(createProduct(formData));

    // Reset Form
    setProductData({
      imageFile: null,
      imagePreview: null,
      brand: "",
      title: "",
      color: "",
      discountedPrice: "",
      price: "",
      discountPersent: "",
      size: [
        { name: "S", quantity: 0 },
        { name: "M", quantity: 0 },
        { name: "L", quantity: 0 },
      ],
      quantity: "",
      topLavelCategory: "",
      secondLavelCategory: "",
      thirdLavelCategory: "",
      description: "",
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-widest uppercase text-[#1A1109] font-headline">
          Add New Product
        </h1>
        <p className="text-xs font-bold text-[#C8742A] tracking-[0.2em] font-label mt-1 uppercase">
          Inventory Management
        </p>
      </div>

      <div className="bg-white p-8 border border-gray-200 shadow-sm max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* IMAGE UPLOAD SECTION */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3">
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-3">
                Product Image (Cloudinary)
              </label>
              <div className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group overflow-hidden">
                {productData.imagePreview ? (
                  <img src={productData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-[#C8742A] transition-colors mb-3">cloud_upload</span>
                    <p className="mb-2 text-xs text-gray-500 font-bold uppercase tracking-widest"><span className="text-[#C8742A]">Click to upload</span> or drag</p>
                    <p className="text-[10px] text-gray-400">PNG, JPG or WebP (Max 5MB)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleImageChange} 
                />
              </div>
            </div>

            <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Brand</label>
                <input type="text" name="brand" value={productData.brand} onChange={handleChange} className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm" placeholder="e.g., CLOTHSY" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Title</label>
                <input type="text" name="title" value={productData.title} onChange={handleChange} className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm" placeholder="e.g., Structured Wool Overcoat" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Color</label>
                <input type="text" name="color" value={productData.color} onChange={handleChange} className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm" placeholder="e.g., Onyx Black" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Total Quantity</label>
                <input type="number" name="quantity" value={productData.quantity} onChange={handleChange} className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm" placeholder="e.g., 50" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Price (₹)</label>
              <input type="number" name="price" value={productData.price} onChange={handleChange} className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm" placeholder="e.g., 10000" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Discounted Price (₹)</label>
              <input type="number" name="discountedPrice" value={productData.discountedPrice} onChange={handleChange} className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm" placeholder="e.g., 8000" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Discount Percent (%)</label>
              <input type="number" name="discountPersent" value={productData.discountPersent} onChange={handleChange} className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm" placeholder="e.g., 20" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Top Level Category</label>
              <select name="topLavelCategory" value={productData.topLavelCategory} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 bg-white text-sm focus:outline-none focus:border-[#C8742A]">
                <option value="">Select Gender</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Second Level</label>
              <select name="secondLavelCategory" value={productData.secondLavelCategory} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 bg-white text-sm focus:outline-none focus:border-[#C8742A]">
                <option value="">Select Group</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Third Level</label>
              <input type="text" name="thirdLavelCategory" value={productData.thirdLavelCategory} onChange={handleChange} className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm" placeholder="e.g., overcoats, silk-dresses" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-4">Size Distribution</label>
            <div className="flex gap-6">
              {productData.size.map((size, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <span className="font-label text-sm font-black border border-gray-300 w-10 h-10 flex items-center justify-center text-gray-600">{size.name}</span>
                  <input type="number" name="size_quantity" placeholder="Qty" onChange={(e) => handleSizeChange(e, index)} className="w-16 border border-gray-300 rounded p-1 text-xs text-center" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Product Description & Fit</label>
            <textarea name="description" value={productData.description} onChange={handleChange} rows="4" className="w-full border border-gray-300 rounded p-3 bg-transparent focus:outline-none focus:border-[#C8742A] text-sm" placeholder="Describe the architectural silhouette, materials, and fit..." />
          </div>

          <button type="submit" className="w-full bg-[#1A1109] text-[#FFF8F5] font-label text-[0.8rem] font-black uppercase tracking-[0.2em] py-5 hover:bg-[#C8742A] transition-colors mt-8">
            Add Product to Inventory
          </button>
        </form>
      </div>
    </div>
  );
}