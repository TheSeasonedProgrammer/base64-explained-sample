# Base64 explained: the code

The tested code from [Base64 Explained: Its History, How the Encoding Works, and Where It’s
Used](https://the-seasoned-programmer.com/blog/base64-explained) on
[The Seasoned Programmer](https://the-seasoned-programmer.com). Each file is exactly what the article shows, and
the tests check that every example prints what its comments say.

## What's here

| File | What it shows |
| --- | --- |
| [`examples/base64.mjs`](examples/base64.mjs) | Base64 written out by hand (RFC 4648, section 4): 3 bytes become four 6-bit groups, with padding and a strict decoder |
| [`examples/use-base64.mjs`](examples/use-base64.mjs) | Using it, and checking it matches Node's `Buffer` for every length from 0 to 999 bytes |
| [`examples/unicode.mjs`](examples/unicode.mjs) | The `btoa()` trap: it takes "byte strings", not text, so encode to UTF-8 first |
| [`examples/base64url.mjs`](examples/base64url.mjs) | base64url (`-` and `_`, no padding), as used in JWTs, and converting by hand |
| [`examples/basic-auth.mjs`](examples/basic-auth.mjs) | HTTP Basic auth: Base64 is an encoding, not encryption |
| [`examples/b64.py`](examples/b64.py) | Python's `base64` module: padding rules and `validate=True` |
| [`examples/terminal.txt`](examples/terminal.txt) | The `base64` command, and GNU's line wrapping at 76 characters |
| [`decoders/`](decoders) | The "decoders disagree" table: 11 inputs, such as `TQ=`, `TW Fu` and `TW-u`, and what each decoder does with them |

## Run the examples

You need [Node.js](https://nodejs.org) 24 or later. Python 3 and a Linux shell are needed only for `b64.py` and the
terminal example.

```sh
cd examples
node use-base64.mjs
node unicode.mjs
node base64url.mjs
node basic-auth.mjs
python3 b64.py
```

The decoder probes print what each decoder returns (`ok:` and the bytes in hex, or `error`) for every input in
[`decoders/inputs.json`](decoders/inputs.json):

```sh
node decoders/probe.mjs              # Buffer.from(s, "base64"), Buffer.from(s, "base64url") and atob()
node decoders/probe-frombase64.mjs   # Uint8Array.fromBase64(), Node.js 26+
python3 decoders/probe.py            # Python's b64decode variants and GNU base64 -d (Linux)
```

[`decoders/expected.json`](decoders/expected.json) is the table from the article. The article checked the
`Uint8Array.fromBase64` columns in Chrome 156; Node.js 26 gives the same results.

## Tests

```sh
node tests/test.mjs     # the JavaScript examples, plus the Node.js columns of the table
python3 tests/test.py   # b64.py, the terminal example, and the Python and GNU coreutils columns
sh test.sh              # all of it in Docker: Node.js 24, Node.js 26 and Python 3.14
```

The `base64 -d` column is GNU coreutils; with another `base64` (macOS, or the Rust rewrite in Ubuntu 26.04 and later),
the Python test skips that column. `BENCH=1` also prints encoding and decoding speeds. CI runs the tests on Node.js 24
and 26, and on Python 3.14 in Debian.

## What to take away

- Base64 turns every 3 bytes into 4 characters, so it adds 33%. It hides nothing: anyone can decode it.
- Encode **bytes**, not text. In JavaScript, turn text into UTF-8 with `TextEncoder` before `btoa()`, or use
  `Buffer` in Node.js.
- Decoders disagree about padding, whitespace and the other alphabet's characters. Compare and sign decoded bytes,
  never Base64 strings, and decode untrusted input with a strict decoder.

## Related

- [Base64 encoder and decoder](https://the-seasoned-programmer.com/base64): encode text and files, switch between
  standard, URL-safe and MIME output, and step through how each character is made.
- [JWT decoder](https://the-seasoned-programmer.com/jwt): base64url in action.

## License

[MIT](LICENSE)
