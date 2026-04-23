Resilient Distributed Task Scheduler (RDTS)

A fault-tolerant distributed task processing system designed to offload long-running processes from APIs and improve reliability using asynchronous background execution.


Problem Statement:

RDTS was built to address high API latency and reliability issues in applications that handle heavy, synchronous tasks. By decoupling request handling from execution, the system improves responsiveness and prevents request timeouts while ensuring tasks are still processed reliably.

Key Features:

Reliable Queue Pattern-
   Utilizes Redis atomic operations (RPOPLPUSH) to move tasks from a main queue to a processing queue, minimizing the risk of data loss during worker failures.
Automatic Task Recovery-
   Implements retry logic with a maximum retry threshold. Failed tasks are re-queued for execution, ensuring resilience against transient failures.
Dead Letter Queue (DLQ)-
   Tasks that exceed retry limits are moved to a dedicated dead letter queue, enabling debugging and preventing blockage of the main processing pipeline.
Scalable Consumer Architecture-
   Supports multiple concurrent worker instances, enabling horizontal scaling and improved throughput under increased load.
Real-Time Status Dashboard-
   A React-based interface that provides visibility into task states (pending, completed, failed) and overall system health.
At-Least-Once Execution-
   Ensures that each task is executed at least once, prioritizing reliability over strict deduplication.


System Architecture:
 The system follows a decoupled producer-consumer architecture:
Producer (API Server): A FastAPI-based service that validates incoming requests and publishes task metadata to Redis.
Message Broker (Redis): Manages task queues and distributes work across workers.
Consumers (Workers): Python-based background processes that execute tasks and update their status.
Database (PostgreSQL): Stores persistent task records, status updates, and execution history.

How It Works:

A client sends a request to the FastAPI server, which creates a task entry in PostgreSQL.


The task is pushed to a Redis queue (task_queue).


A worker atomically moves the task to a processing queue using RPOPLPUSH and begins execution.


On success, the task status is updated to completed.
On failure, the task is retried or moved to the dead letter queue after exceeding retry limits.


Tech Stack:

Backend-
Python
FastAPI

Frontend-
React.js
Axios
CSS3

Database and Infrastructure-
PostgreSQL
Redis
Docker
Docker Compose

Performance Gains (Observed):
API latency reduced significantly by offloading long-running tasks to asynchronous workers, improving responsiveness to sub-100ms for request handling.
Improved reliability through retry mechanisms and DLQ handling, preventing silent task failures.
Validated concurrent processing across multiple worker instances in a containerized environment.


Getting Started:
Clone the repository:
git clone https://github.com/your-username/rdts-engine.git
cd rdts-engine

Start the core infrastructure (database, Redis, backend, and workers):
docker-compose up --build -d

Start the frontend dashboard:
cd frontend
npm install
npm start

Access the application:
Dashboard: http://localhost:3000
API Docs: http://localhost:8000/docs

Future Improvements:
Priority Queuing: Introduce multiple priority levels for task scheduling.
Secure Access: Implement OAuth2-based authentication for API and dashboard.
Enhanced Persistence: Configure Redis persistence (AOF/RDB) for stronger durability guarantees.


Why This Project Matters:
Demonstrates how asynchronous processing, retry mechanisms, and queue-based architectures can be combined to build reliable and scalable backend systems. Highlights practical understanding of distributed systems concepts such as fault tolerance, message durability trade-offs, and horizontal scalability.