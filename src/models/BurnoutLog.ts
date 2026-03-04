import mongoose, { type Document, type Model } from "mongoose";

export interface IBurnoutLog extends Document {
  userId: string;
  sleepHours: number;
  studyHours: number;
  stressLevel: number;
  tasksPending: number;
  deadlinesSoon: number;
  burnoutScore: number;
  risk: string;
  flags: string[];
  crashProbability: number;
  focusMode: number;
  createdAt: Date;
}

const BurnoutLogSchema = new mongoose.Schema<IBurnoutLog>({
  userId: { type: String, default: "anon", index: true },
  sleepHours: { type: Number, required: true },
  studyHours: { type: Number, required: true },
  stressLevel: { type: Number, required: true },
  tasksPending: { type: Number, required: true },
  deadlinesSoon: { type: Number, required: true },
  burnoutScore: { type: Number, required: true },
  risk: { type: String, required: true },
  flags: { type: [String], default: [] },
  crashProbability: { type: Number, required: true },
  focusMode: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Compound index for per-user time-series queries
BurnoutLogSchema.index({ userId: 1, createdAt: -1 });

const BurnoutLog: Model<IBurnoutLog> =
  (mongoose.models.BurnoutLog as Model<IBurnoutLog>) ||
  mongoose.model<IBurnoutLog>("BurnoutLog", BurnoutLogSchema);

export default BurnoutLog;
