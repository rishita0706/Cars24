import {
  Calendar,
  Fuel,
  Gauge,
  Plus,
  Settings,
  Shield,
  Upload,
  User,
  X,
} from "lucide-react";
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
  const [dragActive, setDragActive] = useState(false);

  const placeholderImages = [
    "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  ];

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

  // In a real implementation, this would handle file uploads
  const handleImageUpload = () => {
    // Simulating image upload by using placeholder images
    if (carDetails.images.length < 10) {
      const randomImage =
        placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      updateCarDetails({
        images: [...carDetails.images, randomImage],
      });
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...carDetails.images];
    updatedImages.splice(index, 1);
    updateCarDetails({ images: updatedImages });
  };

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
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

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => {
            handleDrag(e);
            handleImageUpload();
          }}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Drag photos here or</p>
          <button
            type="button"
            onClick={handleImageUpload}
            className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Files
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Add up to 10 photos (JPEG or PNG)
          </p>
        </div>
        {carDetails.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {carDetails.images.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-video rounded-lg overflow-hidden"
              >
                <img
                  src={image}
                  alt={`Car preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1.5 bg-red-600 text-white rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Cover Photo
                  </div>
                )}
              </div>
            ))}
            {carDetails.images.length < 10 && (
              <button
                type="button"
                onClick={handleImageUpload}
                className="aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-6 w-6 text-gray-400" />
              </button>
            )}
          </div>
        )}
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