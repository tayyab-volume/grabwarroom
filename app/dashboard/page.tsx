"use client";

import localFont from "next/font/local";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const centuryGothic = localFont({
  src: "../../public/century-gothic/centurygothic.ttf",
  variable: "--font-century-gothic",
  weight: "400",
});

interface UserTokenPayload {
  id: string; // or email depending on your JWT payload
  email: string;
  name?: string;
  // Add other fields if present in your token
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const decoded = jwtDecode<UserTokenPayload>(token);
      console.log(decoded)
      setEmail(decoded.id);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("Conference Room");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Fetch all users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        const res = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data.users || []);
        } else {
          setMessage("Failed to load users.");
        }
      } catch {
        setMessage("Error fetching users.");
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    router.push("/");
  };

  // Add user from dropdown selection
  const handleAddUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (!userId) return;

    const user = allUsers.find((u) => u.id === userId);
    if (user && !selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }

    // Reset select dropdown
    e.target.value = "";
  };

  // Remove selected user tag
  const handleRemoveUser = (id: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== id));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !room || !date || !startTime || !endTime) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const token = localStorage.getItem("userToken");
    if (!token) {
      setMessage("Not authenticated");
      return;
    }

    const bookingData = {
      email,
      room,
      date,
      startTime,
      endTime,
      usersInvolved: selectedUsers.map((u) => u.email),
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        setMessage("Booking successful!");
        setRoom("Conference Room");
        setDate("");
        setStartTime("");
        setEndTime("");
        setSelectedUsers([]);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to book");
      }
    } catch {
      setMessage("Server error");
    }
  };

  const seeTodaysSchedule = () => {
    router.push("/schedule/today");
  };

  return (
    <div
      className={`min-h-screen bg-white flex flex-col ${centuryGothic.variable}`}
      style={{ fontFamily: "var(--font-century-gothic)" }}
    >
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-6 px-4 md:px-8 border-b border-gray-200">
        <div className="text-3xl font-extrabold text-black tracking-tight">
          GrabWarRoom Dashboard
        </div>
        <div className="flex gap-4">
          <button
            onClick={seeTodaysSchedule}
            className="bg-gray-600 text-white px-6 py-2 cursor-pointer rounded-full font-semibold hover:bg-gray-700 transition duration-300"
          >
            See Today's Schedule
          </button>
          <button
            onClick={handleLogout}
            className="bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition duration-300"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-black mb-6 text-center">
          Book the War Room
        </h1>

        {message && (
          <p className="mb-6 text-center font-semibold text-black">{message}</p>
        )}

        <form
          onSubmit={handleBookingSubmit}
          className="max-w-xl mx-auto grid grid-cols-1 gap-6"
        >
          <input
            type="email"
            placeholder="Your Email"
            value={email || ""}
            readOnly
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black"
          />

          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black"
          >
            <option value="Conference Room">Conference Room</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            required
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black"
          />
          <input
            type="time"
            placeholder="Start Time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black"
          />
          <input
            type="time"
            placeholder="End Time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black"
          />

          {/* User selection dropdown */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Add Users Involved
            </label>
            <select
              onChange={handleAddUser}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                Select user to add
              </option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {/* Selected users display */}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1"
                >
                  <span className="text-sm">{user.email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-gray-600 hover:text-gray-900 font-bold"
                    aria-label={`Remove ${user.email}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition"
          >
            Book Now
          </button>
        </form>
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
