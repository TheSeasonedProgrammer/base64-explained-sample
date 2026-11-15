# How Python's base64 decoders treat each input in inputs.json.
import base64, binascii, json, pathlib, subprocess
inputs = json.loads((pathlib.Path(__file__).parent / "inputs.json").read_text())
out = {"Python b64decode(s)": {}, "Python b64decode(s, validate=True)": {}, "Python urlsafe_b64decode(s)": {}, "base64 -d (GNU coreutils)": {}}
def run(fn, s):
    try:
        return "ok:" + fn(s).hex()
    except (binascii.Error, ValueError):
        return "error"
for s in inputs:
    out["Python b64decode(s)"][s] = run(lambda x: base64.b64decode(x), s)
    out["Python b64decode(s, validate=True)"][s] = run(lambda x: base64.b64decode(x, validate=True), s)
    out["Python urlsafe_b64decode(s)"][s] = run(lambda x: base64.urlsafe_b64decode(x), s)
    p = subprocess.run(["base64", "-d"], input=s.encode(), capture_output=True)
    out["base64 -d (GNU coreutils)"][s] = ("ok:" + p.stdout.hex()) if p.returncode == 0 else ("error" if not p.stdout else "error after:" + p.stdout.hex())
print(json.dumps(out))
