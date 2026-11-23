import pandas as pd
from database import get_reports

def get_stats():
    reports = get_reports()
    columns = ["id", "category", "location", "description", "status", "created_at"]
    df = pd.DataFrame(reports, columns=columns)

    if df.empty:
        return {
            "total": 0,
            "pending": 0,
            "in_progress": 0,
            "resolved": 0,
            "categories": {},
        }

    return {
        "total": len(df),
        "pending": int((df["status"] == "Pending").sum()),
        "in_progress": int((df["status"] == "In Progress").sum()),
        "resolved": int((df["status"] == "Resolved").sum()),
        "categories": df["category"].value_counts().to_dict(),
    }
