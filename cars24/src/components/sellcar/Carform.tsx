import React from "react";
import BasicDetailsForm from "./BasicDetailsForm";
import ImagesAndSpecsForm from "./ImagesAndSpecsForm";
import FeaturesForm from "./FeaturesForm";
import PricingForm from "./PricingForm";

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
interface CarFormProps {
  carDetails: CarDetails;
  updateCarDetails: (details: Partial<CarDetails>) => void;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}
const Carform: React.FC<CarFormProps> = ({
  carDetails,
  updateCarDetails,
  currentStep,
  nextStep,
  prevStep,
  handleSubmit,
}) => {
  const renderste = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicDetailsForm
            carDetails={carDetails}
            updateCarDetails={updateCarDetails}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <ImagesAndSpecsForm
            carDetails={carDetails}
            updateCarDetails={updateCarDetails}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <FeaturesForm
            carDetails={carDetails}
            updateCarDetails={updateCarDetails}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <PricingForm
            carDetails={carDetails}
            updateCarDetails={updateCarDetails}
            handleSubmit={handleSubmit}
            prevStep={prevStep}
          />
        );
      default:
        return null;
    }
  };
  console.log(currentStep);
  return <div className="w-full">{renderste()}</div>;
};

export default Carform;