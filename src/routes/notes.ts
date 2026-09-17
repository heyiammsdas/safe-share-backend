// routes/notes.ts
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import auth from "../middlewares/auth";
import Note from "../Models/Note";
import { encryptNote, decryptNote } from "../utils/crypto";

const router = Router();

/**
 * Parses duration string (e.g. "10m", "1h", "1d") and returns the absolute Date
 * Returns undefined for "never" or invalid formats
 */
function getExpiresAtDate(expiresIn?: string): Date | undefined {
  if (!expiresIn || expiresIn === "never") return undefined;
  
  const match = expiresIn.match(/^(\d+)([mhd])$/);
  if (!match) return undefined;
  
  const amount = parseInt(match[1], 10);
  const unit = match[2];
  
  if (isNaN(amount) || amount <= 0) return undefined;
  
  const now = new Date();
  
  switch (unit) {
    case 'm': now.setMinutes(now.getMinutes() + amount); break;
    case 'h': now.setHours(now.getHours() + amount); break;
    case 'd': now.setDate(now.getDate() + amount); break;
    default: return undefined;
  }
  
  return now;
}

/**
 * POST /api/notes/create
 * Body: { title, content, password, expiresIn }
 * Header: Authorization: Bearer <token>
 */
router.post("/create", auth, async (req: any, res: Response) => {
  try {
    const { title, content, password, expiresIn } = req.body;

    if (!title || !content || !password) {
      return res.status(400).json({ msg: "Title, content and password are required" });
    }

    // 1. Hash the password for verification later
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Encrypt the note content
    const encryptedData = encryptNote(content);

    // 3. Compute expiration date
    const expiresAt = getExpiresAtDate(expiresIn);

    // 4. Save to database without plaintext content
    const noteData: any = {
      title,
      encryptedContent: encryptedData.encryptedContent,
      iv: encryptedData.iv,
      authTag: encryptedData.authTag,
      password: hashedPassword,
    };
    if (req.user?.id) noteData.user = req.user.id;
    if (expiresAt) noteData.expiresAt = expiresAt;

    const note = await Note.create(noteData);

    // Frontend expects data._id, so return the full note
    return res.status(201).json(note);
  } catch (err: any) {
    console.error("Error in POST /api/notes/create:", err);
    if (err.message?.includes('NOTE_ENCRYPTION_KEY')) {
      return res.status(500).json({ msg: "Server configuration error: Encryption key is missing. Please restart the backend server." });
    }
    return res.status(500).json({ msg: "Server error while creating note: " + (err.message || "Unknown error") });
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
      "title content encryptedContent iv authTag password expiresAt"
    );
    
    if (!note) {
      return res.status(404).json({ msg: "Note not found" });
    }

    // Strict expiration check: MongoDB TTL deletion is async, so we must enforce it here
    if (note.expiresAt && new Date() > note.expiresAt) {
      return res.status(410).json({ msg: "This note has expired or is no longer available." });
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
  } catch (err: any) {
    if (err.name === 'CastError') {
      return res.status(404).json({ msg: "Note not found" });
    }
    console.error("Error in POST /api/notes/:id/verify:", err);
    return res.status(500).json({ msg: "Server error while verifying note" });
  }
});

/**
 * GET /api/notes/:id/status
 * No auth required - public for sharing
 * Returns 200 if note exists and is valid, 404 if not found, 410 if expired
 */
router.get("/:id/status", async (req: Request, res: Response) => {
  try {
    const note = await Note.findById(req.params.id).select("expiresAt");
    
    if (!note) {
      return res.status(404).json({ msg: "Note not found" });
    }

    if (note.expiresAt && new Date() > note.expiresAt) {
      return res.status(410).json({ msg: "This note has expired or is no longer available." });
    }

    return res.status(200).json({ status: "valid" });
  } catch (err: any) {
    // If CastError, it means the ID is invalid, treat as 404
    if (err.name === 'CastError') {
      return res.status(404).json({ msg: "Note not found" });
    }
    console.error("Error in GET /api/notes/:id/status:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;