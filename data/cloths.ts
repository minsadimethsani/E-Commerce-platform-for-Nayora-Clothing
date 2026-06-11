export interface Product {
  id: string | number;
  name: string;
  category: string; // e.g. "women", "men", "accessories", "unisex"
  subCategory?: string; // e.g. "formal", "casual", "loungewear", "partywear", "bags", "eyewear", "jewelry", "accents"
  price: number;
  image: string;
  color?: string;
  tag?: string;
}

export const cloths: Product[] = [
  { id: "silk-blend-slip-dress", name: "Silk Blend Slip Dress", category: "women", subCategory: "partywear", price: 245, image: "/women.png", color: "Cream", tag: "Best Seller" },
  { id: "tailored-linen-blazer", name: "Tailored Linen Blazer", category: "men", subCategory: "formal", price: 320, image: "/men.png", color: "Espresso", tag: "Just Added" },
  { id: "woven-leather-tote", name: "Woven Leather Tote", category: "accessories", subCategory: "bags", price: 185, image: "/accessories.png", color: "Olive", tag: "Editor's Pick" },
  { id: "organic-cotton-overcoat", name: "Organic Cotton Overcoat", category: "unisex", subCategory: "formal", price: 450, image: "/hero.png", color: "Espresso", tag: "Limited Run" },
  { id: "cashmere-turtleneck", name: "Cashmere Turtleneck", category: "women", subCategory: "loungewear", price: 210, image: "/women.png", color: "Beaver" },
  { id: "pleated-wool-trousers", name: "Pleated Wool Trousers", category: "men", subCategory: "formal", price: 190, image: "/men.png", color: "Black" },
  { id: "suede-ankle-boots", name: "Suede Ankle Boots", category: "accessories", subCategory: "accents", price: 290, image: "/accessories.png", color: "Beaver" },
  { id: "ribbed-knit-sweater", name: "Ribbed Knit Sweater", category: "men", subCategory: "casual", price: 175, image: "/hero.png", color: "Cream" },
  { id: "structured-linen-suit", name: "Structured Linen Suit", category: "women", subCategory: "formal", price: 550, image: "/women.png", color: "Cream" },
  { id: "silk-evening-gown", name: "Silk Evening Gown", category: "women", subCategory: "partywear", price: 890, image: "/women.png", color: "Black", tag: "Exclusive" },
  { id: "cashmere-lounge-set", name: "Cashmere Lounge Set", category: "women", subCategory: "loungewear", price: 320, image: "/hero.png", color: "Espresso" },
  { id: "oversized-cotton-button-down", name: "Oversized Cotton Button-Down", category: "women", subCategory: "casual", price: 145, image: "/women.png", color: "White" },
  { id: "heavyweight-jersey-tee", name: "Heavyweight Jersey Tee", category: "men", subCategory: "casual", price: 85, image: "/men.png", color: "Olive" },
  { id: "double-breasted-wool-blazer", name: "Double-Breasted Wool Blazer", category: "men", subCategory: "formal", price: 620, image: "/hero.png", color: "Navy" },
  { id: "acetate-sunglasses", name: "Acetate Sunglasses", category: "accessories", subCategory: "eyewear", price: 185, image: "/accessories.png", color: "Tortoise" },
  { id: "gold-chain-necklace", name: "Gold Chain Necklace", category: "accessories", subCategory: "jewelry", price: 210, image: "/women.png", color: "Gold" },
  { id: "silk-scarf", name: "Silk Scarf", category: "accessories", subCategory: "accents", price: 95, image: "/hero.png", color: "Cream" },
  { id: "the-midnight-trench", name: "The Midnight Trench", category: "unisex", subCategory: "formal", price: 650, image: "/hero.png", color: "Black", tag: "Limited Run" },
  { id: "raw-silk-camisole", name: "Raw Silk Camisole", category: "women", subCategory: "partywear", price: 185, image: "/women.png", color: "Cream", tag: "Selling Fast" },
  { id: "woven-leather-satchel", name: "Woven Leather Satchel", category: "accessories", subCategory: "bags", price: 295, image: "/accessories.png", color: "Espresso", tag: "Editor's Pick" }
];
