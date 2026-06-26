import React, { useState } from "react";

import {
  Calendar,
  Clock,
  MapPin,
  Car,
  AlertCircle,
  Home,
  Building2,
} from "lucide-react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { createAppointment } from "@/lib/Appointmentapi";

const BookAppointmentPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    location: "",
    appointmentType: "branch_visit",
    notes: "",
  });

  const availableTimes = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Pleasde login to continue");
      return;
    }
    toast.error("Failed to list Appointmets");
    // Here you would typically send the data to your backend
    console.log("Appointment Data:", formData);
    // navigate('/booking-success');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">
                Schedule Car Inspection
              </h1>
              <p className="text-blue-100 mt-1">
                Book an appointment for your car inspection
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline-block w-4 h-4 mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline-block w-4 h-4 mr-2" />
                  Select Time
                </label>
                <select
                  name="scheduledTime"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a time slot</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline-block w-4 h-4 mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter inspection location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Appointment Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                      formData.appointmentType === "home_inspection"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="appointmentType"
                      value="home_inspection"
                      checked={formData.appointmentType === "home_inspection"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <Home className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Home Inspection
                      </p>
                      <p className="text-sm text-gray-500">We'll come to you</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                      formData.appointmentType === "branch_visit"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="appointmentType"
                      value="branch_visit"
                      checked={formData.appointmentType === "branch_visit"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">Branch Visit</p>
                      <p className="text-sm text-gray-500">Visit our branch</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requirements or notes for the inspection"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              {/* Requirements Notice */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Required Documents
                </h3>
                <ul className="mt-2 text-sm text-blue-700 space-y-1 ml-6 list-disc">
                  <li>Original Registration Certificate (RC)</li>
                  <li>Valid Insurance Papers</li>
                  <li>Service History Records (if available)</li>
                  <li>Valid ID Proof</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Confirm Appointment
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookAppointmentPage;