const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Note = require('./dist/Models/Note').default;
    
    // We get the first user ID from the notes
    const sampleNote = await Note.findOne({ user: { $ne: null } });
    if (!sampleNote) {
      console.log("No notes with a user found.");
      process.exit(0);
    }
    
    console.log("Querying for user:", sampleNote.user);
    const activeNotes = await Note.find({
      user: sampleNote.user,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .select("_id title expiresAt createdAt")
    .sort({ expiresAt: 1, createdAt: -1 });
    
    console.log("Active Notes Found:", activeNotes.length);
    console.log(activeNotes);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
test();
