"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { checkoutSchema } from "@/lib/validation";

export default function PaymentMethodPage() {
  const { pendingCheckout, setPendingCheckout } = useCart();
  const router = useRouter();
  
  const [selectedMethod, setSelectedMethod] = useState<string>("Card");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAccountExistsModal, setShowAccountExistsModal] = useState(false);
  const [existingUserFirstName, setExistingUserFirstName] = useState("");

  const [codFile, setCodFile] = useState<File | null>(null);
  const [codFilePreview, setCodFilePreview] = useState<string | null>(null);
  const [codFileError, setCodFileError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const handleCodFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setCodFileError("Please select a valid image file (PNG, JPG, JPEG).");
        setCodFile(null);
        setCodFilePreview(null);
        return;
      }
      setCodFile(selectedFile);
      setCodFileError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCodFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  useEffect(() => {
    // If user refreshes or accesses this page without a pending checkout, redirect to cart
    if (!pendingCheckout) {
      router.replace("/cart");
    }
  }, [pendingCheckout, router]);

  useEffect(() => {
    async function prefillForm() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionJson = await sessionRes.json();
        const email = sessionJson?.user?.email;
        if (email) {
          const q = query(collection(db, "users"), where("email", "==", email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setFormData({
              firstName: userData.firstName || userData.name?.split(" ")[0] || "",
              lastName: userData.lastName || userData.name?.split(" ")[1] || "",
              email: userData.email || email,
              phone: userData.phone || "",
              address: userData.address || ""
            });
            return;
          }
        }

        // Fallback to pendingCheckout details (e.g. from Buy Now modal)
        if (pendingCheckout?.shippingDetails) {
          const { name, email: checkoutEmail, address, phone } = pendingCheckout.shippingDetails;
          if (name || checkoutEmail || address || phone) {
            const parts = (name || "").split(" ");
            setFormData({
              firstName: parts[0] || "",
              lastName: parts.slice(1).join(" ") || "",
              email: checkoutEmail || "",
              phone: phone || "",
              address: address || ""
            });
          }
        }
      } catch (e) {
        console.error("Failed to prefill form", e);
      }
    }
    prefillForm();
  }, [pendingCheckout]);

  if (!pendingCheckout) return null; // Avoid rendering if state is lost

  const handleContinue = async () => {
    // 1. Validate form fields using Zod schema
    const validation = checkoutSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    // Validate terms agreement
    if (!agreedToTerms) {
      setTermsError("You must agree to the website terms and conditions to proceed.");
      return;
    }
    setTermsError(null);

    // Validate COD receipt if selected
    if (selectedMethod === "Cash on Delivery") {
      if (!codFile) {
        setCodFileError("Please upload the delivery charge payment receipt.");
        return;
      }
      setCodFileError(null);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user is already logged in as this email
      let isLoggedInAsThisEmail = false;
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionJson = await sessionRes.json();
        if (sessionJson?.user?.email === formData.email) {
          isLoggedInAsThisEmail = true;
        }
      } catch (e) {
        console.error("Failed to check auth session", e);
      }

      if (!isLoggedInAsThisEmail) {
        // Query Firestore users collection for existing email
        const q = query(collection(db, "users"), where("email", "==", formData.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Retrieve user first name from metadata
          const userDoc = querySnapshot.docs[0].data();
          const firstName = userDoc.firstName || userDoc.name?.split(" ")[0] || "Customer";
          setExistingUserFirstName(firstName);
          setShowAccountExistsModal(true);
          setIsLoading(false);
          return;
        }
      }

      let deliveryChargeReceiptUrl = "";
      if (selectedMethod === "Cash on Delivery" && codFile) {
        const fileExt = codFile.name.split('.').pop() || 'jpg';
        const storagePath = `products/slips/cod_receipt_${Date.now()}.${fileExt}`;
        const storageRef = ref(storage, storagePath);
        const uploadResult = await uploadBytes(storageRef, codFile);
        deliveryChargeReceiptUrl = await getDownloadURL(uploadResult.ref);
      }

      // Save validated shipping details to pendingCheckout
      const updatedCheckout = {
        ...pendingCheckout,
        shippingDetails: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: formData.address,
          phone: formData.phone
        }
      };
      setPendingCheckout(updatedCheckout as any);

      if (selectedMethod === "Card") {
        router.push("/checkout/card");
        return;
      }

      // If Bank Deposit or COD, process order first
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedCheckout.items,
          shippingDetails: updatedCheckout.shippingDetails,
          paymentMethod: selectedMethod,
          deliveryChargeReceiptUrl: selectedMethod === "Cash on Delivery" ? deliveryChargeReceiptUrl : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (selectedMethod === "Bank Deposit") {
        // Redirect to the bank deposit slip upload page
        router.push(`/checkout/bank-deposit?orderId=${data.orderId}&orderNumber=${data.orderNumber}&amount=${pendingCheckout.totalAmount}`);
      } else {
        // Redirect to the dedicated Order Confirmed page (COD)
        router.push(`/checkout/success?orderId=${data.orderId}`);
      }
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      <section className="pt-6 md:pt-16 pb-16 px-6 md:px-12 text-center bg-espresso/5 border-b border-espresso/10">
        <h1 className="text-4xl font-serif font-bold mb-4 tracking-tight">Checkout</h1>
        <p className="text-espresso/70 max-w-xl mx-auto text-sm uppercase tracking-widest font-bold">Shipping & Payment</p>
      </section>

      {showAccountExistsModal && (
        <div className="fixed inset-0 bg-espresso/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 max-w-md w-full shadow-2xl border border-espresso/10 text-center space-y-6">
            <h3 className="text-2xl font-serif text-espresso">Account Already Exists</h3>
            <p className="text-espresso/70 text-sm leading-relaxed">
              An account with this email already exists. Please log in to complete your purchase safely.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  router.push(`/auth/login?redirect=checkout&firstName=${existingUserFirstName}&callbackUrl=${encodeURIComponent("/checkout/payment-method")}`);
                }}
                className="w-full py-4 bg-espresso text-cream text-xs uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors"
              >
                Log In to Finalize Order
              </button>
              <button
                onClick={() => setShowAccountExistsModal(false)}
                className="w-full py-3 text-espresso/60 text-xs uppercase tracking-widest font-bold hover:text-espresso transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white/50 p-8 shadow-sm border border-espresso/10">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Shipping Details */}
          <div className="space-y-6 mb-10 border-b border-espresso/10 pb-8">
            <h2 className="text-2xl font-serif mb-6 pb-2 border-b border-espresso/5">1. Shipping Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">First Name</label>
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={`w-full border ${errors.firstName ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors`}
                  placeholder="First name"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Last Name</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={`w-full border ${errors.lastName ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors`}
                  placeholder="Last name"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full border ${errors.email ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors`}
                placeholder="name@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={`w-full border ${errors.phone ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors`}
                placeholder="e.g., 0771234567 or +94771234567"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Shipping Address</label>
              <textarea 
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className={`w-full border ${errors.address ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors resize-none`}
                placeholder="Enter your complete delivery address"
              ></textarea>
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mb-10">
            <h2 className="text-2xl font-serif mb-6 pb-2 border-b border-espresso/5">2. Select Payment Option</h2>
            <div className="space-y-4">
              {["Card", "Bank Deposit", "Cash on Delivery"].map((method) => (
                <label 
                  key={method}
                  className={`flex items-center gap-4 p-5 border cursor-pointer transition-all ${
                    selectedMethod === method 
                      ? 'border-espresso bg-espresso/5 shadow-md' 
                      : 'border-espresso/20 hover:border-espresso/40'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method} 
                    checked={selectedMethod === method}
                    onChange={() => setSelectedMethod(method)}
                    className="w-5 h-5 accent-espresso"
                  />
                  <span className="font-medium text-lg">{method}</span>
                </label>
              ))}
            </div>

            {selectedMethod === "Cash on Delivery" && (
              <div className="mt-8 p-6 bg-espresso/5 border border-espresso/10 rounded-lg space-y-6 animate-fadeIn">
                <h3 className="font-serif font-semibold text-lg text-espresso border-b border-espresso/10 pb-2">
                  Cash on Delivery (COD) Guidelines
                </h3>
                <div className="text-sm text-espresso/80 space-y-3 leading-relaxed">
                  <p>
                    • You will pay the product amount in cash to the courier agent upon delivery.
                  </p>
                  <p>
                    • <strong>Important Notice:</strong> To prevent fraudulent orders, the delivery charge must be paid in advance via bank deposit or bank transfer.
                  </p>
                  <p>
                    • Please transfer <strong>LKR 350</strong> (standard delivery fee) to the following bank account:
                  </p>
                  <div className="bg-white/40 p-4 border border-espresso/5 font-mono text-xs space-y-1 mt-2">
                    <div>Bank Name: Nayora Bank</div>
                    <div>Branch: Colombo Main</div>
                    <div>Account Name: Nayora Clothing (Pvt) Ltd</div>
                    <div className="font-bold">Account Number: 1234-5678-9012</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest font-bold text-espresso">
                    Upload Delivery Charge Payment Receipt *
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    codFileError ? 'border-red-500 bg-red-50/20' : 'border-espresso/20 hover:border-espresso/40 bg-transparent'
                  }`}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleCodFileChange}
                      className="hidden" 
                      id="cod-receipt-upload-input"
                    />
                    <label htmlFor="cod-receipt-upload-input" className="cursor-pointer block">
                      {codFilePreview ? (
                        <div className="space-y-4">
                          <img 
                            src={codFilePreview} 
                            alt="Receipt preview" 
                            className="max-h-48 mx-auto object-contain border border-espresso/10 rounded shadow-sm"
                          />
                          <span className="block text-xs font-bold text-espresso/70 hover:text-espresso underline">Change Receipt Image</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-2xl text-espresso/40">📸</div>
                          <span className="block text-sm font-semibold text-espresso">Click to upload transfer receipt</span>
                          <span className="block text-xs text-espresso/50">PNG, JPG, JPEG up to 10MB</span>
                        </div>
                      )}
                    </label>
                  </div>
                  {codFileError && <p className="text-red-500 text-xs mt-2">{codFileError}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-espresso/10 pt-6 space-y-6">
            {/* Terms and Conditions Agreement */}
            <div className="flex flex-col">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked) setTermsError(null);
                  }}
                  className="w-5 h-5 accent-espresso shrink-0 mt-0.5"
                />
                <span className="text-sm text-espresso/80 leading-snug">
                  I have read and agree to the{" "}
                  <Link href="/shipping" target="_blank" className="underline hover:text-espresso font-semibold text-espresso">
                    website terms and conditions
                  </Link>
                  .
                </span>
              </label>
              {termsError && <p className="text-red-500 text-xs mt-2 ml-8">{termsError}</p>}
            </div>

            <div className="flex justify-between text-espresso font-bold text-xl mb-4">
              <span>Total to Pay:</span>
              <span>LKR {pendingCheckout.totalAmount}</span>
            </div>

            <button 
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-xl flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
              ) : selectedMethod === "Card" ? (
                "Continue to Card Details"
              ) : (
                "Confirm Order"
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
