export type Payload = {
  recipient: {
    email: string;
    name: string;
  };
  data: {
    job_title: string;
    // to be deleted
    // Because job payload comes from JSON, and JSON doesn’t really preserve JavaScript Date objects.
    interview_time: string;
  };
};
