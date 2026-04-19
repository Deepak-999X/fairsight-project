"""
FairSight AI — Audit ORM Model
Stores completed bias audit results.
"""

from datetime import datetime
from sqlalchemy import String, DateTime, Float, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Audit(Base):
    __tablename__ = "audits"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    dataset_name: Mapped[str] = mapped_column(String(255), nullable=False)
    protected_attribute: Mapped[str] = mapped_column(String(100), nullable=False)
    outcome_column: Mapped[str] = mapped_column(String(100), nullable=False)
    task_type: Mapped[str] = mapped_column(String(50), default="classification")
    fairness_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    letter_grade: Mapped[str | None] = mapped_column(String(2), nullable=True)
    metrics_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    report_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    group_stats_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="audits")
    upload = relationship("Upload", back_populates="audit", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Audit(id={self.id}, dataset='{self.dataset_name}', score={self.fairness_score})>"
