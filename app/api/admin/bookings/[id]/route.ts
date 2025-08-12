import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Booking } from "@/models/Booking";
var jwt = require("jsonwebtoken");
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
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
