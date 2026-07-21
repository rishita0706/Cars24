import { apiFetch } from "./apiClient";

const RESOURCE = "/api/Booking";

export const createBooking = async (userid: string, Booking: any) => {
  return apiFetch(`${RESOURCE}?userId=${userid}`, {
    method: "POST",
    body: JSON.stringify(Booking),
  });
};

export const getBookingbyid = async (id: string) => {
  return apiFetch(`${RESOURCE}/${id}`);
};

export const getBookingbyuser = async (userId: string) => {
  return apiFetch(`${RESOURCE}/user/${userId}/bookings`);
};