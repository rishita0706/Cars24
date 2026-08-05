import { useEffect, useState } from "react";
import { Copy, Check, Gift, History, Loader2 } from "lucide-react";
import { getWallet, redeemPoints, type Wallet } from "@/lib/Walletapi";

type Props = {
  userId: string;
};

const REDEMPTION_BLOCK = 100;

export default function WalletCard({ userId }: Props) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(REDEMPTION_BLOCK);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadWallet = () => {
    getWallet(userId)
      .then(setWallet)
      .catch(() => setError("Could not load your wallet right now."));
  };

  useEffect(() => {
    loadWallet();
  }, [userId]);

  const referralLink =
    wallet && typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${wallet.referralCode}`
      : "";

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link - you can select and copy it manually.");
    }
  };

  const handleRedeem = async () => {
    if (!wallet) return;
    setRedeeming(true);
    setError(null);
    setMessage(null);
    try {
      const result = await redeemPoints(userId, redeemAmount);
      setMessage(`Redeemed ${redeemAmount} points for Rs.${redeemAmount} platform credit.`);
      loadWallet();
      void result;
    } catch (err: any) {
      setError(err?.message || "Could not redeem points right now.");
    } finally {
      setRedeeming(false);
    }
  };

  if (!wallet) {
    return (
      <div className="bg-white rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Wallet & Referrals</h2>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-sm text-gray-500">Loading...</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Wallet & Referrals</h2>

      {/* Balance */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-4 text-white mb-4">
        <p className="text-xs uppercase tracking-wide text-blue-100">Wallet Balance</p>
        <p className="text-2xl font-bold">{wallet.balance} pts</p>
        <p className="text-xs text-blue-100 mt-1">≈ Rs.{wallet.balance} platform credit</p>
      </div>

      {/* Referral sharing */}
      <div className="border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Invite friends, earn points</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          You get 500 points and your friend gets 250 when they sign up with your code and
          complete their first purchase or sale.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1.5 truncate">
            {wallet.referralCode}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline whitespace-nowrap"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>

      {/* Redeem */}
      <div className="border border-gray-200 rounded-lg p-4 mb-4">
        <p className="text-sm font-medium mb-2">Redeem points</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={REDEMPTION_BLOCK}
            step={REDEMPTION_BLOCK}
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(Number(e.target.value))}
            className="w-28 border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={handleRedeem}
            disabled={redeeming || wallet.balance < REDEMPTION_BLOCK}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {redeeming && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Redeem
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Redeem in blocks of {REDEMPTION_BLOCK} points ({REDEMPTION_BLOCK} pts = Rs.{REDEMPTION_BLOCK} credit).
        </p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        {message && <p className="text-xs text-green-600 mt-1">{message}</p>}
      </div>

      {/* Transaction history */}
      <div>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600"
        >
          <History className="h-4 w-4" />
          {showHistory ? "Hide" : "Show"} transaction history
        </button>
        {showHistory && (
          <ul className="mt-3 space-y-2 max-h-64 overflow-auto">
            {wallet.transactions.length === 0 && (
              <li className="text-xs text-gray-400">No transactions yet.</li>
            )}
            {wallet.transactions.map((t) => (
              <li key={t.id} className="flex justify-between items-start text-xs border-b border-gray-100 pb-2">
                <div>
                  <p className="text-gray-700">{t.reason}</p>
                  <p className="text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-medium shrink-0 ml-2 ${t.points > 0 ? "text-green-600" : "text-red-600"}`}>
                  {t.points > 0 ? "+" : ""}
                  {t.points}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
