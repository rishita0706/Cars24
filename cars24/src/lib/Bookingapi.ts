const BASE_URL = "http://localhost:5213/api/Booking";

export const createBooking = async (userid: string, Booking: any) => {
  const response = await fetch(`${BASE_URL}?userId=${userid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Booking),
  });
  const data = await response.json();
  if (!response.ok) {
    // Backend returns a plain string like "User not found" for 400/404 errors
    const message = typeof data === "string" ? data : "Failed to create booking";
    throw new Error(message);
  }
  return data;
};

export const getBookingbyid = async (id: string) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  return response.json();
};
export const getBookingbyuser = async (userId: string) => {
  const response = await fetch(`${BASE_URL}/user/${userId}/bookings`);
  return response.json();
};