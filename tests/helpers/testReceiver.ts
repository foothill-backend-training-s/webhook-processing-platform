import express, { Express, Request, Response } from "express";
import http from "http";

type ReceiverOptions = {
  failTimes?: number;
};

export type TestReceiver = {
  url: string;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  reset: () => void;
  getRequests: () => unknown[];
  getCallCount: () => number;
};

export function createTestReceiver(options?: ReceiverOptions): TestReceiver {
  const app: Express = express();
  app.use(express.json());

  let server: http.Server | null = null;
  let port: number | null = null;
  let requests: unknown[] = [];
  let callCount = 0;
  const failTimes = options?.failTimes ?? 0;

  app.post("/subscriber", (req: Request, res: Response) => {
    callCount++;
    requests.push(req.body);

    if (callCount <= failTimes) {
      return res.status(500).json({ message: "temporary failure" });
    }

    return res.status(200).json({ message: "ok" });
  });

  return {
    url: "",
    async start() {
      await new Promise<void>((resolve) => {
        server = app.listen(0, () => {
          const address = server?.address();
          if (typeof address === "object" && address?.port) {
            port = address.port;
            this.url = `http://127.0.0.1:${port}/subscriber`;
          }
          resolve();
        });
      });
    },
    async stop() {
      if (!server) return;
      await new Promise<void>((resolve, reject) => {
        server?.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      server = null;
      port = null;
    },
    reset() {
      requests = [];
      callCount = 0;
    },
    getRequests() {
      return requests;
    },
    getCallCount() {
      return callCount;
    },
  };
}