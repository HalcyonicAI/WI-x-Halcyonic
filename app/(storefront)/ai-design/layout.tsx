import { SessionBar } from "@/components/ai-design/SessionBar";

export default function AIDesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionBar />
      {children}
    </>
  );
}
