import mongoose, { type Document, type Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  passwordHash?: string; // undefined for OAuth users
  provider: string;
  image?: string;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: { type: String, trim: true },
  passwordHash: { type: String }, // bcrypt hash — never store plain passwords
  provider: { type: String, default: "credentials" },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
