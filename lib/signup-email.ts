export const MAX_SIGNUP_EMAIL_LENGTH = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignupEmailError = "email_required" | "email_too_long" | "email_invalid";

export type SignupEmailResult =
  | { ok: true; email: string }
  | { ok: false; error: SignupEmailError };

export function parseSignupEmail(value: unknown): SignupEmailResult {
  if (typeof value !== "string") {
    return { ok: false, error: "email_required" };
  }

  const email = value.trim();
  if (email.length === 0) {
    return { ok: false, error: "email_required" };
  }
  if (email.length > MAX_SIGNUP_EMAIL_LENGTH) {
    return { ok: false, error: "email_too_long" };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "email_invalid" };
  }

  return { ok: true, email };
}
