require('dotenv').config();
const { encryptNote, decryptNote } = require('./dist/utils/crypto');

try {
  const plaintext = "This is a highly sensitive note.";
  
  // Encrypt
  const encryptedData = encryptNote(plaintext);
  console.log("Encrypted:", encryptedData);
  
  // Decrypt
  const decrypted = decryptNote(
    encryptedData.encryptedContent,
    encryptedData.iv,
    encryptedData.authTag
  );
  console.log("Decrypted:", decrypted);
  
  if (plaintext === decrypted) {
    console.log("SUCCESS: Encryption/Decryption works flawlessly!");
  } else {
    console.log("ERROR: Decrypted text does not match!");
  }
} catch (error) {
  console.error("Test failed:", error.message);
}
