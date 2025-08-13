"use client";

import localFont from "next/font/local";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const centuryGothic = localFont({
  src: "../../../public/century-gothic/centurygothic.ttf",
  variable: "--font-century-gothic",
  weight: "400",
});

interface Booking {
  _id: string;
  email: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  usersInvolved: string[];
}

export default function TodaysSchedulePage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        } else {
          const data = await res.json();
          setError(data.error || "Failed to fetch bookings");
        }
      } catch {
        setError("Server error while fetching bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  const goBack = () => router.push("/dashboard");

  return (
    <div
      className={`min-h-screen bg-white flex flex-col ${centuryGothic.variable}`}
      style={{ fontFamily: "var(--font-century-gothic)" }}
    >
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-6 px-4 md:px-8 border-b border-gray-200">
        <h1 className="text-3xl font-extrabold text-black tracking-tight">
          Today&apos;s Schedule
        </h1>
        <button
          onClick={goBack}
          className="bg-black text-white px-6 cursor-pointer py-2 rounded-full font-semibold hover:bg-gray-800 transition duration-300"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto mt-5">
        {loading ? (
          <p className="text-center text-black text-lg">Loading bookings...</p>
        ) : error ? (
          <p className="text-center text-red-700 font-semibold">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-black text-lg font-semibold">
            No bookings for today.
          </p>
        ) : (
          <ul className="w-[60vw] max-w-[80vw] mx-auto space-y-2">
            {bookings.map((booking) => (
              <li
                key={booking._id}
                className="flex items-center justify-start gap-4"
              >
                <span className="font-mono text-md text-gray-900 w- text-center">
                  {booking.startTime} - {booking.endTime}
                </span>
                <div className="border border-black rounded-lg px-4 py-2 bg-white flex flex-1 items-center gap-4">
                  <span className="font-bold text-black w-36">
                    {booking.room}
                  </span>
                  <span className="text-black flex-1 truncate">
                    <strong>Booked by:</strong> {booking.email}
                  </span>
                  {booking.usersInvolved.length > 0 && (
                    <span className="text-black flex-1">
                      <strong>Users involved:</strong>{" "}
                      {booking.usersInvolved.join(", ")}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-black text-white py-6 text-center">
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
