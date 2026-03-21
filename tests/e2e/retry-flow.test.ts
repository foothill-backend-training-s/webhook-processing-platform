import request from "supertest";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { app } from "../../src/app/index.js";
import { db } from "../../src/db/index.js";
import { jobs, deliveryAttempts } from "../../src/db/schema.js";
import {
  createTestUser,
  createTestPipeline,
  createTestSubscriber,
} from "../helpers/seedData.js";
import { createTestReceiver } from "../helpers/testReceiver.js";
import { processNextJob } from "../../src/app/test.js";

describe("Retry behavior", () => {
  let receiver: ReturnType<typeof createTestReceiver>;

  afterEach(async () => {
    if (receiver) {
      await receiver.stop();
    }
  });

  it("retries subscriber delivery when the subscriber fails twice and then succeeds", async () => {
    receiver = createTestReceiver({ failTimes: 2 });
    await receiver.start();

    const user = await createTestUser();
    const pipeline = await createTestPipeline({
      userId: user.id,
      webhookKey: "retry-then-success",
    });

    await createTestSubscriber({
      pipelineId: pipeline.id,
      endpoint: receiver.url,
    });

    const payload = {
      recipient: {
        email: "candidate@test.com",
        name: "Maha",
      },
      data: {
        job_title: "QA Engineer",
        interview_time: "2026-04-03 09:30",
      },
    };

    const response = await request(app)
      .post(`/pipelines/webhooks/${pipeline.webhookKey}`)
      .send(payload);

    expect(response.status).toBe(202);

    await processNextJob();

    const [job] = await db.select().from(jobs);
    expect(job.status).toBe("completed");

    const attempts = await db.select().from(deliveryAttempts);
    expect(attempts).toHaveLength(3);
    expect(attempts[0].status).toBe("failed");
    expect(attempts[1].status).toBe("failed");
    expect(attempts[2].status).toBe("success");
  });

  it("marks the job as failed when subscriber delivery fails after max retries", async () => {
    receiver = createTestReceiver({ failTimes: 99 });
    await receiver.start();

    const user = await createTestUser();
    const pipeline = await createTestPipeline({
      userId: user.id,
      webhookKey: "retry-fail-forever",
    });

    await createTestSubscriber({
      pipelineId: pipeline.id,
      endpoint: receiver.url,
    });

    const payload = {
      recipient: {
        email: "candidate@test.com",
        name: "Sara",
      },
      data: {
        job_title: "Data Engineer",
        interview_time: "2026-04-04 14:00",
      },
    };

    const response = await request(app)
      .post(`/pipelines/webhooks/${pipeline.webhookKey}`)
      .send(payload);

    expect(response.status).toBe(202);

    await processNextJob();

    const [job] = await db.select().from(jobs);
    expect(job.status).toBe("failed");
    expect(job.lastError).not.toBeNull();

    const attempts = await db.select().from(deliveryAttempts);
    expect(attempts.length).toBeGreaterThan(0);
    expect(attempts.every((a) => a.status === "failed")).toBe(true);
  });

  it("fails the job when the pipeline has no subscribers", async () => {
    const user = await createTestUser();
    const pipeline = await createTestPipeline({
      userId: user.id,
      webhookKey: "no-subscribers",
    });

    const payload = {
      recipient: {
        email: "candidate@test.com",
        name: "Omar",
      },
      data: {
        job_title: "DevOps Engineer",
        interview_time: "2026-04-05 13:00",
      },
    };

    const response = await request(app)
      .post(`/pipelines/webhooks/${pipeline.webhookKey}`)
      .send(payload);

    expect(response.status).toBe(202);

    await processNextJob();

    const [job] = await db.select().from(jobs);
    expect(job.status).toBe("failed");
    expect(job.lastError).toContain("no subscribers");
  });
});
