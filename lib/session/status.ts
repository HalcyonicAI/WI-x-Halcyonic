import type { BookingStatus } from "@/types/booking";

/** Human labels for the booking lifecycle (context.md §14), shared by storefront, demo tools and admin preview. */
export const STATUS_META: Record<BookingStatus, { label: string; tone: "neutral" | "success" | "attention" | "info" | "warning" }> = {
  unpaid: { label: "Unpaid", tone: "warning" },
  paid: { label: "Paid · not started", tone: "neutral" },
  designing: { label: "Designing", tone: "info" },
  generated: { label: "Design generated", tone: "info" },
  revision: { label: "Customer revising", tone: "info" },
  finalized: { label: "Finalized · awaiting review", tone: "attention" },
  staff_review: { label: "Staff review", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
};
