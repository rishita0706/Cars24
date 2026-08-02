import { Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { formatINR } from "@/lib/Pricingapi";
import type { MaintenanceEstimate } from "@/lib/Maintenanceapi";

type Props = {
  estimate: MaintenanceEstimate;
};

const RISK_STYLES: Record<MaintenanceEstimate["riskLevel"], string> = {
  Low: "bg-green-50 border-green-100 text-green-700",
  Moderate: "bg-amber-50 border-amber-100 text-amber-700",
  High: "bg-red-50 border-red-100 text-red-700",
};

const RISK_ICON: Record<MaintenanceEstimate["riskLevel"], ReactNode> = {
  Low: <CheckCircle2 className="h-4 w-4" />,
  Moderate: <Wrench className="h-4 w-4" />,
  High: <AlertTriangle className="h-4 w-4" />,
};

export default function MaintenanceEstimateCard({ estimate }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-800">Maintenance Estimate</p>
        <span
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${RISK_STYLES[estimate.riskLevel]}`}
        >
          {RISK_ICON[estimate.riskLevel]}
          {estimate.riskLabel}
        </span>
      </div>

      <div className="flex items-baseline gap-4 mb-3">
        <div>
          <p className="text-lg font-bold text-gray-800">
            {formatINR(estimate.estimatedMonthlyCost)}
            <span className="text-xs font-normal text-gray-500">/month</span>
          </p>
          <p className="text-xs text-gray-500">
            ~{formatINR(estimate.estimatedAnnualCost)}/year
          </p>
        </div>
        <p className="text-xs text-gray-400">
          {estimate.carAgeYears} yr old · {estimate.kmDriven.toLocaleString("en-IN")} km driven
        </p>
      </div>

      {estimate.insights.length > 0 && (
        <ul className="space-y-1.5">
          {estimate.insights.map((insight) => (
            <li key={insight} className="text-xs text-gray-600 flex items-start gap-1.5">
              <span className="text-gray-400 mt-0.5">•</span>
              {insight}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-gray-400 mt-3">
        Estimate only, based on this car&apos;s age, mileage, and body type — not an inspection.
      </p>
    </div>
  );
}
