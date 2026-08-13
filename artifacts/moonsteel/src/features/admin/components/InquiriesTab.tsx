"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Archive, Mail, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminDetailSkeleton,
  AdminMasterDetail,
  AdminSidebarCard,
  AdminSidebarEmpty,
  AdminSidebarSkeleton,
  adminSidebarMetaClass,
  adminSidebarMutedClass,
  adminSidebarTitleClass,
} from "@/features/admin/components/AdminMasterDetail";
import { useContactInquiries } from "@/features/admin/hooks/useContactInquiries";
import type { ContactInquiry, ContactInquiryStatus } from "@/features/admin/types";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  "commercial-kitchen": "Commercial Kitchen",
  "exhaust-system": "Exhaust System",
  "sinks-tables": "Sinks & Tables",
  "custom-fabrication": "Custom Fabrication",
  other: "Other",
};

const STATUS_FILTERS: Array<{ value: "all" | ContactInquiryStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

function projectTypeLabel(value: string) {
  return PROJECT_TYPE_LABELS[value] ?? value;
}

function statusLabel(status: ContactInquiryStatus) {
  if (status === "new") return "New";
  if (status === "read") return "Read";
  return "Archived";
}

function formatReceivedAt(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function InquiriesTab() {
  const { inquiries, isLoading, isSaving, error, updateStatus, remove } = useContactInquiries();
  const [statusFilter, setStatusFilter] = useState<"all" | ContactInquiryStatus>("all");
  const [selected, setSelected] = useState<ContactInquiry | null>(null);

  const filtered = useMemo(
    () => (statusFilter === "all" ? inquiries : inquiries.filter((item) => item.status === statusFilter)),
    [inquiries, statusFilter]
  );

  const selectedInquiry = selected
    ? inquiries.find((item) => item.id === selected.id) ?? selected
    : null;

  const openInquiry = async (row: ContactInquiry) => {
    setSelected(row);
    if (row.status === "new") {
      const updated = await updateStatus(row.id, "read");
      if (updated) setSelected(updated);
    }
  };

  const closeInquiry = () => setSelected(null);

  const onStatusChange = async (status: ContactInquiryStatus) => {
    if (!selectedInquiry) return;
    const updated = await updateStatus(selectedInquiry.id, status);
    if (updated) setSelected(updated);
  };

  const onArchive = async () => {
    if (!selectedInquiry) return;
    const updated = await updateStatus(selectedInquiry.id, "archived");
    if (updated) setSelected(updated);
  };

  const onDelete = async () => {
    if (!selectedInquiry) return;
    const ok = await remove(selectedInquiry.id);
    if (ok) closeInquiry();
  };

  return (
    <AdminMasterDetail
      title="Inquiries"
      description="Quote requests submitted from the contact form."
      headerActions={
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              size="sm"
              variant={statusFilter === filter.value ? "default" : "outline"}
              className="h-8 px-2 text-xs"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      }
      onBack={closeInquiry}
      error={error}
      isSaving={isSaving}
      sidebar={
        isLoading ? (
          <AdminSidebarSkeleton />
        ) : filtered.length === 0 ? (
          <AdminSidebarEmpty>
            {inquiries.length === 0 ? "No inquiries yet." : "No inquiries in this filter."}
          </AdminSidebarEmpty>
        ) : (
          filtered.map((item) => {
            const isSelected = selectedInquiry?.id === item.id;
            return (
              <AdminSidebarCard key={item.id} selected={isSelected} onClick={() => void openInquiry(item)}>
                <div className="space-y-1.5 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className={adminSidebarTitleClass(isSelected)}>{item.full_name}</p>
                    <span className={adminSidebarMetaClass(isSelected)}>{statusLabel(item.status)}</span>
                  </div>
                  <p className={adminSidebarMutedClass(isSelected)}>
                    {item.company} · {projectTypeLabel(item.project_type)}
                  </p>
                  <p className={adminSidebarMutedClass(isSelected)}>{formatReceivedAt(item.created_at)}</p>
                </div>
              </AdminSidebarCard>
            );
          })
        )
      }
      detailTitle={!selectedInquiry ? "Inquiry detail" : selectedInquiry.full_name}
      detailDescription={
        selectedInquiry
          ? `${selectedInquiry.company} · ${formatReceivedAt(selectedInquiry.created_at)}`
          : "Choose an inquiry from the sidebar."
      }
      detailActions={
        selectedInquiry ? (
          <>
            {selectedInquiry.status !== "archived" ? (
              <Button variant="outline" size="sm" type="button" onClick={() => void onArchive()} disabled={isSaving}>
                <Archive className="mr-2 h-3.5 w-3.5" />
                Archive
              </Button>
            ) : null}
            <Button variant="outline" size="sm" type="button" onClick={() => void onDelete()}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          </>
        ) : null
      }
      isEditorOpen={Boolean(selectedInquiry)}
      skeleton={<AdminDetailSkeleton withImage={false} />}
    >
      {selectedInquiry ? (
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company" value={selectedInquiry.company} />
            <Field label="Project type" value={projectTypeLabel(selectedInquiry.project_type)} />
            <Field label="Email">
              <a
                href={`mailto:${selectedInquiry.email}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {selectedInquiry.email}
              </a>
            </Field>
            <Field label="Phone">
              <a
                href={`tel:${selectedInquiry.phone}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {selectedInquiry.phone}
              </a>
            </Field>
            {selectedInquiry.file_name ? (
              <Field label="Attachments noted" value={selectedInquiry.file_name} />
            ) : null}
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted-foreground">Status</span>
              <select
                className="layer-1 rounded-md px-3 py-2 text-sm"
                value={selectedInquiry.status}
                disabled={isSaving}
                onChange={(e) => void onStatusChange(e.target.value as ContactInquiryStatus)}
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <div className="grid gap-1.5">
            <p className="text-sm text-muted-foreground">Message</p>
            <p className="layer-1 whitespace-pre-wrap rounded-md px-3 py-3 text-sm leading-relaxed text-foreground">
              {selectedInquiry.message}
            </p>
          </div>
        </div>
      ) : null}
    </AdminMasterDetail>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      {children ?? <p className="text-sm text-foreground">{value}</p>}
    </div>
  );
}
