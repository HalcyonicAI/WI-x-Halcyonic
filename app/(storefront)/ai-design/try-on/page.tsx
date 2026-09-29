import type { Metadata } from "next";
import { TryOnView } from "@/components/ai-design/TryOnView";

export const metadata: Metadata = { title: "Virtual Try-On" };

export default function TryOnPage() {
  return <TryOnView />;
}
