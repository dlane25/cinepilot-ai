# CinePilot AI - Deployment Guide

This document outlines the procedure to deploy CinePilot AI to Google Cloud in a production-ready configuration.

**Note:** This is a guide only. Do not execute these commands during local development without authorization.

## Architecture Overview

CinePilot AI consists of two main services:
1. **Frontend (Next.js)**: The Command Center user interface. Deployed on Vercel, Cloud Run, or any Next.js-compatible host.
2. **Agent Service (FastAPI)**: The authoritative Python AI runtime. Deployed on Google Cloud Run.

## Prerequisites

1. Google Cloud Project with billing enabled.
2. `gcloud` CLI installed and authenticated.
3. Access to a ClickHouse Cloud cluster.
4. Docker installed locally for container builds.

## 1. Google Cloud Setup

Enable necessary APIs:
```bash
gcloud services enable run.googleapis.com \
    artifactregistry.googleapis.com \
    aiplatform.googleapis.com \
    secretmanager.googleapis.com
```

Create an Artifact Registry repository for the agent service:
```bash
gcloud artifacts repositories create cinepilot-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for CinePilot services"
```

## 2. Secrets Management

Store sensitive configuration in Google Cloud Secret Manager.

Create secrets:
```bash
echo -n "your-clickhouse-password" | gcloud secrets create clickhouse-password --data-file=-
```

## 3. Deploying the Agent Service (FastAPI)

The Python agent service is containerized and designed to run on Google Cloud Run.

Build and push the Docker image:
```bash
cd agent-service
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cinepilot-repo/agent-service:latest
```

Deploy to Cloud Run:
```bash
gcloud run deploy agent-service \
    --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cinepilot-repo/agent-service:latest \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID \
    --set-env-vars GOOGLE_CLOUD_LOCATION=us-central1 \
    --set-env-vars GOOGLE_GENAI_USE_VERTEXAI=true \
    --set-env-vars CLICKHOUSE_HOST=your-clickhouse-host.clickhouse.cloud \
    --set-env-vars CLICKHOUSE_PORT=9440 \
    --set-env-vars CLICKHOUSE_USERNAME=default \
    --set-env-vars CLICKHOUSE_DATABASE=default \
    --set-env-vars CLICKHOUSE_SECURE=true \
    --set-env-vars CORS_ORIGINS="https://your-frontend-domain.com" \
    --set-secrets CLICKHOUSE_PASSWORD=clickhouse-password:latest
```

*Note: Ensure the Cloud Run service account has permissions to access Secret Manager (`roles/secretmanager.secretAccessor`) and Vertex AI (`roles/aiplatform.user`).*

## 4. Deploying the Frontend (Next.js)

The Next.js frontend acts as a proxy to the Agent Service. Ensure `CINEPILOT_AGENT_SERVICE_URL` points to the Cloud Run URL.

If deploying to Cloud Run:
```bash
cd .. # Go to project root
# Requires adding a Dockerfile for the Next.js app
# Ensure CINEPILOT_AGENT_SERVICE_URL is passed as a build arg or environment variable.
```

If deploying to Vercel:
1. Connect the GitHub repository to Vercel.
2. Set the `CINEPILOT_AGENT_SERVICE_URL` environment variable to the Cloud Run URL of the agent service.

## 5. Post-Deployment Validation

1. Check the Agent Service health/readiness endpoint:
   `curl https://agent-service-url.a.run.app/api/v1/ready`
2. Open the Command Center frontend.
3. Test a live analysis to ensure Vertex AI orchestration and ClickHouse auditing are functioning.
4. Verify CORS: Ensure browser requests to the backend proxy successfully without CORS errors.

## 6. Rollback and Recovery

If a deployment introduces regressions:
1. Revert the Cloud Run traffic to the previous revision via the Google Cloud Console.
2. In Vercel, use the "Promote to Production" feature on the last known good deployment.
