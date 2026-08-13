import { NextResponse } from "next/server";
import {
  CONTACT_ATTACHMENT_BUCKET,
  CONTACT_ATTACHMENT_MAX_FILE_BYTES,
  isAllowedAttachmentName,
  mimeForAttachment,
  uniqueAttachmentFileName,
  validateAttachmentLimits,
} from "@/lib/contact/attachments";
import { contactUploadRequestSchema } from "@/lib/contact/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactUploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const limitError = validateAttachmentLimits(parsed.data.files);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 400 });
  }

  for (const file of parsed.data.files) {
    if (!isAllowedAttachmentName(file.name)) {
      return NextResponse.json(
        { error: `${file.name} is not an accepted drawing or CAD type.` },
        { status: 400 }
      );
    }
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "File storage is not configured. Remove attachments or try again later." },
      { status: 503 }
    );
  }

  const { error: ensureError } = await ensureContactAttachmentBucket(admin);
  if (ensureError) {
    console.error("contact attachment bucket missing:", ensureError);
    return NextResponse.json(
      { error: "Could not prepare file upload. Please try again." },
      { status: 503 }
    );
  }

  const uploadId = crypto.randomUUID();
  const usedNames = new Set<string>();
  const files = [];

  for (const file of parsed.data.files) {
    const safeName = uniqueAttachmentFileName(file.name, usedNames);
    const path = `inquiries/${uploadId}/${safeName}`;
    const contentType = mimeForAttachment(file.name, file.type);
    const { data, error } = await admin.storage
      .from(CONTACT_ATTACHMENT_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      console.error("contact attachment signed URL failed:", error?.message);
      return NextResponse.json(
        { error: "Could not prepare file upload. Please try again." },
        { status: 503 }
      );
    }

    files.push({
      path,
      signedUrl: data.signedUrl,
      token: data.token,
      name: file.name,
      size: file.size,
      contentType,
    });
  }

  return NextResponse.json({ uploadId, files });
}

async function ensureContactAttachmentBucket(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>
) {
  const { data, error } = await admin.storage.getBucket(CONTACT_ATTACHMENT_BUCKET);
  if (data && !error) return { error: null };

  const created = await admin.storage.createBucket(CONTACT_ATTACHMENT_BUCKET, {
    public: false,
    fileSizeLimit: CONTACT_ATTACHMENT_MAX_FILE_BYTES,
  });
  if (created.error && !/already exists/i.test(created.error.message)) {
    return { error: created.error };
  }
  return { error: null };
}
