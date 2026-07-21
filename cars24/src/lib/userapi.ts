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
