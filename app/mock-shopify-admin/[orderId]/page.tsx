import type { Metadata } from "next";
import { OrderDetailView } from "@/components/shopify-admin/OrderDetailView";

export async function generateMetadata(props: PageProps<"/mock-shopify-admin/[orderId]">): Promise<Metadata> {
  const { orderId } = await props.params;
  return { title: `Order #${decodeURIComponent(orderId)}` };
}

export default async function MockAdminOrderPage(props: PageProps<"/mock-shopify-admin/[orderId]">) {
  const { orderId } = await props.params;
  return <OrderDetailView orderId={decodeURIComponent(orderId)} />;
}
