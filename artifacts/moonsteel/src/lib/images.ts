function getSupabaseHostname() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = getSupabaseHostname();

export function getImageRemotePatterns() {
  if (!supabaseHostname) return [];

  return [
    {
      protocol: "https" as const,
      hostname: supabaseHostname,
      pathname: "/storage/v1/object/public/**",
    },
  ];
}
