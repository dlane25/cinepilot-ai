FROM python:3.13-slim

WORKDIR /app

# Prevent Python from writing .pyc files and ensure unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build dependencies
RUN pip install --no-cache-dir hatchling

# Copy project definition and readme
COPY pyproject.toml .
COPY README.md .

# Install dependencies directly using pip
RUN pip install --no-cache-dir .

# Copy application source
COPY app/ ./app/

# Use the PORT environment variable provided by Cloud Run, default to 8000
ENV PORT=8000

# Start Uvicorn, binding to 0.0.0.0
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
