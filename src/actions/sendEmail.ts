type Payload = {
  recipient: {
    email: string;
    name: string;
  };
  data: {
    job_title: string;
    // Because job payload comes from JSON, and JSON doesn’t really preserve JavaScript Date objects.
    interview_time: string;
  };
};
export function sendEmailAction(payload: Payload) {
  return {
    to: payload.recipient.email,
    from: "no-reply@yourapp.com",
    subject: `Interview Invitation for ${payload.data.job_title}`,
    body: `
Hi ${payload.recipient.name},

You have been selected for an interview for the position of ${payload.data.job_title}.

Interview time: ${payload.data.interview_time}

Good luck!
`
  };
}
