import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CLIENT_REFERENCE_SELECT,
  CLIENT_SELECT,
  type Client,
  type ClientReference,
} from "@/features/clients/types";

export async function listPublishedClients(supabase: SupabaseClient): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select(CLIENT_SELECT)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function listPublishedClientReferences(
  supabase: SupabaseClient,
): Promise<ClientReference[]> {
  const { data, error } = await supabase
    .from("client_references")
    .select(CLIENT_REFERENCE_SELECT)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ClientReference[];
}
