"""
MindPulse Database Layer - SQLite with SQLAlchemy
"""
import os
import uuid
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Float, DateTime, ForeignKey, event, text
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

DB_PATH = os.path.join(os.path.dirname(__file__), "mindpulse.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=False)

# Enable WAL mode for better concurrent reads
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    academic_pressure = Column(Float, nullable=False)
    cgpa = Column(Float, nullable=False)
    study_satisfaction = Column(Float, nullable=False)
    sleep_duration = Column(Float, nullable=False)
    dietary_habits = Column(String, nullable=False)
    financial_stress = Column(Float, nullable=False)
    family_history = Column(String, nullable=False)
    physical_activity = Column(String, nullable=True, default="Light")
    social_support = Column(Float, nullable=True, default=3.0)
    screen_time = Column(Float, nullable=True, default=4.0)
    risk_score = Column(Float, nullable=False)
    risk_tier = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")


def init_db():
    """Create all tables if they don't exist and run auto-migrations for new columns."""
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        for col, definition in [
            ("physical_activity", "TEXT DEFAULT 'Light'"),
            ("social_support", "REAL DEFAULT 3.0"),
            ("screen_time", "REAL DEFAULT 4.0")
        ]:
            try:
                conn.execute(text(f"ALTER TABLE assessments ADD COLUMN {col} {definition}"))
                conn.commit()
            except Exception:
                pass


def get_db():
    """Dependency for FastAPI to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
