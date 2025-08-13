import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import jwt from 'jsonwebtoken';

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

async function verifyJWT(token: string) {
  return new Promise<void>((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await verifyJWT(token);

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    const users = await usersCollection
      .find({}, { projection: { _id: 1, name: 1, email: 1, phone: 1, password: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      password: u.password, // include password here
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch {
    return NextResponse.json(
      { error: "Unauthorized or error occurred" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await verifyJWT(token);

    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "All fields including password are required" },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const now = new Date();
    const result = await usersCollection.insertOne({
      name,
      email,
      phone,
      password,  // save password as is (consider hashing in real apps)
      createdAt: now,
    });

    return NextResponse.json(
      {
        user: {
          id: result.insertedId.toString(),
          name,
          email,
          phone,
          password,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}
