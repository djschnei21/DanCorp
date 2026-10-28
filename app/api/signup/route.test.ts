import { describe, expect, it } from "vitest";
import { MAX_SIGNUP_EMAIL_LENGTH } from "@/lib/signup-email";
import { POST as signup } from "./route";

function signupRequest(email: unknown) {
  return signup(
    new Request("http://localhost/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),
  );
}

describe("POST /api/signup", () => {
  it("accepts a valid email", async () => {
    const response = await signupRequest("ops@dancorp.test");
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ email: "ops@dancorp.test" });
  });

  it("rejects an empty email", async () => {
    const response = await signupRequest("   ");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "email_required" });
  });

  it("rejects a too-long email", async () => {
    const local = "a".repeat(MAX_SIGNUP_EMAIL_LENGTH);
    const response = await signupRequest(`${local}@b.co`);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "email_too_long" });
  });

  it("rejects a malformed email", async () => {
    const response = await signupRequest("not-an-email");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "email_invalid" });
  });
});
