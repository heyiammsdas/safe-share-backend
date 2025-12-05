// models/Note.ts
import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  user: mongoose.Types.ObjectId | null;
  title: string;
  content: string;
  password: string;      // for now store as plain text (you can hash/encrypt later)
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false }, // or true if you want only logged in users
    title: { type: String, required: true },
    content: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Note =
  (mongoose.models.Note as mongoose.Model<INote>) ||
  mongoose.model<INote>("Note", noteSchema);

export default Note;
