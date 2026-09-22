// Inlined at build time. Empty for `next dev`. The Pages workflow sets /DanCorp.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(path: string): string {
  return `${base}${path}`;
}
