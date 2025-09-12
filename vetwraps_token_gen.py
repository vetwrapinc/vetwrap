"""
VetWraps Admin Token Generator (external)

Generates an IP-bound, time-limited admin token encrypted with AES-256-GCM.
Pass this token to the desktop app and web dashboard; server verifies:
  - Token not expired (6h default)
  - IP in token matches caller public IP
  - Email is in ADMIN_EMAILS allowlist

Usage:
  - pip install requests cryptography
  - python vetwraps_token_gen.py
  - Build EXE (Windows): pyinstaller --noconsole --onefile --name TokenIssuer vetwraps_token_gen.py

NOTE: Keep the secret safe. Do not distribute this exe to the public.
"""

from __future__ import annotations
import base64
import getpass
import json
import os
import secrets
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional

try:
    import requests
except Exception:
    print("This tool requires 'requests'. Install: pip install requests")
    raise

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except Exception:
    print("This tool requires 'cryptography'. Install: pip install cryptography")
    raise


def b64url(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def derive_key(secret: str) -> bytes:
    import hashlib
    return hashlib.sha256(secret.encode("utf-8")).digest()


def get_public_ip() -> str:
    try:
        return requests.get("https://api.ipify.org", timeout=10).text.strip()
    except Exception:
        return ""


def issue_token(email: str, secret: str, ip: Optional[str] = None, hours: int = 6) -> str:
    if not ip:
        ip = get_public_ip()
    if not ip:
        raise RuntimeError("Could not detect public IP. Provide one manually.")
    now = datetime.now(timezone.utc)
    payload = {
        "v": 1,
        "email": email,
        "ip": ip,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=hours)).timestamp()),
        "nonce": secrets.token_hex(8),
    }
    pt = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    key = derive_key(secret)
    aes = AESGCM(key)
    iv = os.urandom(12)
    ct = aes.encrypt(iv, pt, None)
    # AESGCM ciphertext includes tag at end in cryptography, split:
    ciphertext, tag = ct[:-16], ct[-16:]
    token = "v1." + ".".join([b64url(iv), b64url(ciphertext), b64url(tag)])
    return token


def main():
    print("VetWraps Admin Token Generator")
    email = input("Admin email: ").strip()
    if not email:
        print("Email required.")
        return
    ip = input("Public IP (leave blank to auto-detect): ").strip()
    if not ip:
        ip = get_public_ip()
        if ip:
            print(f"Detected IP: {ip}")
        else:
            print("Could not auto-detect IP.")
            ip = input("Enter Public IP: ").strip()
            if not ip:
                print("IP required.")
                return
    hrs = input("Hours valid [6]: ").strip() or "6"
    try:
        hours = int(hrs)
    except ValueError:
        hours = 6

    secret = os.environ.get("VETWRAPS_TOKEN_SECRET") or getpass.getpass("Admin token secret: ")
    if not secret:
        print("Secret required.")
        return

    token = issue_token(email, secret, ip, hours)
    print("\nToken (x-admin-token):\n")
    print(token)
    print("\nPaste this into the desktop app or the web dashboard when prompted.\n")


if __name__ == "__main__":
    main()

