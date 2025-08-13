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

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ManageBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // For editing
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);

  // Form state for editing
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("Conference Room");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // You need to fetch or pass this from somewhere

  // For date min attribute
  const today = new Date().toISOString().split("T")[0];

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin");
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

    const fetchUsers = async () => {
      const token = localStorage.getItem("adminToken");
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
    fetchBookings();
  }, []);

  // Delete booking handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin");
      return;
    }

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to delete booking");
      }
    } catch {
      setMessage("Server error while deleting booking");
    }
  };

  // Start editing a booking: load values into form
  const startEditing = (booking: Booking) => {
    setEditingBookingId(booking._id);
    setEmail(booking.email);
    setRoom(booking.room);
    setDate(booking.date);
    setStartTime(booking.startTime);
    setEndTime(booking.endTime);

    // Convert emails to User[] from allUsers (if found)
    const involvedUsers = allUsers.filter((user) =>
      booking.usersInvolved.includes(user.email)
    );
    setSelectedUsers(involvedUsers);
  };

  // Handle add user dropdown change
  const handleAddUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (!userId) return;
    const userToAdd = allUsers.find((u) => u.id === userId);
    if (
      userToAdd &&
      !selectedUsers.some((user) => user.id === userToAdd.id)
    ) {
      setSelectedUsers((prev) => [...prev, userToAdd]);
    }
  };

  // Remove user from selectedUsers
  const handleRemoveUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== id));
  };

  // Submit the edited booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBookingId) return;

    // Basic validation
    if (!email || !room || !date || !startTime || !endTime) {
      setMessage("Please fill all required fields.");
      return;
    }
    if (startTime >= endTime) {
      setMessage("Start time must be before end time.");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin");
      return;
    }

    try {
      const res = await fetch(`/api/admin/bookings/${editingBookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          room,
          date,
          startTime,
          endTime,
          usersInvolved: selectedUsers.map((u) => u.email),
        }),
      });
      if (res.ok) {
        setMessage("Booking updated successfully");
        setEditingBookingId(null);
        fetchBookings();
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update booking");
      }
    } catch {
      setMessage("Server error while updating booking");
    }
  };

  const cancelEdit = () => {
    setEditingBookingId(null);
  };

  const goBack = () => router.push("/admin/dashboard");

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
        <div>
          <button
            onClick={goBack}
            className="bg-black text-white cursor-pointer mr-6 px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              window.location.href = "/";
            }}
            className="bg-black text-white cursor-pointer px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto p-8">
          {message && (
          <p className="mb-6 text-center font-semibold text-black">{message}</p>
        )}
        {loading ? (
          <p className="text-center text-black text-lg">Loading bookings...</p>
        ) : error ? (
          <p className="text-center text-red-700 font-semibold">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-black text-lg font-semibold">
            No bookings found.
          </p>
        ) : (
          <>
            <ul className="max-w-4xl mx-auto grid gap-4 mb-8">
              {bookings.map((booking) => (
                <li
                  key={booking._id}
                  className="border border-black rounded-lg p-4 bg-white shadow-md flex justify-between items-center"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-lg text-black">
                      {booking.room}
                    </span>
                    <span className="font-mono text-sm text-gray-900">
                      {booking.date} | {booking.startTime} - {booking.endTime}
                    </span>
                    <span className="text-black">
                      <strong>Booked by:</strong> {booking.email}
                    </span>
                    {booking.usersInvolved.length > 0 && (
                      <span className="text-black">
                        <strong>Members involved:</strong>{" "}
                        {booking.usersInvolved.join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(booking)}
                      className="bg-gray-700 cursor-pointer text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(booking._id)}
                      className="bg-black cursor-pointer text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Edit form modal/section */}
            {editingBookingId && (
              <section className="max-w-xl mx-auto p-6 border border-black rounded-lg bg-white shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-black text-center">
                  Edit Booking
                </h2>

                <form
                  onSubmit={handleBookingSubmit}
                  className="grid grid-cols-1 gap-6"
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
                    {/* Add other rooms if applicable */}
                  </select>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={today}
                    required
                    className="px-4 py-3 border cursor-pointer rounded-lg focus:ring-2 focus:ring-black"
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
                    <label className="block mb-1 font-semibold text-gray-700 bg">
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
                            className="text-gray-600 cursor-pointer hover:text-gray-900 font-bold"
                            aria-label={`Remove ${user.email}`}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      type="submit"
                      className="bg-black text-white py-3 cursor-pointer rounded-full font-semibold hover:bg-gray-800 transition px-10"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-400 text-black py-3 cursor-pointer rounded-full font-semibold hover:bg-gray-500 transition px-10"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}
          </>
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
