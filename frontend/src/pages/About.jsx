import { Scissors, Award, Heart, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-[#0A0A0A] pt-20 min-h-screen">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#C4973F] mb-4">Our Story</p>
          <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl text-white leading-tight mb-6">Where Elegance<br />Meets Heritage</h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Sarfowaa is a Ghanaian luxury fashion house rooted in the rich textile traditions of West Africa, elevated for the modern woman.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-[#0A0A0A] py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#C4973F] mb-5">Founded with Purpose</p>
            <h2 className="font-['Playfair_Display'] text-4xl lg:text-5xl text-white leading-tight mb-8">
              Crafting Dreams,<br />One Stitch at a Time
            </h2>
            <div className="w-12 h-px bg-[#C4973F] mb-8" />
            <p className="text-white/50 text-sm leading-loose mb-5">
              Born in Accra, Sarfowaa was founded on a simple belief — that every woman deserves to wear clothes that make her feel extraordinary. From bridal gowns that grace the altar to corporate attire that commands respect, every piece tells a story.
            </p>
            <p className="text-white/50 text-sm leading-loose">
              Our master artisans bring decades of experience, combining traditional Ghanaian craftsmanship with contemporary design sensibilities to create fashion that transcends trends.
            </p>
          </div>

          {/* Quote card */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full border border-[#C4973F]/20 p-12 text-center">
              {/* Corner marks */}
              <span className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#C4973F]" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#C4973F]" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#C4973F]" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#C4973F]" />

              <p className="font-['Cormorant_Garamond'] text-[#C4973F] text-7xl leading-none select-none">&ldquo;</p>
              <p className="font-['Playfair_Display'] text-white text-2xl italic leading-relaxed -mt-4">
                Every woman deserves<br />to feel extraordinary
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="h-px w-8 bg-[#C4973F]/40" />
                <p className="text-[#C4973F]/60 text-[10px] tracking-[0.35em] uppercase">Est. Ofankor, Accra</p>
                <span className="h-px w-8 bg-[#C4973F]/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#111111] border-y border-[#C9A84C]/10 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] uppercase tracking-widest text-xs mb-2">What Drives Us</p>
            <h2 className="text-3xl font-bold text-white">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Scissors size={28} />, title: 'Craftsmanship', desc: 'Every stitch is placed with intention and precision' },
              { icon: <Award size={28} />, title: 'Excellence', desc: 'We never compromise on quality, ever' },
              { icon: <Heart size={28} />, title: 'Passion', desc: 'Fashion is our love language' },
              { icon: <Users size={28} />, title: 'Community', desc: 'Empowering Ghanaian artisans and their families' },
            ].map((v) => (
              <div key={v.title} className="text-center p-6 rounded-xl bg-[#1A1A1A] border border-[#C9A84C]/10">
                <div className="text-[#C9A84C] flex justify-center mb-4">{v.icon}</div>
                <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
