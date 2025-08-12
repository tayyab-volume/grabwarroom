"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const centuryGothic = localFont({
  src: "../../public/century-gothic/centurygothic.ttf",
  variable: "--font-century-gothic",
  weight: "400",
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(""); // for showing errors or success
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save token in localStorage for admin access
        localStorage.setItem("userToken", data.token);
        setMessage("Login successful! Redirecting...");

        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          window.location.href = "/dashboard"; // or your dashboard path
        }, 1000);
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (error) {
      setMessage("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-white flex flex-col ${centuryGothic.variable}`}
      style={{ fontFamily: "var(--font-century-gothic)" }}
    >
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-6 px-4 md:px-8 border-b border-gray-200">
        <div className="text-3xl font-extrabold text-black tracking-tight font-borel">
          GrabWarRoom
        </div>
        <nav>
          <Link href="/">
            <button className="bg-black text-white cursor-pointer px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition duration-300">
              Home
            </button>
          </Link>
        </nav>
      </header>

      {/* Login Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-200"
        >
          <h1 className="text-3xl md:text-3xl text-center leading-10 font-bold text-black mb-8 font-borel">
            Login to Book Your <br />{" "}
            <span className="bg-gray-700 text-white">&nbsp; War Room &nbsp;</span>
          </h1>

          {message && <p className="mb-4 text-center text-black">{message}</p>}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@volume.in"
              required
            />
          </div>

          <div className="mb-8 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-[43px] text-gray-500 hover:text-black"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-full font-bold text-lg hover:bg-gray-800 transition duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Don’t have an account? Contact the admin to get access.
        </p>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-6 text-center">
        <p className="text-sm">
          &copy; 2025{" "}
          <a
            href="https://volume.in"
            className="underline hover:text-gray-300 transition"
          >
            Volume.in
          </a>{" "}
          - Creative Ad Agency Delhi NCR | Branding & Advertising | Marketing
        </p>
      </footer>
    </div>
  );
}
