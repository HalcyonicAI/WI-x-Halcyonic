import type { Metadata } from "next";
import { ConfirmedView } from "@/components/checkout/ConfirmedView";

export const metadata: Metadata = { title: "Order confirmed" };

export default function ConfirmedPage() {
  return <ConfirmedView />;
}
