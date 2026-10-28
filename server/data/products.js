import { readJsonFile } from '../utils/jsonStorage.js';

const defaultProducts = [
  {
    id: 'arc-wireless-headphones',
    name: 'Arc Wireless Headphones',
    description:
      'Immersive wireless sound with soft memory-foam cushions and a comfortable all-day fit.',
    category: 'Electronics',
    price: 7499,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-northstar-audio',
    vendor: 'Northstar Audio',
  },
  {
    id: 'everyday-linen-shirt',
    name: 'Everyday Linen Shirt',
    description:
      'A breathable linen staple cut for relaxed days, easy layering, and effortless style.',
    category: 'Fashion',
    price: 4499,
    image:
      'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-studio-common',
    vendor: 'Studio Common',
  },
  {
    id: 'ceramic-pour-over-set',
    name: 'Ceramic Pour Over Set',
    description:
      'A hand-finished ceramic brewer and matching cup made for a slower morning ritual.',
    category: 'Home & Living',
    price: 3499,
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-clay-grain',
    vendor: 'Clay & Grain',
  },
  {
    id: 'daily-glow-face-oil',
    name: 'Daily Glow Face Oil',
    description:
      'A lightweight botanical blend of nourishing oils that leaves skin soft and luminous.',
    category: 'Beauty',
    price: 2999,
    image:
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-botanica-lab',
    vendor: 'Botanica Lab',
  },
  {
    id: 'everyday-carry-tote',
    name: 'Everyday Carry Tote',
    description:
      'A durable, roomy canvas tote with considered details for workdays and weekends.',
    category: 'Accessories',
    price: 5599,
    image:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-field-notes-co',
    vendor: 'Field Notes Co.',
  },
  {
    id: 'cloud-knit-throw',
    name: 'Cloud Knit Throw',
    description:
      'A soft textured knit throw that adds an inviting layer of warmth to any room.',
    category: 'Home & Living',
    price: 6199,
    image:
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-soft-habitat',
    vendor: 'Soft Habitat',
  },
  {
    id: 'pocket-smart-speaker',
    name: 'Pocket Smart Speaker',
    description:
      'Compact room-filling audio with a warm sound profile and simple voice controls.',
    category: 'Electronics',
    price: 3999,
    image:
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-bright-circuit',
    vendor: 'Bright Circuit',
  },
  {
    id: 'minimal-leather-sneakers',
    name: 'Minimal Leather Sneakers',
    description:
      'Clean everyday sneakers crafted in smooth leather with a cushioned, flexible sole.',
    category: 'Fashion',
    price: 6999,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-common-ground',
    vendor: 'Common Ground',
  },
  {
    id: 'stoneware-serving-bowl',
    name: 'Stoneware Serving Bowl',
    description:
      'A sculptural stoneware bowl with a calm glaze for everyday meals and gatherings.',
    category: 'Home & Living',
    price: 2299,
    image:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-clay-grain',
    vendor: 'Clay & Grain',
  },
  {
    id: 'silk-hair-ribbon-set',
    name: 'Silk Hair Ribbon Set',
    description:
      'Three smooth silk ribbons in soft neutral tones for effortless everyday styling.',
    category: 'Beauty',
    price: 1299,
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-petal-form',
    vendor: 'Petal & Form',
  },
  {
    id: 'studio-yoga-mat',
    name: 'Studio Yoga Mat',
    description:
      'A supportive, non-slip mat with a balanced cushion for studio sessions or home practice.',
    category: 'Sports',
    price: 2799,
    image:
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-good-motion',
    vendor: 'Good Motion',
  },
  {
    id: 'everyday-sunglasses',
    name: 'Everyday Sunglasses',
    description:
      'Classic rounded frames with UV-protective lenses and a lightweight everyday feel.',
    category: 'Accessories',
    price: 3199,
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=85',
    stock: 20,
    vendorId: 'demo-vendor-sunroom-studio',
    vendor: 'Sunroom Studio',
  },
];

export const products = readJsonFile('products.json', defaultProducts);
