"use client";

import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import { useEffect } from "react";
import { Users, CalendarDays } from "lucide-react"; // Lucide icons

const centuryGothic = localFont({
  src: "../../../public/century-gothic/centurygothic.ttf",
  variable: "--font-century-gothic",
  weight: "400",
});

export default function AdminDashboard() {
  const router = useRouter();

  // Protect route: redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin"); // redirect to login
    }
  }, [router]);

  return (
    <div
      className={`min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 ${centuryGothic.variable}`}
      style={{ fontFamily: "var(--font-century-gothic)" }}
    >
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center text-black mb-10">
          Admin Dashboard
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Manage Users */}
          <div
            onClick={() => router.push("/admin/manage-users")}
            className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transition duration-300"
          >
            <Users size={64} strokeWidth={2} color="black" className="mb-4" />
            <h2 className="text-2xl font-semibold text-black">Manage Users</h2>
          </div>

          {/* Manage Bookings */}
          <div
            onClick={() => router.push("/admin/manage-bookings")}
            className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transition duration-300"
          >
            <CalendarDays
              size={64}
              strokeWidth={2}
              color="black"
              className="mb-4"
            />
            <h2 className="text-2xl font-semibold text-black">
              Manage Bookings
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
