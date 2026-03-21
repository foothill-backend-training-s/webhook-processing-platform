import request from "supertest";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { app } from "../../src/app/index.js";
import { db } from "../../src/db/index.js";
import { jobs, deliveryAttempts } from "../../src/db/schema.js";
import { eq } from "drizzle-orm";
import { createTestReceiver } from "../helpers/testReceiver.js";
import {
  createTestUser,
  createTestPipeline,
  createTestSubscriber,
} from "../helpers/seedData.js";
import { processNextJob } from "../../src/app/test.js";

describe("Webhook processing flow", () => {
  const receiver = createTestReceiver();

  beforeEach(async () => {
    await receiver.start();
  });

  afterEach(async () => {
    await receiver.stop();
  });

  it("creates a job from webhook ingestion and completes it after successful delivery", async () => {
    const user = await createTestUser();
    const pipeline = await createTestPipeline({
      userId: user.id,
      webhookKey: "interview-flow-1",
      actionType: "send_interview_email",
    });

    await createTestSubscriber({
      pipelineId: pipeline.id,
      endpoint: receiver.url,
    });

    const payload = {
      recipient: {
        email: "candidate@test.com",
        name: "Ahmad",
      },
      data: {
        job_title: "Backend Engineer",
        interview_time: "2026-04-01 10:00",
      },
    };

    const response = await request(app)
      .post(`/pipelines/webhooks/${pipeline.webhookKey}`)
      .send(payload);

    expect(response.status).toBe(202);

    await processNextJob();

    const allJobs = await db.select().from(jobs);
    expect(allJobs).toHaveLength(1);
    expect(allJobs[0].status).toBe("completed");

    const requests = receiver.getRequests();
    expect(requests).toHaveLength(1);

    const attempts = await db.select().from(deliveryAttempts);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].status).toBe("success");
    expect(attempts[0].responseStatusCode).toBe(200);
  });

  it("delivers processed payload to multiple subscribers and marks job completed", async () => {
    const receiver2 = createTestReceiver();
    await receiver2.start();

    try {
      const user = await createTestUser();
      const pipeline = await createTestPipeline({
        userId: user.id,
        webhookKey: "interview-flow-2",
      });

      await createTestSubscriber({
        pipelineId: pipeline.id,
        endpoint: receiver.url,
      });

      await createTestSubscriber({
        pipelineId: pipeline.id,
        endpoint: receiver2.url,
      });

      const payload = {
        recipient: {
          email: "candidate@test.com",
          name: "Lina",
        },
        data: {
          job_title: "Frontend Engineer",
          interview_time: "2026-04-02 11:00",
        },
      };

      const response = await request(app)
        .post(`/pipelines/webhooks/${pipeline.webhookKey}`)
        .send(payload);

      expect(response.status).toBe(202);

      await processNextJob();

      const [job] = await db.select().from(jobs);
      expect(job.status).toBe("completed");

      expect(receiver.getRequests()).toHaveLength(1);
      expect(receiver2.getRequests()).toHaveLength(1);

      const attempts = await db.select().from(deliveryAttempts);
      expect(attempts).toHaveLength(2);
      expect(attempts.every((a) => a.status === "success")).toBe(true);
    } finally {
      await receiver2.stop();
    }
  });
});
