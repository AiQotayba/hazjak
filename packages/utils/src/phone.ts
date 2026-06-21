/** يحوّل الرقم إلى صيغة دولية بدون + (مثال: 9639xxxxxxxx) */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `963${digits.slice(1)}`;
  return digits;
}

export function formatPhoneDisplay(phone: string): string {
  const n = normalizePhone(phone);
  if (n.startsWith("963") && n.length >= 12) {
    return `+${n.slice(0, 3)} ${n.slice(3)}`;
  }
  return phone.trim();
}
