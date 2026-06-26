const BASE_URL = "https://cars-24-clone-net-nextjs.onrender.com/api/Car";

type CarDetails = {
  title: string;
  images: string[];
  price: string;
  emi: string;
  location: string;
  specs: {
    year: number;
    km: string;
    fuel: string;
    transmission: string;
    owner: string;
    insurance: string;
  };
  features: string[];
  highlights: string[];
};
export const createCar = async (carDetails: CarDetails) => {
  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(carDetails),
  });
  return response.json();
};
export const getcarByid = async (id: string) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  return response.json();
};
export const getcarSummaries = async () => {
  const response = await fetch(`${BASE_URL}/summaries`);
  return response.json();
};