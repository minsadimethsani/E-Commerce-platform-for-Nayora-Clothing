import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const cloths = [
  { id: "silk-blend-slip-dress", name: "Silk Blend Slip Dress", category: "women", subCategory: "partywear", price: 245, image: "/slip_dress.png", color: "Cream", tag: "Best Seller" },
  { id: "tailored-linen-blazer", name: "Tailored Linen Blazer", category: "men", subCategory: "formal", price: 320, image: "/mens_blazer.png", color: "Espresso", tag: "Just Added" },
  { id: "woven-leather-tote", name: "Woven Leather Tote", category: "accessories", subCategory: "bags", price: 185, image: "/leather_tote.png", color: "Olive", tag: "Editor's Pick" },
  { id: "womens-wool-blazer", name: "Women's Wool Blazer", category: "women", subCategory: "formal", price: 450, image: "/womens_blazer.png", color: "Espresso", tag: "Limited Run" },
  { id: "pleated-midi-skirt", name: "Pleated Midi Skirt", category: "women", subCategory: "casual", price: 210, image: "/pleated_skirt.png", color: "Beaver" },
  { id: "pleated-wool-trousers", name: "Pleated Wool Trousers", category: "men", subCategory: "formal", price: 190, image: "/men.png", color: "Black" },
  { id: "suede-ankle-boots", name: "Suede Ankle Boots", category: "accessories", subCategory: "accents", price: 290, image: "/ankle_boots.png", color: "Beaver" },
  { id: "ribbed-knit-sweater", name: "Ribbed Knit Sweater", category: "men", subCategory: "casual", price: 175, image: "/hero.png", color: "Cream" },
  { id: "structured-linen-suit", name: "Structured Linen Suit", category: "women", subCategory: "formal", price: 550, image: "/women.png", color: "Cream" },
  { id: "silk-evening-gown", name: "Silk Evening Gown", category: "women", subCategory: "partywear", price: 890, image: "/women.png", color: "Black", tag: "Exclusive" },
  { id: "cashmere-lounge-set", name: "Cashmere Lounge Set", category: "women", subCategory: "loungewear", price: 320, image: "/hero.png", color: "Espresso" },
  { id: "oversized-cotton-button-down", name: "Oversized Cotton Button-Down", category: "women", subCategory: "casual", price: 145, image: "/women.png", color: "White" },
  { id: "heavyweight-jersey-tee", name: "Heavyweight Jersey Tee", category: "men", subCategory: "casual", price: 85, image: "/jersey_tee.png", color: "Olive" },
  { id: "double-breasted-wool-blazer", name: "Double-Breasted Wool Blazer", category: "men", subCategory: "formal", price: 620, image: "/hero.png", color: "Navy" },
  { id: "acetate-sunglasses", name: "Acetate Sunglasses", category: "accessories", subCategory: "eyewear", price: 185, image: "/accessories.png", color: "Tortoise" },
  { id: "gold-chain-necklace", name: "Gold Chain Necklace", category: "accessories", subCategory: "jewelry", price: 210, image: "/women.png", color: "Gold" },
  { id: "silk-scarf", name: "Silk Scarf", category: "accessories", subCategory: "accents", price: 95, image: "/hero.png", color: "Cream" },
  { id: "the-midnight-trench", name: "The Midnight Trench", category: "unisex", subCategory: "formal", price: 650, image: "/hero.png", color: "Black", tag: "Limited Run" },
  { id: "raw-silk-camisole", name: "Raw Silk Camisole", category: "women", subCategory: "partywear", price: 185, image: "/silk_camisole.png", color: "Cream", tag: "Selling Fast" },
  { id: "woven-leather-satchel", name: "Woven Leather Satchel", category: "accessories", subCategory: "bags", price: 295, image: "/accessories.png", color: "Espresso", tag: "Editor's Pick" }
];

async function updateProducts() {
  console.log("Updating products...");
  for (const product of cloths) {
    const { id, ...data } = product;
    await setDoc(doc(db, "products", id), { ...data, updatedAt: new Date() }, { merge: true });
    console.log(`Updated product: ${id}`);
  }
  console.log("Finished updating products!");
  process.exit(0);
}

updateProducts().catch(console.error);
