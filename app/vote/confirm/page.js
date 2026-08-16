'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyVote } from '../../../lib/api';

// This is the page PAYSTACK_CALLBACK_URL (set on the backend) should point
// to. Paystack redirects the browser here with ?reference=... after the
// hosted checkout completes, and we poll our own /api/votes/verify/:reference
// as a fallback in case the webhook hasn't landed yet.
export default function VoteConfirmPage() {
  const params = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');
  const [status, setStatus] = useState('checking'); // checking | success | pending | failed | error
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      return;
    }

    let attempts = 0;
    let cancelled = false;

    const poll = async () => {
      attempts += 1;
      try {
        const data = await verifyVote(reference);
        if (cancelled) return;
        if (data.status === 'success') {
          setResult(data);
          setStatus('success');
          return;
        }
        if (data.status === 'failed') {
          setStatus('failed');
          return;
        }
        // still pending - webhook may not have landed yet, try a few more times
        if (attempts < 8) {
          setTimeout(poll, 1500);
        } else {
          setStatus('pending');
        }
      } catch (err) {
        if (!cancelled) setStatus('error');
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-navy/10 rounded-md p-9 text-center">
        {status === 'checking' && (
          <>
            <Spinner />
            <h1 className="font-display font-semibold text-xl text-navy mt-5 mb-2">Confirming your vote…</h1>
            <p className="text-[13.5px] text-gray-500">This only takes a moment while we verify with Paystack.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckIcon />
            <h1 className="font-display font-semibold text-xl text-navy mt-5 mb-2">Vote Confirmed</h1>
            <p className="text-[13.5px] text-gray-500 mb-6">
              {result?.quantity} vote{result?.quantity === 1 ? '' : 's'} counted. A receipt has been emailed to you.
            </p>
            <Link href="/#leaderboard" className="inline-block bg-gold text-navy px-6 py-3 rounded-sm font-bold text-sm hover:bg-gold-light">
              View Leaderboard
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <h1 className="font-display font-semibold text-xl text-navy mb-2">Still processing</h1>
            <p className="text-[13.5px] text-gray-500 mb-6">
              Paystack is still confirming this payment. It'll appear on the leaderboard automatically once done —
              no need to pay again. Reference: <span className="font-mono">{reference}</span>
            </p>
            <Link href="/" className="inline-block bg-navy text-white px-6 py-3 rounded-sm font-bold text-sm">
              Back to Home
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <h1 className="font-display font-semibold text-xl text-red mb-2">Payment Not Completed</h1>
            <p className="text-[13.5px] text-gray-500 mb-6">This transaction wasn't successful. No votes were charged.</p>
            <Link href="/#nominees" className="inline-block bg-navy text-white px-6 py-3 rounded-sm font-bold text-sm">
              Try Again
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="font-display font-semibold text-xl text-red mb-2">Something went wrong</h1>
            <p className="text-[13.5px] text-gray-500 mb-6">
              We couldn't confirm this transaction automatically. If you were charged, contact support with your
              reference and it'll be resolved manually.
            </p>
            <Link href="/#contact" className="inline-block bg-navy text-white px-6 py-3 rounded-sm font-bold text-sm">
              Contact Support
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="mx-auto w-12 h-12 border-4 border-navy/10 border-t-gold rounded-full animate-spin" />
  );
}

function CheckIcon() {
  return (
    <div className="mx-auto w-16 h-16 rounded-full bg-red/10 border-2 border-red flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A32638" strokeWidth="2.5">
        <path d="M4 12l5 5L20 6" />
      </svg>
    </div>
  );
}
