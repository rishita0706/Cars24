import { apiFetch } from "./apiClient";

const RESOURCE = "/api/Appointment";

export const createAppointment = async (userid: string, appointment: any) => {
  return apiFetch(`${RESOURCE}?userId=${userid}`, {
    method: "POST",
    body: JSON.stringify(appointment),
  });
};

export const getAppointmentbyid = async (id: string) => {
  return apiFetch(`${RESOURCE}/${id}`);
};

export const getappointmentbyuser = async (userId: string) => {
  return apiFetch(`${RESOURCE}/user/${userId}/appointments`);
};

export const updateAppointment = async (id: string, appointment: any) => {
  return apiFetch(`${RESOURCE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(appointment),
  });
};

export const cancelAppointment = async (id: string, userId: string) => {
  try {
    await apiFetch(`${RESOURCE}/${id}?userId=${userId}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
};
