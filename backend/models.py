from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String)
    category = Column(String)
    priority = Column(String)
    title = Column(String)
    description = Column(Text)
    status = Column(String)
    created_at = Column(DateTime)
    assignee = Column(Text)       # JSON как строка
    attachments = Column(Text)    # JSON как строка
    history = Column(Text)        # JSON как строка
    comments = Column(Text)       # JSON как строка - новое поле для комментариев
    rating = Column(Float)

