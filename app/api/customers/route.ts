import { getCustomers } from "@/lib/missions";

export function GET() {
  return Response.json({ customers: getCustomers() });
}
