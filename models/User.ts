// models/User.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
});

export const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
