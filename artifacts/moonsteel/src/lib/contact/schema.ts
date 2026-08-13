import { z } from "zod";
import type { ContactAttachmentMeta } from "@/lib/contact/attachments";

export const contactAttachmentSchema = z.object({
  name: z.string().trim().min(1).max(240),
  path: z.string().trim().min(1).max(500),
  size: z.number().int().nonnegative(),
  contentType: z.string().trim().max(120).optional(),
});

export const contactInquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(10).max(40),
  email: z.string().trim().email().max(254),
  projectType: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10).max(5000),
  fileName: z.string().trim().max(1000).optional(),
  attachments: z.array(contactAttachmentSchema).max(10).optional(),
  website: z.string().optional(),
});

export const contactUploadRequestSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(240),
        size: z.number().int().positive(),
        type: z.string().trim().max(120).optional(),
      })
    )
    .min(1)
    .max(10),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;

export type ContactInquiryRecord = {
  full_name: string;
  company: string;
  phone: string;
  email: string;
  project_type: string;
  message: string;
  file_name: string | null;
  file_urls: ContactAttachmentMeta[];
};

export function toContactInquiryRecord(input: ContactInquiryInput): ContactInquiryRecord {
  const attachments = (input.attachments ?? []).map((file) => ({
    name: file.name,
    path: file.path,
    size: file.size,
    contentType: file.contentType || "application/octet-stream",
  }));
  const fileName =
    attachments.length > 0
      ? attachments.map((file) => file.name).join(", ")
      : input.fileName?.trim() || null;

  return {
    full_name: input.fullName,
    company: input.company,
    phone: input.phone,
    email: input.email,
    project_type: input.projectType,
    message: input.message,
    file_name: fileName,
    file_urls: attachments,
  };
}
