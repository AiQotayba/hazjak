"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { AdminPageHero } from "@/features/shell/components/admin-page-hero";
import { DataTable, type TableColumn } from "@/features/shared/components/data-table";
import { UrlFilterSelect } from "@/features/shared/components/url-filter-select";
import { apiClient } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/labels";
import type { Role } from "@hazjak/types";
import { UserDetailDialog, type AdminUserRow } from "./user-detail-dialog";

const roleOptions = (["USER", "STADIUM_OWNER", "ADMIN"] as Role[]).map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));

const columns: TableColumn<AdminUserRow>[] = [
  {
    key: "firstName",
    label: "الاسم",
    sortable: true,
    render: (_, row) => (
      <span className="font-medium">
        {row.firstName} {row.lastName}
      </span>
    ),
  },
  {
    key: "email",
    label: "البريد",
    render: (v) => <span className="text-muted-foreground">{String(v)}</span>,
  },
  {
    key: "role",
    label: "الدور",
    render: (v) => ROLE_LABELS[String(v) as Role] ?? String(v),
  },
  {
    key: "isBanned",
    label: "الحالة",
    render: (_, row) =>
      row.isBanned ? (
        <span className="text-destructive text-xs font-bold">محظور</span>
      ) : (
        <span className="text-primary text-xs font-bold">نشط</span>
      ),
  },
];

export function UsersAdminView() {
  const queryClient = useQueryClient();
  const [viewUser, setViewUser] = useState<AdminUserRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  async function toggleBan(id: string, isBanned: boolean) {
    const res = await apiClient.patch(
      `/users/${id}/ban`,
      { isBanned: !isBanned },
      { showSuccessToast: true }
    );
    if (!res.isError) {
      queryClient.invalidateQueries({ queryKey: ["table-data", "/users"] });
      setViewUser((u) => (u?.id === id ? { ...u, isBanned: !isBanned } : u));
    }
  }

  async function changeRole(id: string, role: Role) {
    const res = await apiClient.patch(`/users/${id}/role`, { role }, { showSuccessToast: true });
    if (!res.isError) {
      queryClient.invalidateQueries({ queryKey: ["table-data", "/users"] });
      setViewUser((u) => (u?.id === id ? { ...u, role } : u));
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHero
        title="المستخدمون"
        description="إدارة الحسابات والأدوار والحظر."
        perks={[{ icon: Users, label: "بحث بالاسم والبريد" }]}
      />

      <DataTable<AdminUserRow>
        apiEndpoint="/users"
        columns={columns}
        searchPlaceholder="بحث بالاسم أو البريد..."
        emptyMessage="لا يوجد مستخدمون"
        enableDelete={false}
        enableEdit={false}
        toolbarExtra={
          <UrlFilterSelect
            param="role"
            placeholder="كل الأدوار"
            options={roleOptions}
            className="w-44 h-10"
          />
        }
        actions={{
          onView: (row) => {
            setViewUser(row);
            setDetailOpen(true);
          },
        }}
      />

      <UserDetailDialog
        user={viewUser}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onToggleBan={toggleBan}
        onChangeRole={changeRole}
      />
    </div>
  );
}
