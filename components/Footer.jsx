export default function Footer() {
  return (
    <footer className="bg-navy text-white/60 px-6 pt-12 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between flex-wrap gap-7 pb-7 border-b border-white/10">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-9 h-9 rounded-full border border-gold flex items-center justify-center font-display font-semibold text-sm text-gold">US</div>
            <div className="font-display font-semibold text-[17px] tracking-wide">EXCELLENCE <span className="text-gold">AWARDS</span></div>
          </div>
          <div className="flex gap-6 flex-wrap text-[13px]">
            <a href="/terms" className="hover:text-gold-light">Terms of Service</a>
            <a href="/privacy" className="hover:text-gold-light">Privacy Policy</a>
            <a href="/accessibility" className="hover:text-gold-light">Accessibility</a>
          </div>
        </div>
        <div className="pt-5 text-xs flex justify-between flex-wrap gap-2.5">
          <span>© 2026 United States Excellence Awards. All rights reserved.</span>
          <span>Payments processed securely via Paystack.</span>
        </div>
      </div>
    </footer>
  );
}
