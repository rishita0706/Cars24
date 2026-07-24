import { Search, MapPin } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useLocation } from "@/context/LocationContext";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { city } = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push("/buy-car");
      return;
    }
    router.push(`/buy-car?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="relative h-[500px] w-full">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg"
          alt="Happy woman driving car"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="mb-6">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">
            Welcome to{" "}
            <span className="inline-flex items-center">
              <span className="bg-blue-600 text-white font-bold py-1 px-2 rounded-md text-lg mr-1">
                CARS
              </span>
              <span className="text-orange-500 font-bold text-lg">24</span>
            </span>
          </h1>
          <div className="flex flex-col space-y-1">
            <h2 className="text-white text-3xl md:text-5xl font-bold">
              better drives,
            </h2>
            <h2 className="text-white text-3xl md:text-5xl font-bold">
              better lives.
            </h2>
          </div>
        </div>

        {/* Search bar and quick filters */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-4 md:p-6 max-w-3xl w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden px-3 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 transition-colors">
                <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={city ? `Search cars in ${city.name} (e.g. Swift, SUV, Petrol)` : "Search for your favorite cars"}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black text-sm bg-transparent"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-md"
            >
              Search Cars
            </Button>
          </div>

          {city && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <MapPin className="h-3.5 w-3.5 text-orange-500" />
              <span>Showing location-aware listings for <strong className="text-gray-800">{city.name}</strong></span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Hero;