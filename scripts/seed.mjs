import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrD-kic2tsQH-KQktDgz1LSScg5-whQbg",
  authDomain: "project--nayora.firebaseapp.com",
  projectId: "project--nayora",
  storageBucket: "project--nayora.firebasestorage.app",
  messagingSenderId: "150782726885",
  appId: "1:150782726885:web:8df66c10c949cfeffbfa0c",
  measurementId: "G-Q21DFRLQDN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedOtherCollections() {
  console.log("Seeding other collections...");

  // 1. Categories
  const categories = [
    { id: "women", title: "Women's Collection", description: "Discover the latest trends in women's fashion.", heroImage: "/women-hero.jpg", isActive: true },
    { id: "men", title: "Men's Collection", description: "Elevate your wardrobe with our men's essentials.", heroImage: "/men-hero.jpg", isActive: true },
    { id: "accessories", title: "Accessories", description: "The perfect finishing touches to any outfit.", heroImage: "/accessories-hero.jpg", isActive: true },
    { id: "unisex", title: "Unisex", description: "Versatile pieces designed for everyone.", heroImage: "/unisex-hero.jpg", isActive: true }
  ];

  for (const cat of categories) {
    const { id, ...data } = cat;
    await setDoc(doc(db, "categories", id), { ...data, createdAt: new Date() });
    console.log(`Added category: ${id}`);
  }

  // 2. Users (Customer)
  await setDoc(doc(db, "users", "sample-customer-uid"), {
    email: "customer@example.com",
    firstName: "Jane",
    lastName: "Doe",
    role: "customer",
    shippingAddress: {
      street: "123 Fashion Ave",
      city: "New York",
      zip: "10001"
    },
    createdAt: new Date()
  });
  console.log("Added sample customer user.");

  // 3. Users (Employee) + Employee Profile
  const employeeUid = "sample-employee-uid";
  
  // Add to users collection
  await setDoc(doc(db, "users", employeeUid), {
    email: "employee@nayora.com",
    firstName: "John",
    lastName: "Smith",
    role: "employee",
    createdAt: new Date()
  });
  console.log("Added sample employee user.");

  // Add to employees collection
  await setDoc(doc(db, "employees", employeeUid), {
    employeeId: "EMP-001",
    department: "Management",
    positionTitle: "Store Manager",
    status: "active",
    hireDate: new Date(),
    reportsTo: "ceo-uid",
    permissions: ["manage_inventory", "view_orders", "process_refunds", "manage_users"],
    internalContact: {
      workEmail: "john.smith@nayora.com",
      extension: "101"
    },
    emergencyContact: {
      name: "Jane Smith",
      relationship: "Spouse",
      phone: "555-0198"
    },
    updatedAt: new Date()
  });
  console.log("Added sample employee profile.");

  // 4. Orders
  await setDoc(doc(db, "orders", "sample-order-001"), {
    userId: "sample-customer-uid",
    status: "processing",
    totalAmount: 430,
    items: [
      { productId: "silk-blend-slip-dress", quantity: 1, priceAtPurchase: 245 },
      { productId: "woven-leather-tote", quantity: 1, priceAtPurchase: 185 }
    ],
    shippingDetails: {
      street: "123 Fashion Ave",
      city: "New York",
      zip: "10001",
      carrier: "FedEx",
      trackingNumber: ""
    },
    createdAt: new Date()
  });
  console.log("Added sample order.");

  console.log("Finished seeding all collections!");
  process.exit(0);
}

seedOtherCollections().catch(console.error);
