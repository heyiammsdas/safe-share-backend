// routes/notes.ts
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import auth from "../middlewares/auth";
import Note from "../Models/Note";
import { encryptNote, decryptNote } from "../utils/crypto";

const router = Router();

/**
 * POST /api/notes/create
 * Body: { title, content, password }
 * Header: Authorization: Bearer <token>
 */
router.post("/create", auth, async (req: any, res: Response) => {
  try {
    const { title, content, password } = req.body;

    if (!title || !content || !password) {
      return res.status(400).json({ msg: "Title, content and password are required" });
    }

    // 1. Hash the password for verification later
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Encrypt the note content
    const encryptedData = encryptNote(content);

    // 3. Save to database without plaintext content
    const note = await Note.create({
      user: req.user?.id || null,
      title,
      encryptedContent: encryptedData.encryptedContent,
      iv: encryptedData.iv,
      authTag: encryptedData.authTag,
      password: hashedPassword,
    });

    // Frontend expects data._id, so return the full note
    return res.status(201).json(note);
  } catch (err) {
    console.error("Error in POST /api/notes/create:", err);
    return res.status(500).json({ msg: "Server error while creating note" });
  }
});

/**
 * POST /api/notes/:id/verify
 * Body: { password }
 * No auth required - public for sharing
 * Returns { title, content } if password matches, else 401
 */
router.post("/:id/verify", async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ msg: "Password required" });
    }

    const note = await Note.findById(req.params.id).select(
      "title content encryptedContent iv authTag password"
    );
    
    if (!note) {
      return res.status(404).json({ msg: "Note not found" });
    }

    // Handle backward compatibility: legacy notes store password in plaintext
    const isBcryptHash = note.password.startsWith("$2");
    
    let isPasswordValid = false;
    if (isBcryptHash) {
      isPasswordValid = await bcrypt.compare(password, note.password);
    } else {
      isPasswordValid = note.password === password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    // Decrypt content if it is encrypted, else return legacy plaintext content
    let finalContent = "";
    if (note.encryptedContent && note.iv && note.authTag) {
      try {
        finalContent = decryptNote(note.encryptedContent, note.iv, note.authTag);
      } catch (decryptionError) {
        console.error("Failed to decrypt note content:", decryptionError);
        return res.status(500).json({ msg: "Failed to decrypt note content. Data might be corrupted." });
      }
    } else if (note.content) {
      finalContent = note.content;
    } else {
      return res.status(500).json({ msg: "Note content is missing." });
    }

    // Return decrypted/decoded content
    return res.json({ 
      title: note.title, 
      content: finalContent 
    });
  } catch (err) {
    console.error("Error in POST /api/notes/:id/verify:", err);
    return res.status(500).json({ msg: "Server error while verifying note" });
  }
});

export default router;