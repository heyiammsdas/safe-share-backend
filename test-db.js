const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Note = mongoose.connection.collection('notes');
    const notes = await Note.find({}).toArray();
    console.log("Total notes:", notes.length);
    if (notes.length > 0) {
      console.log("Sample note user:", typeof notes[0].user, notes[0].user);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
test();
