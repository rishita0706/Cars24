import { AlertTriangle, CheckCircle, Plus, X } from "lucide-react";
import { features } from "process";
import React, { useState } from "react";
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
interface FeaturesFormProps {
  carDetails: CarDetails;
  updateCarDetails: (details: Partial<CarDetails>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const FeaturesForm: React.FC<FeaturesFormProps> = ({
  carDetails,
  updateCarDetails,
  nextStep,
  prevStep,
}) => {
  const [newFeature, setNewFeature] = useState("");
  const [newHighlight, setNewHighlight] = useState("");

  const isValid =
    carDetails.features.length > 0 || carDetails.highlights.length > 0;

  const addFeature = () => {
    if (newFeature.trim() && !carDetails.features.includes(newFeature.trim())) {
      updateCarDetails({
        features: [...carDetails.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...carDetails.features];
    updatedFeatures.splice(index, 1);
    updateCarDetails({ features: updatedFeatures });
  };

  const addHighlight = () => {
    if (
      newHighlight.trim() &&
      !carDetails.highlights.includes(newHighlight.trim())
    ) {
      updateCarDetails({
        highlights: [...carDetails.highlights, newHighlight.trim()],
      });
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    const updatedHighlights = [...carDetails.highlights];
    updatedHighlights.splice(index, 1);
    updateCarDetails({ highlights: updatedHighlights });
  };

  // Common suggested features and highlights
  const suggestedFeatures = [
    "Air Conditioning",
    "Power Steering",
    "Power Windows",
    "Anti-lock Braking System (ABS)",
    "Driver Airbag",
    "Passenger Airbag",
    "Automatic Climate Control",
    "Alloy Wheels",
    "Fog Lights",
    "Multi-function Steering Wheel",
    "Touch Screen",
    "Rear AC Vents",
  ];

  const suggestedHighlights = [
    "Single Owner",
    "No Accidents",
    "All Service Records Available",
    "Recently Serviced",
    "New Tires",
    "Excellent Condition",
    "Low Mileage",
    "Extended Warranty",
    "Non-Smoker Owner",
  ];
  return (
    <div className="space-y-8 py-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          Car Features & Highlights
        </h2>
        <p className="text-gray-600">
          Add important features and selling points of your car
        </p>

        {/* Features Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Car Features
          </h3>
          <p className="text-sm text-gray-500">
            Add notable features of your car that buyers should know about
          </p>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="e.g. Sunroof, Leather seats"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-1" /> Add Add
            </button>
          </div>

          {/* Suggested Features */}
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Suggested Features:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedFeatures.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => {
                    if (!carDetails.features.includes(feature)) {
                      updateCarDetails({
                        features: [...carDetails.features, feature],
                      });
                    }
                  }}
                  disabled={carDetails.features.includes(feature)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    carDetails.features.includes(feature)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>
          {/* Features List */}
          {carDetails.features.length > 0 && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Added Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {carDetails.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white px-3 py-1.5 rounded-full border border-gray-200"
                  >
                    <span className="text-sm text-gray-800">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-2 p-0.5 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Highlights Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" /> Car
            Highlights
          </h3>
          <p className="text-sm text-gray-500">
            Add key selling points or highlights of your car
          </p>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              placeholder="e.g. Single owner, Recently serviced"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addHighlight();
                }
              }}
            />
            <button
              type="button"
              onClick={addHighlight}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-1" /> Add
            </button>
          </div>

          {/* Suggested Highlights */}
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Suggested Highlights:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedHighlights.map((highlight) => (
                <button
                  key={highlight}
                  type="button"
                  onClick={() => {
                    if (!carDetails.highlights.includes(highlight)) {
                      updateCarDetails({
                        highlights: [...carDetails.highlights, highlight],
                      });
                    }
                  }}
                  disabled={carDetails.highlights.includes(highlight)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    carDetails.highlights.includes(highlight)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  {highlight}
                </button>
              ))}
            </div>
          </div>

          {/* Highlights List */}
          {carDetails.highlights.length > 0 && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Added Highlights
              </h4>
              <div className="flex flex-wrap gap-2">
                {carDetails.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white px-3 py-1.5 rounded-full border border-gray-200"
                  >
                    <span className="text-sm text-gray-800">{highlight}</span>
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="ml-2 p-0.5 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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

export default FeaturesForm;