import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
var jwt=require("jsonwebtoken")

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
    jwt.verify(token, JWT_SECRET, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getIdFromRequest(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  return id;
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await verifyJWT(token);

    const id = getIdFromRequest(req);
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await verifyJWT(token);

    const id = getIdFromRequest(req);
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, phone } = body;

    if (!name && !email && !phone) {
      return NextResponse.json(
        { error: "At least one field required for update" },
        { status: 400 }
      );
    }

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    // Check if email exists on another user
    if (email) {
      const existingUser = await usersCollection.findOne({
        email,
        _id: { $ne: new ObjectId(id) },
      });
      if (existingUser) {
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

    return NextResponse.json({ message: "User updated" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
