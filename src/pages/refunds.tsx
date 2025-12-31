import Head from "next/head";
import Link from "next/link";
import { ChevronLeft, Target } from "lucide-react";

export default function RefundsPage() {
  return (
    <>
      <Head>
        <title>Refund Policy | SignalCore CRM</title>
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
              Refund Policy
            </h1>
            <p className="text-slate-400 mb-8">
              Last Updated: December 30, 2025
            </p>

            <section className="mb-10 p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
              <h2 className="text-xl font-bold text-emerald-400 mb-4 uppercase tracking-wider text-sm">
                1. Professional Service Value
              </h2>
              <p>
                Due to the transactional nature of enterprise signal
                intelligence, SignalCore CRM fees are generally non-refundable
                once intelligence has been accessed or deployed.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-emerald-400 mb-4">
                2. Subscription Terms
              </h2>
              <p>
                Partners may modify or terminate their service tier via
                settings. Refunds for partial periods are evaluate based on data
                utilization metrics.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-emerald-400 mb-4">
                3. Partner Success
              </h2>
              <p>
                Our goal is your market dominance. If you have concerns
                regarding the value received, please coordinate with your
                SignalCore account strategist.
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
