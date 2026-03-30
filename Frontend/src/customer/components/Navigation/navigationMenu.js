export const navigation = {
  categories: [
    {
      id: 'collections',
      name: 'Womenswear',
      featured: [
        {
          name: 'Autumn Rituals',
          href: '/collections/curations/autumn-rituals',
          imageSrc: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
          imageAlt: 'High fashion editorial shot of a woman in an oversized structured coat.',
        },
        {
          name: 'The Archive Sale',
          href: '/collections/curations/archive-sale',
          imageSrc: 'https://images.unsplash.com/photo-1600165328224-8175b5b00c82?auto=format&fit=crop&w=800&q=80',
          imageAlt: 'Close up of luxurious textured silk and linen draping.',
        },
      ],
      sections: [
        {
          id: 'silhouettes',
          name: 'Silhouettes',
          items: [
            { name: 'Architectural Outerwear', id: 'outerwear' },
            { name: 'Heavy Silk Drapes',       id: 'silk-dresses' },
            { name: 'Tailored Trousers',        id: 'womens-trousers' },
            { name: 'Essential Knits',          id: 'knits' },
            { name: 'Midnight Silhouettes',     id: 'evening-dresses' },
            { name: 'Structured Jumpers',       id: 'jumpers' },
            { name: 'Sculpted Blouses',         id: 'blouses' },
          ],
        },
        {
          id: 'accents',
          name: 'Accents',
          items: [
            { name: 'Structured Leather Bags', id: 'bags' },
            { name: 'Monolith Footwear',        id: 'footwear' },
            { name: 'Artisan Jewelry',          id: 'jewelry' },
            { name: 'Silk Foulards',            id: 'scarves' },
            { name: 'Oversized Eyewear',        id: 'eyewear' },
          ],
        },
        {
          id: 'curations',
          name: 'Curations',
          items: [
            { name: 'The Monolith Edit',       id: 'monolith-edit' },       
            { name: 'Core Foundations',        id: 'core-foundations' },
            { name: 'Nocturnal Architecture',  id: 'nocturnal' },
            { name: 'The Archive Sale',        id: 'archive-sale' },
          ],
        },
      ],
    },
    {
      id: 'atelier',
      name: 'Menswear',
      featured: [
        {
          name: 'Structural Tailoring',
          href: '/atelier/curations/mens-heritage-tailoring',
          imageSrc: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
          imageAlt: 'Minimalist menswear flatlay featuring a sharp charcoal suit jacket.',
        },
        {
          name: 'Monolith Boots',
          href: '/atelier/accents/boots',
          imageSrc: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80',
          imageAlt: 'Brutalist leather boots on a concrete surface.',
        },
      ],
      sections: [
        {
          id: 'silhouettes',
          name: 'Silhouettes',
          items: [
            { name: 'Wool Overcoats',      id: 'overcoats' },
            { name: 'Crisp Poplin Shirts', id: 'poplin-shirts' },
            { name: 'Pleated Trousers',    id: 'trousers' },
            { name: 'Fine Gauge Knits',    id: 'fine-knits' },
            { name: 'Raw Denim',           id: 'raw-denim' },
            { name: 'Structural Suits',    id: 'suits' },
          ],
        },
        {
          id: 'accents',
          name: 'Accents',
          items: [
            { name: 'Leather Briefcases',    id: 'briefcases' },
            { name: 'Derby Boots',           id: 'boots' },
            { name: 'Chronograph Watches',   id: 'watches' },
            { name: 'Woven Belts',           id: 'belts' },
          ],
        },
        {
          id: 'curations',
          name: 'Curations',
          items: [
            { name: 'The Monolith Edit',  id: 'mens-monolith-edit' },      
            { name: 'Urban Brutalism',    id: 'mens-urban-brutalism' },   
            { name: 'Heritage Tailoring', id: 'mens-heritage-tailoring' }, 
          ],
        },
      ],
    },
  ],
  pages: [
    { name: 'Craftsmanship',    id: 'craftsmanship' },
    { name: 'Editorial Journal', id: 'journal' },
    { name: 'Contact Atelier',  id: 'contact' },
  ],
};