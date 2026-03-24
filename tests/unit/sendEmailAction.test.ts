import { describe, it, expect, vi, beforeEach } from "vitest";

const { sendMailMock, createTransportMock } = vi.hoisted(() => {
  return {
    sendMailMock: vi.fn(),
    createTransportMock: vi.fn(),
  };
});

vi.mock("nodemailer", () => {
  createTransportMock.mockReturnValue({
    sendMail: sendMailMock,
  });

  return {
    default: {
      createTransport: createTransportMock,
    },
    createTransport: createTransportMock,
  };
});

import { sendEmailAction } from "../../src/actions/send_candidate_email";

describe("sendEmailAction", () => {
  beforeEach(() => {
    sendMailMock.mockReset();
  });

  it("should send an email successfully", async () => {
    sendMailMock.mockResolvedValueOnce({
      messageId: "abc123",
      accepted: ["sue@example.com"],
      rejected: [],
    });

    const payload = {
      to: "sue@example.com",
      from: "no-reply@yourapp.com",
      subject: "Interview Invitation",
      body: "Hello Sue",
    };

    const result = await sendEmailAction(payload);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });

  it("should throw when sending fails", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("SMTP failed"));

    const payload = {
      to: "sue@example.com",
      from: "no-reply@yourapp.com",
      subject: "Interview Invitation",
      body: "Hello Sue",
    };

    await expect(sendEmailAction(payload)).rejects.toThrow();
    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });
});