from .database import Base
from sqlalchemy import Column, String, DateTime
import datetime
import uuid

class Task(Base):
   # Defining the database table name
    __tablename__ = "tasks"

    # Unique identifier for each task using UUID
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))

    # The descriptive name of the task
    task_name = Column(String, index=True)

    # Current execution status 
    task_status = Column(String, default="Pending")

    # Timestamp indicating when the task was registered
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)