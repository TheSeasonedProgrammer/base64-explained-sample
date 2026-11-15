# b64.py: Base64 in Python's standard library.
import base64, binascii

print(base64.b64encode(b"Man"))  # b'TWFu'
print(base64.urlsafe_b64encode(b"\xfb\xff\xbf"))  # b'-_-_'

# Python insists on padding, which base64url values (JWTs, for example) usually omit.
try:
    base64.urlsafe_b64decode("TQ")
except binascii.Error as e:
    print(e)  # Incorrect padding
print(base64.urlsafe_b64decode("TQ" + "=" * (-len("TQ") % 4)))  # b'M'

# By default, characters outside the alphabet are silently skipped. validate=True rejects them.
print(base64.b64decode("TW Fu"))  # b'Man'
try:
    base64.b64decode("TW Fu", validate=True)
except binascii.Error as e:
    print(e)  # Only base64 data is allowed
