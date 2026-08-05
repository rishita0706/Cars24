import React, { useState } from "react";
import {
  Droplets,
  Sparkles,
  Wrench,
  ShieldCheck,
  CircleDot,
  Battery,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  icon: React.ElementType;
  accent: string;
};

const services: Service[] = [
  {
    id: "car-wash",
    title: "Car Wash",
    description: "Exterior foam wash and interior vacuuming to leave your car spotless.",
    price: 499,
    duration: "45 mins",
    icon: Droplets,
    accent: "from-sky-500 to-blue-600",
  },
  {
    id: "detailing",
    title: "Detailing",
    description: "Deep interior and exterior detailing for a showroom-fresh finish.",
    price: 2999,
    duration: "3-4 hrs",
    icon: Sparkles,
    accent: "from-purple-500 to-indigo-600",
  },
  {
    id: "dent-repair",
    title: "Dent Repair",
    description: "Paintless dent removal for minor dings and dents.",
    price: 1499,
    duration: "1-2 hrs",
    icon: Wrench,
    accent: "from-orange-500 to-amber-600",
  },
  {
    id: "ceramic-coating",
    title: "Ceramic Coating",
    description: "Long-lasting protective coating that guards against scratches and UV damage.",
    price: 7999,
    duration: "1 day",
    icon: ShieldCheck,
    accent: "from-emerald-500 to-teal-600",
  },
  {
    id: "wheel-alignment",
    title: "Wheel Alignment",
    description: "Computerized 4-wheel alignment and balancing for a smoother ride.",
    price: 899,
    duration: "1 hr",
    icon: CircleDot,
    accent: "from-slate-500 to-gray-700",
  },
  {
    id: "battery-replacement",
    title: "Battery Replacement",
    description: "Genuine battery replacement with free doorstep installation.",
    price: 4499,
    duration: "30 mins",
    icon: Battery,
    accent: "from-red-500 to-rose-600",
  },
  {
    id: "insurance-renewal",
    title: "Insurance Renewal",
    description: "Hassle-free renewal with the best rates from top insurers.",
    price: 0,
    duration: "Same day",
    icon: FileCheck,
    accent: "from-cyan-500 to-blue-500",
  },
];

const formatINR = (value: number) =>
  value === 0
    ? "Get a quote"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);

const ServicesPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string | null>(null);

  const handleBook = (service: Service) => {
    if (!user) {
      toast.error("Please login to book a service.");
      router.push("/login");
      return;
    }
    setBookingId(service.id);
    setTimeout(() => {
      toast.success(`${service.title} request received. Our team will call you shortly.`);
      setBookingId(null);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Car Services</h1>
          <p className="text-gray-600 mb-8">
            Doorstep car care from trusted professionals - book in a few clicks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className={`bg-gradient-to-br ${service.accent} p-6 text-white`}>
                  <service.icon className="h-8 w-8 mb-3" />
                  <h3 className="text-xl font-bold mb-1">{service.title}</h3>
                  <p className="text-sm opacity-90">{service.description}</p>
                </div>
                <div className="p-6 bg-white flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatINR(service.price)}
                    </span>
                    <span className="text-xs text-gray-500">{service.duration}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBook(service)}
                    disabled={bookingId === service.id}
                    className={`mt-auto w-full py-2.5 rounded-md font-medium transition-colors ${
                      bookingId === service.id
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {bookingId === service.id ? "Booking..." : "Book Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Already have an appointment?{" "}
            <Link href="/appointments" className="text-blue-600 font-medium hover:underline">
              View your appointments
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default ServicesPage;
