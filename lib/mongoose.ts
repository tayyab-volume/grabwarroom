import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

/**
 * Mongoose connection helper to avoid reconnecting on hot reload.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal: { conn?: typeof mongoose | null; promise?: Promise<typeof mongoose> | null };
}

interface MongooseGlobal {
  conn?: typeof mongoose | null;
  promise?: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof global & { mongooseGlobal: MongooseGlobal };

if (!globalWithMongoose.mongooseGlobal) {
  globalWithMongoose.mongooseGlobal = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (globalWithMongoose.mongooseGlobal.conn) {
    return globalWithMongoose.mongooseGlobal.conn;
  }

  if (!globalWithMongoose.mongooseGlobal.promise) {
    globalWithMongoose.mongooseGlobal.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  globalWithMongoose.mongooseGlobal.conn = await globalWithMongoose.mongooseGlobal.promise;
  return globalWithMongoose.mongooseGlobal.conn;
}
