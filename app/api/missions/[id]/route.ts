import { getMissionDetail } from "@/lib/missions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const mission = getMissionDetail(id);
  if (!mission) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  return Response.json({ mission });
}
