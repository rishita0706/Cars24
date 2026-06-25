import Link from "next/link";
import { Car } from "lucide-react";

const categories = [
  {
    name: "Hatchback",
    icon: Car,
    href: "/cars/hatchback",
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  },
  {
    name: "Sedan",
    icon: Car,
    href: "/cars/sedan",
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  },
  {
    name: "SUV",
    icon: Car,
    href: "/cars/suv",
    image: "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg",
  },
];

export default function CarCategories() {
  return (
    <div className="py-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by car type</h2>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="group relative flex flex-col items-center bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
          >
            <div className="mb-3">
              <category.icon className="h-12 w-12 text-blue-600" />
            </div>
            <span className="text-lg font-medium text-gray-900">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}