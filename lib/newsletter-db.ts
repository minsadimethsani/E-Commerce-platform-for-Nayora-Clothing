import { db as firestoreDb } from "./firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getCountFromServer 
} from "firebase/firestore";

export interface Subscriber {
  id?: string;
  email: string;
  subscribedAt?: any;
}

// Normalize email helper
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Add a subscriber if they don't already exist
export async function addSubscriber(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const subscribersRef = collection(firestoreDb, "subscribers");
    const q = query(subscribersRef, where("email", "==", cleanEmail));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return { success: false, error: "This email is already subscribed." };
    }

    await addDoc(subscribersRef, {
      email: cleanEmail,
      subscribedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error adding subscriber to Firestore:", error);
    return { success: false, error: error.message || "Failed to subscribe. Please try again." };
  }
}

// Get the total number of newsletter subscribers
export async function getTotalSubscribersCount(): Promise<number> {
  try {
    const subscribersRef = collection(firestoreDb, "subscribers");
    const snapshot = await getCountFromServer(subscribersRef);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting subscribers count:", error);
    return 0;
  }
}

// Get details of all subscribers (sorted by subscription date descending)
export async function getAllSubscribers(): Promise<Subscriber[]> {
  try {
    const subscribersRef = collection(firestoreDb, "subscribers");
    const q = query(subscribersRef, orderBy("subscribedAt", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      let subscribedAtStr = "";
      
      if (data.subscribedAt && typeof data.subscribedAt.toDate === "function") {
        subscribedAtStr = data.subscribedAt.toDate().toISOString();
      } else if (data.subscribedAt) {
        subscribedAtStr = new Date(data.subscribedAt).toISOString();
      }

      return {
        id: doc.id,
        email: data.email,
        subscribedAt: subscribedAtStr || new Date().toISOString()
      } as Subscriber;
    });
  } catch (error) {
    console.error("Error getting all subscribers:", error);
    
    // Fallback: fetch without ordering in case index hasn't been built yet
    try {
      const subscribersRef = collection(firestoreDb, "subscribers");
      const snapshot = await getDocs(subscribersRef);
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        let subscribedAtStr = "";
        if (data.subscribedAt && typeof data.subscribedAt.toDate === "function") {
          subscribedAtStr = data.subscribedAt.toDate().toISOString();
        }
        return {
          id: doc.id,
          email: data.email,
          subscribedAt: subscribedAtStr || new Date().toISOString()
        } as Subscriber;
      });
      // Sort in-memory
      results.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
      return results;
    } catch (fallbackError) {
      console.error("Fallback error getting subscribers:", fallbackError);
      return [];
    }
  }
}
