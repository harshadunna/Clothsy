export const filters = [
  {
    id: "color",
    name: "Palette",
    options: [
      { "value": "Black", "label": "Ink Black" },
      { "value": "Black | 4661/408/800", "label": "Ink Black" },
      { "value": "Black+Gold", "label": "Black+Gold Tone" },
      { "value": "Blue", "label": "Blue Tone" },
      { "value": "Brown", "label": "Burnt Sienna" },
      { "value": "Brushed Steel / Industrial Dial", "label": "Brushed Steel Tone" },
      { "value": "Gold", "label": "Atelier Gold" },
      { "value": "Grey", "label": "Slate Grey" },
      { "value": "Havana", "label": "Tortoise Havana" },
      { "value": "Oyster-White | 2173/608/251", "label": "Oyster-White Tone" },
      { "value": "Pink", "label": "Pink Tone" },
      { "value": "Standard", "label": "Standard Tone" }
    ],
  },
  {
    id: "size",
    name: "Proportions",
    options: [
      { "value": "XS", "label": "XS" },
      { "value": "S", "label": "Small / 46" },
      { "value": "M", "label": "Medium / 48" },
      { "value": "L", "label": "Large / 50" },
      { "value": "XL", "label": "X-Large / 52" },
      { "value": "XXL", "label": "XXL" },
      { "value": "ONE SIZE", "label": "OS / Atelier Standard" },
      { "value": "85", "label": "85" },
      { "value": "90", "label": "90" },
      { "value": "95", "label": "95" },
      { "value": "100", "label": "100" },
      { "value": "105", "label": "105" },
      { "value": "EU 36", "label": "EU 36" },
      { "value": "EU 37", "label": "EU 37" },
      { "value": "EU 38", "label": "EU 38" },
      { "value": "EU 39", "label": "EU 39" },
      { "value": "EU 40", "label": "EU 40" },
      { "value": "EU 41", "label": "EU 41" },
      { "value": "40", "label": "40" },
      { "value": "41", "label": "41" },
      { "value": "42", "label": "42" },
      { "value": "43", "label": "43" },
      { "value": "44", "label": "44" },
      { "value": "45", "label": "45" },
      { "value": "OS", "label": "OS" }
    ],
  },
];

export const singleFilter = [
  {
    id: "price",
    name: "Investment Range",
    options: [
      { "value": "159-399", "label": "Essential (₹159 - ₹399)" },
      { "value": "399-999", "label": "Elevated (₹399 - ₹999)" },
      { "value": "999-1999", "label": "Premium (₹999 - ₹1999)" },
      { "value": "1999-2999", "label": "Signature (₹1999 - ₹2999)" },
      { "value": "3000-50000", "label": "Atelier (₹3000+)" }
    ],
  },
  {
    id: "discount",
    name: "Archive Access",
    options: [
      { "value": "10", "label": "10% Archive" },
      { "value": "20", "label": "20% Archive" },
      { "value": "30", "label": "30% Archive" },
      { "value": "40", "label": "40% Archive" },
      { "value": "50", "label": "50% Archive" },
      { "value": "60", "label": "60% Archive" },
      { "value": "70", "label": "70% Archive" },
      { "value": "80", "label": "80% Archive" }
    ],
  },
  {
    id: "stock",
    name: "Inventory Status",
    options: [
      { "value": "in_stock", "label": "Available in Atelier" },
      { "value": "out_of_stock", "label": "Awaiting Restock" },
    ],
  },
];

export const sortOptions = [
  { name: "Price: Low to High", query: "price_low", current: false },
  { name: "Price: High to Low", query: "price_high", current: false },
  { name: "Newest Arrivals", query: "newest", current: true },
];