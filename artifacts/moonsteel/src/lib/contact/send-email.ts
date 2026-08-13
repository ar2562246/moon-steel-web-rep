import type { ContactAttachmentMeta } from "@/lib/contact/attachments";
import {
  formatAttachmentBytes,
  shouldAttachFilesToEmail,
} from "@/lib/contact/attachments";
import type { ContactInquiryRecord } from "@/lib/contact/schema";
import {
  getDefaultFromAddress,
  isSmtpConfigured,
  sendEmail,
  type EmailAttachment,
} from "@/lib/email/mailer";

type ContactEmailOptions = {
  to: string;
  from?: string;
  inquiry: ContactInquiryRecord;
  attachments?: EmailAttachment[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapHtml(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">
    <div style="max-width:640px;margin:24px auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:28px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#b45309;">Moon Steel Fabrication</p>
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">${escapeHtml(title)}</h1>
      ${body}
      <p style="margin:24px 0 0;font-size:12px;color:#71717a;">Moon Steel Fabrication · Plot 142, Sector 24, Korangi Industrial Area, Karachi</p>
    </div>
  </body>
</html>`;
}

function inquiryRows(inquiry: ContactInquiryRecord) {
  return [
    ["Name", inquiry.full_name],
    ["Company", inquiry.company],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Project type", inquiry.project_type],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 0;color:#71717a;width:140px;">${escapeHtml(label)}</td><td style="padding:6px 0;">${escapeHtml(value)}</td></tr>`
    )
    .join("");
}

function attachmentSummary(files: ContactAttachmentMeta[], emailed: boolean) {
  if (files.length === 0) return { text: "", html: "" };

  const lines = files.map((file) => `${file.name} (${formatAttachmentBytes(file.size)})`);
  const note = emailed
    ? "Files are attached to this email and stored in Admin → Inquiries."
    : "Files are over the email size limit. Download them from Admin → Inquiries.";

  return {
    text: ["", "Attachments:", ...lines.map((line) => `- ${line}`), note].join("\n"),
    html: `<p style="margin:16px 0 8px;font-weight:bold;">Attachments</p>
     <ul style="margin:0;padding-left:18px;line-height:1.5;">${lines
       .map((line) => `<li>${escapeHtml(line)}</li>`)
       .join("")}</ul>
     <p style="margin:8px 0 0;color:#71717a;font-size:13px;">${escapeHtml(note)}</p>`,
  };
}

export async function sendContactNotificationEmail({
  to,
  from,
  inquiry,
  attachments = [],
}: ContactEmailOptions): Promise<boolean> {
  const files = inquiry.file_urls ?? [];
  const emailed = attachments.length > 0 && shouldAttachFilesToEmail(files.map((file) => file.size));
  const summary = attachmentSummary(files, emailed);
  const subject = `New quote request from ${inquiry.full_name} (${inquiry.company})`;
  const text = [
    "New Moon Steel quote request",
    "",
    `Name: ${inquiry.full_name}`,
    `Company: ${inquiry.company}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone}`,
    `Project type: ${inquiry.project_type}`,
    "",
    "Message:",
    inquiry.message,
    summary.text,
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n")
    .trim();

  const html = wrapHtml(
    "New quote request",
    `<table style="width:100%;border-collapse:collapse;font-size:14px;">${inquiryRows(inquiry)}</table>
     <p style="margin:16px 0 8px;font-weight:bold;">Message</p>
     <p style="margin:0;white-space:pre-wrap;line-height:1.5;">${escapeHtml(inquiry.message)}</p>
     ${summary.html}`
  );

  const mail = {
    to,
    from: from ?? getDefaultFromAddress(),
    replyTo: inquiry.email,
    subject,
    text,
    html,
    attachments: emailed ? attachments : undefined,
  };

  try {
    if (isSmtpConfigured()) {
      try {
        return await sendEmail(mail);
      } catch (error) {
        if (!emailed) throw error;
        console.error("Contact notification with attachments failed, retrying without files:", error);
        return await sendEmail({ ...mail, attachments: undefined });
      }
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return false;

    const payload: Record<string, unknown> = {
      from: mail.from,
      to: [to],
      reply_to: inquiry.email,
      subject,
      text,
      html,
    };

    if (emailed) {
      payload.attachments = attachments.map((file) => ({
        filename: file.filename,
        content: file.content.toString("base64"),
        content_type: file.contentType,
      }));
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) return true;

    if (emailed) {
      delete payload.attachments;
      const retry = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return retry.ok;
    }

    return false;
  } catch (error) {
    console.error("Contact notification email failed:", error);
    return false;
  }
}

export async function sendContactConfirmationEmail({
  to,
  from,
  inquiry,
}: ContactEmailOptions): Promise<boolean> {
  const subject = "We received your quote request — Moon Steel";
  const text = [
    `Hi ${inquiry.full_name},`,
    "",
    "Thank you for contacting Moon Steel Fabrication. We received your quote request and will get back to you within 24 hours.",
    "",
    `Project type: ${inquiry.project_type}`,
    `Company: ${inquiry.company}`,
    "",
    "If you need to add details, reply to this email or call +92-21-35121145-46.",
    "",
    "Moon Steel Fabrication",
  ].join("\n");

  const html = wrapHtml(
    "We received your quote request",
    `<p style="margin:0 0 12px;line-height:1.5;">Hi ${escapeHtml(inquiry.full_name)},</p>
     <p style="margin:0 0 12px;line-height:1.5;">Thank you for contacting Moon Steel Fabrication. We received your quote request and will get back to you within 24 hours.</p>
     <table style="width:100%;border-collapse:collapse;font-size:14px;">
       <tr><td style="padding:6px 0;color:#71717a;width:140px;">Project type</td><td style="padding:6px 0;">${escapeHtml(inquiry.project_type)}</td></tr>
       <tr><td style="padding:6px 0;color:#71717a;">Company</td><td style="padding:6px 0;">${escapeHtml(inquiry.company)}</td></tr>
     </table>
     <p style="margin:16px 0 0;line-height:1.5;">If you need to add details, reply to this email or call <a href="tel:+922135121145">+92-21-35121145-46</a>.</p>`
  );

  try {
    return await sendEmail({
      to,
      from: from ?? getDefaultFromAddress(),
      replyTo: process.env.CONTACT_NOTIFICATION_EMAIL ?? process.env.SMTP_USER,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Contact confirmation email failed:", error);
    return false;
  }
}
