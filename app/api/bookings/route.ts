import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Booking } from "@/models/Booking";
var jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";

interface BookingRequest {
  email: string;
  room: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  usersInvolved: string[]; // emails
}

function isTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
) {
  // Returns true if time intervals overlap
  return start1 < end2 && start2 < end1;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // Check auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body: BookingRequest = await req.json();

    const { email, room, date, startTime, endTime, usersInvolved } = body;

    // Validate required fields
    if (
      !email ||
      !room ||
      !date ||
      !startTime ||
      !endTime ||
      !Array.isArray(usersInvolved)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate time order
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    // Check for booking conflicts
    // Find any booking on same room and date with overlapping times
    const conflictingBooking = await Booking.findOne({
      room,
      date,
      $expr: {
        $and: [
          { $lt: ["$startTime", endTime] },
          { $gt: ["$endTime", startTime] },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "Booking conflict: Room already booked during this time" },
        { status: 409 }
      );
    }

    // Create booking
    const newBooking = new Booking({
      email,
      room,
      date,
      startTime,
      endTime,
      usersInvolved,
      createdAt: new Date(),
    });

    await newBooking.save();

    return NextResponse.json({ message: "Booking created successfully" });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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
