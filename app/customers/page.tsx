import type { Metadata } from "next";
import Link from "next/link";
import { CONTRACT_LABEL } from "@/lib/format";
import { getCustomers } from "@/lib/missions";

export const metadata: Metadata = {
  title: "Customers · DanCorp Dispatch",
};

export default function CustomersPage() {
  const customers = getCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
      <div className="hidden min-[720px]:block">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2 pr-3 font-medium">Customer</th>
              <th className="py-2 pr-3 font-medium">Site</th>
              <th className="py-2 pr-3 font-medium">Contract</th>
              <th className="py-2 font-medium">Open</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-card-04">
                <td className="py-2 pr-3">{customer.name}</td>
                <td className="py-2 pr-3">{customer.site}</td>
                <td className="py-2 pr-3">{CONTRACT_LABEL[customer.contract]}</td>
                <td className="py-2 tabular-nums">
                  <Link href={`/?customer=${customer.id}`} className="hover:text-accent">
                    {customer.openMissionCount}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 min-[720px]:hidden">
        {customers.map((customer) => (
          <li key={customer.id} className="rounded-md border border-card-04 bg-card p-4">
            <p className="font-medium">{customer.name}</p>
            <p className="mt-1 text-sm text-muted">
              {customer.site} · {CONTRACT_LABEL[customer.contract]}
            </p>
            <p className="mt-2 text-sm">
              <Link href={`/?customer=${customer.id}`} className="hover:text-accent">
                {customer.openMissionCount} open
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
