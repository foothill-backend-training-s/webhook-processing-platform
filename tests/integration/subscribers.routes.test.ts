import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { app } from "../../src/app/index.js";
import * as subscriberQueries from "../../src/db/queries/subscribers.js";

vi.mock("../../src/db/queries/subscribers.js", () => ({
  getSubscribersByPipe: vi.fn(),
  deleteSubscribersByPipe: vi.fn(),
}));

describe("subscribers routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /subscribers/:pipe_id should return subscribers", async () => {
    (
      subscriberQueries.getSubscribersByPipe as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([
      { id: "sub1", endpoint: "https://example.com/a", pipelineId: "pipe1" },
      { id: "sub2", endpoint: "https://example.com/b", pipelineId: "pipe1" },
    ]);

    const res = await request(app).get("/subscribers/pipe1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe("sub1");
  });

  it("DELETE /subscribers/:pipe_id should delete subscribers", async () => {
    (
      subscriberQueries.deleteSubscribersByPipe as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined);

    const res = await request(app).delete("/subscribers/pipe1");

    expect(res.status).toBe(204);
    expect(subscriberQueries.deleteSubscribersByPipe).toHaveBeenCalledWith(
      "pipe1",
    );
  });
});