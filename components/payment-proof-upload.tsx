"use client";

import Image from "next/image";
import { CheckCircle2, ImagePlus, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 5 * 1024 * 1024;

type PaymentProofUploadProps = {
  orderId: string;
  onConfirmed: () => void;
};

export function PaymentProofUpload({ orderId, onConfirmed }: PaymentProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(nextFile: File | undefined) {
    setSubmitted(false);

    if (!nextFile) return;
    if (!acceptedTypes.includes(nextFile.type)) {
      setFile(null);
      setPreviewUrl(null);
      setError("Format file harus JPG, PNG, atau WebP");
      return;
    }
    if (nextFile.size < 1 || nextFile.size > maxFileSize) {
      setFile(null);
      setPreviewUrl(null);
      setError("Ukuran file harus lebih dari 0 byte dan maksimal 5 MB");
      return;
    }

    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setError(null);
  }

  function removeFile() {
    setFile(null);
    setPreviewUrl(null);
    setConfirmed(false);
    setSubmitted(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submitProof() {
    if (!file) { setError("Bukti pembayaran wajib diunggah"); return; }
    if (!confirmed) { setError("Konfirmasi bahwa transfer sudah dilakukan"); return; }
    if (!orderId) { setError("Pesanan belum tersimpan"); return; }
    setIsUploading(true);
    const body = new FormData();
    body.set("paymentProof", file);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/payment-proof`, { method: "POST", body });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Gagal mengunggah bukti pembayaran");
      setSubmitted(true);
      onConfirmed();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal mengunggah bukti pembayaran");
    } finally {
      setIsUploading(false);
    }
  }

  if (submitted) {
    return (
      <div role="status" className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 aria-hidden="true" size={23} />
        </span>
        <h3 className="mt-4 font-serif text-2xl text-stone-900">Bukti transfer siap dikirim</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
          File <span className="font-semibold">{file?.name}</span> berhasil diunggah dan menunggu verifikasi admin.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800"
        >
          <RefreshCw aria-hidden="true" size={15} />
          Ubah bukti transfer
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Bukti pembayaran</h3>
          <p className="mt-1 text-xs text-stone-500">Wajib diunggah untuk menyelesaikan checkout.</p>
        </div>
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          Wajib
        </span>
      </div>
      <div
        className={`rounded-2xl border-2 border-dashed p-5 transition ${
          error ? "border-red-300 bg-red-50" : "border-stone-300 bg-stone-50"
        }`}
      >
        {previewUrl && file ? (
          <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-200">
              <Image src={previewUrl} alt="Pratinjau bukti transfer" fill unoptimized className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">{file.name}</p>
              <p className="mt-1 text-xs text-stone-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700"
                >
                  <RefreshCw aria-hidden="true" size={14} />
                  Ganti file
                </button>
                <button
                  type="button"
                  onClick={removeFile}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  <Trash2 aria-hidden="true" size={14} />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid min-h-44 w-full place-items-center text-center"
          >
            <span>
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-[var(--brand-600)] shadow-sm">
                <UploadCloud aria-hidden="true" size={22} />
              </span>
              <span className="mt-4 block text-sm font-semibold text-stone-900">Pilih foto bukti transfer</span>
              <span className="mt-1 block text-xs text-stone-500">JPG, PNG, atau WebP · maksimal 5 MB</span>
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          id="payment-proof"
          name="paymentProof"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          aria-required="true"
          onChange={(event) => handleFile(event.target.files?.[0])}
          className="sr-only"
          aria-describedby={error ? "payment-proof-error" : "payment-proof-help"}
        />
      </div>

      {error ? (
        <p id="payment-proof-error" role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        <p id="payment-proof-help" className="mt-2 flex items-center gap-2 text-xs text-stone-500">
          <ImagePlus aria-hidden="true" size={14} /> Pastikan nominal dan detail transaksi terlihat jelas.
        </p>
      )}

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-4">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-0.5 size-4 accent-[var(--brand-600)]"
        />
        <span className="text-sm leading-6 text-stone-600">
          Saya memastikan telah mentransfer sesuai total pembayaran ke rekening Jasmine Frozen Food yang dipilih.
        </span>
      </label>

      <button
        type="button"
        onClick={() => void submitProof()}
        disabled={!file || !confirmed || !orderId || isUploading}
        className="mt-6 w-full rounded-full bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)] disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {isUploading ? "Mengunggah..." : "Unggah bukti & selesaikan checkout"}
      </button>
    </div>
  );
}
