const BASE_URL = "https://cars24-74k0.onrender.com/api/Appointment";

export const createAppointment = async (userid: string, appointment: any) => {
  const response = await fetch(`${BASE_URL}?userId=${userid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointment),
  });
  const data = await response.json();
  if (!response.ok) {
    // Backend returns a plain string like "User not found" for 400/404 errors
    const message = typeof data === "string" ? data : "Failed to book appointment";
    throw new Error(message);
  }
  return data;
};

export const getAppointmentbyid = async (id: string) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  return response.json();
};
export const getappointmentbyuser = async (userId:string) => {
  const response = await fetch(`${BASE_URL}/user/${userId}/appointments`);
  return response.json();
};

export const updateAppointment = async (id: string, appointment: any) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointment),
  });
  return response.json();
};

export const cancelAppointment = async (id: string, userId: string) => {
  const response = await fetch(`${BASE_URL}/${id}?userId=${userId}`, {
    method: "DELETE",
  });
  return response.ok;
};