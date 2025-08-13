"use client";

import { useState, useEffect } from "react";
import localFont from "next/font/local";

const centuryGothic = localFont({
  src: "../../../public/century-gothic/centurygothic.ttf",
  variable: "--font-century-gothic",
  weight: "400",
});

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // added password field
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(""); // new password state

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [message, setMessage] = useState("");

  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setMessage("");
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setMessage("");
  };

  const saveEdit = async () => {
    if (!editingUserId) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setMessage("No auth token found. Please login.");
        return;
      }

      const res = await fetch(
        `/api/admin/users/${editingUserId}?id=${editingUserId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            phone: editPhone,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ User updated successfully");
        setEditingUserId(null);
        fetchUsers(); // reload users
      } else {
        setMessage(data.error || "Failed to update user");
      }
    } catch {
      setMessage("Something went wrong");
    }
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!token) {
      setMessage("No auth token found. Please login.");
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        setMessage(errData.error || "Failed to fetch users");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
      setMessage("");
    } catch {
      setMessage("Failed to fetch users");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage("No auth token found. Please login.");
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ User added successfully");
        setName("");
        setEmail("");
        setPhone("");
        setPassword(""); // clear password input after submit
        fetchUsers();
      } else {
        setMessage(data.error || "Failed to add user");
      }
    } catch {
      setMessage("Something went wrong");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!token) {
      setMessage("No auth token found. Please login.");
      return;
    }
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
        setMessage("✅ User deleted");
      } else {
        const errData = await res.json();
        setMessage(errData.error || "Failed to delete user");
      }
    } catch {
      setMessage("Something went wrong");
    }
  };

  return (
    <div
      className={`min-h-screen bg-gray-100 p-6 ${centuryGothic.variable}`}
      style={{ fontFamily: "var(--font-century-gothic)" }}
    >
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4 max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-black">Admin Dashboard</h1>
          <div>
            <button
              onClick={() => {
                window.location.href = "/admin/dashboard";
              }}
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
        </div>

        <h1 className="text-4xl font-bold text-center text-black mb-2">
          Admin Dashboard
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8">Manage Users</p>

        <form
          onSubmit={handleAddUser}
          className="grid md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto"
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black"
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black"
            required
          />
          <input
            type="text"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black"
            required
          />
          <button
            type="submit"
            className="md:col-span-4 bg-black text-white py-3 rounded-full cursor-pointer font-semibold hover:bg-gray-800 transition"
          >
            Add User
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-black mb-4">{message}</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Password</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    {editingUserId === user.id ? (
                      <>
                        <td className="p-3 border">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                        </td>
                        <td className="p-3 border">
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                        </td>
                        <td className="p-3 border">
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                        </td>
                        <td className="p-3 border">
                          {/* Optional: show password editable field if you want */}
                          <input
                            type="text"
                            value={user.password || ""}
                            readOnly
                            className="border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                          />
                        </td>
                        <td className="p-3 border flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-black cursor-pointer text-white rounded hover:bg-gray-700 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-gray-400 cursor-pointer text-white rounded hover:bg-gray-500 transition"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 border">{user.name}</td>
                        <td className="p-3 border">{user.email}</td>
                        <td className="p-3 border">{user.phone}</td>
                        <td className="p-3 border">{user.password || "—"}</td>
                        <td className="p-3 border flex gap-2">
                          <button
                            onClick={() => startEditing(user)}
                            className="px-3 py-1 bg-black cursor-pointer text-white rounded hover:bg-gray-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 bg-black cursor-pointer text-white rounded hover:bg-gray-600 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
