'use client';

const LINKS = [
  { href: '#categories', label: 'Categories' },
  { href: '#nominees', label: 'Nominees' },
  { href: '#leaderboard', label: 'Leaderboard' },
  { href: '#how', label: 'How Voting Works' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 bg-navy border-b border-gold/25">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-5">
        <div className="flex items-center gap-2.5 text-white">
          <div className="w-9 h-9 rounded-full border border-gold flex items-center justify-center font-display font-semibold text-sm text-gold shrink-0">
            US
          </div>
          <div className="font-display font-semibold text-[17px] tracking-wide">
            EXCELLENCE <span className="text-gold">AWARDS</span>
          </div>
        </div>

        <div className="hidden md:flex gap-7 items-center">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-white/75 text-[13.5px] font-medium tracking-wide hover:text-gold-light transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#nominees"
          className="bg-gold text-navy px-4.5 py-2.5 rounded-sm font-bold text-[13px] tracking-wide hover:bg-gold-light transition-colors"
        >
          Vote Now
        </a>
      </div>
    </nav>
  );
}
