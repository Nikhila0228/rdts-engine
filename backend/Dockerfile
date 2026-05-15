# Use the official lightweight Python image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required for PostgreSQL (psycopg2) and compiler tools
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache layers
COPY requirements.txt .

# Install Python dependencies without storing cache to keep image size small
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application source code
COPY . .

# Execution commands are managed via docker-compose.yml

CMD ["sh", "-c", "python app/worker.py & uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]