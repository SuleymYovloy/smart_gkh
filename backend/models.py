from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from sqlalchemy import JSON

Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String, index=True)
    category = Column(String)
    priority = Column(String)
    title = Column(String)
    description = Column(Text)
    status = Column(String, default="created")
    created_at = Column(DateTime, default=datetime.utcnow)
    rating = Column(Integer, nullable=True)
    assignee_id = Column(String, nullable=True)
    assignee_name = Column(String, nullable=True)
    assignee_role = Column(String, nullable=True)
    attachments = Column(JSON, nullable=True, default=[])
    history = Column(JSON, nullable=True, default=[])


