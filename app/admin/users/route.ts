// app/admin/users/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const MONGODB_URI = process.env.MONGODB_URI!;

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

// Middleware to check JWT
async function verifyToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }
  try {
    jwt.verify(token, JWT_SECRET);
    return { ok: true };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET(req: Request) {
  const auth = await verifyToken(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    const users = await usersCollection
      .find({}, { projection: { _id: 1, name: 1, email: 1, phone: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyToken(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { name, email, phone } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const now = new Date();
    const result = await usersCollection.insertOne({
      name,
      email,
      phone,
      createdAt: now,
    });

    return NextResponse.json(
      {
        user: {
          id: result.insertedId.toString(),
          name,
          email,
          phone,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}
