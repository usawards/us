'use client';

import { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section className="max-w-6xl mx-auto px-6 py-20" id="contact">
      <div className="max-w-xl mb-10">
        <div className="text-[11.5px] tracking-widest uppercase text-red font-bold mb-2.5">Get In Touch</div>
        <h2 className="font-display font-semibold text-[30px] md:text-[36px] text-navy leading-tight">
          Contact the awards team
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Wire this up to your own form endpoint / email service -
            // intentionally not calling the voting API, which has no
            // contact-form route.
            setSent(true);
          }}
        >
          <div className="mb-3.5">
            <label className="block text-xs font-semibold text-navy mb-1.5">Full Name</label>
            <input required className="w-full bg-white border border-navy/10 rounded-sm px-3.5 py-2.5 text-[13.5px]" placeholder="Jane Doe" />
          </div>
          <div className="mb-3.5">
            <label className="block text-xs font-semibold text-navy mb-1.5">Email</label>
            <input required type="email" className="w-full bg-white border border-navy/10 rounded-sm px-3.5 py-2.5 text-[13.5px]" placeholder="jane@email.com" />
          </div>
          <div className="mb-3.5">
            <label className="block text-xs font-semibold text-navy mb-1.5">Message</label>
            <textarea required rows={4} className="w-full bg-white border border-navy/10 rounded-sm px-3.5 py-2.5 text-[13.5px]" placeholder="How can we help?" />
          </div>
          <button className="bg-gold text-navy px-7 py-3.5 rounded-sm font-bold text-[14px] hover:bg-gold-light transition-colors">
            Send Message
          </button>
          {sent && <p className="text-[12.5px] text-navy mt-3">Thanks — we'll reply within 1 business day.</p>}
        </form>
        <div>
          <p className="text-[13.5px] text-gray-500 leading-relaxed">
            For nominee submissions, press inquiries, or payment support, reach the USEA team directly.
            Response time is typically under one business day during the voting period.
          </p>
          <div className="mt-5 text-[13.5px] text-navy"><b>Email</b><br />support@usexcellenceawards.org</div>
          <div className="mt-3.5 text-[13.5px] text-navy"><b>Voting Support Hours</b><br />Mon–Sun, 8am–10pm ET</div>
        </div>
      </div>
    </section>
  );
}
