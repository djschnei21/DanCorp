import { filterBoard, getBoard, isMissionStatus } from "@/lib/missions";

// Optional `status` query keeps missions with that status; omit or pass an invalid value for the full board.
export function GET(request: Request) {
  const statusParam = new URL(request.url).searchParams.get("status");
  const status = statusParam && isMissionStatus(statusParam) ? statusParam : "all";
  const missions = filterBoard(getBoard(), status, "all");
  return Response.json({ missions });
}
