import { NextResponse } from "next/server";
var jwt = require('jsonwebtoken');


const ADMIN_EMAIL = "admin@warroom.in";
const ADMIN_PASSWORD = "volume"; // For now hardcoded

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // Keep in .env in production
const JWT_EXPIRY = "1h";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Check email & password
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT
    const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    // Send token in response
    return NextResponse.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
