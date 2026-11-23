from flask import Flask, render_template, request, redirect, url_for, flash
from database import init_db, add_report, get_reports, update_report
from classifier import classify_waste
from analytics import get_stats

app = Flask(__name__)
app.secret_key = "ecosort-demo-secret"

init_db()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/citizen", methods=["GET", "POST"])
def citizen():
    result = None
    if request.method == "POST":
        item = request.form.get("item", "").strip()
        if item:
            result = classify_waste(item)
    return render_template("citizen.html", result=result)

@app.route("/report", methods=["GET", "POST"])
def report():
    if request.method == "POST":
        category = request.form.get("category", "")
        location = request.form.get("location", "").strip()
        description = request.form.get("description", "").strip()
        if category and location and description:
            add_report(category, location, description)
            flash("Your civic report has been submitted!")
            return redirect(url_for("report"))
    return render_template("report.html")

@app.route("/admin")
def admin():
    return render_template("admin.html", reports=get_reports(), stats=get_stats())

@app.route("/update/<int:report_id>", methods=["POST"])
def update(report_id):
    status = request.form.get("status", "Pending")
    update_report(report_id, status)
    flash("Report status updated.")
    return redirect(url_for("admin"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
