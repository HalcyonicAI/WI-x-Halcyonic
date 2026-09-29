"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoSession } from "@/types/booking";
import { BookingGate } from "./BookingGate";
import { DesignFrame } from "./DesignFrame";
import { FinalizeDialog } from "./FinalizeDialog";
import { GenerationProgress } from "./GenerationProgress";
import { Notice } from "./Notice";
import { SelectionsList } from "./SelectionsList";
import { SpecList } from "./SpecList";
import { UsageMeter } from "./UsageMeter";
import { Accordion } from "@/components/ui/Accordion";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { DESIGN_STAGES } from "@/lib/client/staged";
import { useDesignGeneration } from "@/lib/client/use-design-generation";
import { selectGeneration } from "@/lib/session/actions";
import { aiBusy, selectedGeneration } from "@/lib/session/use-demo-session";
import { requestFromResult } from "@/lib/client/api";
import { remainingGenerations, remainingTryOns } from "@/lib/usage/quota";
import { cn } from "@/lib/utils";

const KIND_LABEL = { initial: "Initial design", modification: "Modified design", regeneration: "New variation" } as const;

export function ResultView() {
  return <BookingGate rules={["paid", "open", "has-design"]}>{(session) => <Result session={session} />}</BookingGate>;
}

function Result({ session }: { session: DemoSession }) {
  const design = selectedGeneration(session)!;
  const { state, generate, reset } = useDesignGeneration();
  const [confirm, setConfirm] = useState<null | "regenerate" | "finalize">(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const remaining = remainingGenerations(session);
  const busyElsewhere = aiBusy(session) && state.phase !== "running";
  // "limitReached" drives the copy; "blocked" also covers a generation still running elsewhere.
  const limitReached = remaining === 0;
  const blocked = limitReached || busyElsewhere;
  const tryOnLeft = remainingTryOns(session);

  async function regenerate() {
    setConfirm(null);
    window.scrollTo({ top: 0 });
    const ok = await generate(requestFromResult(design), "regeneration");
    // Only touch this page if the customer is still on it.
    if (ok && mounted.current) {
      reset();
      window.scrollTo({ top: 0 });
    }
  }

  if (state.phase === "running") {
    return (
      <GenerationProgress
        meta={`Order ${session.shopifyOrderId} · Design ${session.generationsUsed + 1} of ${session.generationLimit}`}
        title="Creating a new variation"
        subtitle="Same brief, a fresh interpretation — your existing concepts are kept."
        stages={DESIGN_STAGES}
        current={state.stage}
      />
    );
  }

  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      {/* Image + concepts */}
      <section aria-label="Design preview" className="bg-studio px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-[min(100%,calc((100vh-200px)*0.6667))] min-w-[260px]">
          <DesignFrame
            src={design.imageUrl}
            alt={`AI design concept: ${design.title}`}
            caption={`AI concept ${design.version} · ${session.shopifyOrderId}`}
            priority
          />
        </div>
        <div className="mx-auto mt-6 max-w-[640px]">
          <p className="text-center text-[11px] uppercase text-muted">Your concepts</p>
          <ul className="mt-3 flex justify-center gap-3">
            {Array.from({ length: session.generationLimit }, (_, i) => {
              const g = session.generations[i];
              if (!g) {
                return (
                  <li key={i} className="flex w-16 flex-col items-center gap-1.5 sm:w-20">
                    <span className="grid aspect-[2/3] w-full place-items-center border border-line bg-white/40 text-[10px] uppercase text-subtle">
                      {limitReached ? "—" : "Available"}
                    </span>
                    <span className="text-[10px] uppercase text-subtle">Concept {i + 1}</span>
                  </li>
                );
              }
              const active = g.id === design.id;
              return (
                <li key={g.id} className="w-16 sm:w-20">
                  <button
                    type="button"
                    onClick={() => selectGeneration(g.id)}
                    aria-pressed={active}
                    aria-label={`Show concept ${g.version}: ${g.title}`}
                    className="flex w-full flex-col items-center gap-1.5"
                  >
                    <span className={cn("block aspect-[2/3] w-full overflow-hidden border bg-white", active ? "border-black" : "border-transparent hover:border-black/40")}>
                      <RemoteImage src={g.imageUrl} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className={cn("text-[10px] uppercase", active ? "font-medium" : "text-muted")}>Concept {g.version}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Information */}
      <section aria-label="Design details" className="bg-panel">
        <div className="px-5 py-10 sm:px-12 lg:sticky lg:top-[100px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto lg:px-12 lg:py-12 xl:px-16">
          <div className="max-w-[500px] animate-fade-up" key={design.id}>
            <p className="text-[12px] uppercase text-muted">
              Concept {design.version} of {session.generationLimit} · {KIND_LABEL[design.kind]}
            </p>
            <h1 className="wi-h-product mt-2">{design.title}</h1>
            <p className="mt-2 text-[12px] uppercase text-muted">{design.variationLabel}</p>
            <p className="mt-5 text-[12px] leading-[1.6]">{design.summary}</p>

            <div className="my-7 border-t border-black/10" />

            <p className="text-[12px] uppercase">
              Order {session.shopifyOrderId} <span className="text-muted">· Paid</span>
            </p>
            <div className="mt-4 space-y-3">
              <UsageMeter label="Design generations" used={session.generationsUsed} limit={session.generationLimit} />
              <UsageMeter label="Virtual try-on" used={session.tryOnsUsed} limit={session.tryOnLimit} />
            </div>

            {state.phase === "error" && state.code !== "IN_PROGRESS" ? (
              <Notice
                tone={state.code === "GENERATION_LIMIT_REACHED" ? "limit" : "error"}
                title={state.code === "GENERATION_LIMIT_REACHED" ? "No design generations remaining" : "We couldn't create a new variation"}
                className="mt-6"
              >
                {state.code === "GENERATION_LIMIT_REACHED" ? state.message : "Nothing was used from your booking. Please try again in a moment."}
              </Notice>
            ) : null}

            <div className="mt-7 space-y-2">
              <Button full onClick={() => setConfirm("finalize")}>
                Finalize design
              </Button>
              <ButtonLink href="/ai-design/try-on" variant="secondary" full>
                {session.tryOn ? "View virtual try-on" : "Virtual try-on"}
              </ButtonLink>
              <div className="grid grid-cols-2 gap-2">
                <ButtonLink
                  href="/ai-design/form?mode=modify"
                  variant="secondary"
                  aria-disabled={blocked || undefined}
                  className={cn(blocked && "pointer-events-none")}
                  tabIndex={blocked ? -1 : undefined}
                >
                  Modify design
                </ButtonLink>
                <Button variant="secondary" disabled={blocked} onClick={() => setConfirm("regenerate")}>
                  Regenerate
                </Button>
              </div>
              <p className="pt-1 text-center text-[12px] text-muted">
                {limitReached
                  ? "Modify and regenerate are no longer available"
                  : `Modify or regenerate uses 1 of ${remaining} remaining · Try-on ${tryOnLeft ? "included" : "used"}`}
              </p>
            </div>

            {busyElsewhere ? (
              <Notice title="A new concept is still being created" className="mt-6">
                It will appear in Your concepts in a moment.
              </Notice>
            ) : null}

            {limitReached ? (
              <Notice tone="limit" title="You've used the design generations included with this booking" className="mt-6">
                Choose your favourite concept above, try it on, and submit it to Wajie&apos;s team. Our atelier can make further
                changes during your consultation.
              </Notice>
            ) : null}

            <div className="mt-8">
              <Accordion title="Design specification" defaultOpen>
                <SpecList spec={design.specification} />
              </Accordion>
              <Accordion title="Your selections">
                <SelectionsList request={design.request} images={design.referenceImages} />
              </Accordion>
              <Accordion title="Design notes">
                <ul className="space-y-2">
                  {design.designNotes.map((n) => (
                    <li key={n} className="grid grid-cols-[12px_1fr] gap-2">
                      <span className="mt-2 size-1.5 bg-black" aria-hidden="true" />
                      {n}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[12px] text-muted">Guided by Wajie Ibrahim&apos;s design direction.</p>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <Dialog
        open={confirm === "regenerate"}
        onClose={() => setConfirm(null)}
        title="Create a new variation?"
        labelledBy="regen-title"
        actions={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button onClick={() => void regenerate()}>Regenerate design</Button>
          </>
        }
      >
        We&apos;ll create a fresh variation of concept {design.version} from the same brief. This uses 1 of your {remaining} remaining
        design generations. Your current concepts are kept.
      </Dialog>

      <FinalizeDialog open={confirm === "finalize"} onClose={() => setConfirm(null)} design={design} />
    </div>
  );
}
