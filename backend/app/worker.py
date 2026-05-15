import redis
import time
import psycopg2
import os
import json

# Connection settings
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL:
    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
else:
    local_host = os.getenv("REDIS_HOST", "localhost")
    redis_client = redis.Redis(host=local_host, port=6379, db=0, decode_responses=True)


def execute_worker_cycle():
    # Reliable Pop: Move task from main queue to processing queue
    raw_payload = redis_client.rpoplpush("task_queue", "processing_queue")
    
    if raw_payload:
        try:
            task_info = json.loads(raw_payload)
            current_task_id = task_info.get("id")
            
            # Simulation: Trigger exception if 'fail' is in the task name
            if "fail" in task_info.get("name", "").lower():
                raise Exception("Execution error simulated for testing")

            print(f"[*] Processing Task: {current_task_id}...")
            time.sleep(3) # Simulating processing delay

            # Connect and update task status in PostgreSQL
            db_connection = psycopg2.connect(DATABASE_URL)
            db_cursor = db_connection.cursor()


            db_cursor.execute("UPDATE tasks SET task_status = 'Completed' WHERE id = %s", (current_task_id,))
            db_connection.commit()
            db_cursor.close()
            db_connection.close()
            
            # Remove from processing queue upon successful execution
            redis_client.lrem("processing_queue", 1, raw_payload)
            print(f"[V] Task {current_task_id} completed successfully")

        except Exception as error:
            print(f"[X] Task execution failed: {error}")
            
            # Retry Logic Implementation (Max 3 attempts)
            retry_attempts = task_info.get("retry_count", 0)
            if retry_attempts < 3:
                task_info["retry_count"] = retry_attempts + 1
                print(f"[!] Re-attempting task {current_task_id} (Attempt {task_info['retry_count']}/3)")
                
                # Push back to main queue for another attempt
                redis_client.lpush("task_queue", json.dumps(task_info))
                redis_client.lrem("processing_queue", 1, raw_payload)
            else:
                # Move to Dead Letter Queue (DLQ) after final failure
                print(f"[!!!] Max retries reached for {current_task_id} Moving to DLQ.")
                redis_client.lpush("dead_letter_queue", json.dumps(task_info))
                redis_client.lrem("processing_queue", 1, raw_payload)

if __name__ == "__main__":
    print("[RUNNING] RDTS Worker Instance Active...")
    while True:
        execute_worker_cycle()
        time.sleep(1)