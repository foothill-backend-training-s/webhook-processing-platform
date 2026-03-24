export type SendHttpRequestPayload={
    url:string;
    httpMethod: "POST" | "GET" | "DELETE" | "PUT";
    headers?:Record<string,string>;
    body?:unknown;
}