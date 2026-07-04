import type { ContactInquiryRecord } from "@/lib/contact/schema";

type SendContactEmailOptions = {
  to: string;
  from: string;
  inquiry: ContactInquiryRecord;
};

export async function sendContactNotificationEmail({
  to,
  from,
  inquiry,
}: SendContactEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

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
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: inquiry.email,
      subject,
      text,
    }),
  });

  return response.ok;
}
