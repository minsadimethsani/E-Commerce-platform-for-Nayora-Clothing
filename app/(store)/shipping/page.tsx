export default function ShippingPage() {
  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen font-sans">
      <section className="pt-16 pb-12 px-6 text-center border-b border-espresso/10 bg-gradient-to-b from-espresso/5 to-cream">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight text-espresso">Shipping & Returns</h1>
        <p className="text-sm md:text-base text-espresso/70 max-w-xl mx-auto font-light">
          Everything you need to know about our logistical timelines, delivery options, and return processes.
        </p>
      </section>

      <section className="container mx-auto px-6 md:px-12 py-16 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-espresso border-b border-espresso/10 pb-3">Shipping Guidelines</h2>
          
          <div className="space-y-4 text-sm text-espresso/80 font-light leading-relaxed">
            <h3 className="font-semibold text-espresso">Processing Times</h3>
            <p>Orders are dispatched from our warehouse within 2-3 business days. We operate Monday through Friday, excluding national holidays.</p>
            
            <h3 className="font-semibold text-espresso mt-6">Domestic Shipping (Sri Lanka)</h3>
            <p>Standard delivery takes 3-5 business days. We offer free delivery on all orders over LKR 10,000. Flat rate shipping is applied to orders below that threshold.</p>
            
            <h3 className="font-semibold text-espresso mt-6">International Shipping</h3>
            <p>We ship globally. International orders take 7-14 business days. Custom duties, taxes, or entry clearance fees are the sole responsibility of the importer/customer.</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-espresso border-b border-espresso/10 pb-3">Returns & Exchanges</h2>
          
          <div className="space-y-4 text-sm text-espresso/80 font-light leading-relaxed">
            <h3 className="font-semibold text-espresso">14-Day Return Window</h3>
            <p>We offer returns on all unworn, unaltered, and unwashed items with tags attached within 14 days of delivery. Returns that do not meet these requirements will not be refunded.</p>
            
            <h3 className="font-semibold text-espresso mt-6">Exchanges</h3>
            <p>To exchange an item, return the original item for a store credit or refund, and place a new order for the replacement item on our store.</p>
            
            <h3 className="font-semibold text-espresso mt-6">Return Process</h3>
            <p>Pack your return items securely and contact customer support to receive a prepaid shipping label. Return courier costs will be deducted from your final refund amount.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
