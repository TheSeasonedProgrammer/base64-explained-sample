// base64.mjs: Base64 written out by hand (RFC 4648, section 4). For learning; use the built-ins in real code.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function encode(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    // Pack up to 3 bytes (24 bits) into one number, filling missing bytes with zeros.
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    // Cut it into four 6-bit groups; each picks one of the 64 characters.
    const chars = [18, 12, 6, 0].map((shift) => ALPHABET[(n >> shift) & 63]);
    const missing = i + 3 - Math.min(i + 3, bytes.length); // 0, 1 or 2 bytes short
    out += chars.slice(0, 4 - missing).join("") + "=".repeat(missing);
  }
  return out;
}

export function decode(text) {
  if (text.length % 4 !== 0) throw new Error("length must be a multiple of 4");
  const pad = text.endsWith("==") ? 2 : text.endsWith("=") ? 1 : 0;
  const out = [];
  for (let i = 0; i < text.length; i += 4) {
    let n = 0;
    for (let j = 0; j < 4; j++) {
      const c = text[i + j];
      const v = c === "=" && i + j >= text.length - pad ? 0 : ALPHABET.indexOf(c);
      if (v < 0) throw new Error(`invalid character ${JSON.stringify(c)} at ${i + j}`);
      n = (n << 6) | v;
    }
    out.push((n >> 16) & 255, (n >> 8) & 255, n & 255);
  }
  return Uint8Array.from(out.slice(0, out.length - pad));
}
