import { useEffect, useState } from "react";
import api from "../../config/api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [isExporting, setIsExporting] = useState(false); 

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/api/admin/users"); 
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError(error.response?.data?.message || "Failed to load the Client Archive.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" || currentRole === "ROLE_ADMIN" ? "CUSTOMER" : "ADMIN";
    const actionText = newRole === "ADMIN" ? "promote this user to ADMIN" : "revoke ADMIN privileges for this user";
    
    if (!window.confirm(`Are you sure you want to ${actionText}?`)) return;

    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchCustomers(); 
    } catch (error) {
      console.error("Error updating role:", error);
      setError(error.response?.data?.message || "Failed to update user role. Check backend configuration.");
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setError(null);
      
      const response = await api.get("/api/admin/users/export", {
        responseType: "blob" 
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "clothsy_client_archive.csv"); 
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      setError("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "Unknown (Old Account)"; 
    
    try {
      let date;
      
      if (Array.isArray(dateInput)) {
        date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
      } else {
        date = new Date(dateInput);
      }

      // Check if it resulted in a valid date
      if (isNaN(date.getTime())) return "Unknown";
      
      return date.toLocaleDateString("en-GB", {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-[#FFF8F5]">
        <div className="w-12 h-12 border-4 border-t-transparent border-[#1A1109] animate-spin rounded-none" />
      </div>
    );
  }

  return (
    <div className="p-12 max-w-[1440px] mx-auto min-h-screen bg-[#FFF8F5]">
      
      {/* HEADER */}
      <section className="flex justify-between items-end mb-12 border-b border-[#D1C4BC] pb-8">
        <div className="max-w-2xl">
          <h2 className="font-headline text-6xl italic text-[#1A1109] mb-4 leading-none">The Directory</h2>
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#C8742A]">
            Client Archive & Patron Ledger
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExportData}
            disabled={isExporting || customers.length === 0}
            className="border border-[#1A1109] text-[#1A1109] px-8 py-4 font-label text-[0.7rem] font-black tracking-[0.1em] hover:bg-[#1A1109] hover:text-[#FFF8F5] transition-colors disabled:opacity-50"
          >
            {isExporting ? "GENERATING FILE..." : "EXPORT DATA"}
          </button>
        </div>
      </section>

      {error && (
        <div className="mb-8 p-6 bg-[#FFDAD6] text-[#BA1A1A] border-l-4 border-[#BA1A1A] font-label font-bold text-[0.7rem] tracking-widest uppercase">
          {error}
        </div>
      )}

      {/* METRICS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-white mb-12 border border-[#D1C4BC]">
        <div className="p-8 border-b md:border-b-0 md:border-r border-[#D1C4BC]">
          <p className="font-label text-[0.65rem] font-black tracking-widest text-[#C8742A] mb-2 uppercase">Total Patrons</p>
          <p className="font-headline text-4xl font-bold">{customers.length}</p>
        </div>
        <div className="p-8 border-b md:border-b-0 md:border-r border-[#D1C4BC]">
          <p className="font-label text-[0.65rem] font-black tracking-widest text-[#7F756E] mb-2 uppercase">Active Directory</p>
          <p className="font-headline text-4xl font-bold text-[#1A1109]">Verified</p>
        </div>
        <div className="p-8">
          <p className="font-label text-[0.65rem] font-black tracking-widest text-[#7F756E] mb-2 uppercase">System Status</p>
          <p className="font-headline text-4xl font-bold text-[#1A1109]">Operational</p>
        </div>
      </div>

      {/* BRUTALIST LEDGER */}
      <div className="bg-[#FFF8F5] border-t-2 border-[#1A1109]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D1C4BC] bg-[#F9F2EF]">
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">Client Identity</th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">Contact Origin</th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">Registry Date</th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">Role</th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase text-right">Access Controls</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center font-label text-[0.75rem] tracking-widest uppercase text-[#7F756E]">No clients registered in directory.</td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id || customer.email} className="border-b border-[#D1C4BC] hover:bg-[#F9F2EF] transition-colors group">
                  
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#1A1109] flex items-center justify-center text-[#FFF8F5] font-headline text-lg italic shrink-0">
                        {customer.firstName ? customer.firstName[0].toUpperCase() : "-"}
                      </div>
                      <div>
                        <p className="font-headline text-xl font-bold text-[#1A1109]">
                          {customer.firstName} {customer.lastName}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-6 px-6">
                    <p className="font-label text-[0.65rem] font-bold text-[#7F756E] uppercase tracking-wider">{customer.email}</p>
                  </td>

                  <td className="py-6 px-6">
                    <p className="font-label text-[0.75rem] font-bold text-[#1A1109] uppercase tracking-widest">
                      {formatDate(customer.createdAt || customer.createdDate || customer.registrationDate)}
                    </p>
                  </td>

                  <td className="py-6 px-6">
                    <span className={`px-3 py-1 font-label text-[0.6rem] font-black tracking-widest uppercase border ${
                      customer.role === "ADMIN" || customer.role === "ROLE_ADMIN"
                        ? "border-[#C8742A] text-[#C8742A] bg-[#C8742A]/10" 
                        : "border-[#1A1109] text-[#1A1109]"
                    }`}>
                      {customer.role === "ROLE_ADMIN" ? "ADMIN" : (customer.role || "CUSTOMER")}
                    </span>
                  </td>

                  <td className="py-6 px-6 text-right">
                    {customer.role === "ADMIN" || customer.role === "ROLE_ADMIN" ? (
                      <button 
                        onClick={() => handleRoleChange(customer.id, customer.role)}
                        className="font-label text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#BA1A1A] hover:opacity-60 transition-opacity"
                      >
                        Revoke Admin
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRoleChange(customer.id, customer.role)}
                        className="border border-[#1A1109] text-[#1A1109] hover:bg-[#1A1109] hover:text-[#FFF8F5] px-4 py-2 font-label text-[0.6rem] font-black uppercase tracking-widest transition-colors"
                      >
                        Promote to Admin
                      </button>
                    )}
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