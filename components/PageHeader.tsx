export function PageHeader({
  kicker,
  title,
  detail,
}: {
  kicker: string;
  title: string;
  detail?: string;
}) {
  return (
    <header>
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">{kicker}</p>
      <h1 className="mt-2 font-display text-5xl min-[720px]:text-6xl">{title}</h1>
      {detail ? <p className="mt-2 text-sm text-muted">{detail}</p> : null}
    </header>
  );
}
