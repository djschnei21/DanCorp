import { STATUS_LABEL } from "@/lib/format";
import { MISSION_STATUSES, type CustomerSummary } from "@/lib/types";

const selectClass =
  "rounded-md border border-card-04 bg-card px-2 py-1.5 text-sm text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function MissionFilters({
  customers,
  status,
  customerId,
  onStatus,
  onCustomer,
}: {
  customers: CustomerSummary[];
  status: string;
  customerId: string;
  onStatus: (status: string) => void;
  onCustomer: (customerId: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <label className="flex flex-col gap-1 text-sm text-muted">
        Status
        <select
          className={selectClass}
          value={status}
          onChange={(event) => onStatus(event.target.value)}
        >
          <option value="all">All</option>
          {MISSION_STATUSES.map((item) => (
            <option key={item} value={item}>
              {STATUS_LABEL[item]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Customer
        <select
          className={selectClass}
          value={customerId}
          onChange={(event) => onCustomer(event.target.value)}
        >
          <option value="all">All</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
