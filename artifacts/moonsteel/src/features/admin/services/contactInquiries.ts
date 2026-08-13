import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ContactInquiry, ContactInquiryStatus } from "@/features/admin/types";

export const CONTACT_INQUIRY_SELECT =
  "id, full_name, company, phone, email, project_type, message, file_name, status, created_at";

export async function fetchContactInquiries() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select(CONTACT_INQUIRY_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ContactInquiry[];
}

export async function updateContactInquiryStatus(id: string, status: ContactInquiryStatus) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .update({ status })
    .eq("id", id)
    .select(CONTACT_INQUIRY_SELECT)
    .single();

  if (error) throw error;
  return data as ContactInquiry;
}

export async function deleteContactInquiry(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("contact_inquiries").delete().eq("id", id);
  if (error) throw error;
}
