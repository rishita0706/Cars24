import React, { useState } from "react";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { resetPassword } from "@/lib/userapi";
import { notifyError, notifySuccess } from "@/lib/notify";

const ResetPasswordPage = () => {
  const router = useRouter();
  const email = typeof router.query.email === "string" ? router.query.email : "";
  const token = typeof router.query.token === "string" ? router.query.token : "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notifyError(new Error("Passwords do not match"), {
        fallback: "Passwords do not match.",
      });
      return;
    }
    if (!email || !token) {
      notifyError(new Error("Missing reset link details"), {
        fallback: "This reset link looks incomplete. Please request a new one.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email, token, password);
      notifySuccess(res.message);
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      notifyError(err, { fallback: "Couldn't reset your password. Please try again." });
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
          Set a new password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {done ? (
            <p className="text-center text-sm text-gray-700">
              Your password has been updated. Redirecting you to sign in...
            </p>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!email || !token ? (
                <p className="text-sm text-red-600">
                  This reset link is missing information. Please request a new one from{" "}
                  <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    here
                  </Link>
                  .
                </p>
              ) : null}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm new password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Re-enter your new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !token}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading || !email || !token ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
