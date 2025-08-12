// models/Booking.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBooking extends Document {
  email: string;
  room: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  usersInvolved: string[]; // array of emails of involved users
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  email: { type: String, required: true },
  room: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  usersInvolved: { type: [String], default: [] }, // added this field
  createdAt: { type: Date, default: () => new Date() },
});

export const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>("Booking", BookingSchema);
