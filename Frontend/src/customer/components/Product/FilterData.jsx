export const filters = [
  {
    id: "color",
    name: "Palette",
    options: [
      { value: "white", label: "Optical White" },
      { value: "beige", label: "Raw Ecru" },
      { value: "blue", label: "Midnight Indigo" },
      { value: "brown", label: "Tobacco Earth" },
      { value: "green", label: "Deep Moss" },
      { value: "purple", label: "Tyrian Plum" },
      { value: "yellow", label: "Ochre" },
      { value: "black", label: "Ink Black" },
      { value: "red", label: "Carmine" },
      { value: "pink", label: "Dusty Rose" },
    ],
  },
  {
    id: "size",
    name: "Proportions",
    options: [
      { value: "S", label: "Small / 46" },
      { value: "M", label: "Medium / 48" },
      { value: "L", label: "Large / 50" },
      { value: "XL", label: "X-Large / 52" },
      { value: "XXL", label: "XX-Large / 54" },
    ],
  },
];

export const singleFilter = [
  {
    id: "price",
    name: "Investment Range",
    options: [
      { value: "159-399", label: "Essential (₹159 - ₹399)" },
      { value: "399-999", label: "Elevated (₹399 - ₹999)" },
      { value: "999-1999", label: "Premium (₹999 - ₹1999)" },
      { value: "1999-2999", label: "Signature (₹1999 - ₹2999)" },
      { value: "3999-4999", label: "Atelier (₹3999 - ₹4999)" },
    ],
  },
  {
    id: "discount",
    name: "Archive Access",
    options: [
      { value: "10", label: "10% Archive" },
      { value: "20", label: "20% Archive" },
      { value: "30", label: "30% Archive" },
      { value: "40", label: "40% Archive" },
      { value: "50", label: "50% Archive" },
      { value: "60", label: "60% Archive" },
      { value: "70", label: "70% Archive" },
      { value: "80", label: "80% Archive" },
    ],
  },
  {
    id: "stock",
    name: "Inventory Status",
    options: [
      { value: "in_stock", label: "Available in Atelier" },
      { value: "out_of_stock", label: "Awaiting Restock" },
    ],
  },
];

export const sortOptions = [
  { name: "Value: Ascending", query: "price_low", current: false },
  { name: "Value: Descending", query: "price_high", current: false },
];