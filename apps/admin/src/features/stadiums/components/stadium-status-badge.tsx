export function StadiumStatusBadge({
  isActive,
  isSuspended,
}: {
  isActive: boolean;
  isSuspended: boolean;
}) {
  if (isSuspended) {
    return (
      <span className="rounded-full bg-negative/15 text-negative px-2.5 py-0.5 text-[10px] font-bold">
        موقوف
      </span>
    );
  }
  if (!isActive) {
    return (
      <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-[10px] font-bold">
        مخفي
      </span>
    );
  }
  return (
    <span className="rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-[10px] font-bold">
      نشط
    </span>
  );
}
