import type { Metadata } from "next";
import { MissionView } from "@/components/MissionView";
import { NoMission } from "@/components/NoMission";
import { knownMission, missionIds } from "@/lib/shift";

export function generateStaticParams() {
  return missionIds().map((id) => ({ id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id} · DanCorp Dispatch` };
}

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!knownMission(id)) {
    return <NoMission id={id} />;
  }
  return <MissionView id={id} />;
}
