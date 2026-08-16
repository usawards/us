import Countdown from './Countdown';

export default function Hero({ deadline, totalVotes }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy to-navy-2 text-white">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-[1.15fr_0.85fr] gap-12 items-center relative">
        <div>
          <span className="inline-flex items-center gap-2 text-gold-light text-xs tracking-[0.18em] uppercase font-semibold border border-gold/40 px-3 py-1.5 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red shadow-[0_0_0_3px_rgba(163,38,56,0.25)]" />
            2026 Voting Now Open
          </span>
          <h1 className="font-display font-semibold text-[38px] md:text-[58px] leading-[1.03] mt-5 mb-4 tracking-tight">
            Recognizing<br />American <em className="italic text-gold-light font-medium">Excellence</em>
          </h1>
          <p className="text-[16.5px] leading-relaxed text-white/70 max-w-md mb-7">
            Cast your vote for the individuals and organizations shaping the nation — from bold
            new voices online to public servants earning their seat. Every vote is verified,
            every count is public.
          </p>
          <div className="flex gap-3.5 flex-wrap">
            <a
              href="#nominees"
              className="bg-gold text-navy px-7 py-4 rounded-sm font-bold text-[14.5px] hover:bg-gold-light transition-colors"
            >
              Vote Now →
            </a>
            <a
              href="#how"
              className="border border-white/30 px-6.5 py-4 rounded-sm font-semibold text-[14.5px] hover:border-gold-light hover:bg-white/5 transition-colors"
            >
              How Voting Works
            </a>
          </div>
        </div>

        <div className="bg-paper text-ink rounded-sm relative p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
          <div className="text-[11px] tracking-widest uppercase text-red font-bold mb-2.5">
            ● Voting Closes In
          </div>
          <div className="font-display font-semibold text-xl mb-4">2026 USEA Ballot</div>
          <Countdown deadline={deadline} />
          <div className="stub-perf mt-5 mb-4" style={{ borderTop: '1.5px dashed rgba(11,31,58,0.25)' }} />
          <div className="flex justify-between text-[12.5px] text-gray-500">
            <span>Total votes cast</span>
            <b className="font-mono text-navy">{totalVotes.toLocaleString()}</b>
          </div>
        </div>
      </div>
    </section>
  );
}
