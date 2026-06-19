/** Map low-level fetch failures (paused Supabase, DNS, offline) to actionable copy. */
export function formatSupabaseAuthError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (
      msg === "failed to fetch" ||
      msg.includes("networkerror") ||
      msg.includes("load failed")
    ) {
      return "Cannot reach Supabase. Your project may be paused — open the Supabase dashboard, restore the project, then try again.";
    }
    return err.message;
  }
  return "Something went wrong. Please try again.";
}
