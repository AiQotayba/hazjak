/** Returns an embeddable video URL for YouTube/Vimeo/direct MP4 links. */
export type VideoEmbed = { type: "iframe" | "video"; src: string };

export function getVideoEmbedUrl(url: string): VideoEmbed | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (ytMatch) {
    return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed)) {
    return { type: "video", src: trimmed };
  }

  try {
    new URL(trimmed);
    return { type: "iframe", src: trimmed };
  } catch {
    return null;
  }
}
