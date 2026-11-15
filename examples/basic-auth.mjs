// HTTP Basic authentication sends "user:password" in Base64. Anyone who sees the header can read it.
const header = "Basic " + Buffer.from("alice:correct horse").toString("base64");
console.log(header); // Basic YWxpY2U6Y29ycmVjdCBob3JzZQ==
console.log(Buffer.from(header.slice(6), "base64").toString()); // alice:correct horse
