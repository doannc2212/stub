import { describe, expect, it } from "bun:test";
import app from "../src";

const PORT = Bun.env.PORT || 8000;
const baseURL = `http://localhost:${PORT}`;
const headers = {
  cookie: "userId=doannc; Path=/;",
  "Content-Type": "application/json",
};

describe("Stub", () => {
  it("No userId", async () => {
    const response = await app
      .handle(new Request(`${baseURL}/create`, { method: "POST" }))
      .then((res) => res.text());

    expect(response).toBe("No userId");
  });

  it("Invalid JSON body", async () => {
    const response = await app
      .handle(
        new Request(`${baseURL}/create`, {
          method: "POST",
          headers,
          body: "invalid json", // Send invalid JSON data
        })
      )
      .then((res) => res.text());

    expect(response.startsWith("Error")); // Expect an error message
  });

  it("Create Success", async () => {
    const mockBody = {
      method: "GET",
      path: "/sample",
      data: { hello: "world" },
      status: 200,
    };
    const response = await app
      .handle(
        new Request(`${baseURL}/create`, {
          method: "POST",
          headers,
          body: JSON.stringify(mockBody),
        })
      )
      .then((res) => res.text());
    const json = JSON.parse(response);
    delete json.user;

    expect(json).toEqual(mockBody);
  });
});
