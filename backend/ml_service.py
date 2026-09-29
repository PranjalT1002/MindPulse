"""
MindPulse ML Service - AI Inference, Trigger Attribution & Counterfactual Simulation
Loads the attached mental_health_model.joblib pipeline on startup.
Enhanced with a Clinical Guardrail & Monotonicity layer to correct for tabular survey
feature imbalances (e.g., severe sleep deprivation / nutritional strain).
"""
import joblib
import pandas as pd
import numpy as np
import os
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Compatibility shim for models saved with scikit-learn 1.6.x loaded in 1.8.x
try:
    import sklearn.compose._column_transformer as ct
    if not hasattr(ct, "_RemainderColsList"):
        class _RemainderColsList(list):
            pass
        ct._RemainderColsList = _RemainderColsList
except Exception:
    pass

# Look for model in the 'Model' directory in parent mindpulse directory first, with fallback to backend dir
_PARENT_DIR = os.path.dirname(os.path.dirname(__file__))
_MODEL_CANDIDATES = [
    os.path.join(_PARENT_DIR, "Model", "mental_health_model.joblib"),
    os.path.join(_PARENT_DIR, "model", "mental_health_model.joblib"),
    os.path.join(os.path.dirname(__file__), "mental_health_model.joblib"),
    os.path.join(os.path.dirname(_PARENT_DIR), "mental_health_model.joblib"),
]

MODEL_PATH = next((p for p in _MODEL_CANDIDATES if os.path.exists(p)), _MODEL_CANDIDATES[0])

# Load the trained pipeline once at module import
try:
    pipeline = joblib.load(MODEL_PATH)
    print(f"[ML Service] Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"[ML Service] WARNING: Could not load model from {MODEL_PATH}: {e}")
    pipeline = None


def _build_input_df(data: dict) -> pd.DataFrame:
    """Build the input DataFrame matching the model's expected feature names."""
    return pd.DataFrame([{
        'Academic Pressure': float(data['academicPressure']),
        'CGPA': float(data['cgpa']),
        'Study Satisfaction': float(data['studySatisfaction']),
        'Sleep Duration': float(data['sleepDuration']),
        'Dietary Habits': str(data['dietaryHabits']),
        'Financial Stress': float(data['financialStress']),
        'Family History of Mental Illness': str(data['familyHistory'])
    }])


def _compute_calibrated_strain(data: dict, raw_ml_score: float) -> float:
    """
    Clinical Safety Guardrail Layer:
    Corrects for the survey dataset's statistical feature imbalance (where Sleep was
    underweighted at 3.9% and Academic Pressure was 44.5%).
    Enforces physiological strain floors and integrates modern lifestyle vitals:
    Physical Activity and Social Connection / Peer Support.
    """
    sleep = float(data.get('sleepDuration', 7.0))
    diet = str(data.get('dietaryHabits', 'Moderate'))
    activity = str(data.get('physicalActivity', 'Light'))
    social = float(data.get('socialSupport', 3.0))
    screen = float(data.get('screenTime', 4.0))

    # Acute physiological sleep strain penalties
    sleep_penalty = 0.0
    if sleep <= 3.5:
        sleep_penalty = 35.0  # Acute circadian collapse
    elif sleep <= 4.5:
        sleep_penalty = 25.0  # Severe sleep deficit
    elif sleep <= 5.5:
        sleep_penalty = 15.0  # Chronic restriction
    elif sleep >= 10.0:
        sleep_penalty = 8.0   # Hypersomnia / depressive exhaustion

    # Nutritional deficit penalties
    diet_penalty = 0.0
    if diet == 'Unhealthy':
        diet_penalty = 10.0
    elif diet == 'Moderate':
        diet_penalty = 3.0

    # Physical activity factor
    activity_penalty = 0.0
    if activity == 'Sedentary':
        activity_penalty = 7.0
    elif activity == 'Active':
        activity_penalty = -7.0

    # Social connection factor (1.0 to 5.0)
    social_penalty = 0.0
    if social <= 1.5:
        social_penalty = 10.0
    elif social <= 2.5:
        social_penalty = 5.0
    elif social >= 4.5:
        social_penalty = -7.0
    elif social >= 3.5:
        social_penalty = -3.5

    # Screen time factor (hours of non-academic screen exposure)
    screen_penalty = 0.0
    if screen >= 7.0:
        screen_penalty = 7.0   # High sensory overload & melatonin suppression
    elif screen >= 5.0:
        screen_penalty = 3.5   # Moderate digital fatigue
    elif screen <= 2.0:
        screen_penalty = -4.0  # Mindful digital boundary buffer

    phys_penalty = sleep_penalty + diet_penalty + activity_penalty + social_penalty + screen_penalty

    # Blended calibration: respects ML prediction while anchoring physiological reality
    calibrated = (raw_ml_score * 0.60) + phys_penalty

    # Clinical safety floors: 3-4 hours of sleep cannot mathematically be labeled "Manageable"
    if sleep <= 4.0:
        calibrated = max(calibrated, 50.0)
    elif sleep <= 5.5 and diet == 'Unhealthy':
        calibrated = max(calibrated, 40.0)

    return round(float(min(98.5, max(5.0, calibrated))), 1)


def _get_tier(score: float) -> str:
    """Determine risk tier from continuous strain score."""
    if score >= 65.0:
        return "Critical Strain"
    elif score >= 35.0:
        return "Elevated Strain"
    return "Manageable"


def analyze_student_profile(data: dict) -> dict:
    """
    Accepts student metrics, executes model prediction, applies clinical guardrails,
    computes root cause triggers, and runs a counterfactual 'What-If' simulation.
    """
    if pipeline is None:
        raise RuntimeError("ML model not loaded. Ensure mental_health_model.joblib is present.")

    input_df = _build_input_df(data)

    # 1. Base ML model prediction (RandomForest proba)
    raw_prob = pipeline.predict_proba(input_df)[0][1]
    raw_score = round(float(raw_prob * 100), 1)

    # 2. Apply Clinical Guardrails
    risk_score = _compute_calibrated_strain(data, raw_score)
    tier = _get_tier(risk_score)

    # 3. Trigger Attribution (Explainable Insights)
    triggers = []
    if float(data['sleepDuration']) <= 5.5:
        triggers.append({
            "factor": "Critical Sleep Shortage",
            "impact": "High",
            "description": "Sleeping under 6 hours exacerbates emotional and physical fatigue.",
            "icon": "moon"
        })
    if float(data['financialStress']) >= 4.0:
        triggers.append({
            "factor": "High Financial Worry",
            "impact": "High",
            "description": "Everyday monetary strain significantly impacts academic focus.",
            "icon": "wallet"
        })
    if float(data['academicPressure']) >= 4.0:
        triggers.append({
            "factor": "Intense Academic Workload",
            "impact": "Medium",
            "description": "Continuous assessment deadlines with minimal recovery intervals.",
            "icon": "book-open"
        })
    if data['dietaryHabits'] == "Unhealthy":
        triggers.append({
            "factor": "Irregular Meal Habits",
            "impact": "Medium",
            "description": "Erratic nutrition causes blood glucose spikes that mimic anxiety.",
            "icon": "utensils"
        })
    if float(data['studySatisfaction']) <= 2.0:
        triggers.append({
            "factor": "Low Study Fulfillment",
            "impact": "Medium",
            "description": "Feeling disconnected from your coursework erodes motivation over time.",
            "icon": "frown"
        })
    if float(data['cgpa']) <= 4.0:
        triggers.append({
            "factor": "Academic Performance Concerns",
            "impact": "Medium",
            "description": "Lower grades can create a cycle of stress that compounds other pressures.",
            "icon": "trending-down"
        })
    if float(data.get('socialSupport', 3.0)) <= 2.0:
        triggers.append({
            "factor": "Social Isolation Strain",
            "impact": "High",
            "description": "Lack of trusted peer connections significantly amplifies academic and personal stress.",
            "icon": "users"
        })
    if str(data.get('physicalActivity', 'Light')) == "Sedentary":
        triggers.append({
            "factor": "Sedentary Routine Deficit",
            "impact": "Medium",
            "description": "Minimal physical movement contributes to physical stagnation and cognitive fatigue.",
            "icon": "activity"
        })
    if float(data.get('screenTime', 4.0)) >= 6.0:
        triggers.append({
            "factor": "Digital Fatigue & Screen Overload",
            "impact": "Medium",
            "description": "High non-academic screen exposure overstimulates sensory pathways and degrades sleep onset.",
            "icon": "smartphone"
        })

    # 4. Prescriptive Counterfactual "What-If" Simulation (Restored baseline)
    sim_result = simulate_what_if(
        data,
        sleep_override=7.5,
        diet_override='Healthy',
        activity_override='Active',
        social_override=4.5,
        screen_override=2.0
    )
    improved_score = sim_result["projectedScore"]

    # 5. Contextual Guidance Directives
    guidance = []
    if float(data['sleepDuration']) <= 5.5:
        guidance.append({
            "title": "Circadian Rest Protocol",
            "type": "lifestyle",
            "action": "Adopt a 14-day progressive bedtime routine: shut off blue screens 45 mins before sleep and aim for 7.5h.",
            "icon": "moon"
        })
    if float(data['financialStress']) >= 4.0:
        guidance.append({
            "title": "Campus Emergency Relief Bursary",
            "type": "resource",
            "action": "Connect directly with student financial aid for emergency micro-grants and subsidized campus meal access.",
            "icon": "hand-coins"
        })
    if float(data['academicPressure']) >= 4.0:
        guidance.append({
            "title": "Study Pacing & Academic Support",
            "type": "academic",
            "action": "Implement a 50/10 Pomodoro cadence and book a 1-on-1 pacing review with the peer tutoring desk.",
            "icon": "clock"
        })
    if data['dietaryHabits'] == "Unhealthy":
        guidance.append({
            "title": "Nutrition Stabilization Plan",
            "type": "lifestyle",
            "action": "Start with one consistent meal per day at a fixed time. Campus dining subsidies may be available.",
            "icon": "apple"
        })
    if float(data.get('socialSupport', 3.0)) <= 2.0:
        guidance.append({
            "title": "Peer Connection Initiative",
            "type": "social",
            "action": "Join a campus interest club or connect with peer study circles to build trusted social anchors.",
            "icon": "users"
        })
    if str(data.get('physicalActivity', 'Light')) == "Sedentary":
        guidance.append({
            "title": "Brisk Movement Protocol",
            "type": "lifestyle",
            "action": "Incorporate a 20-minute daily outdoor walk or light exercise between study blocks to stimulate dopamine.",
            "icon": "activity"
        })
    if float(data.get('screenTime', 4.0)) >= 6.0:
        guidance.append({
            "title": "Digital Sunset Protocol",
            "type": "lifestyle",
            "action": "Implement a 45-minute blue-light screen curfew before bed and switch mobile devices to grayscale.",
            "icon": "smartphone"
        })

    return {
        "riskScore": risk_score,
        "riskTier": tier,
        "triggers": triggers,
        "counterfactual": {
            "achievableScore": improved_score,
            "potentialReduction": round(max(0.0, risk_score - improved_score), 1)
        },
        "guidance": guidance
    }


def simulate_what_if(
    data: dict,
    sleep_override: float = None,
    diet_override: str = None,
    activity_override: str = None,
    social_override: float = None,
    screen_override: float = None
) -> dict:
    """
    Run a targeted What-If simulation with specific overrides.
    Supports true bidirectional dynamic simulation:
    - Positive lifestyle shifts (better sleep, nutrition, activity, social support, lower screen time)
      reduce psychological strain.
    - Negative lifestyle shifts (sleep deprivation, skipping meals, sedentary habits, isolation, screen overload)
      increase psychological strain.
    """
    if pipeline is None:
        raise RuntimeError("ML model not loaded.")

    input_df = _build_input_df(data)

    current_sleep = float(data.get('sleepDuration', 7.0))
    current_diet = str(data.get('dietaryHabits', 'Moderate'))
    current_activity = str(data.get('physicalActivity', 'Light'))
    current_social = float(data.get('socialSupport', 3.0))
    current_screen = float(data.get('screenTime', 4.0))

    target_sleep = float(sleep_override) if sleep_override is not None else current_sleep
    target_diet = str(diet_override) if diet_override is not None else current_diet
    target_activity = str(activity_override) if activity_override is not None else current_activity
    target_social = float(social_override) if social_override is not None else current_social
    target_screen = float(screen_override) if screen_override is not None else current_screen

    # Evaluate ML model on simulated sleep and diet
    sim_data = input_df.copy()
    sim_data['Sleep Duration'] = target_sleep
    sim_data['Dietary Habits'] = target_diet
    sim_raw_prob = pipeline.predict_proba(sim_data)[0][1]

    # Compute calibrated strain under the simulated lifestyle state
    projected_score = _compute_calibrated_strain({
        **data,
        'sleepDuration': target_sleep,
        'dietaryHabits': target_diet,
        'physicalActivity': target_activity,
        'socialSupport': target_social,
        'screenTime': target_screen
    }, float(sim_raw_prob * 100))

    projected_score = round(float(max(5.0, min(98.5, projected_score))), 1)

    return {
        "projectedScore": projected_score,
        "projectedTier": _get_tier(projected_score)
    }
