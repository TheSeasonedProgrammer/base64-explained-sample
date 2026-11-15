import { encode, decode } from "./base64.mjs";

const bytes = (s) => new TextEncoder().encode(s);
console.log(encode(bytes("Man")), encode(bytes("Ma")), encode(bytes("M"))); // TWFu TWE= TQ==
console.log(new TextDecoder().decode(decode("SGVsbG8sIHdvcmxkIQ=="))); // Hello, world!

// Same answers as the built-in encoder, for every length (the padding cases are the tricky part).
const random = crypto.getRandomValues(new Uint8Array(1000));
const same = Array.from({ length: 1000 }, (_, n) => encode(random.subarray(0, n)) === Buffer.from(random.subarray(0, n)).toString("base64"));
console.log(same.every(Boolean)); // true
