"use client";

/* eslint-disable @next/next/no-img-element -- local data URLs / mock renders */
import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { DemoSession } from "@/types/booking";
import type { TryOnResult } from "@/types/design";
import { BookingGate } from "./BookingGate";
import { DesignFrame } from "./DesignFrame";
import { FinalizeDialog } from "./FinalizeDialog";
import { GenerationProgress } from "./GenerationProgress";
import { Notice } from "./Notice";
import { UsageMeter } from "./UsageMeter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ArrowLeftIcon, CloseIcon, UploadIcon } from "@/components/ui/icons";
import { SAMPLE_CUSTOMER_PHOTO } from "@/lib/ai/samples";
import { fileToDownscaledDataUrl, MAX_UPLOAD_BYTES } from "@/lib/client/image";
import { TRYON_STAGES } from "@/lib/client/staged";
import { useTryOn } from "@/lib/client/use-try-on";
import { aiBusy, selectedGeneration } from "@/lib/session/use-demo-session";
import { remainingTryOns } from "@/lib/usage/quota";
import { cn } from "@/lib/utils";

export function TryOnView() {
  return <BookingGate rules={["paid", "open", "has-design"]}>{(session) => <TryOn session={session} />}</BookingGate>;
}

function TryOn({ session }: { session: DemoSession }) {
  const design = selectedGeneration(session)!;
  const { state, run } = useTryOn();
  const [photo, setPhoto] = useState<TryOnResult["customerPhoto"] | null>(null);
  const [consent, setConsent] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showConsentError, setShowConsentError] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const photoErrorId = useId();
  const consentErrorId = useId();
  const remaining = remainingTryOns(session);
  const result = session.tryOn;
  const tryOnDesign = result ? session.generations.find((g) => g.id === result.designResultId) ?? design : design;

  async function onFile(file: File | undefined) {
    setPhotoError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoError("That file isn't an image. Try a JPG or PNG photo.");
    if (file.size > MAX_UPLOAD_BYTES) return setPhotoError("That photo is over 12 MB — try a smaller version.");
    try {
      setPhoto({ name: file.name, dataUrl: await fileToDownscaledDataUrl(file, 1000), isSample: false });
    } catch {
      setPhotoError("We couldn't read that photo. Try a JPG or PNG.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function start() {
    if (!photo) return;
    if (!consent) {
      setShowConsentError(true);
      consentRef.current?.focus();
      return;
    }
    window.scrollTo({ top: 0 });
    await run(design, photo);
  }

  // On "done" the new result is already in the session, so fall through to show it.
  if (state.phase === "running") {
    return (
      <GenerationProgress
        meta={`Order ${session.shopifyOrderId} · Try-on 1 of ${session.tryOnLimit}`}
        title="Creating your try-on"
        subtitle={`Fitting concept ${design.version} to your photo.`}
        stages={TRYON_STAGES}
        current={state.stage}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1300px] px-4 py-10 sm:px-8 lg:py-14">
      <Link href="/ai-design/result" className="inline-flex items-center gap-1.5 text-[12px] uppercase text-muted hover:text-ink">
        <ArrowLeftIcon size={14} /> Back to your design
      </Link>
      <header className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[12px] uppercase text-muted">Optional</p>
          <h1 className="wi-h-page mt-2">Virtual try-on</h1>
          <p className="mt-3 max-w-[520px] text-[12px] leading-[1.6] text-muted">
            See your design on your own photo before you submit it to our atelier.
          </p>
        </div>
        <UsageMeter label="Virtual try-on" used={session.tryOnsUsed} limit={session.tryOnLimit} className="md:min-w-[260px]" />
      </header>

      {result ? (
        <TryOnResultPanel
          session={session}
          result={result}
          designTitle={tryOnDesign.title}
          selectedVersion={design.version}
          onFinalize={() => setFinalizing(true)}
        />
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {/* Your design */}
          <div className="grid grid-cols-[minmax(0,160px)_1fr] items-start gap-5 sm:grid-cols-[minmax(0,220px)_1fr] lg:block">
            <DesignFrame src={design.imageUrl} alt={design.title} className="lg:max-w-[440px]" caption={`Concept ${design.version}`} />
            <div className="lg:mt-5">
              <p className="text-[11px] uppercase text-muted">Your design</p>
              <p className="mt-1 text-[14px] font-medium uppercase">{design.title}</p>
              <Link href="/ai-design/result" className="mt-2 inline-block text-[12px] underline underline-offset-4">
                Choose a different concept
              </Link>
            </div>
          </div>

          {/* Photo + start */}
          <div>
            {remaining <= 0 ? (
              <Notice tone="limit" title="You've used the virtual try-on included with this booking" />
            ) : (
              <>
                <p className="text-[14px] font-medium uppercase">Your photo</p>
                {photo ? (
                  <div className="mt-4 flex items-start gap-4">
                    <div className="relative w-40 shrink-0">
                      <img src={photo.dataUrl} alt="Your photo for the try-on" className="aspect-[2/3] w-full border border-line object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        aria-label="Remove photo"
                        className="absolute -right-3 -top-3 grid size-10 place-items-center"
                      >
                        <span className="grid size-7 place-items-center border border-line bg-white hover:border-black">
                          <CloseIcon size={14} />
                        </span>
                      </button>
                    </div>
                    <div className="text-[12px]">
                      <p className="font-medium">{photo.isSample ? "Sample photo" : photo.name}</p>
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="mt-1 inline-flex min-h-10 items-center underline underline-offset-4"
                      >
                        Replace photo
                      </button>
                    </div>
                  </div>
                ) : null}
                {/* The file input lives inside its label so it always has a name and a visible focus ring. */}
                <label
                  className={cn(
                    "mt-4 cursor-pointer flex-col items-center justify-center gap-2 border border-line bg-mist px-4 py-12 text-center hover:border-black focus-within:outline focus-within:outline-1 focus-within:outline-offset-2 focus-within:outline-black",
                    photo ? "hidden" : "flex",
                  )}
                >
                  <UploadIcon size={22} />
                  <span className="text-[12px] font-medium uppercase">Upload a full-length photo</span>
                  <span className="text-[12px] text-muted">JPG or PNG · under 12 MB</span>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    aria-label="Upload a full-length photo"
                    aria-describedby={photoError ? photoErrorId : undefined}
                    className="sr-only"
                    onChange={(e) => void onFile(e.target.files?.[0])}
                  />
                </label>
                {photoError ? (
                  <p id={photoErrorId} role="alert" className="mt-2 text-[12px] text-danger">
                    {photoError}
                  </p>
                ) : null}
                {!photo ? (
                  <button
                    type="button"
                    onClick={() => setPhoto({ name: "Sample photo", dataUrl: SAMPLE_CUSTOMER_PHOTO, isSample: true })}
                    className="mt-2 inline-flex min-h-10 items-center text-[12px] underline underline-offset-4"
                  >
                    No photo to hand? Use a sample photo
                  </button>
                ) : null}

                <ul className="mt-6 space-y-1.5 text-[12px] text-muted">
                  <li>· Stand facing the camera, full length, arms relaxed</li>
                  <li>· Plain background and even, natural light</li>
                  <li>· Fitted clothing gives the most accurate preview</li>
                </ul>

                <label className="mt-6 flex cursor-pointer items-start gap-3 text-[12px] leading-[1.6]">
                  <input
                    ref={consentRef}
                    type="checkbox"
                    aria-describedby={showConsentError ? consentErrorId : undefined}
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      setShowConsentError(false);
                    }}
                    className="mt-0.5 size-4 shrink-0 accent-black"
                  />
                  <span>I confirm this is my photo, and agree it is used only to create this try-on preview.</span>
                </label>
                {showConsentError ? (
                  <p id={consentErrorId} role="alert" className="mt-2 text-[12px] text-danger">
                    Please confirm your photo can be used for this preview.
                  </p>
                ) : null}

                {aiBusy(session) ? (
                  <Notice title="A design is still being created" className="mt-6">
                    You can start your try-on as soon as it&apos;s ready.
                  </Notice>
                ) : null}
                {state.phase === "error" && state.code !== "IN_PROGRESS" ? (
                  <Notice tone="error" title="We couldn't create your try-on this time" className="mt-6">
                    Your try-on hasn&apos;t been used. Please try again in a moment.
                  </Notice>
                ) : null}

                <Button full className="mt-6" disabled={!photo || aiBusy(session)} onClick={() => void start()}>
                  Create try-on — uses {session.tryOnLimit - remaining + 1} of {session.tryOnLimit}
                </Button>
                <p className="mt-2 text-[12px] text-muted">Your booking includes {session.tryOnLimit} virtual try-on.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Always submits the concept the customer has selected, which is the one named in the dialog. */}
      <FinalizeDialog open={finalizing} onClose={() => setFinalizing(false)} design={design} />
    </div>
  );
}

function TryOnResultPanel({
  session,
  result,
  designTitle,
  selectedVersion,
  onFinalize,
}: {
  session: DemoSession;
  result: TryOnResult;
  designTitle: string;
  selectedVersion: number;
  onFinalize: () => void;
}) {
  return (
    <div className="mt-10 animate-fade-up">
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-[900px]">
        <figure>
          <div className="aspect-[2/3] overflow-hidden bg-studio">
            {result.customerPhoto.dataUrl ? (
              <img src={result.customerPhoto.dataUrl} alt="Your photo" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full place-items-center text-[11px] uppercase text-muted">Photo kept private</span>
            )}
          </div>
          <figcaption className="mt-2 text-[11px] uppercase text-muted">Your photo</figcaption>
        </figure>
        <figure>
          <DesignFrame src={result.imageUrl} alt={`Try-on preview of ${designTitle}`} caption="Demo preview" />
          <figcaption className="mt-2 text-[11px] uppercase">
            Try-on preview · Concept {result.designVersion}
          </figcaption>
        </figure>
      </div>

      <div className="mt-8 max-w-[900px] space-y-4">
        <Notice tone="limit" title="You've used the virtual try-on included with this booking">
          Try-on previews approximate fit and drape; your final fit is confirmed by Wajie&apos;s atelier team.
          {result.designVersion !== selectedVersion ? ` This preview shows concept ${result.designVersion}.` : ""}
        </Notice>
        <p className="text-[12px] text-muted">
          Demo note: this preview is a placeholder image. In production the design is rendered onto the customer&apos;s own photo.
        </p>
        <div className={cn("flex flex-col gap-2 sm:flex-row")}>
          <Button onClick={onFinalize} className="sm:min-w-[240px]">
            Finalize design
          </Button>
          <ButtonLink href="/ai-design/result" variant="outline" className="sm:min-w-[240px]">
            Back to your design
          </ButtonLink>
        </div>
        <p className="text-[12px] text-muted">Order {session.shopifyOrderId}</p>
      </div>
    </div>
  );
}
