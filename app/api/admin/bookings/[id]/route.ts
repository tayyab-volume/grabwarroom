import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Booking } from "@/models/Booking";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";

async function verifyToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.substring(7);
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error("Invalid token");
  }
  // TODO: Add admin role verification if needed
  return decoded;
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    await verifyToken(req);

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting booking:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    await verifyToken(req);

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { email, room, date, startTime, endTime, usersInvolved } = body;

    // Validate required fields (optional: you can be flexible depending on update)
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

    // Check for booking conflicts excluding current booking
    const conflictingBooking = await Booking.findOne({
      _id: { $ne: id },
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

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        email,
        room,
        date,
        startTime,
        endTime,
        usersInvolved,
      },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error: unknown) {
    console.error("Error updating booking:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || "Unauthorized" },
      { status: 401 }
    );
  }
}
