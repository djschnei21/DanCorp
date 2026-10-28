import { getBoard, isMissionStatus } from "@/lib/missions";

export function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  if (status !== null && !isMissionStatus(status)) {
    return Response.json({ error: "invalid_status" }, { status: 400 });
  }
  const missions = getBoard().filter((mission) => status === null || mission.status === status);
  return Response.json({ missions });
}
