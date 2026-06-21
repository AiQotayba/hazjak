const UPLOAD_PATH_RE = /^\/uploads\/(?:images|files|avatars)\//i;
const UPLOAD_HOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1):4000\/uploads\//i;
const LOCAL_HOST_RE = /^(?:localhost|127\.0\.0\.1)$/i;
const OPTIMIZER_SUFFIX_RE = /(\.(?:jpe?g|png|webp|gif|pdf))(?:[?&](?:w|q|url)=.*)$/i;

/** Strip accidental Next.js optimizer params appended to upload URLs. */
export function normalizeMediaUrl(url: string | null | undefined): string {
  if (!url?.trim()) return "";
  return url.trim().replace(OPTIMIZER_SUFFIX_RE, "$1");
}

export function isApiUploadUrl(url: string): boolean {
  const normalized = normalizeMediaUrl(url);
  if (!normalized) return false;
  if (UPLOAD_HOST_RE.test(normalized)) return true;
  if (UPLOAD_PATH_RE.test(normalized)) return true;
  try {
    return UPLOAD_PATH_RE.test(new URL(normalized).pathname);
  } catch {
    return false;
  }
}

/**
 * Resolves a stored media URL to a publicly fetchable absolute URL.
 * Upload paths always use `apiPublicUrl` so localhost-stored links still work for WhatsApp/email.
 */
export function resolvePublicMediaUrl(
  url: string | null | undefined,
  apiPublicUrl: string
): string | null {
  const normalized = normalizeMediaUrl(url);
  if (!normalized) return null;

  const base = apiPublicUrl.replace(/\/+$/, "");
  const toAbsolute = (pathname: string) => {
    const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `${base}${path}`;
  };

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      if (UPLOAD_PATH_RE.test(parsed.pathname) && LOCAL_HOST_RE.test(parsed.hostname)) {
        return toAbsolute(parsed.pathname);
      }
      return normalized;
    } catch {
      return null;
    }
  }

  return toAbsolute(normalized);
}
