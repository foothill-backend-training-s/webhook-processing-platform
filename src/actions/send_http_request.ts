import { SendHttpRequestPayload } from "../types/request_content.js";

export async function sendHttpRequestAction(
  requestInfo: SendHttpRequestPayload,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...requestInfo.headers,
  };

  const options: RequestInit = {
    method: requestInfo.httpMethod,
    headers,
  };

  if (requestInfo.httpMethod !== "GET" && requestInfo.body !== undefined) {
    options.body = JSON.stringify(requestInfo.body);
  }

  const response = await fetch(requestInfo.url, options);

  let responseBody: unknown = null;
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    responseBody = await response.json();
  } else {
    responseBody = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      `HTTP request failed with status ${response.status}: ${response.statusText}`,
    );
  }

  return {
    targetUrl: requestInfo.url,
    method: requestInfo.httpMethod,
    responseStatus: response.status,
    success: true,
    responseBody,
  };
}
