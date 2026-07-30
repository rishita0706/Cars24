import { apiFetch } from "./apiClient";

const RESOURCE = "/api/UserAuth";

export const signup = async (
  email: string,
  password: string,
  userData: { fullName: string; phone: string }
) => {
  return apiFetch(`${RESOURCE}/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password, ...userData }),
  });
};

export const login = async (email: string, password: string) => {
  return apiFetch(`${RESOURCE}/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const getUserById = async (userId: string) => {
  return apiFetch(`${RESOURCE}/${userId}`);
};

export type NotificationPreferences = {
  appointmentAndBookingUpdates: boolean;
  bidUpdates: boolean;
  priceDrops: boolean;
  newMessages: boolean;
};

export const getNotificationPreferences = async (
  userId: string
): Promise<NotificationPreferences> => {
  return apiFetch(`${RESOURCE}/${userId}/notification-preferences`);
};

export const updateNotificationPreferences = async (
  userId: string,
  preferences: NotificationPreferences
): Promise<NotificationPreferences> => {
  return apiFetch(`${RESOURCE}/${userId}/notification-preferences`, {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
};

export const registerFcmToken = async (userId: string, token: string) => {
  return apiFetch(`${RESOURCE}/${userId}/fcm-token`, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
};

export const unregisterFcmToken = async (userId: string, token: string) => {
  return apiFetch(`${RESOURCE}/${userId}/fcm-token?token=${encodeURIComponent(token)}`, {
    method: "DELETE",
  });
};
