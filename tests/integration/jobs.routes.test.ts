import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { app } from "../../src/app/index.js";
import * as pipelineQueries from "../../src/db/queries/pipelines.js";
import * as subscriberQueries from "../../src/db/queries/subscribers.js";
import * as jobQueries from "../../src/db/queries/jobs.js";

vi.mock("../../src/db/queries/pipelines.js", () => ({
  createPipelineWithSubscribers: vi.fn(),
  getPipeLinesByUser: vi.fn(),
  updatePipeline: vi.fn(),
  deletePipeLine: vi.fn(),
  getPipeLinesById: vi.fn(),
}));

vi.mock("../../src/db/queries/subscribers.js", () => ({
  updateSubscribersById: vi.fn(),
}));

vi.mock("../../src/db/queries/jobs.js", () => ({
  getJobByPipeId: vi.fn(),
}));

describe("pipeline routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /pipelines should create pipeline with subscribers", async () => {
    (
      pipelineQueries.createPipelineWithSubscribers as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      pipeline: {
        id: "pipe1",
        name: "Hiring pipeline",
        actionType: "compose_candidate_email",
        userId: "user1",
        webhookKey: "abc123",
      },
      subs: [
        { id: "sub1", endpoint: "https://example.com/a", pipelineId: "pipe1" },
      ],
    });

    const res = await request(app).post("/pipelines").send({
      user_id: "user1",
      name: "Hiring pipeline",
      action_type: "compose_candidate_email",
      webhook_key: "abc123",
      sub: ["https://example.com/a"],
    });

    expect(res.status).toBe(201);
    expect(res.body.pipeline.id).toBe("pipe1");
    expect(res.body.subs).toHaveLength(1);
  });

  it("GET /pipelines/users/:user_id should return pipelines", async () => {
    (pipelineQueries.getPipeLinesByUser as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        { id: "pipe1", name: "P1" },
        { id: "pipe2", name: "P2" },
      ]);

    const res = await request(app).get("/pipelines/users/user1");

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.pipelines).toHaveLength(2);
  });

  it("PUT /pipelines/:id should update pipeline and subscribers", async () => {
    (pipelineQueries.updatePipeline as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: "pipe1",
          name: "Updated pipeline",
          actionType: "send_candidate_email",
          webhookKey: "new-key",
        },
      ]);

    (subscriberQueries.updateSubscribersById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        id: "sub1",
        endpoint: "https://example.com/new",
        pipelineId: "pipe1",
      });

    const res = await request(app).put("/pipelines/pipe1").send({
      name: "Updated pipeline",
      action_type: "send_candidate_email",
      webhook_key: "new-key",
      sub: [
        {
          id: "sub1",
          url: "https://example.com/new",
        },
      ],
    });

    expect(res.status).toBe(200);
    expect(res.body.pipeline.id).toBe("pipe1");
    expect(res.body.subscribers).toHaveLength(1);
  });

  it("DELETE /pipelines/:id should delete pipeline", async () => {
    (pipelineQueries.deletePipeLine as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        { id: "pipe1" },
      ]);

    const res = await request(app).delete("/pipelines/pipe1");

    expect(res.status).toBe(204);
  });

  it("GET /pipelines/:id/jobs should return jobs for pipeline", async () => {
    (pipelineQueries.getPipeLinesById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        { id: "pipe1", name: "Hiring pipeline" },
      ]);

    (jobQueries.getJobByPipeId as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        { id: "job1", pipelineId: "pipe1", status: "pending" },
        { id: "job2", pipelineId: "pipe1", status: "completed" },
      ]);

    const res = await request(app).get("/pipelines/pipe1/jobs");

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.jobs).toHaveLength(2);
  });
});