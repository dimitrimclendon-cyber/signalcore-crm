import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  CreditCard,
  Target,
  Package,
  Check,
  Zap,
  Download,
  Calendar,
  ArrowRight,
  Crown,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    leads: 10,
    features: [
      "10 leads per month",
      "Phone & email included",
      "POC score access",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 249,
    leads: 30,
    popular: true,
    features: [
      "30 leads per month",
      "Phone & email included",
      "Full property intel",
      "Equipment age analysis",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    leads: 100,
    features: [
      "100 leads per month",
      "Exclusive territories",
      "Custom scoring",
      "API access",
      "Dedicated account manager",
    ],
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("professional");
  const [leadsUsed, setLeadsUsed] = useState(12);
  const [leadsTotal, setLeadsTotal] = useState(30);
  const [nextBillingDate, setNextBillingDate] = useState("January 15, 2025");

  const invoices = [
    { id: "INV-001", date: "Dec 15, 2024", amount: 249, status: "Paid" },
    { id: "INV-002", date: "Nov 15, 2024", amount: 249, status: "Paid" },
    { id: "INV-003", date: "Oct 15, 2024", amount: 249, status: "Paid" },
  ];

  return (
    <>
      <Head>
        <title>Intelligence Subscription | SignalCore</title>
      </Head>
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800/50 border-b border-slate-700/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <a className="text-slate-400 hover:text-white transition">
                    <Target className="w-6 h-6 text-emerald-500" />
                  </a>
                </Link>
                <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  Billing & Subscription
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Current Usage
                </h2>
                <p className="text-sm text-slate-400">
                  Your signal consumption for this billing period
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {leadsUsed} / {leadsTotal}
                </p>
                <p className="text-sm text-slate-400">Signals Deployed</p>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${(leadsUsed / leadsTotal) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-4 italic">
              Next billing cycle starts on {nextBillingDate}
            </p>
          </div>

          {/* Plans */}
          <h2 className="text-lg font-semibold text-white mb-4">Change Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl border p-6 transition ${
                  plan.id === currentPlan
                    ? "bg-emerald-500/10 border-emerald-500/50"
                    : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                } ${plan.popular ? "ring-2 ring-emerald-500/50" : ""}`}
              >
                {plan.popular && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded mb-3">
                    <Star className="w-3 h-3" /> Most Popular
                  </span>
                )}

                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-bold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <p className="text-sm text-emerald-400 mb-4">
                  {plan.leads} leads/month
                </p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-400"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.id === currentPlan
                      ? "bg-slate-700 text-slate-400 cursor-default"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                  disabled={plan.id === currentPlan}
                >
                  {plan.id === currentPlan ? "Current Plan" : "Switch Plan"}
                </button>
              </div>
            ))}
          </div>

          {/* Invoices */}
          <h2 className="text-lg font-semibold text-white mb-4">Invoices</h2>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                    Invoice
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-700/30">
                    <td className="px-6 py-4 text-white font-medium">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{invoice.date}</td>
                    <td className="px-6 py-4 text-white">${invoice.amount}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-white transition">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Method */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              Payment Method
            </h2>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-700 rounded-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      •••• •••• •••• 4242
                    </p>
                    <p className="text-sm text-slate-400">Expires 12/2025</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">
                  Update
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
