import Head from "next/head";
import Link from "next/link";
import { ChevronLeft, Target } from "lucide-react";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | SignalCore CRM</title>
      </Head>
      <div className="min-h-screen bg-slate-900 text-slate-200">
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" legacyBehavior>
              <a className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                <Target className="w-6 h-6 text-emerald-400" />
                Signal<span className="text-emerald-400">Core</span>
              </a>
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12">
          <Link href="/login" legacyBehavior>
            <a className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 group">
              <ChevronLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Login
            </a>
          </Link>

          <article className="prose prose-invert max-w-none">
            <h1 className="text-4xl font-black text-white mb-8">
              Privacy Policy
            </h1>
            <p className="text-slate-400 mb-8">
              Last Updated: December 30, 2025
            </p>

            <section className="mb-10 p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
              <h2 className="text-xl font-bold text-emerald-400 mb-4 uppercase tracking-wider text-sm">
                1. Data Integrity
              </h2>
              <p>
                SignalCore CRM platform prioritizes the security of enterprise
                data and the integrity of the market signals provided. This
                policy details our commitment to your privacy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-emerald-400 mb-4">
                2. Professional Intelligence Handling
              </h2>
              <p>
                We process professional intelligence including property
                ownership and equipment data. This data is handled in accordance
                with professional security standards and Washington public
                records laws.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-emerald-400 mb-4">
                3. Security Infrastructure
              </h2>
              <p>
                All activity within the CRM is encrypted and monitored for
                security. We utilize advanced threat detection to ensure the
                SignalCore Intelligence Hub remains a secure environment for
                enterprise strategy.
              </p>
            </section>
          </article>
        </main>

        <footer className="border-t border-slate-800 py-12 bg-slate-950">
          <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-500">
            <p>&copy; 2025 SignalCore Data. Intelligence Hub.</p>
            <div className="flex justify-center gap-6 mt-4">
              <Link href="/terms" legacyBehavior>
                <a className="hover:text-white transition">Terms</a>
              </Link>
              <Link href="/privacy" legacyBehavior>
                <a className="hover:text-white transition">Privacy</a>
              </Link>
              <Link href="/refunds" legacyBehavior>
                <a className="hover:text-white transition">Refunds</a>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
