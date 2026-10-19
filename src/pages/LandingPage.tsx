import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, ShieldCheck, X, Zap } from 'lucide-react';
import { OneShotLogo } from '../components/OneShotLogo';
import { DemoBadge } from '../components/ui/DemoBadge';
import { FAQ, FEATURES, FEE_ROWS, LANDING_STATS, SECURITY_POINTS, STEPS } from './landing/content';

const glass =
  'rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]';

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '#security', label: 'Security' },
  { href: '#fees', label: 'Fees' },
  { href: '#faq', label: 'FAQ' },
];

const Section: React.FC<{ id?: string; eyebrow?: string; title: string; children: React.ReactNode }> = ({
  id,
  eyebrow,
  title,
  children,
}) => (
  <section id={id} className="mx-auto max-w-6xl px-5 py-20 md:py-28 scroll-mt-20">
    {eyebrow && (
      <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-3">{eyebrow}</div>
    )}
    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-10 max-w-2xl">{title}</h2>
    {children}
  </section>
);

export const LandingPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-ink text-[#E7E9EE] font-sans antialiased overflow-x-hidden">
      {/* Background grid + glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[900px] rounded-full bg-accent/20 blur-[140px]" />
      </div>

      {/* Sticky nav */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <OneShotLogo className="w-7 h-7" />
            <span className="font-extrabold tracking-tight text-white">ONE SHOT</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-[#9AA1B2]">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-white transition">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/pulse"
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent hover:bg-accent-soft px-4 py-2 text-sm font-semibold text-white transition"
            >
              Launch App <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              className="md:hidden p-2 text-[#9AA1B2]"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="md:hidden border-t border-white/[0.06] px-5 py-3 flex flex-col gap-3 text-sm">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="text-[#C4C9D4]">
                {n.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pt-20 md:pt-28 pb-16 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[#9AA1B2] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Public testnet: non-custodial and 0% platform fee
          </div>
          <h1 className="animate-fade-up [animation-delay:80ms] text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
            Spot it first.
            <br />
            <span className="bg-gradient-to-r from-accent to-[#9EB0FF] bg-clip-text text-transparent">
              Trade it in one shot.
            </span>
          </h1>
          <p className="animate-fade-up [animation-delay:160ms] mt-6 max-w-2xl mx-auto text-base md:text-lg text-[#9AA1B2]">
            A fast trading terminal for new on-chain pairs: live discovery, one-click execution,
            and wallet tracking. You keep your keys.
          </p>
          <div className="animate-fade-up [animation-delay:240ms] mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/pulse"
              className="inline-flex items-center gap-2 rounded-xl bg-accent hover:bg-accent-soft px-6 py-3 font-semibold text-white transition shadow-[0_8px_40px_-8px_rgba(82,111,255,0.7)]"
            >
              <Zap className="w-4 h-4" /> Start trading
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] px-6 py-3 font-semibold text-white transition"
            >
              How it works
            </a>
          </div>

          {/* Terminal preview mock */}
          <div className={`${glass} animate-float mt-16 mx-auto max-w-4xl p-3 text-left`}>
            <div className="flex items-center gap-1.5 px-2 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <DemoBadge label="Preview" className="ml-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['New pairs', 'Final stretch', 'Migrated'].map((col, ci) => (
                <div key={col} className="rounded-xl bg-black/30 border border-white/[0.05] p-3">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#8A91A6] mb-3">{col}</div>
                  {[0, 1, 2].map((r) => (
                    <div key={r} className="flex items-center gap-2 py-2 border-t border-white/[0.04] first:border-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/60 to-fuchsia-500/40" />
                      <div className="flex-1">
                        <div className="h-2 w-16 rounded bg-white/20" />
                        <div className="h-1.5 w-10 rounded bg-white/10 mt-1.5" />
                      </div>
                      <span className={`font-mono text-[11px] ${(ci + r) % 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {(ci + r) % 2 ? '-' : '+'}
                        {(12.4 + ci * 7 + r * 3).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section aria-label="Stats" className="mx-auto max-w-6xl px-5">
          <div className={`${glass} grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.06]`}>
            {LANDING_STATS.map((s) => (
              <div key={s.label} className="p-5 md:p-6">
                <div className="font-mono text-2xl md:text-3xl font-semibold text-white">{s.value}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-[#8A91A6]">
                  {s.label}
                  {s.demo && <DemoBadge label="Demo" />}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Section id="features" eyebrow="Features" title="Everything you need to trade new pairs, in one terminal.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Link key={f.title} to={f.path} className={`${glass} group p-6 hover:border-accent/40 hover:-translate-y-0.5 transition`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-lg">{f.title}</h3>
                  <ArrowRight className="w-4 h-4 text-[#8A91A6] group-hover:text-accent group-hover:translate-x-0.5 transition" />
                </div>
                <p className="mt-2 text-sm text-[#9AA1B2] leading-relaxed">{f.body}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section id="how" eyebrow="How it works" title="From wallet to first trade in three steps.">
          <ol className="grid md:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <li key={s.n} className={`${glass} p-6`}>
                <div className="font-mono text-accent text-sm">{s.n}</div>
                <h3 className="mt-3 font-semibold text-white text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-[#9AA1B2] leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="security" eyebrow="Security" title="Your keys, your signature, every time.">
          <div className="grid sm:grid-cols-2 gap-4">
            {SECURITY_POINTS.map((p) => (
              <div key={p.title} className={`${glass} p-6 flex gap-4`}>
                <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-[#9AA1B2] leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="fees" eyebrow="Fees & rewards" title="Simple, transparent pricing.">
          {/* Mobile: stacked cards */}
          <div className="grid gap-3 md:hidden">
            {FEE_ROWS.map((r) => (
              <div key={r.tier} className={`${glass} p-5`}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{r.tier}</span>
                  <span className="font-mono text-emerald-400">{r.fee}</span>
                </div>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  <dt className="text-[#8A91A6]">Cashback</dt>
                  <dd className="text-[#C4C9D4]">{r.cashback}</dd>
                  <dt className="text-[#8A91A6]">Notes</dt>
                  <dd className="text-[#C4C9D4]">{r.note}</dd>
                </dl>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className={`${glass} hidden md:block overflow-x-auto`}>
            <table className="w-full text-sm">
              <thead className="text-left text-[#8A91A6] font-mono text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Tier</th>
                  <th className="p-4">Platform fee</th>
                  <th className="p-4">Cashback</th>
                  <th className="p-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {FEE_ROWS.map((r) => (
                  <tr key={r.tier} className="border-t border-white/[0.06]">
                    <td className="p-4 text-white font-medium">{r.tier}</td>
                    <td className="p-4 font-mono text-emerald-400">{r.fee}</td>
                    <td className="p-4 text-[#9AA1B2]">{r.cashback}</td>
                    <td className="p-4 text-[#9AA1B2]">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#8A91A6]">Network gas applies. Fees may change before mainnet; any change will be announced in advance.</p>
        </Section>

        <Section eyebrow="Testimonials" title="What traders say.">
          <div className="grid md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <figure key={i} className={`${glass} p-6 border-dashed`}>
                <DemoBadge label="Placeholder" />
                <blockquote className="mt-4 text-sm text-[#8A91A6] italic">
                  Placeholder: real testimonials will appear here once beta users opt in.
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                  <div className="h-2 w-24 rounded bg-white/10" />
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section id="faq" eyebrow="FAQ" title="Frequently asked questions.">
          <div className="space-y-2 max-w-3xl">
            {FAQ.map((f, i) => (
              <div key={f.q} className={`${glass} overflow-hidden`}>
                <button
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-white">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#8A91A6] transition ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-5 -mt-1 text-sm text-[#9AA1B2] leading-relaxed">{f.a}</p>}
              </div>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className={`${glass} relative overflow-hidden p-10 md:p-16 text-center`}>
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(82,111,255,0.25),transparent_65%)]" />
            <h2 className="relative text-3xl md:text-5xl font-extrabold tracking-tight text-white">Ready for your first shot?</h2>
            <p className="relative mt-4 text-[#9AA1B2]">Open the terminal and try it on testnet. No sign-up required.</p>
            <Link
              to="/pulse"
              className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-accent hover:bg-accent-soft px-7 py-3 font-semibold text-white transition"
            >
              Launch App <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-10 grid gap-8 md:grid-cols-[1fr_2fr]">
          <div>
            <div className="flex items-center gap-2">
              <OneShotLogo className="w-6 h-6" />
              <span className="font-extrabold text-white">ONE SHOT</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#8A91A6]">
              <Link to="/pulse" className="hover:text-white">App</Link>
              <a href="https://github.com/gsas-bit23/one-shot-terminal" className="hover:text-white" target="_blank" rel="noreferrer">GitHub</a>
              <a href="#faq" className="hover:text-white">FAQ</a>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-[#8A91A6]">
            <strong className="text-[#9AA1B2]">Risk disclosure:</strong> One Shot is experimental software running on a
            public testnet and is provided "as is" without warranty. Trading digital assets, especially newly launched
            tokens and leveraged products, is highly speculative and you can lose all of your funds. Data marked "Demo" or
            "Placeholder" is simulated. Nothing on this site is financial, investment or legal advice. You are solely
            responsible for your transactions and for complying with the laws of your jurisdiction.
          </p>
        </div>
        <div className="text-center text-[11px] text-[#8A91A6] pb-8">© {new Date().getFullYear()} One Shot</div>
      </footer>
    </div>
  );
};

export default LandingPage;
