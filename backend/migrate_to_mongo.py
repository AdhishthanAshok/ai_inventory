"""
Migrate data from PostgreSQL (SQLAlchemy models) to MongoDB.
Run with: python migrate_to_mongo.py
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from pymongo import MongoClient

# 1. Connection URLs (Replace with your actual URLs)
PG_URL = "postgresql://postgres:postgresSQL1%40@localhost:5432/ai_inventory"
MONGO_URL = "mongodb+srv://adhishthan123:nozvupQTyrQscJJ8@cluster0.so92sti.mongodb.net/"
MONGO_DB_NAME = "ai_inventory"


def migrate():
    print("Connecting to PostgreSQL...")
    pg_conn = psycopg2.connect(PG_URL)
    pg_cursor = pg_conn.cursor(cursor_factory=RealDictCursor)

    print("Connecting to MongoDB...")
    mongo_client = MongoClient(MONGO_URL)
    mongo_db = mongo_client[MONGO_DB_NAME]

    # --- 1. Migrate Users ---
    print("\nFetching users from Postgres...")
    pg_cursor.execute(
        "SELECT id, username, password_hash, last_login, created_at FROM users;"
    )
    users = pg_cursor.fetchall()

    if users:
        mongo_users = []
        for u in users:
            mongo_users.append(
                {
                    "_id": str(u["id"]),  # Keep the Postgres UUID as string _id
                    "username": u["username"],
                    "password_hash": u["password_hash"],
                    "last_login": u["last_login"],
                    "created_at": u["created_at"],
                }
            )

        # Clear existing and insert
        mongo_db["users"].delete_many({})
        mongo_db["users"].insert_many(mongo_users)
        print(f" Successfully migrated {len(mongo_users)} users to MongoDB!")
    else:
        print("No users found in PostgreSQL.")

    # --- 2. Migrate Items ---
    print("\nFetching items from Postgres...")
    pg_cursor.execute(
        "SELECT id, user_id, image_url, category, color, tags, status, created_at FROM items;"
    )
    items = pg_cursor.fetchall()

    if items:
        mongo_items = []
        for it in items:
            mongo_items.append(
                {
                    "_id": str(it["id"]),
                    "user_id": str(it["user_id"]),  # References the user's _id
                    "image_url": it["image_url"],
                    "category": it["category"],
                    "color": it["color"],
                    "tags": it["tags"] or [],  # JSONB converts directly to Mongo array
                    "status": it["status"],
                    "created_at": it["created_at"],
                }
            )

        # Clear existing and insert
        mongo_db["items"].delete_many({})
        mongo_db["items"].insert_many(mongo_items)
        print(f" Successfully migrated {len(mongo_items)} items to MongoDB!")
    else:
        print("No items found in PostgreSQL.")

    pg_cursor.close()
    pg_conn.close()
    mongo_client.close()
    print("\n Migration complete!")


if __name__ == "__main__":
    migrate()
