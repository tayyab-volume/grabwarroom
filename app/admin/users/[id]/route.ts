import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";
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

interface UpdateFields {
  name?: string;
  email?: string;
  phone?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const client = await connectToDatabase();
  const db = client.db();
  const usersCollection = db.collection("users");

  if (req.method === "DELETE") {
    try {
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ message: "User deleted" });
    } catch {
      return res.status(500).json({ error: "Failed to delete user" });
    }
  }

  if (req.method === "PATCH") {
    const { name, email, phone } = req.body;

    if (!name && !email && !phone) {
      return res.status(400).json({ error: "At least one field required for update" });
    }

    const updateFields: UpdateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;

    try {
      if (email) {
        // Check if another user already has the email
        const existingUser = await usersCollection.findOne({ email, _id: { $ne: new ObjectId(id) } });
        if (existingUser) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ message: "User updated" });
    } catch {
      return res.status(500).json({ error: "Failed to update user" });
    }
  }

  res.setHeader("Allow", ["DELETE", "PATCH"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
