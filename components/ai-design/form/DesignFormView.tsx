"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { DemoSession } from "@/types/booking";
import type { DesignDraft, DesignRequest, DetailOption, DesignResult, StyleDirection } from "@/types/design";
import { BookingGate } from "@/components/ai-design/BookingGate";
import { GenerationProgress } from "@/components/ai-design/GenerationProgress";
import { Notice } from "@/components/ai-design/Notice";
import { UsageMeter } from "@/components/ai-design/UsageMeter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Chip, FormSection, SwatchGrid, TextInput, Tile } from "./controls";
import { ReferenceUpload } from "./ReferenceUpload";
import {
  ACCENT_COLOURS,
  DETAILS,
  FABRICS,
  findColour,
  FITS,
  GARMENTS,
  garmentLabel,
  labelFor,
  MAX_STYLES,
  OCCASIONS,
  occasionLabel,
  PRIMARY_COLOURS,
  STYLES,
} from "@/lib/catalog/options";
import { GARMENT_THUMBS } from "@/lib/ai/samples";
import { DESIGN_STAGES } from "@/lib/client/staged";
import { useDesignGeneration } from "@/lib/client/use-design-generation";
import { markDesigning, saveDraft, saveModifyDraft } from "@/lib/session/actions";
import { aiBusy, selectedGeneration } from "@/lib/session/use-demo-session";
import { requestFromResult } from "@/lib/client/api";
import { remainingGenerations } from "@/lib/usage/quota";
import { cn } from "@/lib/utils";

type Mode = "new" | "modify";
type SectionKey = "garment" | "occasion" | "colour" | "style" | "fabric" | "fit";

const EMPTY_DRAFT: DesignDraft = { fit: "regular", style: [], details: [], referenceImages: [], additionalRequest: "" };

/** The example brief from context.md — handy for presenters and for customers who want a starting point. */
const EXAMPLE_DRAFT: DesignDraft = {
  garmentType: "baju-kurung",
  occasion: "wedding",
  primaryColour: "sage-green",
  secondaryColour: "muted-ivory",
  style: ["modern", "elegant"],
  fabric: "chiffon",
  fit: "relaxed",
  details: ["embroidery"],
  referenceImages: [],
  additionalRequest: "I want something elegant for my sister's wedding with subtle floral embroidery around the cuffs.",
};

function initialDraft(session: DemoSession, mode: Mode, selected: DesignResult | null): DesignDraft {
  if (mode === "modify" && selected) {
    // Resume unsaved edits to this concept (survives refresh), else start from the concept's own brief.
    if (session.modifyDraft?.baseId === selected.id) return session.modifyDraft.draft;
    return requestFromResult(selected);
  }
  return session.designDraft ?? EMPTY_DRAFT;
}

const LABELS: Record<SectionKey, string> = {
  garment: "Garment",
  occasion: "Occasion",
  colour: "Colour",
  style: "Style direction",
  fabric: "Fabric",
  fit: "Fit",
};

function validate(d: DesignDraft): Partial<Record<SectionKey, string>> {
  const e: Partial<Record<SectionKey, string>> = {};
  if (!d.garmentType) e.garment = "Choose the piece you'd like us to design.";
  else if (d.garmentType === "other" && !d.garmentOther?.trim()) e.garment = "Tell us which piece you have in mind.";
  if (!d.occasion) e.occasion = "Choose the occasion you're dressing for.";
  else if (d.occasion === "other" && !d.occasionOther?.trim()) e.occasion = "Tell us about the occasion.";
  if (!d.primaryColour) e.colour = "Choose a main colour.";
  if (!d.style.length) e.style = "Choose at least one style direction.";
  if (!d.fabric) e.fabric = "Choose a fabric, or select “No Preference”.";
  if (!d.fit) e.fit = "Choose how you'd like it to fit.";
  return e;
}

function toRequest(d: DesignDraft): DesignRequest {
  return {
    garmentType: d.garmentType!,
    garmentOther: d.garmentType === "other" ? d.garmentOther?.trim() : undefined,
    occasion: d.occasion!,
    occasionOther: d.occasion === "other" ? d.occasionOther?.trim() : undefined,
    primaryColour: d.primaryColour!,
    secondaryColour: d.secondaryColour !== d.primaryColour ? d.secondaryColour : undefined,
    style: d.style,
    fabric: d.fabric!,
    fit: d.fit ?? "regular",
    details: d.details,
    referenceImages: d.referenceImages,
    additionalRequest: (d.additionalRequest ?? "").trim(),
  };
}

const SECTION_ORDER: SectionKey[] = ["garment", "occasion", "colour", "style", "fabric", "fit"];

export function DesignFormView({ mode }: { mode: Mode }) {
  return (
    <BookingGate rules={["paid", "open"]}>{(session) => <DesignForm session={session} mode={mode} />}</BookingGate>
  );
}

function DesignForm({ session, mode: requestedMode }: { session: DemoSession; mode: Mode }) {
  const router = useRouter();
  const selected = selectedGeneration(session);
  const mode: Mode = requestedMode === "modify" && selected ? "modify" : "new";
  const [draft, setDraft] = useState<DesignDraft>(() => initialDraft(session, mode, selected));
  const [showErrors, setShowErrors] = useState(false);
  const { state, generate, reset } = useDesignGeneration();
  const mounted = useRef(true);
  const baseId = mode === "modify" ? selected?.id : undefined;

  useEffect(() => {
    mounted.current = true;
    markDesigning();
    return () => {
      mounted.current = false;
    };
  }, []);

  // Autosave: modify-mode edits are kept apart from the new-design draft.
  useEffect(() => {
    const t = setTimeout(() => (baseId ? saveModifyDraft(baseId, draft) : saveDraft(draft)), 300);
    return () => clearTimeout(t);
  }, [draft, baseId]);

  const errors = validate(draft);
  const shown = showErrors ? errors : {};
  const remaining = remainingGenerations(session);
  const limitReached = remaining === 0;
  // Another page or tab started a generation that hasn't finished yet.
  const busyElsewhere = aiBusy(session) && state.phase !== "running";
  const blocked = limitReached || busyElsewhere;
  const update = (patch: Partial<DesignDraft>) => setDraft((d) => ({ ...d, ...patch }));

  async function submit() {
    if (Object.keys(errors).length) {
      setShowErrors(true);
      const first = SECTION_ORDER.find((k) => errors[k]);
      const el = first ? document.getElementById(`section-${first}`) : null;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      el?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
      return;
    }
    const kind = session.generations.length === 0 ? "initial" : "modification";
    window.scrollTo({ top: 0 });
    // A modification keeps the edited concept's neckline, sleeves and kain unless garment or fit changed.
    const ok = await generate(toRequest(draft), kind, mode === "modify" ? selected?.variant : undefined);
    // If the customer navigated elsewhere meanwhile, the concept is saved but we don't pull them back.
    if (ok && mounted.current) router.push("/ai-design/result");
  }

  if (state.phase === "running" || state.phase === "done") {
    return (
      <GenerationProgress
        meta={`Order ${session.shopifyOrderId} · Design ${session.generationsUsed + (state.phase === "done" ? 0 : 1)} of ${session.generationLimit}`}
        title={mode === "modify" ? "Updating your design" : "Creating your design"}
        subtitle="Our AI design studio is working from your brief and Wajie's design direction."
        stages={DESIGN_STAGES}
        current={state.phase === "done" ? DESIGN_STAGES.length : state.stage}
      />
    );
  }

  const primary = findColour(draft.primaryColour);
  const accent = findColour(draft.secondaryColour);
  const submitLabel = mode === "modify" || session.generations.length ? "Create updated design" : "Generate my design";

  const summaryRows: { label: string; value: React.ReactNode }[] = [
    { label: "Garment", value: draft.garmentType ? garmentLabel(draft.garmentType, draft.garmentOther) : null },
    { label: "Occasion", value: draft.occasion ? occasionLabel(draft.occasion, draft.occasionOther) : null },
    {
      label: "Colour",
      value: primary ? (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span className="size-3 border border-black/15" style={{ background: primary.hex }} />
          {primary.name}
          {accent ? (
            <>
              <span className="text-muted">+</span>
              <span className="size-3 border border-black/15" style={{ background: accent.hex }} />
              {accent.name}
            </>
          ) : null}
        </span>
      ) : null,
    },
    { label: "Style", value: draft.style.length ? draft.style.map((s) => labelFor(STYLES, s)).join(" · ") : null },
    { label: "Fabric", value: draft.fabric ? labelFor(FABRICS, draft.fabric) : null },
    { label: "Fit", value: draft.fit ? labelFor(FITS, draft.fit) : null },
    { label: "Details", value: draft.details.length ? draft.details.map((d) => labelFor(DETAILS, d)).join(" · ") : null },
    { label: "References", value: draft.referenceImages.length ? `${draft.referenceImages.length} image(s)` : null },
  ];

  const submitArea = (
    <>
      <UsageMeter label="Design generations" used={session.generationsUsed} limit={session.generationLimit} />
      <Button type="submit" form="design-form" full disabled={blocked} className="mt-5">
        {submitLabel}
      </Button>
      <p className="mt-2 text-center text-[12px] text-muted">
        {limitReached ? "No design generations remaining" : `Uses 1 of your ${remaining} remaining design generations`}
      </p>
    </>
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-10 sm:px-8 lg:pb-20 lg:pt-14">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-20">
        <div>
          <header className="mb-10">
            <p className="text-[12px] uppercase text-muted">{mode === "modify" ? `Modify concept ${selected?.version}` : "Design brief"}</p>
            <h1 className="wi-h-page mt-2">
              {mode === "modify" ? "Refine your design" : "Design your piece"}
            </h1>
            <p className="mt-4 max-w-[560px] text-[12px] leading-[1.6] text-muted">
              Tell us what you have in mind. Your answers guide our AI design studio, working within Wajie&apos;s design
              direction.
            </p>
            {mode === "new" && !limitReached ? (
              <button
                type="button"
                onClick={() => setDraft({ ...EXAMPLE_DRAFT, referenceImages: draft.referenceImages })}
                className="mt-2 inline-flex min-h-10 items-center text-[12px] underline underline-offset-4 hover:no-underline"
              >
                Need inspiration? Start from an example brief
              </button>
            ) : null}
          </header>

          {limitReached ? (
            <Notice
              tone="limit"
              title="You've used the design generations included with this booking"
              className="mb-8"
              action={
                <ButtonLink href="/ai-design/result" variant="outline">
                  View your designs
                </ButtonLink>
              }
            >
              You can still choose your favourite concept, try it on, and submit it to Wajie&apos;s team.
            </Notice>
          ) : mode === "modify" ? (
            <Notice title={`Editing concept ${selected?.version}`} className="mb-8">
              Update any of your choices below. Creating the updated design uses 1 of your {remaining} remaining design
              generations — your existing concepts are kept.
            </Notice>
          ) : null}

          {busyElsewhere ? (
            <Notice title="Your design is still being created" className="mb-8">
              It will appear under Your design in a moment. You can submit another brief once it&apos;s ready.
            </Notice>
          ) : null}

          {state.phase === "error" && state.code !== "IN_PROGRESS" ? (
            <Notice
              tone="error"
              title={state.code === "GENERATION_LIMIT_REACHED" ? "No design generations remaining" : "We couldn't create your design this time"}
              className="mb-8"
              action={
                state.code === "GENERATION_LIMIT_REACHED" ? null : (
                  <Button variant="outline" onClick={() => void submit()}>
                    Try again
                  </Button>
                )
              }
            >
              {state.code === "GENERATION_LIMIT_REACHED"
                ? state.message
                : "Nothing was used from your booking. Please try again in a moment."}
            </Notice>
          ) : null}

          <p role="status" className="sr-only">
            {showErrors && Object.keys(errors).length
              ? `Please complete ${Object.keys(errors).length} section${Object.keys(errors).length === 1 ? "" : "s"}: ${SECTION_ORDER.filter((k) => errors[k])
                  .map((k) => LABELS[k])
                  .join(", ")}.`
              : ""}
          </p>

          <form
            id="design-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              reset();
              void submit();
            }}
          >
            <FormSection id="section-garment" number="01" title="Garment" hint="What would you like us to design?" error={shown.garment}>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {GARMENTS.map((g) => (
                  <Tile
                    key={g.value}
                    type="radio"
                    name="garment"
                    checked={draft.garmentType === g.value}
                    onChange={() => update({ garmentType: g.value })}
                    title={g.label}
                    image={g.value === "other" ? null : GARMENT_THUMBS[g.value]}
                  />
                ))}
              </div>
              {draft.garmentType === "other" ? (
                <TextInput
                  id="garment-other"
                  label="Describe the piece"
                  placeholder="e.g. Kaftan, two-piece set, cape"
                  value={draft.garmentOther ?? ""}
                  onChange={(v) => update({ garmentOther: v })}
                />
              ) : null}
            </FormSection>

            <FormSection id="section-occasion" number="02" title="Occasion" error={shown.occasion}>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <Chip key={o.value} type="radio" name="occasion" checked={draft.occasion === o.value} onChange={() => update({ occasion: o.value })}>
                    {o.label}
                  </Chip>
                ))}
              </div>
              {draft.occasion === "other" ? (
                <TextInput
                  id="occasion-other"
                  label="Tell us about the occasion"
                  placeholder="e.g. Aqiqah, graduation, photoshoot"
                  value={draft.occasionOther ?? ""}
                  onChange={(v) => update({ occasionOther: v })}
                />
              ) : null}
            </FormSection>

            <FormSection id="section-colour" number="03" title="Colour" error={shown.colour}>
              <SwatchGrid
                name="primary-colour"
                label="Main colour"
                colours={PRIMARY_COLOURS}
                value={draft.primaryColour}
                onChange={(id) =>
                  update({ primaryColour: id, ...(draft.secondaryColour === id ? { secondaryColour: undefined } : {}) })
                }
              />
              <div className="mt-8" />
              <SwatchGrid
                name="accent-colour"
                label={
                  <>
                    Accent colour <span className="text-subtle">· optional</span>
                  </>
                }
                colours={ACCENT_COLOURS.filter((c) => c.id !== draft.primaryColour)}
                value={draft.secondaryColour}
                onChange={(id) => update({ secondaryColour: id })}
                allowNone
              />
            </FormSection>

            <FormSection
              id="section-style"
              number="04"
              title="Style direction"
              hint={`Choose up to ${MAX_STYLES} · ${draft.style.length} selected`}
              error={shown.style}
            >
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => {
                  const checked = draft.style.includes(s.value);
                  return (
                    <Chip
                      key={s.value}
                      type="checkbox"
                      name="style"
                      checked={checked}
                      disabled={!checked && draft.style.length >= MAX_STYLES}
                      onChange={() =>
                        update({
                          style: checked ? draft.style.filter((x) => x !== s.value) : ([...draft.style, s.value] as StyleDirection[]),
                        })
                      }
                    >
                      {s.label}
                    </Chip>
                  );
                })}
              </div>
            </FormSection>

            <FormSection id="section-fabric" number="05" title="Fabric preference" error={shown.fabric}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {FABRICS.map((f) => (
                  <Tile
                    key={f.value}
                    type="radio"
                    name="fabric"
                    checked={draft.fabric === f.value}
                    onChange={() => update({ fabric: f.value })}
                    title={f.label}
                    description={f.description}
                  />
                ))}
              </div>
            </FormSection>

            <FormSection id="section-fit" number="06" title="Fit" error={shown.fit}>
              <div className="grid grid-cols-3 gap-2">
                {FITS.map((f) => (
                  <Tile
                    key={f.value}
                    type="radio"
                    name="fit"
                    checked={draft.fit === f.value}
                    onChange={() => update({ fit: f.value })}
                    title={f.label}
                    description={f.description}
                  />
                ))}
              </div>
            </FormSection>

            <FormSection id="section-details" number="07" title="Details" hint="Choose any that appeal — or keep it minimal." optional>
              <div className="flex flex-wrap gap-2">
                {DETAILS.map((d) => {
                  const checked = draft.details.includes(d.value);
                  return (
                    <Chip
                      key={d.value}
                      type="checkbox"
                      name="details"
                      checked={checked}
                      onChange={() => {
                        let next: DetailOption[];
                        if (checked) next = draft.details.filter((x) => x !== d.value);
                        else if (d.value === "minimal") next = ["minimal"];
                        else next = [...draft.details.filter((x) => x !== "minimal"), d.value];
                        update({ details: next });
                      }}
                    >
                      {d.label}
                    </Chip>
                  );
                })}
              </div>
            </FormSection>

            <FormSection id="section-references" number="08" title="Reference images" hint="Share photos of pieces, details or colours you love." optional>
              <ReferenceUpload images={draft.referenceImages} onChange={(referenceImages) => update({ referenceImages })} />
            </FormSection>

            <FormSection id="section-notes" number="09" title="Additional request" optional>
              <label htmlFor="additional-request" className="sr-only">
                Additional request
              </label>
              <textarea
                id="additional-request"
                rows={4}
                maxLength={500}
                value={draft.additionalRequest ?? ""}
                onChange={(e) => update({ additionalRequest: e.target.value })}
                placeholder="e.g. Something elegant for my sister's wedding with subtle floral embroidery around the cuffs."
                className="w-full resize-y border border-line bg-white px-4 py-3 text-[16px] leading-relaxed outline-none placeholder:text-subtle focus:border-black sm:text-[14px]"
              />
              <p className="mt-1 text-right text-[11px] tabular-nums text-muted">{(draft.additionalRequest ?? "").length}/500</p>
            </FormSection>
          </form>
        </div>

        {/* Brief summary (desktop) */}
        <aside aria-label="Your brief" className="hidden lg:block">
          <div className="sticky top-[124px] bg-panel p-8">
            <p className="text-[14px] font-medium uppercase">Your brief</p>
            <p className="mt-1 text-[12px] text-muted">Order {session.shopifyOrderId}</p>
            <dl className="mt-5 divide-y divide-black/10 border-y border-black/10">
              {summaryRows.map((r) => (
                <div key={r.label} className="grid grid-cols-[88px_1fr] gap-3 py-2.5">
                  <dt className="text-[11px] uppercase text-muted">{r.label}</dt>
                  <dd className={cn("text-[12px] leading-snug", !r.value && "text-subtle")}>{r.value ?? "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">{submitArea}</div>
            {session.generations.length ? (
              <p className="mt-4 text-center text-[12px]">
                <Link href="/ai-design/result" className="underline underline-offset-4">
                  Back to your designs
                </Link>
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Sticky submit (mobile / tablet) */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-10 border-t border-black bg-white px-4 py-3 sm:-mx-8 sm:px-8 lg:hidden">
        <div className="mx-auto flex max-w-[640px] items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase">
              Designs {session.generationsUsed}/{session.generationLimit}
            </p>
            <p className="truncate text-[11px] text-muted">
              {limitReached ? "None remaining" : `Uses 1 of ${remaining} remaining`}
            </p>
          </div>
          <Button type="submit" form="design-form" disabled={blocked} className="px-6">
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
