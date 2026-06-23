"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen font-sans">
      <section className="pt-16 pb-12 px-6 text-center border-b border-espresso/10 bg-gradient-to-b from-espresso/5 to-cream">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight text-espresso">Contact Us</h1>
        <p className="text-sm md:text-base text-espresso/70 max-w-xl mx-auto font-light">
          Have an inquiry, feedback, or need help with your order? Reach out and we'll reply as soon as possible.
        </p>
      </section>

      <section className="container mx-auto px-6 md:px-12 py-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-center">
            <div>
              <h2 className="text-2xl font-serif text-espresso mb-4">Get In Touch</h2>
              <p className="text-sm text-espresso/70 leading-relaxed font-light">
                Our support team is available Monday through Friday, 9:00 AM to 6:00 PM. We typically reply within 24 hours.
              </p>
            </div>

            <div className="space-y-6 text-sm text-espresso/80 font-light">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-espresso/5 rounded-full text-olive">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-espresso/50 block font-medium">Email Us</span>
                  <a href="mailto:support@nayora.com" className="hover:text-olive transition-colors">support@nayora.com</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-espresso/5 rounded-full text-olive">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-espresso/50 block font-medium">Call Us</span>
                  <a href="tel:+94112345678" className="hover:text-olive transition-colors">+94 11 234 5678</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-espresso/5 rounded-full text-olive">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-espresso/50 block font-medium">Our Head Office</span>
                  <span>100 Galle Road, Colombo 03, Sri Lanka</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white/40 backdrop-blur-sm border border-espresso/10 p-8 rounded-2xl shadow-sm">
            <h3 className="text-xl font-serif font-semibold text-espresso mb-6">Send A Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-espresso/60 uppercase tracking-wider mb-2">Your Name</label>
                <input 
                  type="text" 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name" 
                  className="w-full border border-espresso/20 bg-transparent px-4 py-3 outline-none focus:border-espresso transition-colors placeholder:text-espresso/45 rounded-lg"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-espresso/60 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email" 
                  className="w-full border border-espresso/20 bg-transparent px-4 py-3 outline-none focus:border-espresso transition-colors placeholder:text-espresso/45 rounded-lg"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-espresso/60 uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?" 
                  rows={5}
                  className="w-full border border-espresso/20 bg-transparent px-4 py-3 outline-none focus:border-espresso transition-colors placeholder:text-espresso/45 rounded-lg resize-none"
                  required
                />
              </div>

              {status === "success" && (
                <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              {status === "error" && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                  Please fill in all the required fields correctly.
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-4 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-md rounded-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}
