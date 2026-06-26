import { Car } from "lucide-react";

const brands = [
  {
    name: "Honda",
    logo: "https://www.honda.com/-/media/Honda-Homepage/Images/Logos/svg/Honda_Power_Of_Dreams_22.svg",
  },
  {
    name: "BMW",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg",
  },
  {
    name: "Mercedes-Benz",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg",
  },
];

export default function CarBrands() {
  return (
    <div className="py-8 mt-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="h-px bg-gray-200 w-10" />
          <div className="px-4">
            <div className="flex items-center justify-center bg-orange-500 rounded-full p-2">
              <Car size={24} className="text-white" />
            </div>
          </div>
          <div className="h-px bg-gray-200 w-10" />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="flex flex-col items-center justify-center transition-transform hover:scale-105"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-12 w-auto object-contain"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="text-orange-500 font-medium hover:text-orange-600 transition-colors">
          View all cars
        </button>
      </div>
    </div>
  );
}