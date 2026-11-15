// How Uint8Array.fromBase64() treats each input in inputs.json. Output: JSON {decoder: {input: result}}.
// It's in Chrome (we checked Chrome 156 for the article) and Node.js 26+, not Node.js 24.
import { readFileSync } from "node:fs";
const inputs = JSON.parse(readFileSync(new URL("inputs.json", import.meta.url), "utf8"));
if (typeof Uint8Array.fromBase64 !== "function") {
  console.error(`Uint8Array.fromBase64 isn't available in Node.js ${process.version}; it needs Node.js 26 or later.`);
  process.exit(2);
}
const decoders = {
  "Uint8Array.fromBase64(s) (Chrome)": (s) => Uint8Array.fromBase64(s),
  'Uint8Array.fromBase64(s, { lastChunkHandling: "strict" }) (Chrome)': (s) =>
    Uint8Array.fromBase64(s, { lastChunkHandling: "strict" }),
};
const out = {};
for (const [name, decode] of Object.entries(decoders)) {
  out[name] = {};
  for (const s of inputs) {
    try { out[name][s] = "ok:" + Buffer.from(decode(s)).toString("hex"); } catch { out[name][s] = "error"; }
  }
}
process.stdout.write(JSON.stringify(out));
