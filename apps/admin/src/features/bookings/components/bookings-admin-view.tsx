"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { BOOKING_STATUSES } from "@beeplay/constants";
import { formatDate, formatPrice } from "@beeplay/utils";
import { AdminPageHero } from "@/features/shell/components/admin-page-hero";
import { DataTable, type TableColumn } from "@/features/shared/components/data-table";
import { UrlFilterSelect } from "@/features/shared/components/url-filter-select";
import { StatusBadge } from "@/components/ui/badge";
import {
  BookingDetailDialog,
  STATUS_LABELS,
  type AdminBookingRow,
} from "./booking-detail-dialog";

const columns: TableColumn<AdminBookingRow>[] = [
  {
    key: "stadium",
    label: "الملعب",
    render: (_, row) => (
      <div>
        <p className="font-medium">{row.stadium.name}</p>
        <p className="text-xs text-muted-foreground">{row.stadium.city}</p>
      </div>
    ),
  },
  {
    key: "user",
    label: "المستخدم",
    render: (_, row) => (
      <div>
        <p>
          {row.user.firstName} {row.user.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{row.user.email}</p>
      </div>
    ),
  },
  {
    key: "startTime",
    label: "الموعد",
    sortable: true,
    render: (v) =>
      formatDate(String(v), { dateStyle: "medium", timeStyle: "short" }),
  },
  {
    key: "totalPrice",
    label: "المبلغ",
    render: (v) => formatPrice(Number(v)),
  },
  {
    key: "status",
    label: "الحالة",
    sortable: true,
    render: (v) => <StatusBadge status={String(v)} />,
  },
];

const statusOptions = BOOKING_STATUSES.map((s) => ({
  value: s,
  label: STATUS_LABELS[s] ?? s,
}));

export function BookingsAdminView() {
  const queryClient = useQueryClient();
  const [viewId, setViewId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHero
        title="الحجوزات"
        description="جميع حجوزات المنصة — بحث، فلترة بالحالة، وعرض التفاصيل."
        perks={[{ icon: ClipboardList, label: "قبول ورفض الطلبات المعلّقة" }]}
      />

      <DataTable<AdminBookingRow>
        apiEndpoint="/bookings"
        columns={columns}
        searchPlaceholder="بحث: ملعب، مستخدم، بريد..."
        emptyMessage="لا توجد حجوزات"
        enableDelete={false}
        enableEdit={false}
        toolbarExtra={
          <UrlFilterSelect
            param="status"
            placeholder="كل الحالات"
            options={statusOptions}
            className="w-44 h-10"
          />
        }
        actions={{
          onView: (row) => {
            setViewId(row.id);
            setDetailOpen(true);
          },
        }}
      />

      <BookingDetailDialog
        bookingId={viewId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusChange={() =>
          queryClient.invalidateQueries({ queryKey: ["table-data", "/bookings"] })
        }
      />
    </div>
  );
}
