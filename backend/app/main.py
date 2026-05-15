from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import redis
import os
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration for database and cache hosts
DB_HOST = os.getenv("DB_HOST", "db")
DB_USER = os.getenv("DB_USER", "neondb_owner")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")  # Render variables lo unna pass ni chaduvuthundi
DB_NAME = os.getenv("DB_NAME", "neondb")
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}?sslmode=require"

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

class TaskCreate(BaseModel):
    name: str

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# Automatically create tasks table if it doesn't exist on startup
@app.on_event("startup")
def setup_database():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                task_name VARCHAR(255) NOT NULL,
                task_status VARCHAR(50) DEFAULT 'Pending',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Database Initialization Error: {e}")

@app.get("/tasks")
def get_tasks():
    db_connection = get_db_connection()
    db_cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    db_cursor.execute("SELECT id, task_name as name, task_status FROM tasks ORDER BY id DESC")
    all_tasks = db_cursor.fetchall()
    db_cursor.close()
    db_connection.close()
    return all_tasks

@app.post("/tasks")
def create_task(task: TaskCreate):
    db_connection = get_db_connection()
    db_cursor = db_connection.cursor()
    db_cursor.execute(
        "INSERT INTO tasks (task_name, task_status) VALUES (%s, 'Pending') RETURNING id",
        (task.name,)
    )
    new_task_id = db_cursor.fetchone()[0]
    db_connection.commit()
    db_cursor.close()
    db_connection.close()

    task_payload = json.dumps({"id": str(new_task_id), "name": task.name})
    redis_client.lpush("task_queue", task_payload)

    return {"id": str(new_task_id), "name": task.name, "status": "Pending"}

@app.get("/stats")
def get_stats():
    tasks_completed, tasks_pending, tasks_failed, is_active = 0, 0, 0, False
    try:
        db_connection = get_db_connection()
        db_cursor = db_connection.cursor()
        db_cursor.execute("SELECT COUNT(*) FROM tasks WHERE task_status = 'Completed'")
        tasks_completed = db_cursor.fetchone()[0]
        db_cursor.execute("SELECT COUNT(*) FROM tasks WHERE task_status = 'Pending'")
        tasks_pending = db_cursor.fetchone()[0]
        tasks_failed = redis_client.llen("dead_letter_queue")
        redis_client.ping()
        is_active = True
        db_cursor.close()
        db_connection.close()
    except Exception as e:
        print(f"Connectivity Error: {e}")
        is_active = False
    
    return {"completed": tasks_completed, "pending": tasks_pending, "failed": tasks_failed, "workers_active": is_active}