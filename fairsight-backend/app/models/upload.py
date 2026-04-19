"""
FairSight AI — Upload ORM Model
Stores metadata about uploaded datasets.
"""

from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Upload(Base):
    __tablename__ = "uploads"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    audit_id: Mapped[int | None] = mapped_column(ForeignKey("audits.id"), nullable=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    row_count: Mapped[int] = mapped_column(Integer, nullable=False)
    column_names: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string
    protected_attr: Mapped[str | None] = mapped_column(String(100), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    audit = relationship("Audit", back_populates="upload")

    def __repr__(self) -> str:
        return f"<Upload(id={self.id}, filename='{self.filename}', rows={self.row_count})>"
