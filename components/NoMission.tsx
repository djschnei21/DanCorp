import Image from "next/image";

export function NoMission({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-card-04 bg-card px-8 py-14 text-center">
      <Image src="/brand/emblem.png" alt="" width={64} height={64} className="mx-auto h-16 w-16 rounded-full" />
      <h1 className="mt-6 font-display text-3xl tracking-tight">{`No mission ${id}.`}</h1>
    </div>
  );
}
