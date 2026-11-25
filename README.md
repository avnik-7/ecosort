
# EcoSort – Smart Waste Segregation and Municipal Management Platform

**Smarter Cities. Cleaner Futures.**

EcoSort is a web-based waste management platform designed to promote responsible waste segregation, simplify civic waste reporting, and support data-driven municipal waste management.

---

## 2. Project Overview

Improper waste segregation, irresponsible disposal, and inefficient complaint management are significant challenges in urban communities. A lack of awareness regarding waste categories and appropriate disposal methods contributes to environmental pollution, reduced recycling efficiency, and increased pressure on municipal waste management systems.

EcoSort addresses these challenges by providing a unified digital platform that connects citizen participation with municipal waste management.

The platform enables citizens to identify everyday waste items, receive appropriate disposal guidance, and report waste-related issues in their neighbourhoods. Municipal administrators can review submitted reports, update complaint statuses, and analyse waste-related data through a centralised dashboard.

EcoSort aims to encourage responsible waste disposal, improve community participation, and contribute towards cleaner and more sustainable urban environments.

---

## 3. Key Features

### Waste Identification and Disposal Guidance

- Allows citizens to enter the name of a waste item through a simple text-based interface.
- Uses a rule-based classification system to identify supported waste items.
- Recognises common alternative names for waste items.
- Provides the identified waste category, suggested disposal destination, and relevant disposal instructions.
- Provides additional handling guidance for soil and appropriate fallback guidance for unrecognised items.

### Waste Segregation Categories

EcoSort classifies supported waste items into four primary categories:

| Category | Examples | Suggested Disposal |
| --- | --- | --- |
| Wet Waste | Banana peels, vegetable scraps, food waste | Green bin |
| Dry Waste | Paper, cardboard, plastic bottles | Blue bin |
| E-Waste | Mobile phones, chargers, laptops | Authorised e-waste collection point |
| Hazardous Waste | Paint, expired medicines, chemical waste | Authorised hazardous waste collection |

### Citizen Complaint and Report Submission

- Enables citizens to report waste-related issues in their local communities.
- Collects the waste category, location, and description of the issue.
- Stores submitted reports in a SQLite database.
- Assigns a default Pending status to newly submitted reports.

### Municipal Administration Dashboard

- Provides a centralised interface for viewing submitted civic reports.
- Displays report categories, locations, descriptions, and current statuses.
- Allows report statuses to be updated according to the following stages:
  - Pending
  - In Progress
  - Resolved

### Waste Analytics and Visualisation

- Displays the total number of submitted reports.
- Provides individual counts for pending, in-progress, and resolved complaints.
- Uses a doughnut chart to visualise the distribution of reported waste categories.
- Uses a bar chart to represent complaint status distribution.
- Supports a clearer understanding of community waste patterns and complaint resolution progress.

---

## 4. Technology Stack

The primary EcoSort application is developed using the following technologies:

| Technology | Purpose |
| --- | --- |
| Python | Core application logic and waste classification |
| Flask | Web application framework and backend development |
| SQLite | Database management and civic report storage |
| Pandas | Data processing and statistical analysis |
| HTML | Structure of the web interface |
| CSS | User interface styling and layout |
| JavaScript | Client-side functionality and chart integration |
| Chart.js | Interactive data visualisation |
| Gunicorn | WSGI server for application deployment |
| Render | Cloud hosting and application deployment |

Plotly is also included in the Python dependency file, while the current dashboard visualisations are implemented using Chart.js.

---

## 5. Project Structure

The repository is organised into two main implementations:

```text
ecosort/
├── ecosort-python/
│   ├── static/
│   │   └── css/
│   │       └── style.css
│   ├── templates/
│   │   ├── admin.html
│   │   ├── base.html
│   │   ├── citizen.html
│   │   ├── index.html
│   │   └── report.html
│   ├── app.py
│   ├── classifier.py
│   ├── database.py
│   ├── analytics.py
│   ├── requirements.txt
│   └── .gitignore
├── ecosort-ai-studio/
├── .gitignore
└── README.md
```

### ecosort-python/ — Primary Implementation

This directory contains the main functional implementation of EcoSort, developed using Python and Flask.

It includes the waste classification system, database operations, citizen reporting functionality, municipal administration dashboard, and data analytics.

- `app.py` — Main Flask application.
- `classifier.py` — Waste identification and disposal guidance.
- `database.py` — Database creation, report storage, and status management.
- `analytics.py` — Statistical analysis of submitted civic reports.
- `templates/` — HTML templates for the application interface.
- `static/` — Stylesheets and static resources.
- `requirements.txt` — Required Python dependencies.

The Python implementation is the primary application used for demonstration and deployment.

### ecosort-ai-studio/ — Original Prototype

This directory contains the original implementation generated using Google AI Studio.

It serves as an initial design prototype, visual reference, and backup demonstration of the EcoSort concept.

The AI Studio implementation is maintained separately from the primary Python application.

---

## 6. Installation & Setup

### Prerequisites

Ensure that the following are installed on your system:

- Python 3
- pip (Python package manager)
- Git
- A modern web browser

### Step 1: Clone the Repository

```bash
git clone https://github.com/avnik-7/ecosort.git
```

### Step 2: Navigate to the Python Application

```bash
cd ecosort/ecosort-python
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Run the Application

```bash
python app.py
```

### Step 5: Access the Application

Open a web browser and navigate to:

```text
http://localhost:5000
```

The SQLite database is initialised automatically when the application starts.

An internet connection is required to load the Chart.js library used in the administration dashboard.

---

## 7. How It Works

### Citizen Workflow

1. The citizen opens the EcoSort platform.
2. The citizen selects the waste identification feature.
3. The name of a waste item is entered into the identification field.
4. The system processes the input using its predefined classification rules.
5. The application displays the waste category, suggested disposal destination, and relevant disposal instructions.
6. If the citizen encounters a waste-related issue, they can access the reporting section.
7. The citizen selects a waste category, enters the location, and provides a description of the issue.
8. The report is submitted and stored in the database with a Pending status.

### Municipal Administrator Workflow

1. The administrator accesses the municipal administration dashboard.
2. The dashboard displays submitted civic reports and their current statuses.
3. The administrator reviews the location, category, and description of each reported issue.
4. The administrator updates the complaint status based on its resolution progress.
5. The dashboard presents updated report statistics and visualisations.
6. The available analytics help administrators understand reported waste patterns and monitor complaint resolution.

---

## 8. Deployment

The primary Python Flask application is deployed on Render using Gunicorn.

The hosted application allows users to explore the platform's waste identification, civic reporting, municipal dashboard, and analytics features directly through a web browser.

### Live Application

[Access EcoSort](https://ecosort-89qw.onrender.com/)

---

## 9. Limitations & Future Scope

### Current Implementation

The current version of EcoSort is a functional demonstration prototype that includes:

- Text-based, rule-based waste identification.
- Waste classification and disposal guidance.
- Citizen complaint submission.
- SQLite-based report storage.
- Municipal report viewing and status management.
- Waste category and complaint status analytics.

### Current Limitations

- Waste identification depends on predefined classification rules and supported item names.
- Image-based waste recognition is not currently implemented in the primary Python application.
- User authentication and role-based access control are not currently implemented.
- Report locations are entered manually.
- The application uses a local SQLite database.
- The platform is a demonstration prototype and is not currently integrated with live municipal waste management systems.

### Future Scope

Potential improvements to EcoSort include:

- AI-powered image recognition for automated waste identification.
- Expansion of the waste classification database.
- Secure citizen and administrator authentication.
- Role-based access control.
- GPS and map-based reporting of waste-related issues.
- Complaint tracking and notification systems.
- Integration with municipal waste collection services.
- Scalable database infrastructure for larger deployments.
- Advanced analytics to support waste management planning.
- Multilingual support to improve accessibility.

These improvements represent proposed future developments and are not part of the current Python implementation.

---

## 10. Team & Acknowledgements

### Team Members

- Pranav A D
- Ayush Jaiswal
- Khushi Mishra
- Avni Kedar

### Acknowledgements

EcoSort is developed as a collaborative project for Srujan Hackathon by L&T 2026, with the objective of addressing practical challenges in waste segregation and municipal waste management through technology.

The team acknowledges the open-source tools, libraries, and development platforms that contributed to the development, visualisation, and deployment of the project.

**EcoSort — Waste Less. Live Better.**
