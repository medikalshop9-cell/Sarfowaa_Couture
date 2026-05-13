import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LAST_UPDATED = '1 July 2025';

export default function TermsOfService() {
  return (
    <div className="bg-[#F5F0E8] pt-20 min-h-screen">
      {/* Page header */}
      <div className="bg-[#0A0A0A] py-16 px-6">
        <div className="max-w-[900px] mx-auto">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/40 mb-6">
            <Link to="/" className="hover:text-[#C4973F] transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-[#C4973F]">Terms of Service</span>
          </nav>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-white">Terms of Service</h1>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-4">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-6 py-16 space-y-12">

        <p className="text-[#3A3A3A] text-sm leading-relaxed">
          These Terms of Service (&quot;Terms&quot;) govern your use of the Sarfowaa&apos;s Couture website and any purchase made through it. By accessing our website or placing an order, you agree to be bound by these Terms. If you do not agree, please do not use our site or services.
        </p>

        {[
          {
            title: '1. Acceptance of Terms',
            content: `By visiting our website, creating an account, or completing a purchase, you confirm that you are at least 18 years of age and have the legal capacity to enter into a binding agreement. These Terms may be updated periodically; your continued use of the site constitutes acceptance of the current version.`,
          },
          {
            title: '2. Products & Descriptions',
            content: `We make every effort to display our products accurately on the website. However, please note:

• Colours may appear slightly different depending on your screen's calibration. We cannot guarantee that your monitor accurately reflects the true colours of a product.
• All measurements provided are approximate. Bespoke orders are subject to a separate fitting and production schedule agreed at the time of order.
• We reserve the right to limit quantities, discontinue products, or adjust product descriptions at any time without prior notice.`,
          },
          {
            title: '3. Pricing & Payment',
            content: `All prices are listed in Ghana Cedis (GHS) and include applicable taxes unless otherwise stated. Prices are subject to change without notice.

Payment is required in full at the time of placing an order. We accept payments through our authorised payment gateway. We do not accept responsibility for delays or failures caused by your bank or payment provider.

For bespoke and bridal orders, a non-refundable deposit (typically 50% of the total order value) is required to confirm your booking and initiate production.`,
          },
          {
            title: '4. Order Acceptance',
            content: `Placing an order constitutes an offer to purchase. An order is only confirmed once you receive a written confirmation from us. We reserve the right to cancel or refuse any order at our discretion, including if:

• A product is found to be incorrectly priced or described.
• We suspect fraudulent activity.
• Stock is unavailable.

In the event of cancellation on our part, you will be refunded in full within 7 business days.`,
          },
          {
            title: '5. Bespoke & Custom Orders',
            content: `Bespoke and custom orders are crafted specifically for you. As such:

• All deposits paid for bespoke commissions are non-refundable once production has commenced.
• You are responsible for providing accurate measurements. We accept no liability for poor fit arising from incorrect measurements provided by the customer.
• Production timelines are estimates. While we strive to meet agreed deadlines, delays due to material availability or unforeseen circumstances may occur. We will notify you promptly.
• Significant changes to a confirmed design after production has commenced may incur additional charges.`,
          },
          {
            title: '6. Shipping & Delivery',
            content: `We ship within Ghana and internationally. Delivery times and charges vary by location and are displayed at checkout.

• All orders are dispatched after full payment (or agreed deposit) is confirmed.
• We are not responsible for delays caused by customs, courier services, or circumstances beyond our control.
• Risk of loss and title for items passes to you upon delivery to the carrier.
• Please inspect your order on arrival and notify us within 48 hours of any damage during transit.`,
          },
          {
            title: '7. Returns & Refunds',
            content: `Ready-to-wear items: we accept returns within 7 days of receipt, provided the item is unused, unwashed, unaltered, and in its original packaging with all tags attached. Return shipping costs are the responsibility of the customer.

Bespoke and custom-made items: as these are made to your specific measurements and design, they are non-returnable and non-refundable except in cases of confirmed production defect.

Faulty items: if you receive a defective item, please contact us within 48 hours with photographs. We will arrange a replacement, repair, or refund at our discretion.

Sale items are final sale and cannot be returned or exchanged.

To initiate a return, contact us at returns@sarfowaa.com with your order number and reason for return.`,
          },
          {
            title: '8. Intellectual Property',
            content: `All content on this website — including but not limited to photographs, design sketches, text, logos, and product descriptions — is the property of Sarfowaa's Couture and is protected by Ghanaian and international copyright laws.

You may not reproduce, distribute, modify, or use any content from this website for commercial purposes without our express written permission. Personal, non-commercial use is permitted provided you retain all copyright and proprietary notices.`,
          },
          {
            title: '9. User Accounts',
            content: `When you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activity conducted under your account. Notify us immediately if you suspect unauthorised use of your account.

We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or otherwise harmful behaviour.`,
          },
          {
            title: '10. Limitation of Liability',
            content: `To the fullest extent permitted by applicable law, Sarfowaa's Couture shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products, even if advised of the possibility of such damages.

Our total liability to you for any claim arising under these Terms shall not exceed the total amount paid by you for the order in question.`,
          },
          {
            title: '11. Governing Law',
            content: `These Terms shall be governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of Ghana.`,
          },
          {
            title: '12. Contact Us',
            content: `For any questions about these Terms, please contact:

Sarfowaa's Couture
Devi, Accra, Ghana
Email: legal@sarfowaa.com
Phone: +233 34 000 0006`,
          },
        ].map((sec) => (
          <div key={sec.title}>
            <h2 className="font-['Playfair_Display'] text-xl text-[#0A0A0A] mb-4 pb-3 border-b border-[#C4973F]/30">
              {sec.title}
            </h2>
            <div className="text-[#3A3A3A] text-sm leading-relaxed whitespace-pre-line">
              {sec.content}
            </div>
          </div>
        ))}

        {/* Links to related pages */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-black/10">
          <Link to="/privacy-policy" className="text-xs tracking-[0.15em] uppercase text-[#C4973F] hover:underline">
            Privacy Policy
          </Link>
          <span className="text-black/20">·</span>
          <Link to="/care-instructions" className="text-xs tracking-[0.15em] uppercase text-[#C4973F] hover:underline">
            Care Instructions
          </Link>
          <span className="text-black/20">·</span>
          <Link to="/contact" className="text-xs tracking-[0.15em] uppercase text-[#C4973F] hover:underline">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
