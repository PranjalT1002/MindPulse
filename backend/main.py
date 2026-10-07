"""
MindPulse Backend - FastAPI Application
Complete REST API for student mental well-being assessment platform.
"""
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

from database import init_db, get_db, User, Assessment
from auth import hash_password, verify_password, create_access_token, decode_access_token
from ml_service import analyze_student_profile, simulate_what_if

# Initialize
app = FastAPI(title="MindPulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    print("[MindPulse] Database initialized. Server ready.")


# ─── Pydantic Models ─────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    fullName: str = Field(min_length=1)

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict

class AssessmentRequest(BaseModel):
    academicPressure: float = Field(ge=1.0, le=5.0)
    cgpa: float = Field(ge=0.0, le=10.0)
    studySatisfaction: float = Field(ge=1.0, le=5.0)
    sleepDuration: float = Field(ge=2.0, le=12.0)
    dietaryHabits: str  # "Healthy", "Moderate", "Unhealthy"
    financialStress: float = Field(ge=1.0, le=5.0)
    familyHistory: str  # "Yes" or "No"
    physicalActivity: Optional[str] = "Light"  # "Sedentary", "Light", "Active"
    socialSupport: Optional[float] = 3.0  # 1.0 to 5.0
    screenTime: Optional[float] = 4.0  # Daily non-academic screen hours
    ephemeral: bool = False  # If true, don't persist

class WhatIfRequest(BaseModel):
    academicPressure: float = Field(ge=1.0, le=5.0)
    cgpa: float = Field(ge=0.0, le=10.0)
    studySatisfaction: float = Field(ge=1.0, le=5.0)
    sleepDuration: float = Field(ge=2.0, le=12.0)
    dietaryHabits: str
    financialStress: float = Field(ge=1.0, le=5.0)
    familyHistory: str
    physicalActivity: Optional[str] = "Light"
    socialSupport: Optional[float] = 3.0
    screenTime: Optional[float] = 4.0
    sleepOverride: Optional[float] = None
    dietOverride: Optional[str] = None
    activityOverride: Optional[str] = None
    socialOverride: Optional[float] = None
    screenOverride: Optional[float] = None


# ─── Auth Dependency ──────────────────────────────────────────────

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> Optional[User]:
    """Extract user from JWT token. Returns None if no valid token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    return user


def require_auth(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    """Strict auth — raises 401 if not authenticated."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ─── Auth Endpoints ──────────────────────────────────────────────

@app.post("/api/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        full_name=req.fullName
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "createdAt": user.created_at.isoformat() if user.created_at else None
        }
    }


@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "email": user.email})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "createdAt": user.created_at.isoformat() if user.created_at else None
        }
    }


@app.get("/api/auth/me")
def get_me(user: User = Depends(require_auth)):
    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "createdAt": user.created_at.isoformat() if user.created_at else None
    }


# ─── Assessment Endpoints ────────────────────────────────────────

@app.post("/api/assessment")
def create_assessment(
    req: AssessmentRequest,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user)
):
    """Run ML model and optionally persist the assessment."""
    data = {
        "academicPressure": req.academicPressure,
        "cgpa": req.cgpa,
        "studySatisfaction": req.studySatisfaction,
        "sleepDuration": req.sleepDuration,
        "dietaryHabits": req.dietaryHabits,
        "financialStress": req.financialStress,
        "familyHistory": req.familyHistory,
        "physicalActivity": req.physicalActivity or "Light",
        "socialSupport": req.socialSupport if req.socialSupport is not None else 3.0,
        "screenTime": req.screenTime if req.screenTime is not None else 4.0
    }

    result = analyze_student_profile(data)

    # Save to DB unless ephemeral mode
    assessment_id = None
    if not req.ephemeral and user:
        assessment = Assessment(
            user_id=user.id,
            academic_pressure=req.academicPressure,
            cgpa=req.cgpa,
            study_satisfaction=req.studySatisfaction,
            sleep_duration=req.sleepDuration,
            dietary_habits=req.dietaryHabits,
            financial_stress=req.financialStress,
            family_history=req.familyHistory,
            physical_activity=req.physicalActivity or "Light",
            social_support=req.socialSupport if req.socialSupport is not None else 3.0,
            screen_time=req.screenTime if req.screenTime is not None else 4.0,
            risk_score=result["riskScore"],
            risk_tier=result["riskTier"]
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        assessment_id = assessment.id

    return {
        "id": assessment_id,
        "ephemeral": req.ephemeral or not user,
        **result,
        "input": data
    }


@app.get("/api/assessments")
def list_assessments(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get all assessments for the authenticated user, ordered by date."""
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == user.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "academicPressure": a.academic_pressure,
            "cgpa": a.cgpa,
            "studySatisfaction": a.study_satisfaction,
            "sleepDuration": a.sleep_duration,
            "dietaryHabits": a.dietary_habits,
            "financialStress": a.financial_stress,
            "familyHistory": a.family_history,
            "physicalActivity": getattr(a, 'physical_activity', 'Light') or 'Light',
            "socialSupport": getattr(a, 'social_support', 3.0) if getattr(a, 'social_support', None) is not None else 3.0,
            "screenTime": getattr(a, 'screen_time', 4.0) if getattr(a, 'screen_time', None) is not None else 4.0,
            "riskScore": a.risk_score,
            "riskTier": a.risk_tier,
            "createdAt": a.created_at.isoformat() if a.created_at else None
        }
        for a in assessments
    ]


@app.get("/api/assessments/latest")
def get_latest_assessment(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get the most recent assessment with full ML analysis."""
    assessment = (
        db.query(Assessment)
        .filter(Assessment.user_id == user.id)
        .order_by(Assessment.created_at.desc())
        .first()
    )
    if not assessment:
        return {"hasData": False}

    # Re-run analysis to get full triggers/guidance
    data = {
        "academicPressure": assessment.academic_pressure,
        "cgpa": assessment.cgpa,
        "studySatisfaction": assessment.study_satisfaction,
        "sleepDuration": assessment.sleep_duration,
        "dietaryHabits": assessment.dietary_habits,
        "financialStress": assessment.financial_stress,
        "familyHistory": assessment.family_history,
        "physicalActivity": getattr(assessment, 'physical_activity', 'Light') or 'Light',
        "socialSupport": getattr(assessment, 'social_support', 3.0) if getattr(assessment, 'social_support', None) is not None else 3.0,
        "screenTime": getattr(assessment, 'screen_time', 4.0) if getattr(assessment, 'screen_time', None) is not None else 4.0
    }
    analysis = analyze_student_profile(data)

    return {
        "hasData": True,
        "id": assessment.id,
        "createdAt": assessment.created_at.isoformat() if assessment.created_at else None,
        "input": data,
        **analysis
    }


# ─── What-If Simulation ──────────────────────────────────────────

@app.post("/api/what-if")
def run_what_if(req: WhatIfRequest):
    """Run a counterfactual What-If simulation with custom overrides."""
    data = {
        "academicPressure": req.academicPressure,
        "cgpa": req.cgpa,
        "studySatisfaction": req.studySatisfaction,
        "sleepDuration": req.sleepDuration,
        "dietaryHabits": req.dietaryHabits,
        "financialStress": req.financialStress,
        "familyHistory": req.familyHistory,
        "physicalActivity": req.physicalActivity or "Light",
        "socialSupport": req.socialSupport if req.socialSupport is not None else 3.0,
        "screenTime": req.screenTime if req.screenTime is not None else 4.0
    }

    # Get baseline
    baseline = analyze_student_profile(data)

    # Get simulated
    simulated = simulate_what_if(
        data,
        sleep_override=req.sleepOverride,
        diet_override=req.dietOverride,
        activity_override=req.activityOverride,
        social_override=req.socialOverride,
        screen_override=req.screenOverride
    )

    return {
        "baseline": baseline,
        "simulated": simulated,
        "delta": round(baseline["riskScore"] - simulated["projectedScore"], 1)
    }


# ─── Data Management ─────────────────────────────────────────────

@app.delete("/api/assessments")
def purge_assessments(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Permanently delete all assessment records for the authenticated user."""
    db.query(Assessment).filter(Assessment.user_id == user.id).delete()
    db.commit()
    return {"message": "All check-in history has been permanently removed.", "deleted": True}


@app.delete("/api/auth/account")
def delete_account(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Permanently delete the user account and all associated data."""
    db.delete(user)
    db.commit()
    return {"message": "Account and all data permanently deleted.", "deleted": True}


# ─── Health ───────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "MindPulse API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
