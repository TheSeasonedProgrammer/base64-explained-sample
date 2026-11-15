# Runs b64.py and the terminal example and checks their output, then checks the Python and GNU coreutils columns of
# the decoder table. Needs GNU coreutils (Linux). Run from anywhere: python tests/test.py
# Set BENCH=1 to also print speeds.
import json, os, pathlib, subprocess, sys, time

root = pathlib.Path(__file__).resolve().parent.parent
examples, decoders = root / "examples", root / "decoders"
passed = 0


def ok(msg):
    global passed
    passed += 1
    print("PASS", msg)


out = subprocess.run([sys.executable, "b64.py"], cwd=examples, capture_output=True, text=True, check=True).stdout
assert out.strip().split("\n") == ["b'TWFu'", "b'-_-_'", "Incorrect padding", "b'M'", "b'Man'", "Only base64 data is allowed"], out
ok("b64.py output matches its comments")

expected = json.loads((decoders / "expected.json").read_text())
py = json.loads(subprocess.run([sys.executable, decoders / "probe.py"], capture_output=True, text=True, check=True).stdout)
columns = 0
for i, d in enumerate(expected["decoders"]):
    if d in py:
        columns += 1
        for value, results in expected["rows"]:
            assert results[i] == py[d][value], (d, value, results[i], py[d][value])
assert columns == 3, columns
ok("decoder table: Python and coreutils columns match")

# The terminal example: run each command and compare with the lines that follow it.
lines = (examples / "terminal.txt").read_text().rstrip("\n").split("\n")
i = 0
while i < len(lines):
    cmd = lines[i][2:].split("#")[0].strip()
    want = []
    i += 1
    while i < len(lines) and not lines[i].startswith("$ "):
        want.append(lines[i])
        i += 1
    got = subprocess.run(["sh", "-c", cmd], capture_output=True, text=True).stdout.rstrip("\n").split("\n")
    assert got == want, (cmd, got, want)
ok("terminal.txt: every command prints what it shows")

if os.environ.get("BENCH") == "1":
    import base64
    data = os.urandom(64 << 20)
    enc = base64.b64encode(data)

    def mibs(fn, reps=5):
        fn()
        t = time.perf_counter()
        for _ in range(reps):
            fn()
        return round(64 / ((time.perf_counter() - t) / reps))

    print(f"| Python b64encode | {mibs(lambda: base64.b64encode(data))} MiB/s |")
    print(f"| Python b64decode | {mibs(lambda: base64.b64decode(enc))} MiB/s |")

print(f"\nPython: {passed} checks passed")
