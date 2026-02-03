import { mongoose } from "../utils/database";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,
  role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  lastLogin: Date
}, {
  timestamps: true
});

export const User = mongoose.model("User", userSchema);