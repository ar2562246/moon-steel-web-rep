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
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { ContactVCardQr } from "@/components/ContactVCardQr";
import {
  CONTACT_DRAWING_ACCEPT,
  CONTACT_DRAWING_HINT,
  EMAIL,
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
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          fileName: fileNames.length > 0 ? fileNames.join(", ") : undefined,
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

      form.reset();
      setFileNames([]);
    } catch {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Network error. Please try again or call us directly.",
      });
    } finally {
      setIsSubmitting(false);
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
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-8 max-w-6xl mx-auto">
          
          {/* Contact Info Panel */}
          <div className="lg:col-span-2 layer-2 space-y-8 text-foreground p-8 md:p-10 rounded-xl">
            <div>
              <h2 className="text-3xl font-display font-semibold mb-4">Let's Build It Right.</h2>
              <p className="text-muted-foreground">
                Get a custom fabrication quote in 24 hours. No obligations. Just precise engineering and clear pricing.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Factory Location</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {STREET_ADDRESS}<br />
                    Karachi-Pakistan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Direct Line</h4>
                  <a href={`tel:${PHONE_TEL}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">{PHONE_DISPLAY}</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Email</h4>
                  <a href={`mailto:${EMAIL}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">{EMAIL}</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="mt-0.5 h-6 w-6 shrink-0"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="11" fill="#25D366" />
                  <path
                    fill="#FFFFFF"
                    d="M17.34 14.15c-.28-.14-1.63-.8-1.88-.89-.25-.09-.43-.14-.61.14-.18.28-.7.89-.86 1.08-.16.18-.31.21-.58.07-.28-.14-1.17-.43-2.23-1.36-.82-.73-1.38-1.62-1.54-1.9-.16-.28-.02-.43.12-.57.12-.12.28-.31.42-.46.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.5-.07-.14-.61-1.47-.84-2.02-.22-.52-.45-.45-.61-.45h-.52c-.18 0-.46.07-.7.35-.24.28-.91.89-.91 2.16s.93 2.5 1.06 2.67c.14.18 1.81 2.75 4.38 3.85.61.26 1.09.42 1.46.54.61.19 1.17.16 1.61.1.49-.07 1.63-.67 1.86-1.32.23-.65.23-1.21.16-1.32-.07-.12-.25-.19-.52-.33Z"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-foreground mb-1">WhatsApp</h4>
                  <a
                    href={WHATSAPP_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    {WHATSAPP_DISPLAY}
                  </a>
                </div>
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

            <div className="pt-8 border-t border-border mt-8">
              <a 
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full min-h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full border border-primary/80 font-medium transition-colors"
              >
                Chat on WhatsApp · {WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 lg:pl-8">
            <h3 className="text-2xl font-display font-semibold mb-6 text-foreground">Request a Quote</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <input
                  ref={honeypotRef}
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="layer-1" />
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
                          <Input placeholder="Acme Hospitality" {...field} className="layer-1" />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="layer-1">
                            <SelectValue placeholder="Select a project category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                          placeholder="Please provide dimensions, specific requirements, or the scope of work..." 
                          className="layer-1 min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Attach Drawings (Optional)</Label>
                  <FileDropzone
                    accept={CONTACT_DRAWING_ACCEPT}
                    multiple
                    label="Drop drawings or CAD files here, or click to browse"
                    hint={CONTACT_DRAWING_HINT}
                    onFiles={(files) => {
                      setFileNames((current) => {
                        const next = [...current];
                        for (const file of files) {
                          if (!next.includes(file.name)) next.push(file.name);
                        }
                        return next;
                      });
                    }}
                  />
                  {fileNames.length > 0 ? (
                    <ul className="space-y-1">
                      {fileNames.map((name) => (
                        <li key={name} className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                          <span className="truncate">{name}</span>
                          <button
                            type="button"
                            className="shrink-0 text-xs text-primary hover:underline"
                            onClick={() => setFileNames((current) => current.filter((item) => item !== name))}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium group"
                >
                  <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Form>
          </div>

        </div>
      </div>
    </section>
  );
}
