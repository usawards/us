export default function Prizes({ prizes }) {
  return (
    <section className="bg-white border-y border-navy/10">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-xl mb-8">
          <div className="text-[11.5px] tracking-widest uppercase text-red font-bold mb-2.5">Recognition</div>
          <h2 className="font-display font-semibold text-[30px] md:text-[36px] text-navy leading-tight">
            What winners receive
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prizes.map((p, i) => (
            <div key={i} className="bg-navy text-white rounded p-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gold/20 blur-xl" />
              <div className="font-display text-xl text-gold-light font-semibold relative">{p}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
