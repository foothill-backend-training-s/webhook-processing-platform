import { describe, it, expect, beforeEach, vi } from "vitest";
import { composeEmailAction } from "../../src/actions/compose_candidate_email.js";

describe("composeEmailAction", () => {
  beforeEach(() => {
    vi.stubEnv("SMTP_USER", "no-reply@yourapp.com");
  });

  it("should build email bodies for all candidates", () => {
    const payload = [
      {
        recipient: {
          name: "Sue",
          email: "sue@example.com",
        },
        data: {
          job_title: "Backend Engineer",
          interview_time: "2026-03-25 10:00 AM",
        },
      },
      {
        recipient: {
          name: "Ali",
          email: "ali@example.com",
        },
        data: {
          job_title: "Frontend Engineer",
          interview_time: "2026-03-26 11:00 AM",
        },
      },
    ];

    const result = composeEmailAction(payload);

    expect(result).toHaveLength(2);
    expect(result[0].to).toBe("sue@example.com");
    expect(result[0].from).toBe("no-reply@yourapp.com");
    expect(result[0].subject).toContain("Backend Engineer");
    expect(result[0].body).toContain("Sue");
    expect(result[1].body).toContain("Ali");
  });

  it("should return empty array for empty payload", () => {
    const result = composeEmailAction([]);
    expect(result).toEqual([]);
  });
});