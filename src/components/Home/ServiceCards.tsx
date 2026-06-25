import Link from "next/link";
import { ChevronRight, Calendar, Percent, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: 1,
    title: "Drive home your dream car",
    description: "Choose from our wide range of certified used cars",
    icon: Calendar,
    color: "bg-blue-600",
    link: "/buy-car",
    linkText: "View all cars",
    features: [
      "7-day money back guarantee",
      "6-month warranty",
      "No paperwork hassle"
    ]
  },
  {
    id: 2,
    title: "Make your dreams real with a personal loan",
    description: "Quick approvals with flexible repayment options",
    icon: Percent,
    color: "bg-indigo-600",
    link: "/finance",
    linkText: "Apply now",
    features: [
      "Competitive interest rates",
      "No hidden charges",
      "Instant approvals"
    ]
  },
  {
    id: 3,
    title: "All your credit card options in one place",
    description: "Compare and apply for the best credit cards",
    icon: CreditCard,
    color: "bg-gray-800",
    link: "/credit-cards",
    linkText: "Apply now",
    features: [
      "Multiple card options",
      "Exclusive rewards",
      "Instant approval"
    ]
  }
];

export default function ServiceCards() {
  return (
    <div className="py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div 
            key={service.id}
            className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div className={`${service.color} px-6 py-8 text-white relative h-40`}>
              <service.icon className="h-8 w-8 mb-3" />
              <h3 className="text-xl font-bold mb-1">{service.title}</h3>
              <p className="text-sm opacity-90">{service.description}</p>
            </div>
            <div className="p-6 bg-white">
              <ul className="mb-4">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-center mb-2 text-sm text-black">
                    <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={service.link}>
                <Button variant="outline" className="w-full justify-between text-blue-500">
                  {service.linkText}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}