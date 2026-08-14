import { GoogleAnalytics } from "@next/third-parties/google";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

export function SiteGoogleAnalytics() {
  if (!measurementId || process.env.NODE_ENV !== "production") return null;
  return <GoogleAnalytics gaId={measurementId} />;
}
