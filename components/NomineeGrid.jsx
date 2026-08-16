'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getNominees } from '../lib/api';

export default function NomineeGrid({ categories, initialCategory, onVote }) {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory || '');
  const [state, setState] = useState('');
  const [sort, setSort] = useState('votes');

  useEffect(() => {
    setCategory(initialCategory || '');
  }, [initialCategory]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getNominees({ search, category, state, sort })
      .then((data) => {
        if (!cancelled) setNominees(data.nominees || []);
      })
      .catch(() => {
        if (!cancelled) setNominees([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, category, state, sort]);

  const states = [...new Set(nominees.map((n) => n.state).filter(Boolean))].sort();

  return (
    <section className="max-w-6xl mx-auto px-6 py-20" id="nominees">
      <div className="max-w-xl mb-8">
        <div className="text-[11.5px] tracking-widest uppercase text-red font-bold mb-2.5">
          Featured Nominees
        </div>
        <h2 className="font-display font-semibold text-[30px] md:text-[36px] text-navy leading-tight">
          Cast your vote
        </h2>
        <p className="text-gray-500 text-[15px] mt-3 leading-relaxed">
          $0.90 per vote, processed securely through Paystack.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5 mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search nominees by name…"
          className="flex-1 min-w-[180px] bg-white border border-navy/10 rounded-sm px-3.5 py-2.5 text-[13.5px] focus:outline-gold"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-navy/10 rounded-sm px-3.5 py-2.5 text-[13.5px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="bg-white border border-navy/10 rounded-sm px-3.5 py-2.5 text-[13.5px]"
        >
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-white border border-navy/10 rounded-sm px-3.5 py-2.5 text-[13.5px]"
        >
          <option value="votes">Most Voted</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading nominees…</p>
      ) : nominees.length === 0 ? (
        <p className="text-gray-400 text-sm">No nominees match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nominees.map((n) => (
            <NomineeCard key={n.id} nominee={n} onVote={onVote} />
          ))}
        </div>
      )}
    </section>
  );
}

function NomineeCard({ nominee, onVote }) {
  const catLabel = nominee.category_name?.replace('Best ', '').replace(' Award', '');

  return (
    <div className="bg-white border border-navy/10 rounded overflow-hidden hover:-translate-y-1 hover:shadow-[0_22px_40px_-22px_rgba(11,31,58,0.3)] transition-all">
      <div className="relative h-48">
        {nominee.photo_url && (
          <Image src={nominee.photo_url} alt={nominee.name} fill className="object-cover" />
        )}
        <div className="absolute top-3 left-3 bg-navy/85 text-gold-light text-[10.5px] tracking-wide uppercase font-bold px-2.5 py-1 rounded-sm">
          {catLabel}
        </div>
      </div>
      <div className="p-5 relative">
        <div className="stub-perf" />
        <h3 className="font-display font-semibold text-lg text-navy mt-2 mb-0.5">{nominee.name}</h3>
        {nominee.state && <div className="text-xs text-gray-400 mb-2.5">{nominee.state}</div>}
        {nominee.bio && <p className="text-[13px] text-gray-500 leading-relaxed mb-3.5 line-clamp-2">{nominee.bio}</p>}

        <div className="flex items-center justify-between pt-3 border-t border-dashed border-navy/10 mb-3.5">
          <div>
            <div className="font-mono font-semibold text-lg text-navy">
              {Number(nominee.votes_count).toLocaleString()}
            </div>
            <div className="text-[10.5px] tracking-wide uppercase text-gray-400">Total Votes</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onVote(nominee)}
            className="flex-1 bg-navy text-white rounded-sm py-2.5 font-bold text-[13px] hover:bg-red transition-colors"
          >
            Vote Now
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(window.location.origin + `/#nominees`)}
            title="Share profile"
            className="w-11 bg-paper border border-navy/10 rounded-sm text-navy hover:border-gold transition-colors"
          >
            ↗
          </button>
        </div>
      </div>
    </div>
  );
}
