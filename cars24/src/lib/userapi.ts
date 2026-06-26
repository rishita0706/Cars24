const BASE_URL = "https://cars-24-clone-net-nextjs.onrender.com/api/UserAuth";

export const signup = async (
  email: string,
  password: string,
  userData: { fullName: string; phone: string }
) => {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, ...userData }),
  });
  if (!response.ok) {
    throw new Error("Failed to sign up");
  }
  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error("Failed to login");
  }
  return response.json();
};

export const getUserById = async (userId: string) => {
  const response = await fetch(`${BASE_URL}/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
};