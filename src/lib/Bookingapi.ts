const BASE_URL = "https://cars-24-clone-net-nextjs.onrender.com/api/Booking";

export const createBooking = async (userid: string, Booking: any) => {
  const response = await fetch(`${BASE_URL}?userId=${userid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Booking),
  });
  return response.json();
};

export const getBookingbyid = async (id: string) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  return response.json();
};
export const getBookingbyuser = async (userId: string) => {
  const response = await fetch(`${BASE_URL}/user/${userId}/bookings`);
  return response.json();
};