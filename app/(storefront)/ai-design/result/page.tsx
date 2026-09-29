import type { Metadata } from "next";
import { ResultView } from "@/components/ai-design/ResultView";

export const metadata: Metadata = { title: "Your Design" };

export default function ResultPage() {
  return <ResultView />;
}
