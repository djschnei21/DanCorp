import { getBoard } from "@/lib/missions";

export function GET() {
  return Response.json({ missions: getBoard() });
}
