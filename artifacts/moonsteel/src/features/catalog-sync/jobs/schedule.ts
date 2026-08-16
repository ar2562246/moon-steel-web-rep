import { after } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { processSyncJob } from "./processor";

const MAX_CHUNKS = 80;

export async function runSyncJobToCompletion(jobId: string, processToken: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return;
  for (let i = 0; i < MAX_CHUNKS; i += 1) {
    const result = await processSyncJob(admin, jobId, processToken);
    if (result.done) return;
  }
}

export function scheduleSyncJob(jobId: string, processToken: string) {
  after(() => runSyncJobToCompletion(jobId, processToken));
}
