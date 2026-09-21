import type { Metadata } from "next";
import { FleetView } from "@/components/FleetView";

export const metadata: Metadata = {
  title: "Fleet · DanCorp Dispatch",
};

export default function FleetPage() {
  return <FleetView />;
}
