# Webhook Processing Platform 🚀

![CI](https://img.shields.io/github/actions/workflow/status/your-username/webhook-processing-platform/ci.yml?label=CI&logo=github)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)

---

## Overview

A **Webhook-Driven Task Processing Pipeline** inspired by tools like Zapier.

This system allows users to:
- Receive webhook events
- Process them asynchronously
- Deliver results to multiple subscribers

Built with:
- TypeScript
- PostgreSQL
- Docker
- GitHub Actions

---

## Architecture

```
Client → API Server → Database (Jobs Queue)
                          ↓
                        Worker
                          ↓
                   Processing Actions
                          ↓
                    Subscribers
```

---

## Features

- Pipeline CRUD API
- Async webhook processing
- Background worker
- 3 processing actions
- Subscriber delivery + retry
- Job tracking APIs
- Dockerized setup
- CI pipeline
- Full test suite

---

## Project Structure

```
src/
  actions/        # Processing logic
  app/            # Server & worker
  db/             # Schema & queries
  delivery/       # Subscriber delivery
  retry/          # Retry logic
  routes/         # API endpoints
  middleware/     # Express middleware
  types/          # Types
tests/            # Tests
```

---

## Setup

### Clone
```
git clone <repo-url>
cd webhook-processing-platform
```

### Environment
Create `.env`:

```
DATABASE_URL=postgres://user:password@db:5432/app
PORT=3000
```

### Run
```
docker compose up --build
```

---

## API Documentation

### 1. Create Pipeline

**POST /pipelines**

Request:
```json
{
  "name": "email_pipeline",
  "actionType": "compose_candidate_email"
}
```

Response:
```json
{
  "id": "pipeline_id",
  "name": "email_pipeline",
  "actionType": "compose_candidate_email"
}
```

---

### 2. Trigger Webhook

**POST /webhook/:pipelineId**

Request:
```json
[
  {
    "recipient": {
      "name": "John",
      "email": "john@test.com"
    },
    "data": {
      "job_title": "Backend Engineer",
      "interview_time": "10:00 AM"
    }
  }
]
```

Response:
```json
{
  "jobId": "job_uuid",
  "status": "queued"
}
```

---

### 3. Get Job Status

**GET /jobs/:id**

Response:
```json
{
  "id": "job_uuid",
  "status": "completed",
  "pipelineId": "pipeline_id"
}
```

---

### 4. Delivery Attempts

**GET /jobs/:id/delivery-attempts**

Response:
```json
[
  {
    "attemptNumber": 1,
    "status": "failed",
    "responseStatusCode": 500
  },
  {
    "attemptNumber": 2,
    "status": "success"
  }
]
```

---

## Actions

### compose_candidate_email
Transforms webhook payload into email content.

### send_candidate_email
Sends emails to candidates.

### send_http_request
Sends processed data to external APIs.

---

## 🔥 Design Decisions (Important)

### 1. Database as Job Queue
Instead of using Redis or Kafka, PostgreSQL is used as a queue.

Why?
- Simpler architecture
- Strong consistency
- Easier debugging
- No extra infrastructure

Tradeoff:
- Not ideal for very high throughput systems

---

### 2. Worker-Based Processing
Webhook requests are not processed synchronously.

Why?
- Prevents API blocking
- Improves scalability
- Handles spikes safely

---

### 3. Action Abstraction
Each action is implemented as a separate module.

Why?
- Easy to extend
- Clean separation of concerns
- Supports adding new actions without touching core logic

---

### 4. Separate Retry Systems
Two retry mechanisms:
- Job processing retry
- Subscriber delivery retry

Why?
- Different failure types
- Better control over reliability
- Clear debugging

---

### 5. Delivery Attempt Tracking
All delivery attempts are stored in DB.

Why?
- Full observability
- Debugging failures
- Audit trail

---

## CI/CD

GitHub Actions:
- Install dependencies
- Build
- Run tests

---

## Testing

Run:
```
npm run test
```

Includes:
- Unit tests
- Integration tests
- Worker tests

---

## Demo Flow

1. Create pipeline
2. Send webhook
3. Job queued
4. Worker processes
5. Subscribers receive result

---

## Future Improvements

- Authentication
- Rate limiting
- Dashboard UI
- Metrics

---

## Author

Foothill Backend Training Final Project
