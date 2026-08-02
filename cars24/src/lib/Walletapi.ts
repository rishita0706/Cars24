import { apiFetch } from "./apiClient";

export type WalletTransaction = {
  id: string;
  userId: string;
  type: "Earned" | "Redeemed";
  points: number;
  reason: string;
  createdAt: string;
};

export type Wallet = {
  balance: number;
  referralCode: string;
  transactions: WalletTransaction[];
};

export const getWallet = async (userId: string): Promise<Wallet> => {
  return apiFetch(`/api/Wallet/${userId}`);
};

export const redeemPoints = async (
  userId: string,
  points: number
): Promise<{ message: string; balance: number }> => {
  return apiFetch(`/api/Wallet/${userId}/redeem`, {
    method: "POST",
    body: JSON.stringify({ points }),
  });
};
