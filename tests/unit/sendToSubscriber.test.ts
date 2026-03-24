import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendToSubscriberWithRetry } from "../../src/delivery/sendToSubscriber.js";
import * as deliveryAttemptQueries from "../../src/db/queries/deliveryAttempts.js";
import * as jobQueries from "../../src/db/queries/jobs.js";

vi.mock("../../src/db/queries/deliveryAttempts.js", () => ({
  createDeliveryAttempt: vi.fn(),
  markDeliveryAttemptSuccess: vi.fn(),
  markDeliveryAttemptFailed: vi.fn(),
}));

vi.mock("../../src/db/queries/jobs.js", () => ({
  failJob: vi.fn(),
}));

describe("sendToSubscriberWithRetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should succeed on first attempt", async () => {
    (
      deliveryAttemptQueries.createDeliveryAttempt as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([{ id: "attempt1" }]);

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    const promise = sendToSubscriberWithRetry(
      "job1",
      { id: "sub1", endpoint: "https://example.com/webhook" },
      { hello: "world" },
      3,
    );

    await promise;

    expect(deliveryAttemptQueries.createDeliveryAttempt).toHaveBeenCalledWith(
      "job1",
      "sub1",
      1,
    );
    expect(
      deliveryAttemptQueries.markDeliveryAttemptSuccess,
    ).toHaveBeenCalled();
    expect(
      deliveryAttemptQueries.markDeliveryAttemptFailed,
    ).not.toHaveBeenCalled();
    expect(jobQueries.failJob).not.toHaveBeenCalled();
  });

  it("should mark attempt failed then succeed on second try", async () => {
    (deliveryAttemptQueries.createDeliveryAttempt as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([{ id: "attempt1" }])
      .mockResolvedValueOnce([{ id: "attempt2" }]);

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

    const promise = sendToSubscriberWithRetry(
      "job1",
      { id: "sub1", endpoint: "https://example.com/webhook" },
      { hello: "world" },
      3,
    );

    await vi.runAllTimersAsync();
    await promise;

    expect(
      deliveryAttemptQueries.markDeliveryAttemptFailed,
    ).toHaveBeenCalledTimes(1);
    expect(
      deliveryAttemptQueries.markDeliveryAttemptSuccess,
    ).toHaveBeenCalledTimes(1);
  });

  it("should fail after max retries are exhausted", async () => {
    (deliveryAttemptQueries.createDeliveryAttempt as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([{ id: "attempt1" }])
      .mockResolvedValueOnce([{ id: "attempt2" }])
      .mockResolvedValueOnce([{ id: "attempt3" }]);

    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("network error"),
    );

    const promise = sendToSubscriberWithRetry(
      "job1",
      { id: "sub1", endpoint: "https://example.com/webhook" },
      { hello: "world" },
      3,
    );

    const asserted = expect(promise).rejects.toThrow("network error");

    await vi.runAllTimersAsync();
    await asserted;

    expect(
      deliveryAttemptQueries.markDeliveryAttemptFailed,
    ).toHaveBeenCalledTimes(3);
  });
});
