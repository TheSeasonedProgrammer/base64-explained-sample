// Runs the JavaScript examples and checks they print what their comments say, then checks the Node.js columns of
// the decoder table (and the Uint8Array.fromBase64 columns on Node.js 26+). Run from anywhere: node tests/test.mjs
// Set BENCH=1 to also print speeds.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("..", import.meta.url));
const examples = `${root}examples/`;
const decoders = `${root}decoders/`;
let pass = 0;
const ok = (m) => { pass++; console.log("PASS", m); };
const run = (f) => execFileSync(process.execPath, [f], { cwd: examples, encoding: "utf8" }).trim().split("\n");
const probe = (f) => JSON.parse(execFileSync(process.execPath, [`${decoders}${f}`], { encoding: "utf8" }));

assert.deepEqual(run("use-base64.mjs"), ["TWFu TWE= TQ==", "Hello, world!", "true"]);
ok("use-base64.mjs: TWFu TWE= TQ==, decode, matches Buffer for lengths 0-999");

const { encode, decode } = await import(new URL("../examples/base64.mjs", import.meta.url));
for (let n = 0; n < 300; n++) {
  const b = randomBytes(n);
  assert.deepEqual(Buffer.from(decode(encode(b))), b);
}
for (const bad of ["TWF", "TW@u", "TW-u", "T===", "=TWF"]) assert.throws(() => decode(bad), undefined, bad);
ok("base64.mjs: round trip for 300 lengths; rejects bad length, bad characters, misplaced padding");

assert.deepEqual(run("unicode.mjs"), ["InvalidCharacterError", "4oKs", "4oKs", "€"]);
ok("unicode.mjs: btoa('€') throws, UTF-8 route gives 4oKs and back");

assert.deepEqual(run("base64url.mjs"), ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", "+/+/", "-_-_", "TQ TQ=="]);
ok("base64url.mjs: JWT header, +/ vs -_, conversion helpers");

assert.deepEqual(run("basic-auth.mjs"), ["Basic YWxpY2U6Y29ycmVjdCBob3JzZQ==", "alice:correct horse"]);
ok("basic-auth.mjs");

// The decoder table: every column a probe can measure here must match decoders/expected.json.
const expected = JSON.parse(readFileSync(`${decoders}expected.json`, "utf8"));
const check = (results, label) => {
  let columns = 0;
  expected.decoders.forEach((d, i) => {
    if (!results[d]) return;
    columns++;
    for (const [input, row] of expected.rows) assert.equal(row[i], results[d][input], `${d} ${JSON.stringify(input)}`);
  });
  assert.ok(columns > 0);
  ok(`decoder table: ${label} columns match (${columns})`);
};
check(probe("probe.mjs"), `Node.js ${process.version}`);
if (typeof Uint8Array.fromBase64 === "function") check(probe("probe-frombase64.mjs"), "Uint8Array.fromBase64");
else console.log(`SKIP Uint8Array.fromBase64 columns: not in Node.js ${process.version} (needs 26+)`);

// Size overhead
const ratio = (n) => Buffer.from(randomBytes(n)).toString("base64").length / n;
assert.equal(ratio(3 * 1000), 4 / 3);
ok("output is exactly 4/3 of the input for multiples of 3 bytes");

if (process.env.BENCH === "1") {
  const data = randomBytes(64 << 20);
  const time = (fn, reps = 5) => { fn(); const t = performance.now(); for (let i = 0; i < reps; i++) fn(); return (performance.now() - t) / reps; };
  const mibs = (ms, mib = 64) => Math.round(mib / (ms / 1000));
  const s = data.toString("base64");
  const small = data.subarray(0, 4 << 20);
  console.log(`| Node Buffer encode | ${mibs(time(() => data.toString("base64")))} MiB/s |`);
  console.log(`| Node Buffer decode | ${mibs(time(() => Buffer.from(s, "base64")))} MiB/s |`);
  const bin = small.toString("latin1");
  console.log(`| Node btoa (binary string) | ${mibs(time(() => btoa(bin)), 4)} MiB/s |`);
  console.log(`| base64.mjs encode (by hand) | ${mibs(time(() => encode(small), 2), 4)} MiB/s |`);
}

console.log(`\nJavaScript: ${pass} checks passed`);
