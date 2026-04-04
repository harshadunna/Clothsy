import React, { useState } from 'react';
import api from '../../../config/api';
// Import your local JSON file directly
import allProductsData from '../../../data/all.json'; 

export default function SizeRestorer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const log = (msg) => setLogs(prev => [...prev, msg]);

  const handleRestoreSizes = async () => {
    setLoading(true);
    setLogs([]);
    log("🚀 Starting Size Restoration Process...");

    try {
      // 1. Fetch all current products from the backend database
      log("Fetching current products from database...");
      // Assuming pageSize=1000 to get everything at once for the script
      const { data } = await api.get("/api/products?pageSize=1000"); 
      const dbProducts = Array.isArray(data) ? data : (data?.content || []);
      
      log(`Found ${dbProducts.length} products in the database.`);

      // 2. Build a lookup map from your local JSON file
      const jsonSizeMap = {};
      allProductsData.forEach(item => {
        if (item.title && item.sizes) {
          jsonSizeMap[item.title.toLowerCase().trim()] = item.sizes;
        }
      });

      // 3. Loop through DB products and update them if sizes are missing
      let updatedCount = 0;

      for (const product of dbProducts) {
        const isMissingSizes = !product.sizes || product.sizes.length === 0;
        
        if (isMissingSizes) {
          const searchTitle = product.title.toLowerCase().trim();
          const correctSizes = jsonSizeMap[searchTitle];

          if (correctSizes && correctSizes.length > 0) {
            log(`Fixing: ${product.title}...`);
            
            // Format sizes to match backend expectations
            const payload = {
              sizes: correctSizes.map(s => ({
                name: s.name,
                quantity: s.quantity
              }))
            };

            // Call the Admin Update API to save the sizes permanently
            await api.put(`/api/admin/products/${product.id}/update`, payload);
            updatedCount++;
          } else {
            log(`⚠️ Warning: No sizes found in JSON for "${product.title}"`);
          }
        }
      }

      log(`✅ Complete! Successfully restored sizes for ${updatedCount} products.`);
    } catch (error) {
      log(`❌ Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#FFF8F5] min-h-screen text-[#1A1109] font-body">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-headline italic mb-4">Database Size Restorer</h1>
        <p className="text-sm text-[#7F756E] mb-8">
          This utility reads `src/data/all.json` and pushes the missing size data to your MySQL database via the Admin API.
        </p>

        <button 
          onClick={handleRestoreSizes}
          disabled={loading}
          className="bg-[#1A1109] text-[#FFF8F5] px-8 py-4 font-label text-xs uppercase tracking-widest font-black disabled:opacity-50 mb-8"
        >
          {loading ? "Restoring Data..." : "Run Size Restoration"}
        </button>

        <div className="bg-[#E8E1DE] p-6 h-96 overflow-y-auto font-mono text-xs border border-[#D1C4BC]">
          {logs.length === 0 ? (
            <span className="text-[#7F756E]">Awaiting execution...</span>
          ) : (
            logs.map((l, i) => <div key={i} className="mb-2">{l}</div>)
          )}
        </div>
      </div>
    </div>
  );
}