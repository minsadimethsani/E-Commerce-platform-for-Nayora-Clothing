"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

function BankDepositForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? Number(amountParam) : 0;

  const [formData, setFormData] = useState({
    depositorName: "",
    referenceNumber: "",
    depositedAmount: amount,
    depositedDateTime: "",
    bankName: "Nayora Bank"
  });

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default datetime and amount once search params are loaded
  useEffect(() => {
    if (amount) {
      setFormData(prev => ({ ...prev, depositedAmount: amount }));
    }
    
    // Get YYYY-MM-DDTHH:MM local format
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
    setFormData(prev => ({ ...prev, depositedDateTime: localISOTime }));
  }, [amount]);

  // Handle file change and generate preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select a valid image file (PNG, JPG, JPEG).");
        setFile(null);
        setFilePreview(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const validateForm = () => {
    const errors: any = {};
    if (!formData.depositorName.trim()) errors.depositorName = "Depositor name is required";
    if (!formData.referenceNumber.trim()) errors.referenceNumber = "Reference number / Transaction ID is required";
    if (!formData.bankName.trim()) errors.bankName = "Bank name is required";
    if (!formData.depositedDateTime) errors.depositedDateTime = "Deposited date and time is required";
    if (!formData.depositedAmount || formData.depositedAmount <= 0) errors.depositedAmount = "A valid amount is required";
    if (!file) errors.file = "An image of the bank slip or receipt is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !orderId || !file) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Upload file to Firebase Storage (under products/slips/ which is write-allowed)
      const fileExt = file.name.split('.').pop() || 'jpg';
      const storagePath = `products/slips/${orderId}_${Date.now()}.${fileExt}`;
      const storageRef = ref(storage, storagePath);

      const uploadResult = await uploadBytes(storageRef, file);
      const slipUrl = await getDownloadURL(uploadResult.ref);

      // 2. Submit details to the server
      const response = await fetch("/api/checkout/bank-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          bankDepositDetails: {
            depositorName: formData.depositorName,
            referenceNumber: formData.referenceNumber,
            depositedAmount: formData.depositedAmount,
            depositedDateTime: formData.depositedDateTime,
            bankName: formData.bankName,
            slipUrl
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit bank deposit details");
      }

      // 3. Success! Redirect to checkout success page
      router.push(`/checkout/success?orderId=${orderId}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-espresso p-6">
        <h2 className="text-2xl font-serif mb-4">No Order Information Found</h2>
        <p className="text-espresso/60 text-sm">Please return to the cart and proceed through checkout again.</p>
        <button 
          onClick={() => router.replace("/cart")}
          className="mt-8 px-8 py-4 bg-espresso text-cream uppercase text-xs tracking-widest font-bold font-serif"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      <section className="pt-6 md:pt-16 pb-16 px-6 md:px-12 text-center bg-espresso/5 border-b border-espresso/10">
        <h1 className="text-4xl font-serif font-bold mb-4 tracking-tight">Bank Deposit / Transfer Details</h1>
        <p className="text-espresso/70 max-w-xl mx-auto text-sm uppercase tracking-widest font-bold">Upload Your Payment Slip</p>
      </section>

      <section className="container mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 justify-center items-stretch max-w-5xl">
        {/* Left Side: Bank account details & Instructions */}
        <div className="w-full lg:w-1/2 bg-white/40 p-8 shadow-sm border border-espresso/10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-serif mb-6 border-b border-espresso/10 pb-4">Payment Instructions</h2>
            
            <p className="text-sm leading-relaxed mb-6 text-espresso/80">
              Please transfer the total order amount to the bank account below. Ensure you include the **Order Number** as the transfer reference or memo.
            </p>

            <div className="space-y-4 bg-espresso/5 p-6 rounded border border-espresso/5 mb-8">
              <div>
                <span className="block text-[10px] uppercase tracking-widest font-bold text-espresso/50">Bank Name</span>
                <span className="font-serif font-semibold text-lg">Nayora Bank</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest font-bold text-espresso/50">Branch</span>
                <span className="font-serif font-semibold text-lg">Colombo Main</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest font-bold text-espresso/50">Account Name</span>
                <span className="font-serif font-semibold text-lg">Nayora Clothing (Pvt) Ltd</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest font-bold text-espresso/50">Account Number</span>
                <span className="font-mono font-bold text-xl tracking-wider text-espresso">1234-5678-9012</span>
              </div>
            </div>

            <div className="space-y-4 border-t border-espresso/10 pt-6">
              <div className="flex justify-between items-center text-espresso/70 text-sm">
                <span>Order Number:</span>
                <span className="font-mono font-bold text-espresso">{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center text-espresso font-bold text-lg">
                <span>Amount to Transfer:</span>
                <span>LKR {amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-amber-50 border border-amber-200 text-amber-800 p-4 text-xs rounded-md">
            <strong>Important:</strong> Your order will not be processed or shipped until the deposited slip has been verified by our team.
          </div>
        </div>

        {/* Right Side: Form details and Upload */}
        <div className="w-full lg:w-1/2 bg-white/50 p-8 shadow-sm border border-espresso/10">
          <h2 className="text-2xl font-serif mb-6 border-b border-espresso/10 pb-4">Submit Payment Details</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Depositor Name</label>
              <input 
                type="text" 
                placeholder="Full Name of the Depositor"
                value={formData.depositorName}
                onChange={(e) => setFormData({...formData, depositorName: e.target.value})}
                className={`w-full border ${formErrors.depositorName ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors text-espresso`}
              />
              {formErrors.depositorName && <p className="text-red-500 text-xs mt-1">{formErrors.depositorName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Reference / Transaction ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. TXN12345678"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                  className={`w-full border ${formErrors.referenceNumber ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors text-espresso`}
                />
                {formErrors.referenceNumber && <p className="text-red-500 text-xs mt-1">{formErrors.referenceNumber}</p>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Bank Name</label>
                <input 
                  type="text" 
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  className={`w-full border ${formErrors.bankName ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors text-espresso`}
                />
                {formErrors.bankName && <p className="text-red-500 text-xs mt-1">{formErrors.bankName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Amount Deposited (LKR)</label>
                <input 
                  type="number" 
                  value={formData.depositedAmount}
                  onChange={(e) => setFormData({...formData, depositedAmount: Number(e.target.value) || 0})}
                  className={`w-full border ${formErrors.depositedAmount ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors text-espresso`}
                />
                {formErrors.depositedAmount && <p className="text-red-500 text-xs mt-1">{formErrors.depositedAmount}</p>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Date & Time of Deposit</label>
                <input 
                  type="datetime-local" 
                  value={formData.depositedDateTime}
                  onChange={(e) => setFormData({...formData, depositedDateTime: e.target.value})}
                  className={`w-full border ${formErrors.depositedDateTime ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors text-espresso`}
                />
                {formErrors.depositedDateTime && <p className="text-red-500 text-xs mt-1">{formErrors.depositedDateTime}</p>}
              </div>
            </div>

            {/* Slip Upload */}
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Upload Bank Slip / Receipt Image</label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                formErrors.file ? 'border-red-500 bg-red-50/20' : 'border-espresso/20 hover:border-espresso/40 bg-transparent'
              }`}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" 
                  id="slip-upload-input"
                />
                <label htmlFor="slip-upload-input" className="cursor-pointer block">
                  {filePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={filePreview} 
                        alt="Slip preview" 
                        className="max-h-48 mx-auto object-contain border border-espresso/10 rounded shadow-sm"
                      />
                      <span className="block text-xs font-bold text-espresso/70 hover:text-espresso underline">Change Slip Image</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-2xl text-espresso/40">📸</div>
                      <span className="block text-sm font-semibold text-espresso">Click to upload bank slip/receipt</span>
                      <span className="block text-xs text-espresso/50">PNG, JPG, JPEG up to 10MB</span>
                    </div>
                  )}
                </label>
              </div>
              {formErrors.file && <p className="text-red-500 text-xs mt-2">{formErrors.file}</p>}
            </div>

            <div className="pt-4 border-t border-espresso/10 mt-6">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-xl flex items-center justify-center disabled:opacity-70 gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                    Uploading & Submitting...
                  </>
                ) : (
                  "Submit Payment & Details"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function BankDepositPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-espresso/20 border-t-espresso rounded-full animate-spin"></div>
      </div>
    }>
      <BankDepositForm />
    </Suspense>
  );
}
