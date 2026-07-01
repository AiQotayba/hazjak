"use client";

import { useEffect, useState } from "react";
import { CalendarOff, Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate, formatTime } from "@hazjak/utils";

interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface BlockedDay {
  id: string;
  date: string;
  reason?: string | null;
}

export function OwnerAvailabilityTab({
  stadiumId,
  token,
}: {
  stadiumId: string;
  token: string;
}) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [slotDate, setSlotDate] = useState("");
  const [slotStart, setSlotStart] = useState("08:00");
  const [slotEnd, setSlotEnd] = useState("22:00");
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const [slotsRes, blockedRes] = await Promise.all([
      api<AvailabilitySlot[]>(`/availability?stadiumId=${stadiumId}`, { token }),
      api<BlockedDay[]>(`/availability/blocked?stadiumId=${stadiumId}`, { token }),
    ]);
    if (slotsRes.data) setSlots(slotsRes.data);
    if (blockedRes.data) setBlockedDays(blockedRes.data);
  }

  useEffect(() => {
    load();
  }, [stadiumId, token]);

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!slotDate) return;
    const startTime = new Date(`${slotDate}T${slotStart}:00`).toISOString();
    const endTime = new Date(`${slotDate}T${slotEnd}:00`).toISOString();
    const res = await api("/availability", {
      method: "POST",
      token,
      body: JSON.stringify({ stadiumId, startTime, endTime }),
    });
    if (res.success) {
      setMsg("تمت إضافة فترة التوفر");
      setSlotDate("");
      load();
    }
  }

  async function removeSlot(id: string) {
    await api(`/availability/${id}`, { method: "DELETE", token });
    load();
    setMsg("تم حذف الموعد");
  }

  async function addBlockedDay(e: React.FormEvent) {
    e.preventDefault();
    if (!blockDate) return;
    const res = await api("/availability/blocked", {
      method: "POST",
      token,
      body: JSON.stringify({
        stadiumId,
        date: blockDate,
        reason: blockReason.trim() || undefined,
      }),
    });
    if (res.success) {
      setMsg("تم تسجيل يوم العطلة");
      setBlockDate("");
      setBlockReason("");
      load();
    }
  }

  async function removeBlockedDay(id: string) {
    await api(`/availability/blocked/${id}`, { method: "DELETE", token });
    load();
    setMsg("تم إلغاء العطلة");
  }

  return (
    <div className="space-y-6">
      {msg && (
        <p className="text-sm text-primary font-bold rounded-2xl bg-primary/10 px-4 py-2">{msg}</p>
      )}

      <Card className="border-0 shadow-soft">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-heading text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              فترات التوفر
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              إذا أضفت فترات، يُسمح بالحجز داخلها فقط. بدون فترات = كل المواعيد الافتراضية متاحة.
            </p>
          </div>

          <form onSubmit={addSlot} className="grid gap-3 sm:grid-cols-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">التاريخ</Label>
              <Input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} className="h-11 rounded-2xl border-0 bg-secondary/60" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">من</Label>
              <Input type="time" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} className="h-11 rounded-2xl border-0 bg-secondary/60" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">إلى</Label>
              <Input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} className="h-11 rounded-2xl border-0 bg-secondary/60" />
            </div>
            <Button type="submit" className="rounded-2xl h-11 gap-2">
              <Plus className="h-4 w-4" />
              إضافة
            </Button>
          </form>

          <ul className="space-y-2">
            {slots.length === 0 ? (
              <li className="text-xs text-muted-foreground">لا توجد فترات مخصصة</li>
            ) : (
              slots.map((slot) => (
                <li key={slot.id} className="flex items-center justify-between gap-2 rounded-2xl bg-secondary/50 px-3 py-2 text-sm">
                  <span>
                    {formatDate(slot.startTime, { dateStyle: "medium" })} —{" "}
                    {formatTime(slot.startTime)}
                    {" – "}
                    {formatTime(slot.endTime)}
                  </span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSlot(slot.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-heading text-sm flex items-center gap-2">
              <CalendarOff className="h-4 w-4 text-primary" />
              أيام العطلة
            </h3>
            <p className="text-xs text-muted-foreground mt-1">أيام يُغلق فيها الملعب بالكامل</p>
          </div>

          <form onSubmit={addBlockedDay} className="grid gap-3 sm:grid-cols-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">التاريخ</Label>
              <Input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} className="h-11 rounded-2xl border-0 bg-secondary/60" />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-xs">السبب (اختياري)</Label>
              <Input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="صيانة..." className="h-11 rounded-2xl border-0 bg-secondary/60" />
            </div>
            <Button type="submit" className="rounded-2xl h-11 gap-2">
              <Plus className="h-4 w-4" />
              إغلاق اليوم
            </Button>
          </form>

          <ul className="space-y-2">
            {blockedDays.length === 0 ? (
              <li className="text-xs text-muted-foreground">لا توجد أيام مغلقة</li>
            ) : (
              blockedDays.map((day) => (
                <li key={day.id} className="flex items-center justify-between gap-2 rounded-2xl bg-secondary/50 px-3 py-2 text-sm">
                  <span>
                    {formatDate(day.date, { dateStyle: "medium" })}
                    {day.reason ? ` — ${day.reason}` : ""}
                  </span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeBlockedDay(day.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
