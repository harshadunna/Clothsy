import React from 'react';

const AddressCard = ({ address, selected, onEdit, onDelete, showActions = true }) => {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 relative ${selected && showActions ? 'border-[#c8742a] bg-[#fff9f4]' : 'border-gray-200 bg-white'
        }`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">

          {/* Conditionally hide the Radio Button */}
          {showActions && (
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-[#c8742a]' : 'border-gray-300'}`}>
              {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#c8742a]"></div>}
            </div>
          )}

          <p className="font-bold text-gray-900 text-base">
            {address?.firstName} {address?.lastName}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold text-[#c8742a] bg-[#fdf0e6] tracking-wider">
          HOME
        </span>
      </div>

      {/* Address Details - Shifted left if radio button is hidden */}
      <div className={`space-y-1.5 text-sm text-gray-500 ${showActions ? 'ml-8' : 'ml-0'}`}>
        <p>{address?.streetAddress}</p>
        <p>{address?.city}, {address?.state} — {address?.zipCode}</p>

        <div className="flex items-center gap-2 pt-1">
          <svg className="w-4 h-4 text-[#c8742a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <p className="font-medium">{address?.mobile}</p>
        </div>
      </div>

      {/* Conditionally hide the Edit/Delete Icons ONLY on Order Summary */}
      {showActions && (
        <div className="absolute bottom-4 right-4 flex items-center gap-3 text-gray-400">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(address); }}
            className="p-1 hover:text-[#c8742a] transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(address.id); }}
            className="p-1 hover:text-red-500 transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default AddressCard;