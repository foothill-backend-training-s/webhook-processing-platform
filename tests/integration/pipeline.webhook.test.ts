import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { app } from "../../src/app/index.js";
import * as pipelineQueries from "../../src/db/queries/pipelines.js";
import * as jobQueries from "../../src/db/queries/jobs.js";

vi.mock("../../src/db/queries/pipelines.js", () => ({
  getPipeLinesByUrl: vi.fn(),
}));

vi.mock("../../src/db/queries/jobs.js", () => ({
  createJob: vi.fn(),
}));

describe("pipeline webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should queue a job for a valid webhook key", async () => {
    (
      pipelineQueries.getPipeLinesByUrl as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([
      {
        id: "pipe1",
        webhookKey: "abc123",
      },
    ]);

    (jobQueries.createJob as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: "job1",
        pipelineId: "pipe1",
        status: "pending",
      },
    ]);

    const res = await request(app)
      .post("/pipelines/webhooks/abc123")
      .send({
        recipient: { name: "Sue", email: "sue@example.com" },
        data: { job_title: "Backend Engineer" },
      });

    expect(res.status).toBe(202);
    expect(res.body.message).toBe("job queued successfully");
  });

  it("should return 404 for unknown webhook key", async () => {
    (
      pipelineQueries.getPipeLinesByUrl as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([]);

    const res = await request(app).post("/pipelines/webhooks/unknown").send({});

    expect(res.status).toBe(404);
  });
});