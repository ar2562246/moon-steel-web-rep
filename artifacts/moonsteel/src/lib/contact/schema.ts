import { z } from "zod";

export const contactInquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(10).max(40),
  email: z.string().trim().email().max(254),
  projectType: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10).max(5000),
  fileName: z.string().trim().max(255).optional(),
  website: z.string().optional(),
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
};

export function toContactInquiryRecord(input: ContactInquiryInput): ContactInquiryRecord {
  return {
    full_name: input.fullName,
    company: input.company,
    phone: input.phone,
    email: input.email,
    project_type: input.projectType,
    message: input.fileName
      ? `${input.message}\n\n[Attachment noted: ${input.fileName}]`
      : input.message,
    file_name: input.fileName ?? null,
  };
}
