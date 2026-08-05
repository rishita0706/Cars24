import {
  Calendar,
  Fuel,
  Gauge,
  Settings,
  Shield,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import ImageUploader from "./ImageUploader";
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
interface ImagesAndSpecsFormProps {
  carDetails: CarDetails;
  updateCarDetails: (details: Partial<CarDetails>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const ImagesAndSpecsForm: React.FC<ImagesAndSpecsFormProps> = ({
  carDetails,
  updateCarDetails,
  nextStep,
  prevStep,
}) => {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const { specs } = carDetails;
    const specsFilled =
      specs.year &&
      specs.km &&
      specs.fuel &&
      specs.transmission &&
      specs.owner &&
      specs.insurance;
    const hasImages = carDetails.images.length > 0;

    setIsValid(!!specsFilled && hasImages);
  }, [carDetails]);

  const handleSpecChange = (
    key: keyof CarDetails["specs"],
    value: string | number
  ) => {
    updateCarDetails({
      specs: {
        ...carDetails.specs,
        [key]: value,
      },
    });
  };

  const years = Array.from(
    { length: 25 },
    (_, i) => new Date().getFullYear() - i
  );
  const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "LPG"];
  const transmissions = ["Manual", "Automatic", "AMT", "CVT", "DCT"];
  const ownerOptions = [
    "1st Owner",
    "2nd Owner",
    "3rd Owner",
    "4th Owner or more",
  ];
  const insuranceOptions = ["Comprehensive", "Third Party", "Expired"];

  return (
    <div className="space-y-8 py-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          Car Images & Specifications
        </h2>
        <p className="text-gray-600">Add photos and details about your car</p>
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Car Photos
        </label>

        <ImageUploader
          images={carDetails.images}
          onChange={(images) => updateCarDetails({ images })}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Car Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Year */}
          <div>
            <label
              htmlFor="year"
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <Calendar className="h-4 w-4 mr-1 text-gray-500" /> Manufacturing
              Year
            </label>
            <select
              id="year"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={carDetails.specs.year}
              onChange={(e) =>
                handleSpecChange("year", parseInt(e.target.value))
              }
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          {/* KM Driven */}
          <div>
            <label
              htmlFor="km"
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <Gauge className="h-4 w-4 mr-1 text-gray-500" /> KM Driven
            </label>
            <input
              type="text"
              id="km"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 45,000"
              value={carDetails.specs.km}
              onChange={(e) => handleSpecChange("km", e.target.value)}
            />
          </div>

          {/* Fuel Type */}
          <div>
            <label
              htmlFor="fuel"
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <Fuel className="h-4 w-4 mr-1 text-gray-500" /> Fuel Type
            </label>
            <select
              id="fuel"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={carDetails.specs.fuel}
              onChange={(e) => handleSpecChange("fuel", e.target.value)}
            >
              <option value="">Select Fuel Type</option>
              {fuelTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label
              htmlFor="transmission"
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <Settings className="h-4 w-4 mr-1 text-gray-500" /> Transmission
            </label>
            <select
              id="transmission"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={carDetails.specs.transmission}
              onChange={(e) => handleSpecChange("transmission", e.target.value)}
            >
              <option value="">Select Transmission</option>
              {transmissions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Owner */}
          <div>
            <label
              htmlFor="owner"
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <User className="h-4 w-4 mr-1 text-gray-500" /> Owner
            </label>
            <select
              id="owner"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={carDetails.specs.owner}
              onChange={(e) => handleSpecChange("owner", e.target.value)}
            >
              <option value="">Select Owner</option>
              {ownerOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Insurance */}
          <div>
            <label
              htmlFor="insurance"
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <Shield className="h-4 w-4 mr-1 text-gray-500" /> Insurance
            </label>
            <select
              id="insurance"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={carDetails.specs.insurance}
              onChange={(e) => handleSpecChange("insurance", e.target.value)}
            >
              <option value="">Select Insurance</option>
              {insuranceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
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

export default ImagesAndSpecsForm;