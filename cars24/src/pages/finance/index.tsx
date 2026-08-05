import React, { useMemo, useState } from "react";
import { Zap, TrendingDown, ShieldCheck, IndianRupee } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const infoCards = [
  {
    icon: Zap,
    title: "Instant Loan",
    description: "Get pre-approved in minutes with minimal paperwork.",
    accent: "bg-blue-50 text-blue-600",
  },
  {
    icon: TrendingDown,
    title: "Lowest Interest",
    description: "Rates starting at 9.5% p.a. from our partner banks.",
    accent: "bg-green-50 text-green-600",
  },
  {
    icon: ShieldCheck,
    title: "Quick Approval",
    description: "90% of applications approved within 24 hours.",
    accent: "bg-orange-50 text-orange-600",
  },
];

const FinancePage = () => {
  const [loanAmount, setLoanAmount] = useState(800000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(9.5);
  const [tenureYears, setTenureYears] = useState(5);

  const principal = Math.max(loanAmount - downPayment, 0);

  const { emi, totalInterest, totalPayment } = useMemo(() => {
    const monthlyRate = interestRate / 12 / 100;
    const months = tenureYears * 12;

    if (principal <= 0 || monthlyRate <= 0 || months <= 0) {
      return { emi: 0, totalInterest: 0, totalPayment: 0 };
    }

    const factor = Math.pow(1 + monthlyRate, months);
    const monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
    const total = monthlyEmi * months;

    return {
      emi: monthlyEmi,
      totalInterest: total - principal,
      totalPayment: total,
    };
  }, [principal, interestRate, tenureYears]);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Car Finance</h1>
          <p className="text-gray-600 mb-8">
            Work out your monthly EMI and explore financing options for your next car.
          </p>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {infoCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${card.accent}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{card.description}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Calculator inputs */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">EMI Calculator</h2>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="loanAmount" className="text-sm font-medium text-gray-700">
                      Car Price
                    </label>
                    <span className="text-sm font-semibold text-gray-900">{formatINR(loanAmount)}</span>
                  </div>
                  <Slider
                    id="loanAmount"
                    min={100000}
                    max={5000000}
                    step={10000}
                    value={[loanAmount]}
                    onValueChange={(v) => setLoanAmount(v[0])}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>₹1L</span>
                    <span>₹50L</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="downPayment" className="text-sm font-medium text-gray-700 mb-2 block">
                    Down Payment
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="downPayment"
                      type="number"
                      min={0}
                      max={loanAmount}
                      value={downPayment}
                      onChange={(e) =>
                        setDownPayment(Math.min(Number(e.target.value) || 0, loanAmount))
                      }
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="interestRate" className="text-sm font-medium text-gray-700">
                      Interest Rate (per annum)
                    </label>
                    <span className="text-sm font-semibold text-gray-900">{interestRate.toFixed(1)}%</span>
                  </div>
                  <Slider
                    id="interestRate"
                    min={7}
                    max={16}
                    step={0.1}
                    value={[interestRate]}
                    onValueChange={(v) => setInterestRate(v[0])}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>7%</span>
                    <span>16%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="tenure" className="text-sm font-medium text-gray-700">
                      Loan Duration
                    </label>
                    <span className="text-sm font-semibold text-gray-900">
                      {tenureYears} {tenureYears === 1 ? "year" : "years"}
                    </span>
                  </div>
                  <Slider
                    id="tenure"
                    min={1}
                    max={7}
                    step={1}
                    value={[tenureYears]}
                    onValueChange={(v) => setTenureYears(v[0])}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 yr</span>
                    <span>7 yrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* EMI output */}
            <div className="lg:col-span-2 bg-blue-600 rounded-xl shadow-sm p-6 text-white flex flex-col justify-between">
              <div>
                <p className="text-sm text-blue-100 uppercase tracking-wide font-medium">
                  Your Monthly EMI
                </p>
                <p className="text-4xl font-bold mt-2">{formatINR(Math.round(emi))}</p>
                <p className="text-sm text-blue-100 mt-1">for {tenureYears * 12} months</p>
              </div>

              <div className="mt-8 space-y-3 border-t border-blue-500 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Loan Amount</span>
                  <span className="font-medium">{formatINR(principal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Total Interest</span>
                  <span className="font-medium">{formatINR(Math.round(totalInterest))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Total Payment</span>
                  <span className="font-medium">{formatINR(Math.round(totalPayment))}</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full bg-white text-blue-600 font-semibold py-2.5 rounded-md hover:bg-blue-50 transition-colors"
              >
                Apply for Finance
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            EMI figures are indicative and based on reducing-balance interest. Actual offers depend on
            your credit profile and the lending partner&apos;s terms.
          </p>
        </div>
      </main>
    </div>
  );
};

export default FinancePage;
