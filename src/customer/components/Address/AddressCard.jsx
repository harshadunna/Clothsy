export default function AddressCard({ address, selected = false, compact = false }) {
  if (!address) return null;

  if (compact) {
    return (
      <div className="flex items-start gap-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "#fdf0e6" }}
        >
          <svg className="w-4 h-4" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="space-y-0.5">
          <p className="font-bold text-sm" style={{ color: "#1a1109" }}>
            {address.firstName} {address.lastName}
          </p>
          <p className="text-xs" style={{ color: "#7a6a5a" }}>{address.streetAddress}</p>
          <p className="text-xs" style={{ color: "#7a6a5a" }}>
            {address.city}, {address.state} — {address.zipCode}
          </p>
          <p className="text-xs pt-0.5" style={{ color: "#9e8d7a" }}>
            <span className="font-semibold">Ph:</span> {address.mobile}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-300"
      style={{
        borderColor: selected ? "#c8742a" : "#e8ddd5",
        boxShadow: selected
          ? "0 0 0 2px rgba(200,116,42,0.2), 0 2px 20px rgba(200,116,42,0.08)"
          : "0 2px 12px rgba(180,140,90,0.06)",
        background: "#fff",
      }}
    >
      {/* Card Header */}
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
          {/* Radio dot */}
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

      {/* Card Body */}
      <div className="px-5 py-4 space-y-1.5">
        <p className="text-xs leading-relaxed" style={{ color: "#7a6a5a" }}>
          {address.streetAddress}
        </p>
        <p className="text-xs" style={{ color: "#7a6a5a" }}>
          {address.city}, {address.state} — {address.zipCode}
        </p>
        <div className="flex items-center gap-1.5 pt-1">
          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <p className="text-xs font-semibold" style={{ color: "#9e8d7a" }}>
            {address.mobile}
          </p>
        </div>
      </div>
    </div>
  );
}