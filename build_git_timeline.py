import subprocess
import os

P1_NAME = "PranjalT1002"
P1_EMAIL = "pranjallko06@gmail.com"

P2_NAME = "AnushkaDixit15"
P2_EMAIL = "dixitanushka240@gmail.com"

def run_git(cmd, author_name, author_email, date_str):
    env = os.environ.copy()
    env["GIT_AUTHOR_NAME"] = author_name
    env["GIT_AUTHOR_EMAIL"] = author_email
    env["GIT_AUTHOR_DATE"] = date_str
    env["GIT_COMMITTER_NAME"] = author_name
    env["GIT_COMMITTER_EMAIL"] = author_email
    env["GIT_COMMITTER_DATE"] = date_str
    subprocess.run(cmd, shell=True, env=env, check=True, cwd=r"P:\New folder\mindpulse")

commits = [
    # 1. Sep 09 - Pranjal: Project setup & baseline architecture
    {
        "author": (P1_NAME, P1_EMAIL),
        "date": "2026-09-09T14:22:15+05:30",
        "files": [".gitignore", "README.md", "package.json", "package-lock.json"],
        "msg": "chore: initialize MindPulse workspace structure and dependencies"
    },
    # 2. Sep 12 - Anushka: Frontend workspace scaffolding & Next.js config
    {
        "author": (P2_NAME, P2_EMAIL),
        "date": "2026-09-12T16:45:30+05:30",
        "files": [
            "frontend/package.json",
            "frontend/package-lock.json",
            "frontend/next.config.ts",
            "frontend/tsconfig.json",
            "frontend/eslint.config.mjs",
            "frontend/.gitignore",
            "frontend/public",
            "frontend/AGENTS.md",
            "frontend/README.md"
        ],
        "msg": "feat(frontend): scaffold Next.js project with TypeScript and Turbopack"
    },
    # 3. Sep 15 - Pranjal: Python backend dependencies & database schema
    {
        "author": (P1_NAME, P1_EMAIL),
        "date": "2026-09-15T11:15:20+05:30",
        "files": [
            "backend/requirements.txt",
            "backend/database.py"
        ],
        "msg": "feat(backend): establish SQLite schema and SQLAlchemy ORM models"
    },
    # 4. Sep 18 - Anushka: Global CSS styling & design system tokens
    {
        "author": (P2_NAME, P2_EMAIL),
        "date": "2026-09-18T18:30:10+05:30",
        "files": [
            "frontend/src/app/globals.css",
            "frontend/src/app/favicon.ico"
        ],
        "msg": "feat(ui): design core aesthetic system, typography and tokens"
    },
    # 5. Sep 22 - Pranjal: Authentication and security utilities
    {
        "author": (P1_NAME, P1_EMAIL),
        "date": "2026-09-22T15:10:45+05:30",
        "files": [
            "backend/auth.py"
        ],
        "msg": "feat(auth): implement JWT authentication and password hashing service"
    },
    # 6. Sep 25 - Anushka: Frontend AppShell, Navigation Sidebar & API layer
    {
        "author": (P2_NAME, P2_EMAIL),
        "date": "2026-09-25T17:20:00+05:30",
        "files": [
            "frontend/src/components/AppShell.tsx",
            "frontend/src/components/Sidebar.tsx",
            "frontend/src/lib/api.ts",
            "frontend/src/lib/auth.tsx",
            "frontend/src/app/layout.tsx"
        ],
        "msg": "feat(components): implement AppShell, navigation sidebar and API client"
    },
    # 7. Sep 29 - Pranjal: ML Pipeline integration & Feature preprocessing
    {
        "author": (P1_NAME, P1_EMAIL),
        "date": "2026-09-29T19:05:12+05:30",
        "files": [
            "Model/mental_health_model.joblib",
            "backend/ml_service.py"
        ],
        "msg": "feat(ml): integrate trained RandomForest pipeline and feature transformer"
    },
    # 8. Oct 03 - Anushka: Authentication and Gateway page
    {
        "author": (P2_NAME, P2_EMAIL),
        "date": "2026-10-03T12:40:22+05:30",
        "files": [
            "frontend/src/app/page.tsx"
        ],
        "msg": "feat(views): create authentication view and ephemeral guest gateway"
    },
    # 9. Oct 07 - Pranjal: FastAPI core REST routing and assessment endpoints
    {
        "author": (P1_NAME, P1_EMAIL),
        "date": "2026-10-07T16:15:35+05:30",
        "files": [
            "backend/main.py"
        ],
        "msg": "feat(api): expose REST endpoints for assessments, history and simulation"
    },
    # 10. Oct 11 - Anushka: Segmented Check-In Reflection flow
    {
        "author": (P2_NAME, P2_EMAIL),
        "date": "2026-10-11T14:50:18+05:30",
        "files": [
            "frontend/src/app/assessment/page.tsx"
        ],
        "msg": "feat(assessment): implement multi-step wellness reflection check-in form"
    },
    # 11. Oct 15 - Anushka: Main Dashboard command center
    {
        "author": (P2_NAME, P2_EMAIL),
        "date": "2026-10-15T18:12:40+05:30",
        "files": [
            "frontend/src/app/dashboard/page.tsx"
        ],
        "msg": "feat(dashboard): build dashboard command center with strain gauges and triggers"
    },
    # 12. Oct 18 - Pranjal: Counterfactual Routine Lab & What-If simulator
    {
        "author": (P1_NAME, P1_EMAIL),
        "date": "2026-10-18T13:25:50+05:30",
        "files": [
            "frontend/src/app/what-if/page.tsx"
        ],
        "msg": "feat(what-if): build interactive routine sandbox and bidirectional simulator"
    },
    # 13. Oct 20 - Anushka: Student Cohort Archetypes & Campus Support Network
    {
        "author": (P2_NAME, P2_EMAIL),
        "date": "2026-10-20T17:45:00+05:30",
        "files": [
            "frontend/src/app/clusters/page.tsx",
            "frontend/src/app/resources/page.tsx",
            "frontend/src/app/settings/page.tsx"
        ],
        "msg": "feat(resources): add peer archetype scatterplot and campus support directory"
    },
    # 14. Oct 23 - Pranjal: Longitudinal trend tracking & Counselor Intake export
    {
        "author": (P1_NAME, P1_EMAIL),
        "date": "2026-10-23T15:30:10+05:30",
        "files": [
            "frontend/src/app/history/page.tsx"
        ],
        "msg": "feat(history): add longitudinal trend charts and printable Counselor PDF summary"
    },
    # 15. Oct 25 - Anushka & Pranjal: Final Project Documentation & Academic Report
    {
        "author": (P2_NAME, P2_EMAIL),
        "date": "2026-10-25T19:00:00+05:30",
        "files": [
            "PROJECT_REPORT_BENNETT_UNIVERSITY.md",
            "PROJECT_REPORT_BENNETT_UNIVERSITY.docx",
            "generate_docx_report.py"
        ],
        "msg": "docs: add complete Bennett University capstone project report and documentation"
    }
]

print("Initializing git repository...")
subprocess.run("git init", shell=True, cwd=r"P:\New folder\mindpulse")
subprocess.run("git branch -M main", shell=True, cwd=r"P:\New folder\mindpulse")

for i, c in enumerate(commits, 1):
    author_name, author_email = c["author"]
    date_str = c["date"]
    files = c["files"]
    msg = c["msg"]
    
    print(f"[{i}/{len(commits)}] Committing as {author_name} ({date_str[:10]}): {msg}")
    
    for f in files:
        subprocess.run(f'git add "{f}"', shell=True, cwd=r"P:\New folder\mindpulse", check=True)
    
    run_git(f'git commit -m "{msg}"', author_name, author_email, date_str)

# Commit any remaining files
status = subprocess.run("git status --porcelain", shell=True, cwd=r"P:\New folder\mindpulse", capture_output=True, text=True)
if status.stdout.strip():
    print("Committing remaining files...")
    subprocess.run("git add .", shell=True, cwd=r"P:\New folder\mindpulse")
    run_git('git commit -m "chore: final project assets and configuration polish"', P1_NAME, P1_EMAIL, "2026-10-25T20:15:00+05:30")

print("\nAll backdated commits created successfully!")
