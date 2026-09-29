import type { Metadata } from "next";
import { OrdersListView } from "@/components/shopify-admin/OrdersListView";

export const metadata: Metadata = { title: "Orders" };

export default function MockAdminOrdersPage() {
  return <OrdersListView />;
}
