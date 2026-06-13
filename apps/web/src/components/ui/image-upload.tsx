"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiUpload } from "@/lib/api";
import type { UploadResponse } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/gif";

function getUploadUrl(data: UploadResponse | undefined): string {
  if (!data || typeof data !== "object") return "";
  return data.url ?? data.image_url ?? data.imageUrl ?? data.path ?? "";
}

export interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  token?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
  showUrlInput?: boolean;
  previewFit?: "cover" | "contain";
  inputClassName?: string;
}

export function ImageUpload({
  value,
  onChange,
  token,
  accept = ACCEPT_IMAGES,
  disabled = false,
  className,
  showUrlInput = false,
  previewFit = "cover",
  inputClassName,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const hasValue = !!value.trim();

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة (JPEG أو PNG أو WebP أو GIF)");
      return;
    }

    if (!token) {
      setError("يجب تسجيل الدخول لرفع الصور");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "images");

      const res = await apiUpload<UploadResponse>("/upload/image", formData, { token });

      if (!res.success) {
        setError(res.message || "فشل رفع الصورة");
        return;
      }

      const url = getUploadUrl(res.data);
      if (!url) {
        setError("لم يُرجع الرابط بعد الرفع");
        return;
      }

      onChange(url);
    } catch {
      setError("فشل رفع الصورة");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function clearImage() {
    onChange("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled || uploading}
            onChange={onInputChange}
          />

          {hasValue ? (
            <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-muted sm:h-40 sm:w-40">
              <Image
                src={value}
                alt="معاينة"
                fill
                className={previewFit === "contain" ? "object-contain" : "object-cover"}
                sizes="160px"
                unoptimized
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 end-2 h-7 w-7 rounded-full shadow-soft"
                  onClick={clearImage}
                  aria-label="حذف الصورة"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-36 w-36 shrink-0 flex-col gap-2 rounded-2xl border-dashed border-border/60 bg-secondary/40 sm:h-40 sm:w-40"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">جاري الرفع...</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">رفع صورة</span>
                </>
              )}
            </Button>
          )}

          {hasValue && !disabled && !uploading ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => inputRef.current?.click()}
            >
              تغيير الصورة
            </Button>
          ) : null}
        </div>

        {showUrlInput ? (
          <Input 
            value={value}
            onChange={(e) => {
              setError("");
              onChange(e.target.value);
            }}
            placeholder="أو الصق رابط الصورة"
            dir="ltr"
            className={cn("text-start hidden", inputClassName)}
            disabled={disabled || uploading}
          />
        ) : null}

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
