/* eslint-disable @next/next/no-img-element -- local data URLs */
import type { DesignRequestPayload, ReferenceImage } from "@/types/design";
import { DETAILS, FABRICS, findColour, FITS, garmentLabel, labelFor, occasionLabel, STYLES } from "@/lib/catalog/options";
import { KeyValueList } from "./SpecList";

/** The customer's own choices, in plain language. */
export function SelectionsList({ request, images }: { request: DesignRequestPayload; images?: ReferenceImage[] }) {
  const primary = findColour(request.primaryColour);
  const accent = findColour(request.secondaryColour);
  const swatch = (hex: string) => <span className="mr-1.5 inline-block size-3 translate-y-0.5 border border-black/15" style={{ background: hex }} />;
  const showImages = images && images.length === request.referenceImageCount && images.some((i) => i.dataUrl);

  const rows = [
    { label: "Garment", value: garmentLabel(request.garmentType, request.garmentOther) },
    { label: "Occasion", value: occasionLabel(request.occasion, request.occasionOther) },
    { label: "Main colour", value: primary ? <>{swatch(primary.hex)}{primary.name}</> : "—" },
    { label: "Accent", value: accent ? <>{swatch(accent.hex)}{accent.name}</> : "None" },
    { label: "Style", value: request.style.map((s) => labelFor(STYLES, s)).join(" · ") },
    { label: "Fabric", value: labelFor(FABRICS, request.fabric) },
    { label: "Fit", value: labelFor(FITS, request.fit) },
    { label: "Details", value: request.details.length ? request.details.map((d) => labelFor(DETAILS, d)).join(" · ") : "Minimal" },
    {
      label: "References",
      value: showImages ? (
        <span className="flex flex-wrap gap-2">
          {images!.map((img) =>
            img.dataUrl ? <img key={img.id} src={img.dataUrl} alt={`Reference: ${img.name}`} className="size-14 border border-line object-cover" /> : null,
          )}
        </span>
      ) : request.referenceImageCount ? (
        `${request.referenceImageCount} image(s) — not kept on this device`
      ) : (
        "None"
      ),
    },
    { label: "Your note", value: request.additionalRequest ? <q className="italic">{request.additionalRequest}</q> : "—" },
  ];
  return <KeyValueList rows={rows} />;
}
