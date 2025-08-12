"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";

const centuryGothic = localFont({
  src: "../../public/century-gothic/centurygothic.ttf",
  variable: "--font-century-gothic",
  weight: "400",
});

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // For error/success messages
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous message

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@warroom.in",
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
      } else {
        setMessage(data.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-white flex flex-col items-center justify-center px-4 ${centuryGothic.variable}`}
      style={{ fontFamily: "var(--font-century-gothic)" }}
    >
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-black mb-6 font-borel">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fixed Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value="admin@warroom.in"
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-full cursor-pointer font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>

          {/* Message below button */}
          {message && (
            <p className="text-sm text-black text-center mt-2">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
