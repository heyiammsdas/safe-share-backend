// models/Note.ts
import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  user: mongoose.Types.ObjectId | null;
  title: string;
  content?: string; // Legacy plaintext content
  encryptedContent?: string; // AES-256-GCM encrypted content (hex)
  iv?: string; // Initialization vector (hex)
  authTag?: string; // Authentication tag (hex)
  password: string; // bcrypt hashed password
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false }, // or true if you want only logged in users
    title: { type: String, required: true },
    content: { type: String, required: false },
    encryptedContent: { type: String, required: false },
    iv: { type: String, required: false },
    authTag: { type: String, required: false },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Note =
  (mongoose.models.Note as mongoose.Model<INote>) ||
  mongoose.model<INote>("Note", noteSchema);

export default Note;
