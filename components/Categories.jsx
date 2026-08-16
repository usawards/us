'use client';

export default function Categories({ categories, onSelect }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20" id="categories">
      <div className="max-w-xl mb-10">
        <div className="text-[11.5px] tracking-widest uppercase text-red font-bold mb-2.5">
          Award Categories
        </div>
        <h2 className="font-display font-semibold text-[30px] md:text-[36px] text-navy leading-tight">
          Four categories. One national ballot.
        </h2>
        <p className="text-gray-500 text-[15px] mt-3 leading-relaxed">
          Nominees are grouped by category — filter the nominee gallery below or browse by
          category card.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((c, i) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.slug)}
            className="text-left bg-white border border-navy/10 rounded-sm p-6 hover:-translate-y-1 hover:shadow-[0_16px_30px_-18px_rgba(11,31,58,0.25)] hover:border-gold transition-all"
          >
            <div className="font-mono text-xs text-gold font-semibold">0{i + 1}</div>
            <h3 className="font-display font-semibold text-[17px] text-navy mt-3 mb-1.5">{c.name}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">{c.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
