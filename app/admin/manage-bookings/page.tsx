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

export default function ManageBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("userToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const res = await fetch("/api/admin/bookings", {
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

  useEffect(() => {
    fetchBookings();
  }, []);

  // Delete booking handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    const token = localStorage.getItem("userToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Remove deleted booking from list
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete booking");
      }
    } catch {
      alert("Server error while deleting booking");
    }
  };

  const goBack = () => router.push("/dashboard");

  return (
    <div
      className={`min-h-screen bg-white flex flex-col ${centuryGothic.variable}`}
      style={{ fontFamily: "var(--font-century-gothic)" }}
    >
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-6 px-4 md:px-8 border-b border-gray-300">
        <h1 className="text-3xl font-extrabold text-black tracking-tight">
          Manage Bookings
        </h1>
        <button
          onClick={goBack}
          className="bg-black text-white px-6 cursor-pointer py-2 rounded-full font-semibold hover:bg-gray-800 transition duration-300"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto p-8">
        {loading ? (
          <p className="text-center text-black text-lg">Loading bookings...</p>
        ) : error ? (
          <p className="text-center text-red-700 font-semibold">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-black text-lg font-semibold">
            No bookings found.
          </p>
        ) : (
          <ul className="max-w-4xl mx-auto grid gap-4">
            {bookings.map((booking) => (
              <li
                key={booking._id}
                className="border border-black rounded-lg p-4 bg-white shadow-md flex justify-between items-center"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-lg text-black">{booking.room}</span>
                  <span className="font-mono text-sm text-gray-900">
                    {booking.date} | {booking.startTime} - {booking.endTime}
                  </span>
                  <span className="text-black">
                    <strong>Booked by:</strong> {booking.email}
                  </span>
                  {booking.usersInvolved.length > 0 && (
                    <span className="text-black">
                      <strong>Users involved:</strong> {booking.usersInvolved.join(", ")}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(booking._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
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
