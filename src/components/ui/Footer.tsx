import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Investors", href: "/investors" },
  { name: "Press Kit", href: "/press" },
  { name: "Careers", href: "/careers" },
  { name: "News", href: "/news" },
  { name: "Sustainability", href: "/sustainability" },
];

const discoverLinks = [
  { name: "Buy used car", href: "/buy-used-car" },
  { name: "Sell used car", href: "/sell-used-car" },
  { name: "Used car valuation", href: "/valuation" },
  { name: "Service centers", href: "/service-centers" },
  { name: "Check vehicle details", href: "/vehicle-details" },
  { name: "Scrap your car", href: "/scrap-car" },
];

const supportLinks = [
  { name: "FAQs", href: "/faqs" },
  { name: "Security", href: "/security" },
  { name: "Contact us", href: "/contact" },
  { name: "Customer charter", href: "/customer-charter" },
  { name: "Terms & conditions", href: "/terms" },
];

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com" },
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Instagram, href: "https://instagram.com" },
  { icon: Youtube, href: "https://youtube.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
];
const Fotter = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center mb-2">
            <span className="bg-blue-600 text-white font-bold py-1 px-2 rounded-md text-lg">
              CARS
            </span>
            <span className="text-orange-500 font-bold text-lg">24</span>
          </div>
          <p className="text-sm text-gray-600">better drives, better lives</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              COMPANY
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              DISCOVER
            </h3>
            <ul className="space-y-3">
              {discoverLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              HELP & SUPPORT
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 pt-8">
          <div className="flex mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              © 2025 Cars24. All rights reserved.
            </p>
          </div>

          <div className="flex space-x-6 items-center">
            <span className="text-sm text-gray-500 mr-2">SOCIAL LINKS</span>
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">{link.icon.name}</span>
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 text-center">WE ARE GLOBAL</p>
          <div className="flex justify-center space-x-4 mt-2">
            <div className="flex items-center">
              <span className="inline-block h-4 w-6 rounded overflow-hidden mr-1">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                  alt="India flag"
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-xs text-gray-500">India</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block h-4 w-6 rounded overflow-hidden mr-1">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg"
                  alt="UAE flag"
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-xs text-gray-500">UAE</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Fotter;