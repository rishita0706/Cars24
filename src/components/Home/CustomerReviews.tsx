"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const reviews = [
  {
    id: 1,
    name: "Shreya",
    message: "Car was well serviced by Cars24 & Finance & Security Team for the support.",
    rating: 5,
    date: "15 Mar 2025",
    avatar: "https://i.pravatar.cc/48?img=26",
  },
  {
    id: 2,
    name: "Sushant Kumar",
    message: "Great place to buy cars! Supportive staff & plenty of options.",
    rating: 4,
    date: "10 Mar 2025",
    avatar: "https://i.pravatar.cc/48?img=12",
  },
  {
    id: 3,
    name: "Victoria",
    message: "Good app to buy a car ! The car inspection, delivery and payment process was smooth and hassle-free.",
    rating: 5,
    date: "5 Mar 2025",
    avatar: "https://i.pravatar.cc/48?img=5",
  },
];

export default function CustomerReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };
  
  const prevReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className="py-12">
      <div className="bg-gray-50 rounded-2xl py-8 px-6 md:px-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What motivates us</h2>
          <div className="flex items-center justify-center">
            <div className="text-4xl font-bold text-blue-600">4.5+</div>
            <div className="ml-3 text-left">
              <div className="font-medium">Average</div>
              <div className="text-gray-600">online rating</div>
            </div>
          </div>
          <div className="flex justify-center mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-4 w-4 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"}`} 
              />
            ))}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="flex overflow-hidden">
            {reviews.map((review, index) => (
              <div 
                key={review.id}
                className={`w-full flex-shrink-0 transition-all duration-300 ease-in-out transform ${
                  index === currentIndex ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute"
                }`}
                style={{ left: index === currentIndex ? 0 : "100%" }}
              >
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-start mb-4">
                    <img 
                      src={review.avatar}
                      alt={review.name}
                      className="h-12 w-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{review.name}</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="ml-auto text-xs text-gray-500">{review.date}</div>
                  </div>
                  <p className="text-gray-700">{review.message}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-6 space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevReview}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {reviews.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextReview}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}