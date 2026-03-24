import { useDispatch } from "react-redux";
import { deleteAddress } from "../../../Redux/Auth/Action";

export default function AddressCard({ address, selected = false, compact = false, onEdit }) {
  const dispatch = useDispatch();

  const handleDelete = (e) => {
    e.stopPropagation(); 
    dispatch(deleteAddress(address.id));
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    // This calls the function passed from DeliveryAddress.jsx
    if (onEdit) onEdit(address); 
  };

  if (!address) return null;

  if (compact) {
    return null; 
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-300 relative"
      style={{
        borderColor: selected ? "#c8742a" : "#e8ddd5",
        boxShadow: selected
          ? "0 0 0 2px rgba(200,116,42,0.2), 0 2px 20px rgba(200,116,42,0.08)"
          : "0 2px 12px rgba(180,140,90,0.06)",
        background: "#fff",
      }}
    >
      <div
        className="px-5 py-3 flex items-center justify-between border-b"
        style={{
          borderColor: selected ? "rgba(200,116,42,0.15)" : "#f0e8e0",
          background: selected
            ? "linear-gradient(135deg, #fff9f4, #fff)"
            : "linear-gradient(135deg, #fdfcfb, #fff)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-200"
            style={{ borderColor: selected ? "#c8742a" : "#d9cfc6" }}
          >
            {selected && (
              <div className="w-2 h-2 rounded-full" style={{ background: "#c8742a" }} />
            )}
          </div>
          <span className="font-bold text-sm" style={{ color: "#1a1109" }}>
            {address.firstName} {address.lastName}
          </span>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#f5ede4", color: "#c8742a" }}
        >
          HOME
        </span>
      </div>

      <div className="px-5 py-4 space-y-1.5">
        <p className="text-xs leading-relaxed" style={{ color: "#7a6a5a" }}>
          {address.streetAddress}
        </p>
        <p className="text-xs" style={{ color: "#7a6a5a" }}>
          {address.city}, {address.state} — {address.zipCode}
        </p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-xs font-semibold" style={{ color: "#9e8d7a" }}>
              {address.mobile}
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleEdit} className="text-gray-400 hover:text-blue-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}