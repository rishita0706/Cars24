import { Bell, Calendar, Car, LogOut, Mail, Settings, User } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";

const index = () => {
  const user = {
    id: "1",
    avatar_url: "https://github.com/shadcn.png",
    email: "abc@gmail.com",
    full_name: "John Doe",
    phone: "+1234567890",
    created_at: new Date().toISOString(),
  };
  const router = useRouter();

  return (
     <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="bg-blue-600 px-6 py-8">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {user?.full_name}
                  </h1>
                  <p className="text-blue-100">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">
                        Profile Information
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-medium">{user?.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{user?.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{user?.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Quick Actions</h2>
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-2 p-3 text-left rounded-lg hover:bg-gray-50">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => router.push("/bookings")}
                      className="w-full flex items-center space-x-2 p-3 text-left rounded-lg hover:bg-gray-50"
                    >
                      <Car className="w-5 h-5 text-gray-400" />
                      <span>My Cars</span>
                    </button>

                    <button
                      onClick={() => router.push("/appointments")}
                      className="w-full flex items-center space-x-2 p-3 text-left rounded-lg hover:bg-gray-50"
                    >
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>Appointments</span>
                    </button>

                    <button
                      className="w-full flex items-center space-x-2 p-3 text-left rounded-lg hover:bg-gray-50 text-red-600"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default index;