import { parseSignupEmail } from "@/lib/signup-email";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const email =
    body !== null && typeof body === "object" && "email" in body
      ? (body as { email: unknown }).email
      : undefined;

  const parsed = parseSignupEmail(email);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  return Response.json({ email: parsed.email }, { status: 201 });
}
