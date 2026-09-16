"use client";

import { Check, Copy, Landmark, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

type Account = { id: string; bankName: string; accountNumber: string; accountHolder: string; instruction: string };
type Instruction = { id: string; title: string; instruction: string; step: number };
type QrisSetting = { id: string; label: string; merchantName: string; payId: string; qrImageUrl: string; instruction: string };
const rupiahFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function TransferGuide({ total }: { total: number }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [qris, setQris] = useState<QrisSetting | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [method, setMethod] = useState<"bank" | "qris">("bank");
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ accounts: Account[]; instructions: Instruction[]; qris: QrisSetting | null }>("/api/payment-settings", { cache: "no-store" })
      .then((payload) => { setAccounts(payload.accounts); setInstructions(payload.instructions); setSelectedAccountId(payload.accounts[0]?.id ?? ""); setQris(payload.qris ?? null); setMethod(payload.qris ? "qris" : "bank"); })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat panduan pembayaran"));
  }, []);

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? accounts[0];
  const hasQris = qris !== null;
  const hasBank = accounts.length > 0;
  const activeMethod: "bank" | "qris" = hasQris && hasBank ? method : hasQris ? "qris" : "bank";

  async function copyValue(value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
    window.setTimeout(() => setCopiedValue((current) => current === value ? null : current), 1600);
  }

  return <div className="mt-8 space-y-6">
    <div className="rounded-2xl bg-[var(--brand-50)] p-5 sm:flex sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-600)]">Total pembayaran</p><p className="mt-2 font-serif text-3xl font-semibold">{rupiahFormatter.format(total)}</p></div><button type="button" onClick={() => void copyValue(String(total))} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--brand-100)] bg-white px-4 py-2 text-xs font-semibold text-[var(--brand-700)] sm:mt-0">{copiedValue === String(total) ? <Check size={15} /> : <Copy size={15} />}Salin total</button></div>
    {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
    {hasQris && hasBank ? <fieldset><legend className="text-sm font-semibold">Metode pembayaran</legend><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className={`cursor-pointer rounded-2xl border p-4 ${method === "bank" ? "border-[var(--brand-600)] bg-[var(--brand-50)]" : "border-stone-200"}`}><input type="radio" name="payMethod" checked={method === "bank"} onChange={() => setMethod("bank")} className="sr-only" /><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-white text-[var(--brand-600)]"><Landmark size={17} /></span><span><span className="block text-sm font-semibold">Transfer bank</span><span className="text-xs text-stone-500">Manual via rekening</span></span></span></label><label className={`cursor-pointer rounded-2xl border p-4 ${method === "qris" ? "border-[var(--brand-600)] bg-[var(--brand-50)]" : "border-stone-200"}`}><input type="radio" name="payMethod" checked={method === "qris"} onChange={() => setMethod("qris")} className="sr-only" /><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-white text-[var(--brand-600)]"><QrCode size={17} /></span><span><span className="block text-sm font-semibold">QRIS</span><span className="text-xs text-stone-500">Scan kode QR</span></span></span></label></div></fieldset> : null}
    {activeMethod === "qris" ? <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5"><div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center"><div className="mx-auto grid size-44 shrink-0 place-items-center rounded-2xl bg-white p-2">{qris?.qrImageUrl ? <img src={qris.qrImageUrl} alt={`Kode QR ${qris.merchantName}`} className="size-full object-contain" /> : <QrCode size={92} className="text-[var(--brand-600)]" />}</div><div className="min-w-0 text-center sm:text-left"><p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--brand-600)]">{qris?.label ?? "QRIS"}</p><p className="mt-1 font-serif text-2xl font-semibold">{qris?.merchantName ?? "Jasmine Shop Premium Product"}</p><div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start"><span className="font-mono text-base font-bold tracking-wider">{qris?.payId ?? ""}</span><button type="button" onClick={() => void copyValue(qris?.payId ?? "")} className="grid size-9 place-items-center rounded-full border bg-white">{copiedValue === qris?.payId ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}</button></div>{qris?.instruction ? <p className="mt-3 text-xs leading-5 text-stone-600">{qris.instruction}</p> : null}</div></div></div> : <>{hasBank ? <fieldset><legend className="text-sm font-semibold">Pilih rekening tujuan</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{accounts.map((account) => <label key={account.id} className={`cursor-pointer rounded-2xl border p-4 ${selectedAccountId === account.id ? "border-[var(--brand-600)] bg-[var(--brand-50)]" : "border-stone-200"}`}><input type="radio" name="bankAccount" checked={selectedAccountId === account.id} onChange={() => setSelectedAccountId(account.id)} className="sr-only" /><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-white text-[var(--brand-600)]"><Landmark size={17} /></span><span><span className="block text-sm font-semibold">{account.bankName}</span><span className="text-xs text-stone-500">Transfer bank</span></span></span></label>)}</div></fieldset> : null}{selectedAccount && hasBank ? <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5"><div className="flex justify-between gap-4"><div><p className="text-xs text-stone-500">Nomor rekening {selectedAccount.bankName}</p><p className="mt-1 font-mono text-xl font-bold tracking-wider">{selectedAccount.accountNumber}</p><p className="mt-2 text-xs text-stone-500">a.n. {selectedAccount.accountHolder}</p>{selectedAccount.instruction ? <p className="mt-3 text-xs text-stone-600">{selectedAccount.instruction}</p> : null}</div><button type="button" onClick={() => void copyValue(selectedAccount.accountNumber)} className="grid size-10 place-items-center rounded-full border bg-white"><Copy size={17} /></button></div></div> : <>{!hasQris ? <p className="text-sm text-amber-700">Belum ada rekening pembayaran aktif.</p> : null}</>}</>}
    <div><h3 className="text-sm font-semibold">Cara melakukan pembayaran</h3><ol className="mt-4 space-y-3">{instructions.map((item) => <li key={item.id} className="flex gap-3 text-sm leading-6 text-stone-600"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-semibold">{item.step}</span><span><strong className="text-stone-800">{item.title}. </strong>{item.instruction}</span></li>)}</ol></div>
  </div>;
}
