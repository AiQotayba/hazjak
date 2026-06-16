const UPLOAD_PATH_RE = /^\/uploads\/(?:images|files|avatars)\//i;
const UPLOAD_HOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1):4000\/uploads\//i;
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
