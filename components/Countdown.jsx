'use client';

import { useEffect, useState } from 'react';

function getParts(deadline) {
  const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    secs: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function Countdown({ deadline }) {
  const [parts, setParts] = useState(() => getParts(deadline));

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const units = [
    ['days', 'Days'],
    ['hours', 'Hrs'],
    ['mins', 'Min'],
    ['secs', 'Sec'],
  ];

  return (
    <div className="flex gap-2.5">
      {units.map(([key, label]) => (
        <div key={key} className="flex-1 text-center bg-white border border-navy/10 rounded-sm py-3 px-1">
          <div className="font-mono text-2xl font-semibold text-navy">
            {String(parts[key]).padStart(2, '0')}
          </div>
          <div className="text-[9.5px] tracking-widest uppercase text-gray-500 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}
