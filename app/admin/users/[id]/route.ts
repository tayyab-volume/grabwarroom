// app/admin/users/[id]/route.ts

import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
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

async function verifyJWT(token: string) {
  return new Promise<void>((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getIdFromRequest(req: Request) {
  const url = new URL(req.url);
  const paths = url.pathname.split("/");
  return paths[paths.length - 1];
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    await verifyJWT(token);

    const id = getIdFromRequest(req);
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db();
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    await verifyJWT(token);

    const id = getIdFromRequest(req);
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { name, email, phone } = await req.json();
    if (!name && !email && !phone) {
      return NextResponse.json({ error: "At least one field required" }, { status: 400 });
    }

    const updateFields: Record<string, string> = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    if (email) {
      const exists = await usersCollection.findOne({
        email,
        _id: { $ne: new ObjectId(id) },
      });
      if (exists) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated" });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
