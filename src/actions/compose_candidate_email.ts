import { Payload } from "../types/payload";
import { Email } from "../types/email_content.js";
import "dotenv/config";

export function composeEmailAction(payload: Payload[]): Email[] {
  return payload.map((candidate) => ({
    to: candidate.recipient.email,
    from: process.env.SMTP_USER,
    subject: `Interview Invitation for ${candidate.data.job_title}`,
    body: `
Hi ${candidate.recipient.name},

You have been selected for an interview for the position of ${candidate.data.job_title}.

Interview time: ${candidate.data.interview_time}

Good luck!
`,
  }));
}
