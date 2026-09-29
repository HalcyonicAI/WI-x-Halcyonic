import type { Metadata } from "next";
import { CompleteView } from "@/components/ai-design/CompleteView";

export const metadata: Metadata = { title: "Design Submitted" };

export default function CompletePage() {
  return <CompleteView />;
}
