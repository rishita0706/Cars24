import { MapPin, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
type CarDetails = {
  id: string;
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
interface BasicDetailsFormProps {
  carDetails: CarDetails;
  updateCarDetails: (details: Partial<CarDetails>) => void;
  nextStep: () => void;
}

const BasicDetailsForm: React.FC<BasicDetailsFormProps> = ({
  carDetails,
  updateCarDetails,
  nextStep,
}) => {
  const [isValid, setIsValid] = useState(false);
  useEffect(() => {
    setIsValid(!!carDetails.title && !!carDetails.location);
  }, [carDetails.title, carDetails.location]);
  const handletitlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCarDetails({ title: e.target.value });
  };
  const handlelocationchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCarDetails({ location: e.target.value });
  };
  const popularCities = [
    "New Delhi",
    "Mumbai",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
  ];
  return (
    <div className="space-y-6 py-4">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-1">Car Details</h2>
        <p className="text-gray-600">
          Let's start with the basics about your car
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Car Title
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="title"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Honda City 2020 ZX MT PETROL"
              value={carDetails.title}
              onChange={handletitlechange}
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Include make, model, variant, fuel type, and year for better
            visibility
          </p>
        </div>
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Car Location
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="location"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter city where the car is located"
              value={carDetails.location}
              onChange={handlelocationchange}
              required
            />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Popular Cities</p>
          <div className="flex flex-wrap gap-2">
            {popularCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => updateCarDetails({ location: city })}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  carDetails.location === city
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          disabled={!isValid}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            isValid
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default BasicDetailsForm;