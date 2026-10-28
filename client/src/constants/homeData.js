export const categories = [
  { name: 'Electronics', icon: '⌁', detail: 'Smart tech' },
  { name: 'Fashion', icon: '◇', detail: 'Your style' },
  { name: 'Home & Living', icon: '⌂', detail: 'Make it yours' },
  { name: 'Beauty', icon: '✦', detail: 'Feel refreshed' },
  { name: 'Sports', icon: '○', detail: 'Stay active' },
  { name: 'Accessories', icon: '✧', detail: 'Finishing touches' },
];

export const allProducts = [
  {
    id: 'arc-wireless-headphones',
    name: 'Arc Wireless Headphones',
    category: 'Electronics',
    vendor: 'Northstar Audio',
    price: 7499,
    description:
      'Immersive wireless sound with soft memory-foam cushions and a comfortable all-day fit.',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85',
    tone: 'sand',
  },
  {
    id: 'everyday-linen-shirt',
    name: 'Everyday Linen Shirt',
    category: 'Fashion',
    vendor: 'Studio Common',
    price: 4499,
    description:
      'A breathable linen staple cut for relaxed days, easy layering, and effortless style.',
    image:
      'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=800&q=85',
    tone: 'blue',
  },
  {
    id: 'ceramic-pour-over-set',
    name: 'Ceramic Pour Over Set',
    category: 'Home & Living',
    vendor: 'Clay & Grain',
    price: 3499,
    description:
      'A hand-finished ceramic brewer and matching cup made for a slower morning ritual.',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=85',
    tone: 'cream',
  },
  {
    id: 'daily-glow-face-oil',
    name: 'Daily Glow Face Oil',
    category: 'Beauty',
    vendor: 'Botanica Lab',
    price: 2999,
    description:
      'A lightweight botanical blend of nourishing oils that leaves skin soft and luminous.',
    image:
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=85',
    tone: 'peach',
  },
  {
    id: 'everyday-carry-tote',
    name: 'Everyday Carry Tote',
    category: 'Accessories',
    vendor: 'Field Notes Co.',
    price: 5599,
    description:
      'A durable, roomy canvas tote with considered details for workdays and weekends.',
    image:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=85',
    tone: 'olive',
  },
  {
    id: 'cloud-knit-throw',
    name: 'Cloud Knit Throw',
    category: 'Home & Living',
    vendor: 'Soft Habitat',
    price: 6199,
    description:
      'A soft textured knit throw that adds an inviting layer of warmth to any room.',
    image:
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=85',
    tone: 'lavender',
  },
  {
    id: 'pocket-smart-speaker',
    name: 'Pocket Smart Speaker',
    category: 'Electronics',
    vendor: 'Bright Circuit',
    price: 3999,
    description:
      'Compact room-filling audio with a warm sound profile and simple voice controls.',
    image:
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=85',
    tone: 'blue',
  },
  {
    id: 'minimal-leather-sneakers',
    name: 'Minimal Leather Sneakers',
    category: 'Fashion',
    vendor: 'Common Ground',
    price: 6999,
    description:
      'Clean everyday sneakers crafted in smooth leather with a cushioned, flexible sole.',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85',
    tone: 'cream',
  },
  {
    id: 'stoneware-serving-bowl',
    name: 'Stoneware Serving Bowl',
    category: 'Home & Living',
    vendor: 'Clay & Grain',
    price: 2299,
    description:
      'A sculptural stoneware bowl with a calm glaze for everyday meals and gatherings.',
    image:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=85',
    tone: 'sand',
  },
  {
    id: 'silk-hair-ribbon-set',
    name: 'Silk Hair Ribbon Set',
    category: 'Beauty',
    vendor: 'Petal & Form',
    price: 1299,
    description:
      'Three smooth silk ribbons in soft neutral tones for effortless everyday styling.',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85',
    tone: 'peach',
  },
  {
    id: 'studio-yoga-mat',
    name: 'Studio Yoga Mat',
    category: 'Sports',
    vendor: 'Good Motion',
    price: 2799,
    description:
      'A supportive, non-slip mat with a balanced cushion for studio sessions or home practice.',
    image:
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=85',
    tone: 'olive',
  },
  {
    id: 'everyday-sunglasses',
    name: 'Everyday Sunglasses',
    category: 'Accessories',
    vendor: 'Sunroom Studio',
    price: 3199,
    description:
      'Classic rounded frames with UV-protective lenses and a lightweight everyday feel.',
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=85',
    tone: 'lavender',
  },
];

export const featuredProducts = allProducts.slice(0, 6);
