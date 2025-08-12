import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";
var jwt = require("jsonwebtoken");
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // JWT auth check
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const client = await connectToDatabase();
  const db = client.db();
  const usersCollection = db.collection("users");

  if (req.method === "GET") {
    try {
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

      return res.status(200).json({ users: formattedUsers });
    } catch {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  if (req.method === "POST") {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const now = new Date();

      const result = await usersCollection.insertOne({
        name,
        email,
        phone,
        createdAt: now,
      });

      return res.status(201).json({
        user: {
          id: result.insertedId.toString(),
          name,
          email,
          phone,
        },
      });
    } catch {
      return res.status(500).json({ error: "Failed to add user" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
