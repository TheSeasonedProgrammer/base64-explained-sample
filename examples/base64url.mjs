// base64url: "-" and "_" instead of "+" and "/", usually without "=" padding (RFC 4648, section 5).
const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
console.log(Buffer.from(header).toString("base64url")); // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9: a JWT header

const bytes = Uint8Array.of(0xfb, 0xff, 0xbf);
console.log(Buffer.from(bytes).toString("base64")); // +/+/  (unsafe in a URL: + means space, / is a path)
console.log(Buffer.from(bytes).toString("base64url")); // -_-_

// Converting by hand, e.g. where only standard Base64 is available:
const toUrl = (b64) => b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromUrl = (u) => u.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (u.length % 4)) % 4);
console.log(toUrl("TQ=="), fromUrl("TQ")); // TQ TQ==
