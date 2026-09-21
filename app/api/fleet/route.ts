import { getFleet } from "@/lib/missions";

export function GET() {
  return Response.json({ vehicles: getFleet() });
}
