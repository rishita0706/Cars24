'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const featuredCars = [
  {
    id: 1,
    title: "Tata Altroz facelift clear images leaked ahead of launch",
    summary: "See the first all-clear images of the new Altroz facelift",
    author: "Eddie Summerson",
    date: "1 week ago",
    comments: 5,
    image: "https://images.pexels.com/photos/2056220/pexels-photo-2056220.jpeg",
  },
  {
    id: 2,
    title: "Discounts on Volkswagen cars — Save up to ₹ 2.50 lakh",
    summary: "Top deals and discounts on Volkswagen models this month",
    author: "Samantha Bridges",
    date: "3 days ago",
    comments: 8,
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  },
  {
    id: 3,
    title: "Honda car Check out new arrivals for 2025",
    summary: "Check out the latest Honda models hitting the market",
    author: "Michael Scott",
    date: "5 days ago",
    comments: 3,
    image: "https://images.pexels.com/photos/248687/pexels-photo-248687.jpeg",
  },
  {
    id: 4,
    title: "Toyota to launch 3 new EVs by the end of 2025",
    summary: "Toyota accelerates its electric vehicle lineup expansion",
    author: "Jennifer Lee",
    date: "2 days ago",
    comments: 12,
    image: "https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg",
  },
  {
    id: 5,
    title: "Mahindra XUV700 gets new features and variant updates",
    summary: "Explore the new features added to the popular XUV700",
    author: "Rajesh Kumar",
    date: "6 days ago",
    comments: 9,
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  },
];

export default function FeaturedCars() {
  const [activeCars, setActiveCars] = useState(featuredCars.slice(0, 3));

  return (
    <div className="py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured articles</h2>
        <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeCars.map((car) => (
          <div key={car.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={car.image}
                alt={car.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
              <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white">
                <Heart className="h-4 w-4 text-gray-500 hover:text-red-500" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 text-black">{car.title}</h3>
              <div className="mb-3">
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {car.summary}
                </p>
                <Link href={`/blog/${car.id}`}>
                  <Button variant="link" className="px-0 text-blue-600 hover:text-blue-700 h-auto">
                    Read more
                  </Button>
                </Link>
              </div>
              <div className="flex items-center text-xs text-gray-500 border-t pt-3">
                <div className="h-6 w-6 rounded-full bg-gray-200 mr-2 flex-shrink-0 overflow-hidden">
                  <img 
                    src={`https://i.pravatar.cc/24?u=${car.id}`} 
                    alt={car.author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span>{car.author}</span>
                <span className="mx-2">•</span>
                <span>{car.date}</span>
                <span className="mx-2">•</span>
                <span>{car.comments} comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}