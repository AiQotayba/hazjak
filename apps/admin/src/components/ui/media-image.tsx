import Image, { type ImageProps } from "next/image";
import { isApiUploadUrl, normalizeMediaUrl } from "@hazjak/utils";

type MediaImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function MediaImage({ src, unoptimized, ...props }: MediaImageProps) {
  const cleanSrc = normalizeMediaUrl(src);
  return (
    <Image
      src={cleanSrc}
      unoptimized={unoptimized ?? isApiUploadUrl(cleanSrc)}
      {...props}
    />
  );
}
