// btoa() takes a string of "bytes" (characters 0-255), not text. Encode text to UTF-8 bytes first.
try {
  btoa("€");
} catch (e) {
  console.log(e.name); // InvalidCharacterError: € is character 8364, which isn't a byte
}

const utf8 = new TextEncoder().encode("€"); // 3 bytes: e2 82 ac
console.log(btoa(String.fromCharCode(...utf8))); // 4oKs (fine for short strings)
console.log(Buffer.from("€").toString("base64")); // 4oKs (Node.js)
// In current browsers: new TextEncoder().encode("€").toBase64() also gives 4oKs.

// And back: decode to bytes, then bytes to text.
const back = Uint8Array.from(atob("4oKs"), (c) => c.charCodeAt(0));
console.log(new TextDecoder().decode(back)); // €
