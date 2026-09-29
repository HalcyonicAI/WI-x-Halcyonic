import type { NextRequest } from "next/server";
import { decodeRenderParams } from "@/lib/ai/render/params";
import { renderGarmentSVG } from "@/lib/ai/render/garment-svg";

/**
 * MOCK image host. Returns the deterministic SVG concept for the given render params.
 * Stands in for the image URL FLUX / FASHN would return (stored in Supabase Storage in production).
 */
export function GET(request: NextRequest) {
  const params = decodeRenderParams(request.nextUrl.searchParams);
  const svg = renderGarmentSVG(params);
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // URLs carry RENDER_VERSION, so responses are immutable (bump the version when drawing changes).
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
