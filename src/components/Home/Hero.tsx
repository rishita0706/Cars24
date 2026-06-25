import { Search } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
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
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-4xl w-full">
          <div className="grid grid-cols-1 gap-4">
            {/* Search input */}
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <div className="pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for your favorite cars"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;