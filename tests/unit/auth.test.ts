import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { app } from "../../src/app/index.js";
import * as jobQueries from "../../src/db/queries/jobs.js";
import * as deliveryAttemptQueries from "../../src/db/queries/deliveryAttempts.js";

vi.mock("../../src/db/queries/jobs.js", () => ({
  getJob: vi.fn(),
  getJobById: vi.fn(),
}));

vi.mock("../../src/db/queries/deliveryAttempts.js", () => ({
  getDeliveryAttemptsByJobId: vi.fn(),
}));

describe("jobs routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /jobs should return all jobs", async () => {
    (jobQueries.getJob as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "job1", status: "pending" },
      { id: "job2", status: "completed" },
    ]);

    const res = await request(app).get("/jobs");

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.jobs).toHaveLength(2);
    expect(res.body.jobs[0].id).toBe("job1");
  });

  it("GET /jobs/:id should return one job with delivery attempts", async () => {
    (jobQueries.getJobById as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: "job1",
        status: "completed",
        pipelineId: "pipe1",
      },
    ]);

    (
      deliveryAttemptQueries.getDeliveryAttemptsByJobId as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValueOnce([
      {
        id: "attempt1",
        jobId: "job1",
        status: "success",
      },
    ]);

    const res = await request(app).get("/jobs/job1");

    expect(res.status).toBe(200);
    expect(res.body.job.id).toBe("job1");
    expect(res.body.deliveryAttempts).toHaveLength(1);
    expect(res.body.deliveryAttempts[0].id).toBe("attempt1");
  });

  it("GET /jobs/:id should return 404 when job is missing", async () => {
    (jobQueries.getJobById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      [],
    );

    const res = await request(app).get("/jobs/not-found");

    expect(res.status).toBe(404);
  });
});