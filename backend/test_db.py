from database import engine
from sqlalchemy import text
print("Attempting to connect...")
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("Success")
except Exception as e:
    print("Failed!", e)
