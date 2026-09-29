"use client";

import { useRouter } from "next/navigation";
import type { DesignResult } from "@/types/design";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { finalizeDesign } from "@/lib/session/actions";

/** Named confirmation before the (irreversible) submission to Wajie Ibrahim. */
export function FinalizeDialog({ open, onClose, design }: { open: boolean; onClose: () => void; design: DesignResult }) {
  const router = useRouter();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Submit this design to Wajie Ibrahim?"
      labelledBy="finalize-title"
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            Keep editing
          </Button>
          <Button
            onClick={() => {
              finalizeDesign(design.id);
              onClose();
              router.push("/ai-design/complete");
            }}
          >
            Submit design
          </Button>
        </>
      }
    >
      &ldquo;{design.title}&rdquo; (concept {design.version}) will be sent to Wajie&apos;s team for review. Once submitted, the design
      is locked and can&apos;t be changed here.
    </Dialog>
  );
}
