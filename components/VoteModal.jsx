'use client';

import { useState } from 'react';
import Image from 'next/image';
import { initiateVote } from '../lib/api';

const PRESETS = [10, 25, 50, 100];
const VOTE_PRICE = 0.9;

export default function VoteModal({ nominee, onClose }) {
  const [quantity, setQuantity] = useState(10);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!nominee) return null;

  const total = (quantity * VOTE_PRICE).toFixed(2);

  const handlePay = async () => {
    setError('');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email — your receipt and vote confirmation go there.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await initiateVote({
        nominee_id: nominee.id,
        quantity,
        email,
        name: name || undefined,
      });
      // Paystack's hosted checkout page presents Apple Pay / card itself,
      // based on your Paystack account's enabled channels + the visitor's
      // device. This redirect is the simplest, most reliable integration -
      // see the frontend README for the inline-popup alternative.
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err.message || 'Could not start payment. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-navy/55 backdrop-blur-sm flex items-center justify-center z-[100] p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-paper rounded-md max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-navy text-white p-5.5 px-6 flex gap-3.5 items-center">
          <div className="relative rounded-full overflow-hidden border-2 border-gold shrink-0" style={{ width: 52, height: 52 }}>
            {nominee.photo_url && <Image src={nominee.photo_url} alt={nominee.name} fill className="object-cover" />}
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">{nominee.name}</h3>
            <p className="text-xs text-white/65">{nominee.category_name}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/60 text-xl px-1">✕</button>
        </div>

        <div className="p-6">
          <div className="text-[11.5px] tracking-wide uppercase text-gray-500 font-bold mb-2.5">
            Number of Votes
          </div>
          <div className="flex gap-2 mb-3.5">
            {PRESETS.map((v) => (
              <button
                key={v}
                onClick={() => setQuantity(v)}
                className={`flex-1 bg-white border rounded-sm py-2.5 text-center font-mono font-semibold text-[13.5px] transition-colors ${
                  v === quantity ? 'border-gold bg-gold/10' : 'border-navy/10'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center border border-navy/10 rounded-sm overflow-hidden bg-white mb-5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 5))}
              className="w-11 h-11 bg-paper-2 font-bold text-lg text-navy"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 text-center font-mono text-[17px] font-semibold text-navy py-2"
            />
            <button
              onClick={() => setQuantity((q) => q + 5)}
              className="w-11 h-11 bg-paper-2 font-bold text-lg text-navy"
            >
              +
            </button>
          </div>

          <div className="space-y-3 mb-5">
            <input
              placeholder="Email — for your receipt"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-navy/10 rounded-sm px-3.5 py-2.5 text-[13.5px]"
            />
            <input
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-navy/10 rounded-sm px-3.5 py-2.5 text-[13.5px]"
            />
          </div>

          <div className="flex justify-between items-baseline bg-white border border-navy/10 rounded-sm px-4.5 py-4 mb-5">
            <div>
              <div className="text-[13px] text-gray-500">Total Amount</div>
              <div className="text-[11px] text-gray-400">{quantity} votes × ${VOTE_PRICE.toFixed(2)}</div>
            </div>
            <div className="font-mono text-2xl font-semibold text-navy">${total}</div>
          </div>

          {error && <div className="text-red text-[12.5px] mb-3">{error}</div>}

          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full bg-red text-white rounded font-bold text-[15px] py-4 hover:bg-red-dark transition-colors disabled:opacity-60"
          >
            {submitting ? 'Starting secure checkout…' : `Continue to Payment — $${total}`}
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-3">
            🔒 You'll choose Apple Pay or card on the next, secure screen — powered by Paystack.
          </p>
        </div>
      </div>
    </div>
  );
}
