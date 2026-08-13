import { NextResponse } from "next/server";
import {
  CONTACT_ATTACHMENT_BUCKET,
  CONTACT_EMAIL_ATTACH_MAX_BYTES,
  isContactAttachmentPath,
  shouldAttachFilesToEmail,
  validateAttachmentLimits,
} from "@/lib/contact/attachments";
import { contactInquirySchema, toContactInquiryRecord, type ContactInquiryRecord } from "@/lib/contact/schema";
import {
  sendContactConfirmationEmail,
  sendContactNotificationEmail,
} from "@/lib/contact/send-email";
import { getDefaultFromAddress } from "@/lib/email/mailer";
import type { EmailAttachment } from "@/lib/email/mailer";
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

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const attachments = parsed.data.attachments ?? [];
  if (attachments.length > 0) {
    const limitError = validateAttachmentLimits(attachments);
    if (limitError) {
      return NextResponse.json({ error: limitError }, { status: 400 });
    }
    if (attachments.some((file) => !isContactAttachmentPath(file.path))) {
      return NextResponse.json({ error: "Invalid attachment path." }, { status: 400 });
    }
  }

  const inquiry = toContactInquiryRecord(parsed.data);
  const admin = createSupabaseAdminClient();

  if (attachments.length > 0 && admin) {
    for (const file of attachments) {
      const { error } = await admin.storage
        .from(CONTACT_ATTACHMENT_BUCKET)
        .createSignedUrl(file.path, 30);
      if (error) {
        return NextResponse.json(
          { error: "One or more attachments could not be verified. Please upload again." },
          { status: 400 }
        );
      }
    }
  }

  let stored = false;
  if (admin) {
    const { error } = await admin.from("contact_inquiries").insert(inquiry);
    if (error) {
      console.error("contact_inquiries insert failed:", error.message);
      if (inquiry.file_urls.length > 0) {
        const withoutUrls = {
          full_name: inquiry.full_name,
          company: inquiry.company,
          phone: inquiry.phone,
          email: inquiry.email,
          project_type: inquiry.project_type,
          message: inquiry.message,
          file_name: JSON.stringify(inquiry.file_urls),
        };
        const retry = await admin.from("contact_inquiries").insert(withoutUrls);
        if (retry.error) {
          console.error("contact_inquiries insert retry failed:", retry.error.message);
        } else {
          stored = true;
        }
      }
    } else {
      stored = true;
    }
  }

  const notifyTo = process.env.CONTACT_NOTIFICATION_EMAIL ?? process.env.SMTP_USER;
  const notifyFrom = getDefaultFromAddress();
  let notified = false;
  let confirmed = false;
  let emailAttachments: EmailAttachment[] = [];

  if (
    admin &&
    inquiry.file_urls.length > 0 &&
    shouldAttachFilesToEmail(inquiry.file_urls.map((file) => file.size))
  ) {
    emailAttachments = await downloadEmailAttachments(admin, inquiry.file_urls);
  }

  if (notifyTo) {
    notified = await sendContactNotificationEmail({
      to: notifyTo,
      from: notifyFrom,
      inquiry,
      attachments: emailAttachments,
    });
  }

  confirmed = await sendContactConfirmationEmail({
    to: inquiry.email,
    from: notifyFrom,
    inquiry,
  });

  if (!stored && !notified) {
    return NextResponse.json(
      {
        error:
          "Contact delivery is not configured. Set SUPABASE_SERVICE_ROLE_KEY and/or SMTP with CONTACT_NOTIFICATION_EMAIL.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      stored,
      emailed: notified,
      confirmed,
      attachmentsEmailed: emailAttachments.length > 0,
    },
    { status: 201 }
  );
}

async function downloadEmailAttachments(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  files: ContactInquiryRecord["file_urls"]
): Promise<EmailAttachment[]> {
  const downloaded: EmailAttachment[] = [];
  let total = 0;

  for (const file of files) {
    const { data, error } = await admin.storage.from(CONTACT_ATTACHMENT_BUCKET).download(file.path);
    if (error || !data) {
      console.error("contact attachment download failed:", file.path, error?.message);
      return [];
    }
    const content = Buffer.from(await data.arrayBuffer());
    total += content.length;
    if (total > CONTACT_EMAIL_ATTACH_MAX_BYTES) {
      return [];
    }
    downloaded.push({
      filename: file.name,
      content,
      contentType: file.contentType,
    });
  }

  return downloaded;
}
