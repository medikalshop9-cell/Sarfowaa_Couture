import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LAST_UPDATED = '1 July 2025';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#F5F0E8] pt-20 min-h-screen">
      {/* Page header */}
      <div className="bg-[#0A0A0A] py-16 px-6">
        <div className="max-w-[900px] mx-auto">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/40 mb-6">
            <Link to="/" className="hover:text-[#C4973F] transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-[#C4973F]">Privacy Policy</span>
          </nav>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-white">Privacy Policy</h1>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-4">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-6 py-16 space-y-12">

        <p className="text-[#3A3A3A] text-sm leading-relaxed">
          Sarfowaa&apos;s Couture (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us. Please read this policy carefully. If you do not agree with its terms, please discontinue use of our site.
        </p>

        {[
          {
            title: '1. Information We Collect',
            content: `We may collect the following types of information:

Personal identification information: name, email address, phone number, billing and delivery address when you create an account or place an order.

Payment information: we do not store your full card number. Payments are processed by trusted third-party payment processors in compliance with PCI-DSS standards.

Usage data: pages visited, time spent on pages, links clicked, browser type, and device information — collected via cookies and analytics tools.

Communications: records of correspondence if you contact us via email, the contact form, or social media.

User-generated content: any photographs, measurements, or design preferences shared with us for bespoke orders.`,
          },
          {
            title: '2. How We Use Your Information',
            content: `We use your information to:

• Process and fulfil your orders, including sending confirmation, shipping, and delivery notifications.
• Manage your account and provide customer support.
• Send you marketing communications about new collections, events, and promotions — only where you have opted in. You may unsubscribe at any time.
• Improve our website experience through analytics.
• Comply with legal obligations, including tax and financial record-keeping requirements.
• Prevent fraudulent transactions and protect the security of our site.`,
          },
          {
            title: '3. Sharing Your Information',
            content: `We do not sell, trade, or rent your personal information to third parties. We may share data with:

Service providers: shipping couriers, payment processors, email delivery services, and website hosting providers — only to the extent necessary to provide our services.

Legal requirements: if required by law, court order, or governmental authority, we may disclose your information accordingly.

Business transfers: in the event of a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before your data becomes subject to a different privacy policy.`,
          },
          {
            title: '4. Cookies',
            content: `Our website uses cookies — small text files stored on your device — to:

• Keep you logged in during your session.
• Remember items in your shopping cart.
• Analyse site traffic and improve our content (via anonymised analytics).

You may configure your browser to refuse cookies or to alert you when cookies are being sent. Note that some parts of our website may not function properly without cookies.`,
          },
          {
            title: '5. Data Security',
            content: `We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. This includes encrypted data transmission (HTTPS), secure Firebase infrastructure, and restricted internal access.

However, no method of transmission over the internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee its absolute security.`,
          },
          {
            title: '6. Data Retention',
            content: `We retain your personal data for as long as your account is active or as needed to provide you with services and comply with legal obligations. You may request deletion of your account and associated data at any time by contacting us at privacy@sarfowaa.com.

Order records may be retained for up to seven years for legal and financial compliance purposes.`,
          },
          {
            title: '7. Your Rights',
            content: `Depending on your location, you may have the right to:

• Access the personal data we hold about you.
• Correct inaccurate or incomplete data.
• Request erasure of your personal data ("right to be forgotten").
• Object to or restrict certain types of processing.
• Request portability of your data in a machine-readable format.
• Withdraw consent at any time (where processing is based on consent).

To exercise any of these rights, please contact us using the details below.`,
          },
          {
            title: '8. Third-Party Links',
            content: `Our website may contain links to third-party websites (such as social media platforms). These sites have their own privacy policies, and we do not accept any responsibility or liability for their policies or practices. We encourage you to review the privacy policy of every website you visit.`,
          },
          {
            title: '9. Children\'s Privacy',
            content: `Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a minor, please contact us immediately so we may delete it.`,
          },
          {
            title: '10. Changes to This Policy',
            content: `We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated "Last updated" date. Your continued use of our website after any changes constitutes your acceptance of the new policy.`,
          },
          {
            title: '11. Contact Us',
            content: `For questions, concerns, or requests relating to this Privacy Policy, please contact:

Sarfowaa's Couture
Devi, Accra, Ghana
Email: privacy@sarfowaa.com
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

        {/* CTA */}
        <div className="bg-[#0A0A0A] p-8 text-center mt-10">
          <p className="font-['Playfair_Display'] text-xl text-white mb-2">Questions about your data?</p>
          <p className="text-white/50 text-sm mb-6">Our team is happy to help with any privacy-related enquiries.</p>
          <Link to="/contact" className="btn-gold px-8 py-3">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
