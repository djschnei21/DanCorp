import type { Metadata } from "next";
import { CustomersView } from "@/components/CustomersView";

export const metadata: Metadata = {
  title: "Customers · DanCorp Dispatch",
};

export default function CustomersPage() {
  return <CustomersView />;
}
