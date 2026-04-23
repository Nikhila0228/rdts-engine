# 1. Base Image
FROM python:3.10-slim

# 2. Set Working Directory
WORKDIR /app

# 3. Install dependencies
# Note: psycopg2 ki konni system libraries avasaram
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the entire app folder
COPY . .

# 5. Command to run is handled by docker-compose, 
# so we don't necessarily need a CMD here, but it's good practice.