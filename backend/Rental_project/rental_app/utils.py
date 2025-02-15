import base64
from Crypto.Cipher import AES
import hashlib
import os
from django.conf import settings

def pad(text):
    pad_len = 16 - (len(text) % 16)
    return text + (chr(pad_len) * pad_len)

def encrypt(plain_text, working_key):
    key = hashlib.md5(working_key.encode()).digest()
    iv = os.urandom(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted_text = cipher.encrypt(pad(plain_text).encode())
    return base64.b64encode(iv + encrypted_text).decode()

def decrypt(encrypted_text, working_key):
    key = hashlib.md5(working_key.encode()).digest()
    encrypted_text = base64.b64decode(encrypted_text)
    iv = encrypted_text[:16]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted_text = cipher.decrypt(encrypted_text[16:]).decode()
    return decrypted_text.rstrip(decrypted_text[-1])  # Remove padding
