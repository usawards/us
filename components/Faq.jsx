'use client';

import { useState } from 'react';

const FAQS = [
  { q: 'How much does each vote cost?', a: 'Each vote costs $0.90 USD. You can vote for any nominee as many times as you like — there is no limit on total votes.' },
  { q: 'What payment methods are accepted?', a: 'We accept Apple Pay, Visa, Mastercard, and American Express (where supported), all processed securely through Paystack.' },
  { q: 'Is my payment secure?', a: 'Yes. All transactions are encrypted and processed through Paystack with webhook verification, and no card details are stored on our servers.' },
  { q: 'When do votes appear on the leaderboard?', a: 'Immediately — the leaderboard updates in real time as soon as a payment is confirmed.' },
  { q: 'Will I get a receipt?', a: 'Yes, a payment confirmation and receipt are emailed to you automatically after every successful transaction.' },
];

export default function Faq() {
  const [open, setOpen] = useState(null);

  return (
    <section className="bg-white border-y border-navy/10" id="faq">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-xl mb-8">
          <div className="text-[11.5px] tracking-widest uppercase text-red font-bold mb-2.5">Questions</div>
          <h2 className="font-display font-semibold text-[30px] md:text-[36px] text-navy leading-tight">
            Frequently asked questions
          </h2>
        </div>
        <div className="border-t border-navy/10">
          {FAQS.map((f, i) => (
            <div key={i} className="border-b border-navy/10">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left py-5 flex justify-between items-center font-semibold text-[15px] text-navy"
              >
                <span>{f.q}</span>
                <span className={`font-mono text-gold text-lg transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {open === i && (
                <div className="pb-5 text-[13.5px] text-gray-500 leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
