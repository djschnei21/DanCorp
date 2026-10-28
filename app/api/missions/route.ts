import { getBoard } from "@/lib/missions";

// Optional status query limits missions to that status; omit it for the full board.
export function GET() {
  return Response.json({ missions: getBoard() });
}
