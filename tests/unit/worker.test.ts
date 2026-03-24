import { describe, it, expect, vi, beforeEach } from "vitest";
import { worker } from "../../src/app/workers.js";
import * as jobQueries from "../../src/db/queries/jobs.js";
import * as pipelineQueries from "../../src/db/queries/pipelines.js";
import * as subscriberQueries from "../../src/db/queries/subscribers.js";
import * as composeAction from "../../src/actions/compose_candidate_email.js";
import * as sendHttpAction from "../../src/actions/send_http_request.js";
import * as subscriberDelivery from "../../src/delivery/sendToSubscriber.js";

vi.mock("../../src/db/queries/jobs.js", () => ({
  updateJob: vi.fn(),
  jobCompleted: vi.fn(),
  retryJob: vi.fn(),
  failJob: vi.fn(),
}));

vi.mock("../../src/db/queries/pipelines.js", () => ({
  getPipeLinesById: vi.fn(),
}));

vi.mock("../../src/db/queries/subscribers.js", () => ({
  getSubscribersByPipe: vi.fn(),
}));

vi.mock("../../src/actions/compose_candidate_email.js", () => ({
  composeEmailAction: vi.fn(),
}));

vi.mock("../../src/actions/send_candidate_email.js", () => ({
  sendEmailAction: vi.fn(),
}));

vi.mock("../../src/actions/send_http_request.js", () => ({
  sendHttpRequestAction: vi.fn(),
}));

vi.mock("../../src/delivery/sendToSubscriber.js", () => ({
  sendToSubscriberWithRetry: vi.fn(),
}));

describe("worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process compose_candidate_email job and complete it", async () => {
    (jobQueries.updateJob as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: "job1",
          pipeline_id: "pipe1",
          payload: [
            {
              recipient: { name: "Sue", email: "sue@example.com" },
              data: {
                job_title: "Backend Engineer",
                interview_time: "tomorrow",
              },
            },
          ],
        },
      ])
      .mockRejectedValueOnce(new Error("stop-worker"));

    (pipelineQueries.getPipeLinesById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: "pipe1",
          actionType: "compose_candidate_email",
        },
      ]);

    (composeAction.composeEmailAction as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce([
        {
          to: "sue@example.com",
          from: "no-reply@yourapp.com",
          subject: "Interview Invitation for Backend Engineer",
          body: "Hello Sue",
        },
      ]);

    (subscriberQueries.getSubscribersByPipe as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: "sub1",
          endpoint: "https://example.com/subscriber",
        },
      ]);

    (
      subscriberDelivery.sendToSubscriberWithRetry as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined);

    await expect(worker()).rejects.toThrow("stop-worker");

    expect(composeAction.composeEmailAction).toHaveBeenCalled();
    expect(subscriberDelivery.sendToSubscriberWithRetry).toHaveBeenCalledWith(
      "job1",
      { id: "sub1", endpoint: "https://example.com/subscriber" },
      expect.any(Array),
      5,
    );
    expect(jobQueries.jobCompleted).toHaveBeenCalledWith("job1");
  });

  it("should retry job when action processing fails", async () => {
    (jobQueries.updateJob as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: "job2",
          pipeline_id: "pipe2",
          payload: [],
        },
      ])
      .mockRejectedValueOnce(new Error("stop-worker"));

    (pipelineQueries.getPipeLinesById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: "pipe2",
          actionType: "compose_candidate_email",
        },
      ]);

    (composeAction.composeEmailAction as ReturnType<typeof vi.fn>)
      .mockImplementationOnce(() => {
        throw new Error("processing failed");
      });

    (jobQueries.retryJob as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("retrying");

    await expect(worker()).rejects.toThrow("stop-worker");

    expect(jobQueries.retryJob).toHaveBeenCalledWith("job2");
    expect(jobQueries.jobCompleted).not.toHaveBeenCalled();
  });

  it("should fail job when no subscribers exist", async () => {
    (jobQueries.updateJob as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: "job3",
          pipeline_id: "pipe3",
          payload: [],
        },
      ])
      .mockRejectedValueOnce(new Error("stop-worker"));

    (pipelineQueries.getPipeLinesById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: "pipe3",
          actionType: "send_http_request",
        },
      ]);

    (sendHttpAction.sendHttpRequestAction as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        success: true,
      });

    (subscriberQueries.getSubscribersByPipe as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([]);

    await expect(worker()).rejects.toThrow("stop-worker");

    expect(jobQueries.failJob).toHaveBeenCalledWith(
      "job3",
      "no subscribers found for pipeline",
    );
  });
});