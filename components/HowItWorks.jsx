const STEPS = [
  ['01', 'Find your nominee', 'Browse by category or search by name across all fifty states.'],
  ['02', 'Choose vote count', 'Pick a quick preset or enter a custom number of votes.'],
  ['03', 'Pay securely', 'Apple Pay in one tap, or a card — processed via Paystack.'],
  ['04', 'Votes count instantly', 'The leaderboard updates live and a receipt is emailed to you.'],
];

export default function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20" id="how">
      <div className="max-w-xl mb-10">
        <div className="text-[11.5px] tracking-widest uppercase text-red font-bold mb-2.5">Process</div>
        <h2 className="font-display font-semibold text-[30px] md:text-[36px] text-navy leading-tight">
          How voting works
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map(([num, title, desc]) => (
          <div key={num}>
            <div className="font-display text-4xl text-gold font-semibold leading-none">{num}</div>
            <h4 className="font-bold text-[15.5px] text-navy mt-3 mb-1.5">{title}</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
