// routes/notes.ts
import { Router, Request, Response } from "express";
import auth from "../middlewares/auth";
import Note from "../Models/Note"; // or "../Models/Note" depending on your folder name

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

    const note = await Note.create({
      user: req.user?.id || null,
      title,
      content,
      password, // later you can hash or encrypt this
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

    const note = await Note.findById(req.params.id).select("title content password");
    
    if (!note) {
      return res.status(404).json({ msg: "Note not found" });
    }

    if (note.password !== password) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    // Return decrypted/decoded content (for now, just plain)
    return res.json({ 
      title: note.title, 
      content: note.content 
    });
  } catch (err) {
    console.error("Error in POST /api/notes/:id/verify:", err);
    return res.status(500).json({ msg: "Server error while verifying note" });
  }
});

export default router;