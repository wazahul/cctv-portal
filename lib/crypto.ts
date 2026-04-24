// app/lib/crypto.ts -
import CryptoJS from 'crypto-js';

// 🚩 Hardcoded Key: Isse mismatch ka khatra khatam
const SECRET_KEY = process.env.CRYPTO_KEY || 'MODERN_ENT_2026_SECURE';

/**
 * 🔓 DECRYPT DATA
 */
export const decryptData = (ciphertext: string): string => {
  // 1. Agar data khali hai ya string nahi hai
  if (!ciphertext || typeof ciphertext !== 'string') return "";

  // 2. 🛡️ CHOR PAKADNE WALI LINE:
  // Agar password 'U2Fsd' se shuru NAHI hota, toh wo pehle se hi PLAIN TEXT hai.
  // Ise decrypt karne ki koshish karna hi "Malformed UTF-8" error deta hai.
  if (!ciphertext.startsWith('U2Fsd')) {
    console.log("🟢 Skipping Decryption: Data is already Plain Text.");
    return ciphertext; // Seedha wahi password wapas kar do (e.g. admin123)
  }

  try {
    // 3. Decrypt the ciphertext
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    
    // 4. Convert to UTF-8
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    // 5. Check if result is empty (Wrong Key)
    if (!originalText || originalText.length === 0) {
      console.warn("⚠️ Decryption result empty. Key mismatch?");
      return ciphertext; 
    }

    return originalText;
  } catch (err) {
    // 6. Final safety for Malformed Data
    console.error("❌ Crypto Crash Prevented: Invalid Data Format.");
    return ciphertext; 
  }
};

/**
 * 🔒 ENCRYPT DATA
 */
export const encryptData = (text: string): string => {
  if (!text || (typeof text === 'string' && text.startsWith('U2Fsd'))) return text;
  try {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (err) { return text; }
};