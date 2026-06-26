import React, { useEffect, useState } from "react";

import {
  Calendar,
  Clock,
  MapPin,
  Car,
  FileText,
  PenTool as Tool,
  Shield,
  AlertCircle,
  Check,
  User,
  Settings,
  Fuel,
  Gauge,
  Mail,
  Phone,
  Landmark,
  CreditCard,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getBookingbyuser } from "@/lib/Bookingapi";

const PurchasedCarsPage = () => {
  // Mock purchased cars data matching MongoDB schema
  // const purchasedCars = [
  //   {
  //     id: "1",
  //     car: {
  //       id: "car1",
  //       title: "Honda City 2020 ZX MT PETROL",
  //       image:
  //         "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  //       price: "₹8,50,000",
  //     },
  //     bookingAmount: 25000,
  //     isRefunded: false,
  //     bookingStatus: "completed",
  //     deliveryStatus: "scheduled",
  //     deliveryDate: "2024-03-20",
  //     location: "Mumbai, Maharashtra",
  //     documents: {
  //       registration: true,
  //       insurance: true,
  //       loan: "In Process",
  //     },
  //     nextServiceDate: "2024-08-15",
  //     warranty: "Valid till 2026",
  //     specs: {
  //       km: "45,000",
  //       fuel: "Petrol",
  //       transmission: "Manual",
  //     },
  //     bookedAt: "2024-02-15",
  //   },
  //   {
  //     id: "2",
  //     car: {
  //       id: "car2",
  //       title: "Hyundai i20 2019 Asta",
  //       image:
  //         "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  //       price: "₹6,75,000",
  //     },
  //     bookingAmount: 20000,
  //     isRefunded: false,
  //     bookingStatus: "completed",
  //     deliveryStatus: "delivered",
  //     deliveryDate: "2024-02-01",
  //     location: "Mumbai, Maharashtra",
  //     documents: {
  //       registration: true,
  //       insurance: true,
  //       loan: "Approved",
  //     },
  //     nextServiceDate: "2024-07-01",
  //     warranty: "Valid till 2025",
  //     specs: {
  //       km: "38,000",
  //       fuel: "Petrol",
  //       transmission: "Manual",
  //     },
  //     bookedAt: "2024-01-10",
  //   },
  // ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLoanStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500";
      case "In Process":
        return "bg-yellow-500";
      case "Not Started":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchasedCars, setpurchasedCars] = useState<any>(null);
  useEffect(() => {
    const fetchpurchasedCars = async () => {
      try {
        if (user) {
          const car = await getBookingbyuser(user?.id);
          setpurchasedCars(car);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchpurchasedCars();
  }, [user]);
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }
  if (!purchasedCars) {
    return (
      <div className="text-center mt-10 text-red-500">Boooking not found.</div>
    );
  }
  const formatPrice = (price: string) => {
    return "₹ " + parseInt(price).toLocaleString("en-IN");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:py-0 print:px-0 text-black">
      <div className="mb-8 text-center print:hidden">
        <h1 className="text-3xl font-bold text-gray-800">
          Car Booking Confirmation
        </h1>
        <p className="text-gray-600">Thank you for your purchase!</p>
      </div>
      {purchasedCars.map((data: any) => (
        <div className="max-w-5xl mx-auto bg-gray-50 rounded-lg overflow-hidden shadow-xl">
          <div className="bg-blue-900 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <Check className="w-6 h-6 mr-2 text-green-400" />
                  <h1 className="text-2xl font-bold">Booking Confirmed</h1>
                </div>
                <p className="text-blue-200 mb-4">
                  Booking ID: {data.booking.id.slice(-8).toUpperCase()}
                </p>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-300" />
                    <span>{data.booking.preferredDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-300" />
                    <span>{data.booking.preferredTime}</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center">
                <Car className="w-12 h-12 text-blue-300" />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Car Image */}
                <div className="md:w-2/5 h-64 overflow-hidden rounded-lg">
                  <img
                    src={data.car.images[0]}
                    alt={data.car.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
                  />
                </div>

                {/* Car Details */}
                <div className="md:w-3/5">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {data.car.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{data.car.location}</p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">Price</p>
                      <p className="text-xl font-bold text-blue-900">
                        {formatPrice(data.car.price)}
                      </p>
                    </div>
                    {data.car.emi && (
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-sm text-amber-700">EMI from</p>
                        <p className="text-xl font-bold text-amber-900">
                          ₹ {parseInt(data.car.emi).toLocaleString("en-IN")}
                          /month
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Car Specifications */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Specifications
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-gray-700">
                        {data.car.specs.year}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Gauge className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-gray-700">
                        {data.car.specs.km} km
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Fuel className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-gray-700">
                        {data.car.specs.fuel}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-gray-700">
                        {data.car.specs.transmission}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-gray-700">
                        {data.car.specs.owner}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-gray-700">
                        {data.car.specs.insurance}
                      </span>
                    </div>
                  </div>

                  {/* Highlights and Features */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {data.car.highlights.map((highlight: any, index: any) => (
                      <span
                        key={`highlight-${index}`}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                    {data.car.features.map((feature: any, index: any) => (
                      <span
                        key={`feature-${index}`}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Customer Details
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-gray-800 font-medium">
                        {data.booking.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800 font-medium">
                        {data.booking.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800 font-medium">
                        {data.booking.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-800 font-medium">
                        {data.booking.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                  Payment Details
                </h2>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">Car Price</span>
                    <span className="font-semibold">
                      {formatPrice(data.car.price)}
                    </span>
                  </div>

                  {data.booking.downPayment && (
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600">Down Payment</span>
                      <span className="font-semibold">
                        {formatPrice(data.booking.downPayment)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-blue-900">
                        {formatPrice(data.car.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                    <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="text-gray-800 font-medium">
                        {data.booking.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                    <Landmark className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Financing</p>
                      <p className="text-gray-800 font-medium">{data.booking.loanStatus}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 p-4 text-center text-gray-500 text-sm">
            <p>
              Thank you for your purchase! For any queries, please contact our
              customer support.
            </p>
          </div>
        </div>
      ))}

      <div className="mt-8 text-center text-gray-500 text-sm print:hidden">
        <p>© 2025 Premium Auto Sales. All rights reserved.</p>
      </div>
    </div>
  );
};

export default PurchasedCarsPage;