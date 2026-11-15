// How Node's decoders treat each input in inputs.json. Output: JSON {decoder: {input: result}}.
import { readFileSync } from "node:fs";
const inputs = JSON.parse(readFileSync(new URL("inputs.json", import.meta.url), "utf8"));
const show = (bytes) => "ok:" + Buffer.from(bytes).toString("hex");
const out = { "Node Buffer.from(s, 'base64')": {}, "Node Buffer.from(s, 'base64url')": {}, "atob() (Node)": {} };
for (const s of inputs) {
  out["Node Buffer.from(s, 'base64')"][s] = show(Buffer.from(s, "base64"));
  out["Node Buffer.from(s, 'base64url')"][s] = show(Buffer.from(s, "base64url"));
  try { out["atob() (Node)"][s] = show(Buffer.from(atob(s), "latin1")); } catch { out["atob() (Node)"][s] = "error"; }
}
process.stdout.write(JSON.stringify(out));
