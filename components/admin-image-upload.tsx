"use client";

import { useCallback, useRef, useState } from "react";
import { AlertCircle, Film, ImagePlus, Upload, X } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/client-api";

type UploadResponse = {
  data: {
    url: string;
    width: number | null;
    height: number | null;
    mimeType: string;
    fileSizeBytes: number;
    mediaType: "image" | "video";
  };
};

type Props = {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  error?: string;
};

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,video/mp4";
const DEFAULT_MAX_MB = 50;

export function AdminImageUpload({
  value,
  onChange,
  folder = "misc",
  accept = DEFAULT_ACCEPT,
  maxSizeMB = DEFAULT_MAX_MB,
  label,
  error,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploadError(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        setUploadError(`Ukuran file melebihi batas ${maxSizeMB}MB`);
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const result = await apiFetch<UploadResponse>("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        onChange(result.data.url);
        setPreview(null);
      } catch (caught) {
        setUploadError(caught instanceof ApiError ? caught.message : "Gagal mengunggah file");
      } finally {
        setUploading(false);
      }
    },
    [folder, maxSizeMB, onChange],
  );

  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setPreview(url);
      void upload(file);
    },
    [upload],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  const remove = useCallback(() => {
    onChange("");
    setPreview(null);
  }, [onChange]);

  const hasValue = Boolean(value);
  const displayUrl = preview || value;
  const isVideo = hasValue && (value.endsWith(".mp4") || value.includes("video/"));

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-medium text-[var(--ink-950)]">{label}</p> : null}

      {hasValue ? (
        <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
          {isVideo ? (
            <div className="flex h-40 items-center justify-center bg-stone-900 text-white">
              <Film size={32} />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="Preview" className="h-40 w-full object-cover" />
          )}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-lg">
                <Upload size={16} className="animate-pulse" />
                Mengunggah...
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={remove}
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
              aria-label="Hapus gambar"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 transition-colors ${
            isDragging
              ? "border-[var(--brand-600)] bg-[var(--brand-50)]"
              : "border-stone-300 bg-stone-50 hover:border-[var(--brand-500)] hover:bg-[var(--brand-50)]/50"
          }`}
        >
          <div className="grid size-12 place-items-center rounded-xl bg-stone-100 text-stone-400">
            <ImagePlus size={24} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-stone-700">
              {isDragging ? "Lepaskan file di sini" : "Seret gambar ke sini atau klik untuk browse"}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              JPEG, PNG, WebP, AVIF, MP4 (maks. {maxSizeMB}MB)
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFileChange}
        className="hidden"
        aria-label="Pilih file untuk diunggah"
      />

      {uploadError || error ? (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={14} />
          <span>{uploadError || error}</span>
        </div>
      ) : null}
    </div>
  );
}
