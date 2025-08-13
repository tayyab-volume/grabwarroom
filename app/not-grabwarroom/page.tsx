"use client";

import localFont from "next/font/local";
import { useState } from "react";
import { useRouter } from "next/navigation";

const centuryGothic = localFont({
  src: "../../public/century-gothic/centurygothic.ttf",
  variable: "--font-century-gothic",
  weight: "400",
});

export default function NotGrabWarRoom() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allowedIP = "180.151.238.126";

  const verifyNetwork = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      if (!res.ok) throw new Error("Failed to fetch IP");
      const data = await res.json();
      const userIP = data.ip;

      if (userIP !== allowedIP) {
        setError("You are not connected to the authorized GrabWarRoom network.");
      } else {
        // If IP matches, redirect to home or dashboard or wherever appropriate
        router.replace("/");
      }
    } catch (e) {
      console.error("Error checking network:", e);
      setError("Network check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center ${centuryGothic.variable}`}
      style={{ fontFamily: "var(--font-century-gothic)" }}
    >
      <h1 className="text-3xl font-extrabold text-black mb-4">Access Denied</h1>
      <p className="mt-2 text-black max-w-md mb-6">
        Sorry, this app can only be accessed from the authorized GrabWarRoom network.
        Please connect to the correct Wi-Fi to continue.
      </p>

      {error && <p className="text-red-600 mb-6">{error}</p>}

      <button
        onClick={verifyNetwork}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Try Again"}
      </button>
    </div>
  );
}
