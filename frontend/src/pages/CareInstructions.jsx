import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const sections = [
  {
    title: 'General Care Guidelines',
    items: [
      'Always read and follow the care label sewn into every garment before washing or cleaning.',
      'Store all pieces away from direct sunlight to prevent fading of delicate dyes and embellishments.',
      'Handle beaded and embroidered areas with care — avoid snagging on jewellery, zips, or rough surfaces.',
      'Allow garments to air out for at least one hour after wearing before returning them to storage.',
      'Do not hang knitted or bias-cut pieces; fold and store flat to preserve their shape.',
      'When in doubt, take your piece to a trusted dry cleaner who specialises in delicate or couture fabrics.',
    ],
  },
  {
    title: 'Care by Fabric',
    subsections: [
      {
        name: 'Silk & Charmeuse',
        tips: [
          'Hand-wash in cold water with a gentle silk-specific detergent, or dry-clean only.',
          'Never wring — press gently in a clean towel to remove excess water, then lay flat to dry.',
          'Iron on the lowest heat setting while still slightly damp, or use a pressing cloth.',
          'Avoid contact with perfume, deodorant, or sweat as these can permanently stain silk.',
        ],
      },
      {
        name: 'Lace & Embroidery',
        tips: [
          'Hand-wash delicately in lukewarm water with a mild soap; do not rub or scrub.',
          'Dry-clean for pieces with heavy embellishment, 3D appliqué, or intricate needlework.',
          'Store flat or rolled — never folded — to prevent the lace from cracking or losing its shape.',
          'Press from the reverse side using a thick towel to protect raised embroidery.',
        ],
      },
      {
        name: 'Beaded & Sequined Pieces',
        tips: [
          'Dry-clean only for all heavily beaded garments. Machine washing will loosen threads and damage beads.',
          'Store in a breathable garment bag and avoid stacking heavy items on top.',
          'If a bead or sequin is lost, contact our atelier for repairs using the original materials wherever possible.',
          'Turn the garment inside out during transport or storage to protect the surface.',
        ],
      },
      {
        name: 'Ankara & Wax Prints',
        tips: [
          'Machine wash at 30 °C on a gentle cycle, or hand-wash in cool water.',
          'Wash dark and bright prints separately for the first few washes as colours may run.',
          'Line-dry in the shade; direct sunlight fades vibrant wax-print colours.',
          'Iron on medium heat, preferably on the reverse side, to preserve the print\'s lustre.',
        ],
      },
      {
        name: 'Chiffon & Organza',
        tips: [
          'Hand-wash gently in cool water or opt for dry-cleaning for structured or multi-layered pieces.',
          'Hang to dry on a padded hanger to prevent stretching; avoid wire hangers.',
          'Steam rather than iron — a hand steamer removes wrinkles without damaging delicate weaves.',
          'Store in a sealed, acid-free garment bag to protect from dust and humidity.',
        ],
      },
      {
        name: 'Velvet & Jacquard',
        tips: [
          'Dry-clean only. Water can crush the pile of velvet and distort jacquard weaves irreversibly.',
          'Hang velvet pieces on a padded hanger; never fold flat as this creates permanent creases.',
          'Brush the pile gently in one direction with a soft clothes brush after each wearing.',
          'Steam from a distance of at least 15 cm to lift the pile without direct contact.',
        ],
      },
    ],
  },
  {
    title: 'Bridal Gown Care',
    items: [
      'We strongly recommend professional dry-cleaning and preservation immediately after your wedding day.',
      'Do not attempt home washing for any bridal creation — the combination of fabrics requires specialist handling.',
      'Store your gown in an acid-free, archival preservation box. Never use plastic bags that trap moisture.',
      'Keep your gown in a cool, dark, and dry location — humidity encourages yellowing and mildew.',
      'For minor repairs, stain treatment, or re-steaming before the big day, contact our atelier directly.',
    ],
  },
  {
    title: 'Storage & Preservation',
    items: [
      'Invest in padded, satin-covered hangers for structured pieces such as blazers, gowns, and tailored jackets.',
      'Use breathable cotton garment bags — never plastic, which traps moisture and breeds mildew.',
      'Place cedar blocks or lavender sachets in your wardrobe to repel moths naturally without harsh chemicals.',
      'Clean a garment before storing it for a long period; body oils, perfume, and food residues attract insects.',
      'For long-term storage, wrap folded pieces in acid-free tissue paper to prevent creasing and discolouration.',
      'Air your wardrobe regularly by leaving doors open for a few hours each week.',
    ],
  },
  {
    title: 'Repairs & Alterations',
    items: [
      'We offer in-house repairs and alterations for all Sarfowaa\'s Couture pieces — please contact us to book a fitting.',
      'Bring your piece in person to our atelier for assessment; we will provide an honest quote before any work begins.',
      'For pieces purchased some time ago, we\'ll do our best to source matching materials; slight variations may occur.',
      'We do not accept responsibility for damage caused by home washing, dry cleaners, or third-party tailors.',
    ],
  },
];

export default function CareInstructions() {
  return (
    <div className="bg-[#F5F0E8] pt-20 min-h-screen">
      {/* Page header */}
      <div className="bg-[#0A0A0A] py-16 px-6">
        <div className="max-w-[900px] mx-auto">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/40 mb-6">
            <Link to="/" className="hover:text-[#C4973F] transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-[#C4973F]">Care Instructions</span>
          </nav>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-white">Care Instructions</h1>
          <p className="text-white/50 text-sm mt-4 max-w-xl leading-relaxed">
            Protect the craftsmanship, colours, and structure of your Sarfowaa&apos;s Couture pieces with these professional care guidelines.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-6 py-16 space-y-14">
        {sections.map((sec) => (
          <div key={sec.title}>
            <h2 className="font-['Playfair_Display'] text-2xl text-[#0A0A0A] mb-4 pb-3 border-b border-[#C4973F]/30">
              {sec.title}
            </h2>

            {/* Simple bullet list */}
            {sec.items && (
              <ul className="space-y-3">
                {sec.items.map((item, i) => (
                  <li key={i} className="flex gap-3 text-[#3A3A3A] text-sm leading-relaxed">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#C4973F] mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* Subsections (fabric types) */}
            {sec.subsections && (
              <div className="space-y-8">
                {sec.subsections.map((sub) => (
                  <div key={sub.name}>
                    <h3 className="text-[10px] tracking-[0.25em] uppercase text-[#C4973F] font-semibold mb-3">
                      {sub.name}
                    </h3>
                    <ul className="space-y-2.5">
                      {sub.tips.map((tip, i) => (
                        <li key={i} className="flex gap-3 text-[#3A3A3A] text-sm leading-relaxed">
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#C4973F]/60 mt-2" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* CTA */}
        <div className="bg-[#0A0A0A] p-8 text-center">
          <p className="font-['Playfair_Display'] text-xl text-white mb-2">Still have questions?</p>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            Our atelier team is happy to advise on the care of any specific piece. Reach out and we'll guide you personally.
          </p>
          <Link to="/contact" className="btn-gold px-8 py-3">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
