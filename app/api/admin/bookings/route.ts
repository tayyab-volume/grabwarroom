

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Booking } from "@/models/Booking";
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";

// Add GET to fetch today's bookings
export async function GET(req: Request) {
  try {
    await connectDB();

    // Check auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get today's date string YYYY-MM-DD in server timezone (UTC)
    const today = new Date().toISOString().split("T")[0];

    // Find bookings for today sorted by startTime ascending
    const bookings = await Booking.find({ date: today })
      .sort({ startTime: 1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Fetch today's bookings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
