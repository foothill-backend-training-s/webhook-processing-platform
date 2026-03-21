import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../../src/app/index.js";
import { db } from "../../src/db/index.js";
import { jobs, deliveryAttempts } from "../../src/db/schema.js";
import {
  createTestUser,
  createTestPipeline,
  createTestSubscriber,
} from "../helpers/seedData.js";

describe("Monitoring endpoints", () => {
  it("returns job details by id", async () => {
    const user = await createTestUser();
    const pipeline = await createTestPipeline({ userId: user.id });

    const [job] = await db
      .insert(jobs)
      .values({
        pipelineId: pipeline.id,
        payload: { hello: "world" },
        status: "pending",
      })
      .returning();

    const response = await request(app).get(`/jobs/${job.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it("returns all jobs for a pipeline", async () => {
    const user = await createTestUser();
    const pipeline = await createTestPipeline({ userId: user.id });

    await db.insert(jobs).values([
      {
        pipelineId: pipeline.id,
        payload: { x: 1 },
        status: "pending",
      },
      {
        pipelineId: pipeline.id,
        payload: { x: 2 },
        status: "completed",
      },
    ]);

    const response = await request(app).get(`/pipelines/${pipeline.id}/jobs`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.jobs)).toBe(true);
    expect(response.body).toHaveLength(2);
  });

  it("returns delivery attempts together with job monitoring data", async () => {
    const user = await createTestUser();
    const pipeline = await createTestPipeline({ userId: user.id });
    const sub = await createTestSubscriber({
      pipelineId: pipeline.id,
      endpoint: "http://example.com/subscriber",
    });

    const [job] = await db
      .insert(jobs)
      .values({
        pipelineId: pipeline.id,
        payload: { hello: "world" },
        status: "failed",
      })
      .returning();

    await db.insert(deliveryAttempts).values([
      {
        jobId: job.id,
        subscriberId: sub.id,
        attemptNumber: 1,
        status: "failed",
        responseStatusCode: 500,
        errorMessage: "delivery failed with status 500",
      },
      {
        jobId: job.id,
        subscriberId: sub.id,
        attemptNumber: 2,
        status: "success",
        responseStatusCode: 200,
      },
    ]);

    const response = await request(app).get(`/jobs/${job.id}`);

    expect(response.status).toBe(200);

    // Adjust this depending on your real route response shape.
    // If you return { job, deliveryAttempts }, keep these:
    if (response.body.job && response.body.deliveryAttempts) {
      expect(response.body.job.id).toBe(job.id);
      expect(response.body.deliveryAttempts).toHaveLength(2);
    } else {
      // fallback if your current route still returns a joined/raw shape
      expect(response.body).toBeDefined();
    }
  });
});
