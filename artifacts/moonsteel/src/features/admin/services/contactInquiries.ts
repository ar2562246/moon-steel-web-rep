import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { attachmentsFromInquiryFields } from "@/lib/contact/attachments";
import type { ContactInquiry, ContactInquiryStatus } from "@/features/admin/types";

export const CONTACT_INQUIRY_SELECT =
  "id, full_name, company, phone, email, project_type, message, file_name, file_urls, status, created_at";

export async function fetchContactInquiries() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select(CONTACT_INQUIRY_SELECT)
    .order("created_at", { ascending: false });
  if (!error) return (data ?? []) as ContactInquiry[];

  if (/file_urls/i.test(error.message)) {
    const fallback = await supabase
      .from("contact_inquiries")
      .select("id, full_name, company, phone, email, project_type, message, file_name, status, created_at")
      .order("created_at", { ascending: false });
    if (fallback.error) throw fallback.error;
    return (fallback.data ?? []) as ContactInquiry[];
  }

  throw error;
}

export async function updateContactInquiryStatus(id: string, status: ContactInquiryStatus) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .update({ status })
    .eq("id", id)
    .select(CONTACT_INQUIRY_SELECT)
    .single();

  if (!error) return data as ContactInquiry;
  if (!/file_urls/i.test(error.message)) throw error;

  const fallback = await supabase
    .from("contact_inquiries")
    .update({ status })
    .eq("id", id)
    .select("id, full_name, company, phone, email, project_type, message, file_name, status, created_at")
    .single();
  if (fallback.error) throw fallback.error;
  return fallback.data as ContactInquiry;
}

export async function deleteContactInquiry(id: string) {
  const supabase = createSupabaseBrowserClient();
  const withUrls = await supabase
    .from("contact_inquiries")
    .select("file_urls, file_name")
    .eq("id", id)
    .maybeSingle();

  let fileUrls: unknown;
  let fileName: string | null | undefined;
  if (withUrls.error && /file_urls/i.test(withUrls.error.message)) {
    const fallback = await supabase.from("contact_inquiries").select("file_name").eq("id", id).maybeSingle();
    fileName = fallback.data?.file_name;
  } else {
    fileUrls = withUrls.data?.file_urls;
    fileName = withUrls.data?.file_name;
  }

  const paths = attachmentsFromInquiryFields(fileUrls, fileName).map((file) => file.path);
  if (paths.length > 0) {
    await fetch("/api/admin/contact-attachments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
  }

  const { error } = await supabase.from("contact_inquiries").delete().eq("id", id);
  if (error) throw error;
}

export async function downloadContactAttachment(path: string, fileName: string) {
  const response = await fetch(
    `/api/admin/contact-attachments?path=${encodeURIComponent(path)}`
  );
  const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error || "Could not create a download link.");
  }

  const fileResponse = await fetch(payload.url);
  if (!fileResponse.ok) {
    throw new Error("Could not download this file.");
  }

  const blob = await fileResponse.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
