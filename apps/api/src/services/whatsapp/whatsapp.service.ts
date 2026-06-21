import { env } from "@hazjak/config";
import { resolvePublicMediaUrl } from "@hazjak/utils";

function isConfigured() {
  return Boolean(env.whatsappApiKey && env.whatsappSender);
}

/** يحوّل الرقم إلى صيغة دولية بدون + (مثال: 9639xxxxxxxx) */
export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `963${digits.slice(1)}`;
  return digits;
}

function resolveMediaUrl(url: string | null | undefined): string | null {
  return resolvePublicMediaUrl(url, env.apiPublicUrl);
}

type WhatsAppApiResult = { ok: true } | { ok: false; skipped: boolean; msg?: string };

async function parseWhatsAppResponse(res: Response): Promise<WhatsAppApiResult> {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text) as { status?: boolean; msg?: string };
    if (json.status === true) return { ok: true };
    return { ok: false, skipped: false, msg: json.msg ?? text };
  } catch {
    if (res.ok) return { ok: true };
    return { ok: false, skipped: false, msg: text };
  }
}

/** يتبع إعادة التوجيه ويُرجع رابطاً مباشراً لملف صورة (مطلوب من Metaphilia) */
async function resolveDirectImageUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: { Range: "bytes=0-0" },
    });
    if (!res.ok && res.status !== 206) return null;

    const type = res.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) {
      console.warn("[whatsapp] media URL is not a direct image:", url, type);
      return null;
    }

    return res.url || url;
  } catch (err) {
    console.warn("[whatsapp] could not verify direct image URL:", url, err);
    return url;
  }
}

function mediaPayload(number: string, url: string, caption: string) {
  return {
    api_key: env.whatsappApiKey,
    sender: env.whatsappSender,
    number: normalizeWhatsAppNumber(number),
    media_type: "image" as const,
    caption,
    url,
  };
}

async function postSendMedia(payload: ReturnType<typeof mediaPayload>): Promise<WhatsAppApiResult> {
  const res = await fetch(`${env.whatsappApiBase}/send-media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60_000),
  });
  const result = await parseWhatsAppResponse(res);
  if (!result.ok) {
    console.error("[whatsapp] send-media POST failed:", result.msg ?? res.status);
  }
  return result;
}

/** GET fallback — مطابق لـ api.docx.md */
async function getSendMedia(payload: ReturnType<typeof mediaPayload>): Promise<WhatsAppApiResult> {
  const params = new URLSearchParams({
    api_key: payload.api_key,
    sender: payload.sender,
    number: payload.number,
    media_type: payload.media_type,
    caption: payload.caption,
    url: payload.url,
  });

  const res = await fetch(`${env.whatsappApiBase}/send-media?${params}`, {
    signal: AbortSignal.timeout(60_000),
  });
  const result = await parseWhatsAppResponse(res);
  if (!result.ok) {
    console.error("[whatsapp] send-media GET failed:", result.msg ?? res.status);
  }
  return result;
}

export async function sendWhatsAppMessage(number: string, message: string) {
  if (!isConfigured()) {
    console.info("[whatsapp] skipped (not configured):", message.slice(0, 80));
    return { ok: false as const, skipped: true };
  }

  const res = await fetch(`${env.whatsappApiBase}/send-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: env.whatsappApiKey,
      sender: env.whatsappSender,
      number: normalizeWhatsAppNumber(number),
      message,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const result = await parseWhatsAppResponse(res);
  if (!result.ok) {
    console.error("[whatsapp] send-message failed:", result.msg ?? res.status);
    return { ok: false as const, skipped: false };
  }

  return { ok: true as const, skipped: false };
}

export async function sendWhatsAppImage(
  number: string,
  imageUrl: string,
  caption?: string
) {
  const url = resolveMediaUrl(imageUrl);
  if (!url) {
    console.warn("[whatsapp] invalid media URL:", imageUrl?.slice(0, 120));
    return { ok: false as const, skipped: true };
  }

  if (/localhost|127\.0\.0\.1/i.test(url)) {
    console.warn(
      "[whatsapp] media URL is not publicly reachable — set API_PUBLIC_URL to your public API domain:",
      url
    );
    return { ok: false as const, skipped: true };
  }

  if (!isConfigured()) {
    console.info("[whatsapp] skipped media:", caption?.slice(0, 80));
    return { ok: false as const, skipped: true };
  }

  const directUrl = (await resolveDirectImageUrl(url)) ?? url;
  const payload = mediaPayload(number, directUrl, caption ?? "");

  let result = await postSendMedia(payload);
  if (!result.ok) {
    result = await getSendMedia(payload);
  }

  return result.ok
    ? ({ ok: true as const, skipped: false })
    : ({ ok: false as const, skipped: false });
}

/** يرسل تعليمات العربون: صورة QR ثم النص (حسب api.docx.md — caption قصير + رسالة منفصلة) */
export async function sendDepositInstructionsWhatsApp(
  phone: string,
  message: string,
  qrImageUrl?: string | null
) {
  if (!qrImageUrl?.trim()) {
    console.warn("[whatsapp] no shamCashQrImage on stadium — sending text-only deposit message");
    return sendWhatsAppMessage(phone, message);
  }

  const resolved = resolveMediaUrl(qrImageUrl);
  console.info("[whatsapp] deposit QR:", resolved ?? "(unresolved)", "from:", qrImageUrl.slice(0, 80));

  const shortCaption = "باركود شام كاش";
  const img = await sendWhatsAppImage(phone, qrImageUrl, shortCaption);
  if (img.ok) {
    await sendWhatsAppMessage(phone, message);
    return img;
  }

  console.warn("[whatsapp] QR image failed, falling back to text-only message");
  return sendWhatsAppMessage(phone, message);
}
