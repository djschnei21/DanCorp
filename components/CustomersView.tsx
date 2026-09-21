"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { useShift } from "@/components/ShiftProvider";
import { CONTRACT_LABEL } from "@/lib/format";
import { getCustomers } from "@/lib/missions";

export function CustomersView() {
  const customers = getCustomers(new Date(useShift()));

  return (
    <div className="space-y-8">
      <PageHeader kicker="Accounts" title="Customers" detail="6 accounts." />
      <ul className="grid gap-4 min-[720px]:grid-cols-2 min-[1024px]:grid-cols-3">
        {customers.map((customer) => (
          <li key={customer.id} className="rounded-[28px] border border-card-04 bg-card p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
              {CONTRACT_LABEL[customer.contract]}
            </p>
            <h2 className="mt-3 font-display text-3xl leading-none">{customer.name}</h2>
            <p className="mt-2 text-sm text-muted">{customer.site}</p>
            <Link
              href={`/?customer=${customer.id}`}
              className="mt-8 flex items-end justify-between gap-3 border-t border-card-04 pt-4 hover:text-accent"
            >
              <span className="pb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Open</span>
              <span className="font-display text-6xl leading-none tabular-nums">{customer.openMissionCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
