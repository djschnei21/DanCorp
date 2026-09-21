import { DispatchView } from "@/components/DispatchView";

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; customer?: string }>;
}) {
  const params = await searchParams;

  return <DispatchView initialStatus={params.status ?? "all"} initialCustomer={params.customer ?? "all"} />;
}
