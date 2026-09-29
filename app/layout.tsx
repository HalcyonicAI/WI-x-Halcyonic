import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { DemoControls } from "@/components/demo/DemoControls";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Custom Design – Wajie Ibrahim",
    template: "%s – Wajie Ibrahim",
  },
  description:
    "Approval build v0.1 — Wajie Ibrahim AI Custom Design experience (interactive mock-up by Halcyonic AI Solutions).",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <DemoControls />
      </body>
    </html>
  );
}
