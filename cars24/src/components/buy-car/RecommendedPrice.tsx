import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { formatINR, type PriceRecommendation } from "@/lib/Pricingapi";

type Props = {
  recommendation: PriceRecommendation;
};

export default function RecommendedPrice({ recommendation }: Props) {
  const [open, setOpen] = useState(false);
  const { recommendedPrice, adjustmentPercent, factors = [] } = recommendation;

  if (!recommendedPrice) return null;

  const isUp = adjustmentPercent > 0;
  const isFlat = adjustmentPercent === 0;

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">
            Recommended Price
          </p>
          <p className="text-xl font-bold text-blue-900">
            {formatINR(recommendedPrice)}
          </p>
        </div>

        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            isFlat ? "text-gray-500" : isUp ? "text-green-600" : "text-red-600"
          }`}
        >
          {isFlat ? (
            <Minus className="h-4 w-4" />
          ) : isUp ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {adjustmentPercent > 0 ? "+" : ""}
          {adjustmentPercent.toFixed(1)}%
        </div>
      </div>

      {factors.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 text-xs text-blue-700 hover:underline"
          >
            Why? <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <ul className="mt-2 space-y-1.5">
              {factors.map((f) => (
                <li key={f.name} className="text-xs text-gray-600 flex justify-between gap-3">
                  <span>
                    <span className="font-medium text-gray-700">{f.name}:</span> {f.reason}
                  </span>
                  <span
                    className={`shrink-0 font-medium ${
                      f.percent > 0 ? "text-green-600" : f.percent < 0 ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    {f.percent > 0 ? "+" : ""}
                    {f.percent}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
