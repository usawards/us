'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getLeaderboard } from '../lib/api';

export default function Leaderboard({ refreshKey }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getLeaderboard({ limit: 50 })
      .then((data) => setRows(data.leaderboard || []))
      .catch(() => setRows([]));
  }, [refreshKey]);

  const max = rows[0]?.votes_count || 1;

  return (
    <section className="max-w-6xl mx-auto px-6 py-20" id="leaderboard">
      <div className="max-w-xl mb-8">
        <div className="text-[11.5px] tracking-widest uppercase text-red font-bold mb-2.5">
          Live Rankings
        </div>
        <h2 className="font-display font-semibold text-[30px] md:text-[36px] text-navy leading-tight">
          Leaderboard
        </h2>
        <p className="text-gray-500 text-[15px] mt-3">Updates as votes are confirmed — no refresh needed.</p>
      </div>

      <div className="bg-white border border-navy/10 rounded overflow-hidden">
        <div className="grid grid-cols-[40px_44px_1fr_120px] sm:grid-cols-[52px_52px_1fr_160px_140px] items-center gap-3.5 px-5 py-3 bg-paper-2 text-[10.5px] tracking-wide uppercase text-gray-500 font-bold">
          <div>#</div><div></div><div>Nominee</div>
          <div className="hidden sm:block">Category</div>
          <div className="text-right">Votes</div>
        </div>
        {rows.map((n, i) => (
          <div
            key={n.id}
            className="grid grid-cols-[40px_44px_1fr_120px] sm:grid-cols-[52px_52px_1fr_160px_140px] items-center gap-3.5 px-5 py-3.5 border-t border-navy/10"
          >
            <div
              className={`font-mono font-bold ${
                i === 0 ? 'text-gold text-lg' : i === 1 ? 'text-gray-400 text-base' : i === 2 ? 'text-amber-700 text-base' : 'text-gray-400 text-sm'
              }`}
            >
              {n.rank}
            </div>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-paper">
              {n.photo_url && <Image src={n.photo_url} alt={n.name} fill className="object-cover" />}
            </div>
            <div>
              <div className="font-semibold text-sm text-navy">{n.name}</div>
              <div className="h-1 bg-paper-2 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-gold to-gold-light"
                  style={{ width: `${(n.votes_count / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="hidden sm:block text-xs text-gray-400">{n.category_name}</div>
            <div className="font-mono font-semibold text-navy text-right">
              {Number(n.votes_count).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
