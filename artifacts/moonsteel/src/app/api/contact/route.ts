import { NextResponse } from "next/server";
import { contactInquirySchema, toContactInquiryRecord } from "@/lib/contact/schema";
import { sendContactNotificationEmail } from "@/lib/contact/send-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Honeypot: bots fill hidden field; pretend success.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const inquiry = toContactInquiryRecord(parsed.data);
  const admin = createSupabaseAdminClient();

  let stored = false;
  if (admin) {
    const { error } = await admin.from("contact_inquiries").insert(inquiry);
    stored = !error;
  }

  const notifyTo = process.env.CONTACT_NOTIFICATION_EMAIL;
  const notifyFrom = process.env.RESEND_FROM_EMAIL ?? "Moon Steel <onboarding@resend.dev>";
  let emailed = false;

  if (notifyTo) {
    emailed = await sendContactNotificationEmail({
      to: notifyTo,
      from: notifyFrom,
      inquiry,
    });
  }

  if (!stored && !emailed) {
    return NextResponse.json(
      {
        error:
          "Contact delivery is not configured. Set SUPABASE_SERVICE_ROLE_KEY and/or RESEND_API_KEY with CONTACT_NOTIFICATION_EMAIL.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, stored, emailed }, { status: 201 });
}
