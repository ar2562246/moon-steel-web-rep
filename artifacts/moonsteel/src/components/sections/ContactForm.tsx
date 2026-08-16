"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Spinner } from "@/components/ui/spinner";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { TrackedContactLink } from "@/components/analytics/TrackedContactLink";
import Link from "next/link";
import { ContactVCardQr } from "@/components/ContactVCardQr";
import { trackGenerateLead } from "@/lib/analytics/gtag";
import {
  CONTACT_ATTACHMENT_MAX_FILES,
  formatAttachmentBytes,
  validateAttachmentLimits,
  type ContactAttachmentMeta,
} from "@/lib/contact/attachments";
import {
  CONTACT_DRAWING_ACCEPT,
  CONTACT_DRAWING_HINT,
  EMAIL,
  GOOGLE_MAPS_HREF,
  PHONE_DISPLAY,
  PHONE_TEL,
  STREET_ADDRESS,
  WHATSAPP_DISPLAY,
  WHATSAPP_HREF,
} from "@/lib/contact/details";

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Invalid email address"),
  projectType: z.string().min(1, "Please select a project type"),
  message: z.string().min(10, "Please provide some project details"),
});

export function ContactForm({ standalone = false }: { standalone?: boolean }) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [submitStage, setSubmitStage] = useState<"idle" | "uploading" | "sending">("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const isSubmitting = submitStage !== "idle";
  const statusLabel =
    submitStage === "uploading"
      ? "Uploading drawings…"
      : submitStage === "sending"
        ? "Sending your quote request…"
        : null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      company: "",
      phone: "",
      email: "",
      projectType: "",
      message: "",
    },
  });

  const projectType = form.watch("projectType");
  const isGreaseTrapQuote = projectType === "grease-trap";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const project = params.get("project");
    const gpm = params.get("gpm");
    const size = params.get("size");
    if (project === "grease-trap") {
      form.setValue("projectType", "grease-trap");
      if (!form.getValues("message")) {
        const parts = [
          gpm ? `Required flow: ${gpm} GPM.` : null,
          size ? `Recommended size: ${size.replace(/x/g, " × ")} in.` : null,
          "Please quote a grease trap.",
        ].filter(Boolean);
        if (parts.length > 1) form.setValue("message", parts.join(" "));
      }
    }
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const limitError = validateAttachmentLimits(files);
    if (limitError) {
      toast({
        variant: "destructive",
        title: "Attachments not accepted",
        description: limitError,
      });
      return;
    }

    setSubmitStage(files.length > 0 ? "uploading" : "sending");
    try {
      const attachments = await uploadContactAttachments(files);
      setSubmitStage("sending");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          attachments: attachments.length > 0 ? attachments : undefined,
          fileName: attachments.length > 0 ? attachments.map((file) => file.name).join(", ") : undefined,
          website: honeypotRef.current?.value ?? "",
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | { ok?: boolean }
        | null;

      if (!response.ok) {
        const errorMessage =
          payload && "error" in payload && payload.error
            ? payload.error
            : "Please try again or contact us by phone.";
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: errorMessage,
        });
        return;
      }

      toast({
        title: "Quote Request Received",
        description: "We'll get back to you within 24 hours.",
      });

      trackGenerateLead({
        method: "quote_form",
        project_type: values.projectType,
        has_attachments: attachments.length > 0,
      });

      form.reset();
      setFiles([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description:
          error instanceof Error
            ? error.message
            : "Network error. Please try again or call us directly.",
      });
    } finally {
      setSubmitStage("idle");
    }
  };

  return (
    <section
      id="contact"
      className={cn(
        "border-t border-border/70 bg-gradient-to-b from-muted/45 via-background to-muted/35 py-24",
        standalone && "pt-28 md:pt-32",
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
        {standalone ? <ParentBackLink href="/" label="home" /> : null}
        <div className="grid items-start lg:grid-cols-5 gap-12 lg:gap-10">
          
          {/* Contact Info Panel */}
          <div className="lg:col-span-2 space-y-8 text-foreground">
            <div>
              <h2 className="text-3xl font-display font-semibold mb-4">Let's Build It Right.</h2>
              <p className="text-muted-foreground">
                Get a custom fabrication quote in 24 hours. No obligations. Just precise engineering and clear pricing.
              </p>
            </div>

            <div className="layer-2 space-y-6 p-8 md:p-10 rounded-xl">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Factory Location</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {STREET_ADDRESS}<br />
                    Karachi-Pakistan
                  </p>
                  <a
                    href={GOOGLE_MAPS_HREF}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-primary hover:opacity-80"
                  >
                    View Google Business Profile
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Direct Line</h4>
                  <TrackedContactLink method="phone" href={`tel:${PHONE_TEL}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">{PHONE_DISPLAY}</TrackedContactLink>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Email</h4>
                  <TrackedContactLink method="email" href={`mailto:${EMAIL}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">{EMAIL}</TrackedContactLink>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="11" fill="#25D366" />
                  <path
                    fill="#FFFFFF"
                    d="M17.34 14.15c-.28-.14-1.63-.8-1.88-.89-.25-.09-.43-.14-.61.14-.18.28-.7.89-.86 1.08-.16.18-.31.21-.58.07-.28-.14-1.17-.43-2.23-1.36-.82-.73-1.38-1.62-1.54-1.9-.16-.28-.02-.43.12-.57.12-.12.28-.31.42-.46.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.5-.07-.14-.61-1.47-.84-2.02-.22-.52-.45-.45-.61-.45h-.52c-.18 0-.46.07-.7.35-.24.28-.91.89-.91 2.16s.93 2.5 1.06 2.67c.14.18 1.81 2.75 4.38 3.85.61.26 1.09.42 1.46.54.61.19 1.17.16 1.61.1.49-.07 1.63-.67 1.86-1.32.23-.65.23-1.21.16-1.32-.07-.12-.25-.19-.52-.33Z"
                  />
                </svg>
                <TrackedContactLink
                  method="whatsapp"
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${WHATSAPP_DISPLAY}`}
                  className="text-muted-foreground text-sm hover:text-primary transition-colors"
                >
                  {WHATSAPP_DISPLAY}
                </TrackedContactLink>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Business Hours</h4>
                  <p className="text-muted-foreground text-sm">Mon - Sat: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            <ContactVCardQr />
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-display font-semibold mb-4 text-foreground">Request a Quote</h2>
            
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                aria-busy={isSubmitting}
              >
                <input
                  ref={honeypotRef}
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                <fieldset disabled={isSubmitting} className={cn("space-y-6 border-0 p-0", isSubmitting && "opacity-60")}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name" {...field} className="layer-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company / Business</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} className="layer-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} className="layer-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+92-21-35121145-46" {...field} className="layer-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="layer-1">
                            <SelectValue placeholder="Select a project category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="grease-trap">Grease Trap</SelectItem>
                          <SelectItem value="commercial-kitchen">Commercial Kitchen</SelectItem>
                          <SelectItem value="exhaust-system">Exhaust System</SelectItem>
                          <SelectItem value="sinks-tables">Sinks & Tables</SelectItem>
                          <SelectItem value="custom-fabrication">Custom Fabrication</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            isGreaseTrapQuote
                              ? "GPM, overall size, inlet and outlet — or attach the consultant or customer drawing."
                              : "Please provide dimensions, specific requirements, or the scope of work..."
                          } 
                          className="layer-1 min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>
                    {isGreaseTrapQuote
                      ? "Attach drawings or consultant specs"
                      : "Attach Drawings (Optional)"}
                  </Label>
                  <FileDropzone
                    accept={CONTACT_DRAWING_ACCEPT}
                    multiple
                    disabled={isSubmitting}
                    label={
                      isGreaseTrapQuote
                        ? "Drop the consultant or customer drawing here, or click to browse"
                        : "Drop drawings or CAD files here, or click to browse"
                    }
                    hint={CONTACT_DRAWING_HINT}
                    onFiles={(incoming) => {
                      setFiles((current) => {
                        const next = [...current];
                        for (const file of incoming) {
                          if (!next.some((item) => item.name === file.name && item.size === file.size)) {
                            next.push(file);
                          }
                        }
                        return next.slice(0, CONTACT_ATTACHMENT_MAX_FILES);
                      });
                    }}
                  />
                  {files.length > 0 ? (
                    <ul className="space-y-1">
                      {files.map((file) => (
                        <li
                          key={`${file.name}-${file.size}-${file.lastModified}`}
                          className="flex items-center justify-between gap-3 text-sm text-muted-foreground"
                        >
                          <span className="truncate">
                            {file.name}
                            <span className="ml-2 text-xs opacity-80">{formatAttachmentBytes(file.size)}</span>
                          </span>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            className="shrink-0 text-xs text-primary hover:underline disabled:opacity-50"
                            onClick={() =>
                              setFiles((current) =>
                                current.filter(
                                  (item) =>
                                    !(
                                      item.name === file.name &&
                                      item.size === file.size &&
                                      item.lastModified === file.lastModified
                                    )
                                )
                              )
                            }
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                </fieldset>

                <div className="flex flex-col items-end gap-3">
                {statusLabel ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground" role="status" aria-live="polite">
                    <Spinner className="size-4 text-primary" />
                    {statusLabel}
                    <span className="font-normal text-muted-foreground">Please keep this page open.</span>
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium group"
                >
                  {isSubmitting ? (
                    <Spinner className="mr-2 size-4" />
                  ) : (
                    <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  )}
                  {statusLabel ?? "Submit Request"}
                </Button>
                <p className="max-w-sm text-right text-xs leading-relaxed text-muted-foreground">
                  We use your details only to prepare a quote. See our{" "}
                  <Link href="/privacy" className="text-foreground underline-offset-4 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
                </div>
              </form>
            </Form>
          </div>

        </div>
        </div>
      </div>
    </section>
  );
}

type SignedUploadFile = ContactAttachmentMeta & {
  signedUrl: string;
};

async function uploadContactAttachments(files: File[]): Promise<ContactAttachmentMeta[]> {
  if (files.length === 0) return [];

  const signResponse = await fetch("/api/contact/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    }),
  });

  const signPayload = (await signResponse.json().catch(() => null)) as
    | { error?: string; files?: SignedUploadFile[] }
    | null;

  if (!signResponse.ok || !signPayload?.files || signPayload.files.length !== files.length) {
    throw new Error(
      (signPayload && "error" in signPayload && signPayload.error) ||
        "Could not upload drawings. Please try again or email the files separately."
    );
  }

  for (let index = 0; index < files.length; index += 1) {
    const signed = signPayload.files[index];
    const file = files[index];
    const upload = await fetch(signed.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": signed.contentType || file.type || "application/octet-stream" },
      body: file,
    });
    if (!upload.ok) {
      throw new Error(`Could not upload ${file.name}. Please try again.`);
    }
  }

  return signPayload.files.map((file) => ({
    name: file.name,
    path: file.path,
    size: file.size,
    contentType: file.contentType,
  }));
}
