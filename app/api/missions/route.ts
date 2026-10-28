import { filterBoard, getBoard, isMissionStatus } from "@/lib/missions";

export function GET(request: Request) {
  const statusParam = new URL(request.url).searchParams.get("status");
  const status = statusParam && isMissionStatus(statusParam) ? statusParam : "all";
  const missions = filterBoard(getBoard(), status, "all");
  return Response.json({ missions });
}
