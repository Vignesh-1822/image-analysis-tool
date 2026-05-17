"""
Run this once to generate secure values for your .env file:
    cd backend && python generate_secrets.py
"""
import secrets
import getpass
import bcrypt

password = getpass.getpass("Enter the app password to hash: ")
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()
jwt_secret = secrets.token_hex(32)

print("\nAdd these to your backend/.env file:\n")
print(f"APP_PASSWORD_HASH={hashed}")
print(f"JWT_SECRET={jwt_secret}")
print(f"JWT_EXPIRE_HOURS=8")
print("\nDone. Keep these values secret and never commit .env to git.")
