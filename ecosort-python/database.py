import sqlite3
from pathlib import Path

DB = Path(__file__).parent / "data" / "ecosort.db"

def connect():
    return sqlite3.connect(DB)

def init_db():
    DB.parent.mkdir(exist_ok=True)
    with connect() as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

def add_report(category, location, description):
    with connect() as conn:
        conn.execute(
            "INSERT INTO reports (category, location, description) VALUES (?, ?, ?)",
            (category, location, description)
        )

def get_reports():
    with connect() as conn:
        return conn.execute("SELECT * FROM reports ORDER BY id DESC").fetchall()

def update_report(report_id, status):
    if status not in ["Pending", "In Progress", "Resolved"]:
        return
    with connect() as conn:
        conn.execute(
            "UPDATE reports SET status=? WHERE id=?",
            (status, report_id)
        )
