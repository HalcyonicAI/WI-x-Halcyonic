import type { Metadata } from "next";
import { DesignFormView } from "@/components/ai-design/form/DesignFormView";

export const metadata: Metadata = { title: "Design Your Piece" };

export default async function DesignFormPage(props: PageProps<"/ai-design/form">) {
  const q = await props.searchParams;
  return <DesignFormView mode={q.mode === "modify" ? "modify" : "new"} />;
}
