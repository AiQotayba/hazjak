"use client";

import { Phone, Shield, User } from "lucide-react";
import { formatDate } from "@hazjak/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/lib/labels";
import type { Role } from "@hazjak/types";

export type AdminUserRow = {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: Role;
  isBanned: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
};

const ROLES: Role[] = ["USER", "STADIUM_OWNER", "ADMIN"];

interface UserDetailDialogProps {
  user: AdminUserRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleBan: (id: string, isBanned: boolean) => void;
  onChangeRole: (id: string, role: Role) => void;
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
  onToggleBan,
  onChangeRole,
}: UserDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {user ? (
          <>
            <DialogHeader className="text-start">
              <DialogTitle>
                {user.firstName} {user.lastName}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span dir="ltr">{user.phone}</span>
              </DialogDescription>
            </DialogHeader>

            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                <User className="h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">الحالة</p>
                  <p className="font-bold">
                    {user.isBanned ? (
                      <span className="text-destructive">محظور</span>
                    ) : (
                      <span className="text-primary">نشط</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                <Shield className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1.5">الدور</p>
                  <Select
                    value={user.role}
                    onValueChange={(role) => onChangeRole(user.id, role as Role)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                الهاتف {user.isPhoneVerified ? "موثّق" : "غير موثّق"} · انضم{" "}
                {formatDate(user.createdAt, { dateStyle: "medium" })}
              </p>
            </dl>

            <Button
              variant={user.isBanned ? "brand" : "danger"}
              className="w-full"
              onClick={() => onToggleBan(user.id, user.isBanned)}
            >
              {user.isBanned ? "إلغاء الحظر" : "حظر المستخدم"}
            </Button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
