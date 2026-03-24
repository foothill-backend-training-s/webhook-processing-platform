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

### install dependencies

```
npm install
```

### Environment

Create `.env` :

- i provided the .env.example file in the additional inforamtion section in the submit form ,and all the values needed for the .env is there
```
DATABASE_URL=postgres://user:password@db:5432/app
PORT=8080
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
SMTP_PASS=
SMTP_USER = 
SMTP_SERVICE = 
SMTP_HOST=
SMTP_PORT=
```
note : for the SMTP_PASS and SMTP_USER , i couldnt include them in the .env.example because its a sensitive info
those info needed for `send_candidate_email` action 
you need to get a App Password to be able to use the service 
you can check `http://nodemailer.com/guides/using-gmail` documentation in `App Password (requires 2-Step Verification)` section for this
its critical to get a working gmail account so for the service to work , other wise the job will fail

### Run

```
docker compose up 
```

---

## API Documentation

### 1. Create Users
Registers a new user to manage pipelines.

**POST /users**

Request:

```json
{
  "email": "user_email",
  "password": "user_pass"
}
```

Response:

```json
{
  "user": {
    "id": "user_is",
    "createdAt": "time_row_created",
    "updatedAt": "time_row_created_as_defult",
    "email": "user_email",
    "password": "user_hashed_pass"
  }
}
```

---

### 2. Create Pipline
Creates a new processing workflow. Note that action_type is case-sensitive.

**POST /pipelines**

Request:

```json
{
  "user_id": "",
  "name": "Interview Pipeline",
  "action_type": "", //compose_candidate_email or send_candidate_email or send_http_request
  "webhook_key": "interview-<actionType>-1",
  "sub": [
    "https://webhook.site/2c8441c6-3458-4eac-ac23-8f58d6899912" // you can use this as example
  ]
}
```

note : you can use https://webhook.site/ site as a subscribers (to recieve the webhooks processed data)

Response:

```json
{
  "pipeline":
  {
    "id":,
    "name":"Interview Pipeline",
    // you should use one of those 3 actions, its case sensitive so make sure to copy one of them
    // ["compose_candidate_email" , "send_candidate_email" , "send_http_request"]
    "actionType":"compose_candidate_email",
    "createdAt":,
    "updatedAt":,
    "isActive":true,
    "webhookKey":"interview-compose-1",
    "userId":
  },
    "subs":
    [
      {
        "id":,
        "createdAt":,
        "endpoint":"https://webhook.site/2c8441c6-3458-4eac-ac23-8f58d6899912",
        "isActive":true,
        "pipelineId":
      }
    ]
}
```

---

## Actions

there is 3 types of actions in this project , each have a specific body for the request

### compose_candidate_email

Transforms webhook payload into email content.

Request :

```json
[
  {
    "recipient": {
      "email": "user_email", // thats the user that will recieve the email
      "name": "user name"
    },
    "data": {
      "job_title": "Backend Engineer",
      "interview_time": "2026-04-01 10:00"
    }
  }
]
```

### send_candidate_email

Sends emails to candidates(users).

- action can send eamils to multiple users
  Request:

```json
[
  {
    "to": "nidashomaly@gmail.com", // thats the email for the user that will recieve the email
    // type a valid active email , else the job will fail
    "subject": "Interview Invitation for Backend Engineer",
    "body": "\nHi Nida Shomaly,\n\nYou have been selected for an interview for the position of Backend Engineer.\n\nInterview time: 2026-04-01 10:00\n\nGood luck!\n"
  }
]
```

### send_http_request

Sends processed data to external APIs.

Request:

```json
{
  "url": "https://httpbin.org/post",
  "httpMethod": "POST",
  "headers": {
    "X-Test-Header": "demo"
  },
  "body": {
    "message": "hello from webhook pipeline",
    "user": "sama",
    "project": "foothill"
  }
}
```

---

### 3. Trigger Webhook
Submit data to the pipeline. This adds a task to the asynchronous job queue.

**POST pipelines/webhooks/webhookKey**
- this is an example for the "compose_candidate_email" , you can test the other actions with the same endpoint but with the action required body from the previous section 

Request:

```json
[
  {
    "recipient": {
      "email": "user_email", // thats the user that will recieve the email
      "name": "user name"
    },
    "data": {
      "job_title": "Backend Engineer",
      "interview_time": "2026-04-01 10:00"
    }
  }
]
```

Response:

```json
{
    "message": "job queued successfully",
    "job": [
        {
            "id": ,
            "payload": [
                {
                    "data": {
                        "job_title": "Backend Engineer",
                        "interview_time": "2026-04-01 10:00"
                    },
                    "recipient": {
                        "name": ,
                        "email":
                    }
                },
            ],
            "status": "pending",
            "attempts": 0,
            "maxAttempts": 5,
            "createdAt": "2026-03-24T17:36:46.952Z",
            "lastError": null,
            "completedAt": null,
            "updatedAt": "2026-03-24T17:36:46.952Z",
            "pipelineId":
        }
    ]
}
```

---

### 3. Get Job Status

**GET /jobs**

Response:

```json
[
  {
    "id": "job_uuid",
    "status": "completed",
    "pipelineId": "pipeline_id"
  }
]
```

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

**GET /jobs/:id/delivery_attempts**

Response:

```json
{
    "deliveryAttempts": [
        {
            "id": "49909a71-dda4-4519-be00-65c2789668a9",
            "jobId": "3cf5e1c6-4ceb-45f0-9683-95a3ef223d02",
            "subscriberId": "f6beaa9c-d17e-449d-8b06-233633ac3f68",
            "attemptNumber": 1,
            "status": "success",
            "attemptedAt": "2026-03-24T00:24:14.135Z",
            "responseStatusCode": 200,
            "errorMessage": null,
            "deliveredAt": "2026-03-24T00:24:14.612Z",
            "nextRetryAt": null,
            "createdAt": "2026-03-24T00:24:14.135Z",
            "updatedAt": "2026-03-24T00:24:14.612Z"
        }
    ]
}
```

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
