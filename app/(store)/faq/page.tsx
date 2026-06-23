export default function FAQPage() {
  const faqs = [
    {
      q: "What is your return policy?",
      a: "We accept returns on all unworn, unwashed items in their original packaging within 14 days of delivery. Custom or pre-ordered items are final sale. Please visit our Shipping & Returns page for more details."
    },
    {
      q: "How long does shipping take?",
      a: "Domestic orders are processed within 2-3 business days and typically deliver within 3-5 business days. International shipping times vary depending on the destination, generally ranging between 7-14 business days."
    },
    {
      q: "Are the fabrics sustainable?",
      a: "Yes, Nayora is committed to responsible fashion. We select only organic cotton, recycled cashmere, and ethically sourced silk from mills that prioritize environmental stewardship."
    },
    {
      q: "Can I modify or cancel my order?",
      a: "Because we process orders rapidly to ensure timely delivery, modifications or cancellations are only possible within 1 hour of placing the order. Please contact our support team immediately if you need assistance."
    },
    {
      q: "How do I care for my Nayora garments?",
      a: "To preserve the quality and longevity of the premium natural fibers, we recommend dry cleaning for structured coats/suits and delicate hand washing in cold water with mild detergent for silks and light knitwear."
    }
  ];

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen font-sans">
      <section className="pt-16 pb-12 px-6 text-center border-b border-espresso/10 bg-gradient-to-b from-espresso/5 to-cream">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight text-espresso">Frequently Asked Questions</h1>
        <p className="text-sm md:text-base text-espresso/70 max-w-xl mx-auto font-light">
          Everything you need to know about our products, ordering process, and brand philosophies.
        </p>
      </section>

      <section className="container mx-auto px-6 md:px-12 py-16 max-w-3xl">
        <div className="space-y-8">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-espresso/10 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-serif font-semibold mb-3 text-espresso flex items-start gap-3">
                <span className="text-olive font-bold">Q.</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-sm text-espresso/70 leading-relaxed font-light pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
