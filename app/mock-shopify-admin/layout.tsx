import type { Metadata } from "next";
import { AdminChrome } from "@/components/shopify-admin/AdminChrome";

export const metadata: Metadata = {
  title: { default: "Shopify Admin preview", template: "%s · Shopify Admin preview" },
};

/**
 * Shopify Admin INTEGRATION PREVIEW (mock). Demonstrates where Halcyonic AI data
 * would appear inside Wajie's existing Shopify Admin — not a separate staff dashboard.
 */
export default function MockShopifyAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminChrome>{children}</AdminChrome>;
}
