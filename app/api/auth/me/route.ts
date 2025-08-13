import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import connectDB from "@/lib/mongoose";
import {User} from "@/models/User"; // ✅ Use default import unless you actually export { User }

const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";

export async function GET(req: Request) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found"}, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token"+error }, { status: 401 });
  }
}
