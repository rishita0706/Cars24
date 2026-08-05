import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { forgotPassword } from "@/lib/userapi";
import { notifyError, notifySuccess } from "@/lib/notify";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      notifySuccess(res.message);
      setSubmitted(true);

      if (res.devResetToken) {
        setTimeout(() => {
          router.push(
            `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
              res.devResetToken as string
            )}`
          );
        }, 1200);
      }
    } catch (err) {
      notifyError(err, { fallback: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="-m-1.5 p-1.5">
            <div className="flex items-center">
              <span className="bg-blue-600 text-white font-bold py-1 px-2 rounded-md text-lg">
                CARS
              </span>
              <span className="text-orange-500 font-bold text-lg">24</span>
            </div>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email and we&apos;ll help you reset it.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-700">
                If an account exists for <span className="font-medium">{email}</span>, reset
                instructions are on their way.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Sending..." : "Send reset instructions"}
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
