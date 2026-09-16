"use client";

import { AlertTriangle, CheckCircle2, CreditCard, Edit3, Landmark, ListChecks, Plus, QrCode, ShieldCheck, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { apiFetch } from "@/lib/client-api";

type AdminBankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
  displayOrder: number;
};

type AdminInstruction = { id: string; title: string; text: string; order: number; isActive: boolean };

type AdminQris = { id: string; label: string; merchantName: string; payId: string; qrImageUrl: string; instruction: string; isActive: boolean };

const emptyAccountForm = { bankName: "", accountNumber: "", accountHolder: "", displayOrder: "1", isActive: true };

const emptyQrisForm = { label: "QRIS", merchantName: "", payId: "", qrImageUrl: "", instruction: "", isActive: true };

export function AdminPaymentSettings() {
  const [activeTab, setActiveTab] = useState<"accounts" | "instructions" | "qris">("accounts");
  const [accounts, setAccounts] = useState<AdminBankAccount[]>([]);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [accountNotice, setAccountNotice] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null | undefined>(undefined);
  const [accountForm, setAccountForm] = useState(emptyAccountForm);
  const [accountFormError, setAccountFormError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<AdminInstruction[]>([]);
  const [editingInstructionId, setEditingInstructionId] = useState<string | null | undefined>(undefined);
  const [instructionForm, setInstructionForm] = useState({ title: "", text: "", order: "1", isActive: true });
  const [instructionError, setInstructionError] = useState<string | null>(null);
  const [instructionNotice, setInstructionNotice] = useState<string | null>(null);
  const [qris, setQris] = useState<AdminQris | null>(null);
  const [showQrisEditor, setShowQrisEditor] = useState(false);
  const [qrisForm, setQrisForm] = useState(emptyQrisForm);
  const [qrisFormError, setQrisFormError] = useState<string | null>(null);
  const [qrisNotice, setQrisNotice] = useState<string | null>(null);
  const accountToDelete = accounts.find((account) => account.id === deleteAccountId) ?? null;

  useEffect(() => {
    Promise.all([
      apiFetch<{ accounts: Array<{ id: string; bankName: string; accountNumber: string; accountHolderName: string; isActive: boolean; displayOrder: number }> }>("/api/admin/payment-settings/accounts", { cache: "no-store" }),
      apiFetch<{ instructions: Array<{ id: string; title: string; instruction: string; stepOrder: number; isActive: boolean }> }>("/api/admin/payment-settings/instructions", { cache: "no-store" }),
      apiFetch<{ qris: AdminQris | null }>("/api/admin/payment-settings/qris", { cache: "no-store" }),
    ]).then(([accountPayload, instructionPayload, qrisPayload]) => {
      setAccounts(accountPayload.accounts.map((item) => ({ ...item, accountHolder: item.accountHolderName })));
      setInstructions(instructionPayload.instructions.map((item) => ({ id: item.id, title: item.title, text: item.instruction, order: item.stepOrder, isActive: item.isActive })));
      setQris(qrisPayload.qris);
    }).catch((caught) => setAccountNotice(caught instanceof Error ? caught.message : "Gagal memuat pengaturan"));
  }, []);

  function openNewAccount() {
    setEditingAccountId(null);
    setAccountForm({ ...emptyAccountForm, displayOrder: String(accounts.length + 1) });
    setAccountFormError(null);
    setAccountNotice(null);
  }

  function openEditAccount(account: AdminBankAccount) {
    setEditingAccountId(account.id);
    setAccountForm({ bankName: account.bankName, accountNumber: account.accountNumber, accountHolder: account.accountHolder, displayOrder: String(account.displayOrder), isActive: account.isActive });
    setAccountFormError(null);
    setAccountNotice(null);
  }

  async function saveAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bankName = accountForm.bankName.trim();
    const accountNumber = accountForm.accountNumber.replace(/\s/g, "");
    const accountHolder = accountForm.accountHolder.trim();
    const displayOrder = Number(accountForm.displayOrder);
    if (bankName.length < 2 || !/^\d{5,30}$/.test(accountNumber) || accountHolder.length < 3 || !Number.isInteger(displayOrder) || displayOrder < 1) {
      setAccountFormError("Lengkapi bank, nomor rekening numerik 5–30 digit, nama pemilik, dan urutan positif.");
      return;
    }
    if (accounts.some((account) => account.id !== editingAccountId && account.bankName.toLowerCase() === bankName.toLowerCase() && account.accountNumber === accountNumber)) {
      setAccountFormError("Kombinasi bank dan nomor rekening sudah terdaftar.");
      return;
    }
    try {
      const payload = await apiFetch<{ account: { id: string; bankName: string; accountNumber: string; accountHolderName: string; displayOrder: number; isActive: boolean } }>(editingAccountId ? `/api/admin/payment-settings/accounts/${editingAccountId}` : "/api/admin/payment-settings/accounts", { method: editingAccountId ? "PATCH" : "POST", body: JSON.stringify({ bankName, accountNumber, accountHolderName: accountHolder, displayOrder, isActive: accountForm.isActive }) });
      const nextAccount = { ...payload.account, accountHolder: payload.account.accountHolderName };
      setAccounts((items) => editingAccountId ? items.map((item) => item.id === editingAccountId ? nextAccount : item) : [...items, nextAccount]);
      setAccountNotice(`Rekening ${bankName} berhasil ${editingAccountId ? "diperbarui" : "ditambahkan"}.`);
      setEditingAccountId(undefined);
    } catch (caught) { setAccountFormError(caught instanceof Error ? caught.message : "Gagal menyimpan rekening"); }
  }

  function openNewInstruction() {
    setEditingInstructionId(null);
    setInstructionForm({ title: "", text: "", order: String(instructions.length + 1), isActive: true });
    setInstructionError(null);
    setInstructionNotice(null);
  }

  function openEditInstruction(instruction: AdminInstruction) {
    setEditingInstructionId(instruction.id);
    setInstructionForm({ title: instruction.title, text: instruction.text, order: String(instruction.order), isActive: instruction.isActive });
    setInstructionError(null);
    setInstructionNotice(null);
  }

  async function saveInstruction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = instructionForm.title.trim();
    const text = instructionForm.text.trim();
    const order = Number(instructionForm.order);
    if (title.length < 2 || text.length < 10 || !Number.isInteger(order) || order < 1) {
      setInstructionError("Judul minimal 2 karakter, instruksi minimal 10 karakter, dan urutan harus positif.");
      return;
    }
    if (instructions.some((item) => item.id !== editingInstructionId && item.order === order)) {
      setInstructionError("Urutan langkah sudah digunakan instruksi lain.");
      return;
    }
    try {
      const payload = await apiFetch<{ instruction: { id: string; title: string; instruction: string; stepOrder: number; isActive: boolean } }>(editingInstructionId ? `/api/admin/payment-settings/instructions/${editingInstructionId}` : "/api/admin/payment-settings/instructions", { method: editingInstructionId ? "PATCH" : "POST", body: JSON.stringify({ title, instruction: text, stepOrder: order, isActive: instructionForm.isActive }) });
      const next = { id: payload.instruction.id, title: payload.instruction.title, text: payload.instruction.instruction, order: payload.instruction.stepOrder, isActive: payload.instruction.isActive };
      setInstructions((items) => editingInstructionId ? items.map((item) => item.id === editingInstructionId ? next : item) : [...items, next]);
      setInstructionNotice(`Instruksi “${title}” berhasil ${editingInstructionId ? "diperbarui" : "ditambahkan"}.`);
      setEditingInstructionId(undefined);
    } catch (caught) { setInstructionError(caught instanceof Error ? caught.message : "Gagal menyimpan instruksi"); }
  }

  async function deleteAccount(account: AdminBankAccount) {
    try { await apiFetch(`/api/admin/payment-settings/accounts/${account.id}`, { method: "DELETE" }); setAccounts((items) => items.filter((item) => item.id !== account.id)); setAccountNotice(`Rekening ${account.bankName} berhasil dihapus.`); setDeleteAccountId(null); }
    catch (caught) { setAccountNotice(caught instanceof Error ? caught.message : "Gagal menghapus rekening"); }
  }

  async function deleteInstruction(instruction: AdminInstruction) {
    try { await apiFetch(`/api/admin/payment-settings/instructions/${instruction.id}`, { method: "DELETE" }); setInstructions((items) => items.filter((item) => item.id !== instruction.id)); setInstructionNotice(`Instruksi “${instruction.title}” berhasil dihapus.`); }
    catch (caught) { setInstructionNotice(caught instanceof Error ? caught.message : "Gagal menghapus instruksi"); }
  }

  function openQrisEditor() {
    setShowQrisEditor(true);
    setQrisForm(qris ? { label: qris.label, merchantName: qris.merchantName, payId: qris.payId, qrImageUrl: qris.qrImageUrl, instruction: qris.instruction, isActive: qris.isActive } : { ...emptyQrisForm });
    setQrisFormError(null);
    setQrisNotice(null);
  }

  async function saveQris(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const label = qrisForm.label.trim();
    const merchantName = qrisForm.merchantName.trim();
    const payId = qrisForm.payId.trim();
    const qrImageUrl = qrisForm.qrImageUrl.trim();
    const instruction = qrisForm.instruction.trim();
    if (label.length < 2 || merchantName.length < 3 || payId.length < 5) {
      setQrisFormError("Label minimal 2 karakter, nama merchant minimal 3 karakter, dan pay ID minimal 5 karakter.");
      return;
    }
    try {
      const payload = await apiFetch<{ qris: AdminQris }>("/api/admin/payment-settings/qris", { method: "PUT", body: JSON.stringify({ label, merchantName, payId, qrImageUrl, instruction, isActive: qrisForm.isActive }) });
      setQris(payload.qris);
      setQrisNotice("Pengaturan QRIS berhasil disimpan.");
      setShowQrisEditor(false);
    } catch (caught) { setQrisFormError(caught instanceof Error ? caught.message : "Gagal menyimpan QRIS"); }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-[var(--brand-600)]">Konfigurasi checkout</p><h1 className="mt-1 font-serif text-4xl tracking-tight">Pengaturan pembayaran</h1><p className="mt-2 max-w-2xl text-sm text-stone-500">Kelola rekening resmi, panduan transfer manual, dan QRIS yang dilihat pelanggan.</p></div><div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-800"><CheckCircle2 size={15} />Pembayaran aktif</div></div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3"><Info icon={Landmark} label="Rekening aktif" value={String(accounts.filter((item) => item.isActive).length)} /><Info icon={ListChecks} label="Langkah panduan" value={String(instructions.filter((item) => item.isActive).length)} /><Info icon={ShieldCheck} label="Metode" value={qris?.isActive ? "Transfer + QRIS" : "Transfer manual"} /></div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <div className="flex gap-2 overflow-x-auto border-b border-stone-200 p-3">
          <button type="button" onClick={() => setActiveTab("accounts")} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold ${activeTab === "accounts" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}><Landmark size={16} />Rekening bank</button>
          <button type="button" onClick={() => setActiveTab("instructions")} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold ${activeTab === "instructions" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}><ListChecks size={16} />Instruksi transfer</button>
          <button type="button" onClick={() => setActiveTab("qris")} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold ${activeTab === "qris" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}><QrCode size={16} />QRIS</button>
        </div>

        {activeTab === "accounts" ? (
          <section className="p-5 sm:p-7" aria-labelledby="accounts-title"><div className="flex items-end justify-between gap-4"><div><h2 id="accounts-title" className="font-serif text-2xl">Rekening tujuan</h2><p className="mt-1 text-xs text-stone-500">Urutan rekening mengikuti tampilan checkout.</p></div><button type="button" onClick={openNewAccount} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-600)] px-4 text-xs font-semibold text-white"><Plus size={15} />Tambah rekening</button></div>{accountNotice ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{accountNotice}</p> : null}<div className="mt-6 grid gap-4 md:grid-cols-2">{accounts.sort((a, b) => a.displayOrder - b.displayOrder).map((account) => <article key={account.id} className="rounded-2xl border border-stone-200 p-5"><div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-xl bg-[var(--brand-50)] text-[var(--brand-600)]"><CreditCard size={19} /></span><div className="flex gap-1"><button type="button" onClick={() => openEditAccount(account)} aria-label={`Edit rekening ${account.bankName}`} className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><Edit3 size={16} /></button><button type="button" onClick={() => { setDeleteAccountId(account.id); setAccountNotice(null); }} aria-label={`Hapus rekening ${account.bankName}`} disabled={accounts.length <= 1} className="grid size-9 place-items-center rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={16} /></button></div></div><p className="mt-5 text-xs font-medium text-stone-500">{account.bankName} · Urutan {account.displayOrder}</p><p className="mt-1 font-mono text-xl font-bold tracking-wider">{account.accountNumber}</p><p className="mt-2 text-xs text-stone-500">a.n. {account.accountHolder}</p><span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${account.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>{account.isActive ? "Aktif" : "Nonaktif"}</span></article>)}</div>{accounts.length === 1 ? <p className="mt-5 flex items-center gap-2 text-xs text-amber-700"><AlertTriangle size={15} />Rekening terakhir tidak dapat dihapus.</p> : null}</section>
        ) : activeTab === "qris" ? (
          <section className="p-5 sm:p-7" aria-labelledby="qris-title"><div className="flex items-end justify-between gap-4"><div><h2 id="qris-title" className="font-serif text-2xl">QRIS pembayaran</h2><p className="mt-1 text-xs text-stone-500">Pelanggan melihat QRIS aktif sebagai opsi pembayaran di checkout.</p></div><button type="button" onClick={openQrisEditor} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-600)] px-4 text-xs font-semibold text-white"><Edit3 size={15} />Atur QRIS</button></div>{qrisNotice ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{qrisNotice}</p> : null}{qris ? <div className="mt-6 grid gap-5 md:grid-cols-[auto_1fr]"><div className="grid size-52 place-items-center rounded-2xl border border-stone-200 bg-white p-3">{qris.qrImageUrl ? <img src={qris.qrImageUrl} alt={`Kode QR ${qris.merchantName}`} className="size-full object-contain" /> : <QrCode size={80} className="text-stone-300" />}</div><div className="space-y-4"><div><p className="text-xs font-medium text-stone-500">Label & nama merchant</p><p className="mt-1 text-sm font-bold text-stone-900">{qris.label} <span className="font-semibold text-stone-500">·</span> {qris.merchantName}</p></div><div><p className="text-xs font-medium text-stone-500">Pay ID</p><p className="mt-1 font-mono text-lg font-bold tracking-wider">{qris.payId}</p></div><div><p className="text-xs font-medium text-stone-500">Instruksi</p><p className="mt-1 text-sm leading-6 text-stone-600">{qris.instruction || "—"}</p></div><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${qris.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"}`}><span className={`size-1.5 rounded-full ${qris.isActive ? "bg-emerald-500" : "bg-stone-400"}`} />{qris.isActive ? "Aktif di checkout" : "Nonaktif"}</span></div></div> : <div className="mt-6 rounded-2xl border border-dashed border-stone-300 p-10 text-center"><QrCode size={40} className="mx-auto text-stone-300" /><p className="mt-4 text-sm font-medium text-stone-700">Belum ada pengaturan QRIS</p><p className="mt-1 text-xs text-stone-500">Tambahkan QRIS agar pelanggan bisa membayar lewat scan kode.</p><button type="button" onClick={openQrisEditor} className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-600)] px-4 text-xs font-semibold text-white"><Plus size={15} />Atur QRIS</button></div>}</section>
        ) : (
          <section className="p-5 sm:p-7" aria-labelledby="instructions-title"><div className="flex items-end justify-between gap-4"><div><h2 id="instructions-title" className="font-serif text-2xl">Langkah transfer</h2><p className="mt-1 text-xs text-stone-500">Pelanggan melihat instruksi aktif sesuai urutan.</p></div><button type="button" onClick={openNewInstruction} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-600)] px-4 text-xs font-semibold text-white"><Plus size={15} />Tambah langkah</button></div>{instructionNotice ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{instructionNotice}</p> : null}<ol className="mt-6 space-y-3">{instructions.sort((a, b) => a.order - b.order).map((instruction) => <li key={instruction.id} className="flex items-start gap-4 rounded-2xl border border-stone-200 p-4"><span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${instruction.isActive ? "bg-stone-900" : "bg-stone-400"}`}>{instruction.order}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-stone-900">{instruction.title}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${instruction.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>{instruction.isActive ? "Aktif" : "Nonaktif"}</span></div><p className="mt-1 text-sm leading-6 text-stone-600">{instruction.text}</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => openEditInstruction(instruction)} aria-label={`Edit instruksi ${instruction.title}`} className="grid size-8 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><Edit3 size={15} /></button><button type="button" onClick={() => void deleteInstruction(instruction)} aria-label={`Hapus instruksi ${instruction.title}`} className="grid size-8 place-items-center rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button></div></li>)}</ol></section>
        )}
      </div>

      {accountToDelete ? <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/55 p-5"><div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex justify-between"><span className="grid size-12 place-items-center rounded-full bg-red-100 text-red-600"><Trash2 size={21} /></span><button type="button" onClick={() => setDeleteAccountId(null)} aria-label="Tutup konfirmasi hapus rekening" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><X size={18} /></button></div><h2 id="delete-account-title" className="mt-5 font-serif text-3xl">Hapus rekening?</h2><p className="mt-3 text-sm leading-6 text-stone-600">Rekening {accountToDelete.bankName} <strong>{accountToDelete.accountNumber}</strong> akan hilang dari pilihan checkout.</p><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setDeleteAccountId(null)} className="h-11 rounded-full border border-stone-300 px-5 text-sm font-semibold">Batal</button><button type="button" onClick={() => void deleteAccount(accountToDelete)} className="h-11 rounded-full bg-red-600 px-5 text-sm font-semibold text-white">Hapus rekening</button></div></div></div> : null}

      {editingAccountId !== undefined ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/55 p-5"><form onSubmit={saveAccount} role="dialog" aria-modal="true" aria-labelledby="account-form-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">Data rekening</p><h2 id="account-form-title" className="mt-1 font-serif text-3xl">{editingAccountId ? "Edit rekening" : "Tambah rekening"}</h2></div><button type="button" onClick={() => setEditingAccountId(undefined)} aria-label="Tutup form rekening" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><X size={18} /></button></div>{accountFormError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{accountFormError}</p> : null}<div className="mt-6 grid gap-5 sm:grid-cols-2"><FormField label="Nama bank"><input value={accountForm.bankName} onChange={(event) => setAccountForm((form) => ({ ...form, bankName: event.target.value }))} placeholder="BCA" className="mt-2 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm" /></FormField><FormField label="Nomor rekening"><input inputMode="numeric" value={accountForm.accountNumber} onChange={(event) => setAccountForm((form) => ({ ...form, accountNumber: event.target.value.replace(/\D/g, "") }))} placeholder="1234567890" className="mt-2 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm" /></FormField><div className="sm:col-span-2"><FormField label="Nama pemilik rekening"><input value={accountForm.accountHolder} onChange={(event) => setAccountForm((form) => ({ ...form, accountHolder: event.target.value.toUpperCase() }))} placeholder="RAF STORE INDONESIA" className="mt-2 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm" /></FormField></div><FormField label="Urutan tampil"><input type="number" min="1" value={accountForm.displayOrder} onChange={(event) => setAccountForm((form) => ({ ...form, displayOrder: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm" /></FormField><label className="flex items-center gap-3 self-end rounded-xl border border-stone-200 p-3 text-sm font-medium"><input type="checkbox" checked={accountForm.isActive} onChange={(event) => setAccountForm((form) => ({ ...form, isActive: event.target.checked }))} className="accent-[var(--brand-600)]" />Aktif di checkout</label></div><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setEditingAccountId(undefined)} className="h-11 rounded-full border border-stone-300 px-5 text-sm font-semibold">Batal</button><button type="submit" className="h-11 rounded-full bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-[var(--brand-700)]">Simpan rekening</button></div></form></div> : null}

      {editingInstructionId !== undefined ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/55 p-5"><form onSubmit={saveInstruction} role="dialog" aria-modal="true" aria-labelledby="instruction-form-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">Panduan pelanggan</p><h2 id="instruction-form-title" className="mt-1 font-serif text-3xl">{editingInstructionId ? "Edit instruksi" : "Tambah instruksi"}</h2></div><button type="button" onClick={() => setEditingInstructionId(undefined)} aria-label="Tutup editor instruksi" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><X size={18} /></button></div>{instructionError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{instructionError}</p> : null}<div className="mt-6 space-y-5"><FormField label="Judul langkah"><input value={instructionForm.title} onChange={(event) => setInstructionForm((form) => ({ ...form, title: event.target.value }))} placeholder="Contoh: Transfer sesuai total" className="mt-2 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm" /></FormField><FormField label="Teks instruksi"><textarea rows={5} value={instructionForm.text} onChange={(event) => setInstructionForm((form) => ({ ...form, text: event.target.value }))} placeholder="Tuliskan instruksi yang mudah dipahami pelanggan" className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm" /></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label="Urutan langkah"><input type="number" min="1" value={instructionForm.order} onChange={(event) => setInstructionForm((form) => ({ ...form, order: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm" /></FormField><label className="flex items-center gap-3 self-end rounded-xl border border-stone-200 p-3 text-sm font-medium"><input type="checkbox" checked={instructionForm.isActive} onChange={(event) => setInstructionForm((form) => ({ ...form, isActive: event.target.checked }))} className="accent-[var(--brand-600)]" />Tampilkan di checkout</label></div></div><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setEditingInstructionId(undefined)} className="h-11 rounded-full border border-stone-300 px-5 text-sm font-semibold">Batal</button><button type="submit" className="h-11 rounded-full bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-[var(--brand-700)]">Simpan instruksi</button></div></form></div> : null}

      {showQrisEditor ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/55 p-5"><form onSubmit={saveQris} role="dialog" aria-modal="true" aria-labelledby="qris-form-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">Pembayaran lewat scan</p><h2 id="qris-form-title" className="mt-1 font-serif text-3xl">Pengaturan QRIS</h2></div><button type="button" onClick={() => setShowQrisEditor(false)} aria-label="Tutup pengaturan QRIS" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><X size={18} /></button></div>{qrisFormError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{qrisFormError}</p> : null}<div className="mt-6 space-y-5"><FormField label="Label (opsional)"><input value={qrisForm.label} onChange={(event) => setQrisForm((form) => ({ ...form, label: event.target.value }))} placeholder="QRIS" className="mt-2 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm" /></FormField><FormField label="Nama merchant"><input value={qrisForm.merchantName} onChange={(event) => setQrisForm((form) => ({ ...form, merchantName: event.target.value.toUpperCase() }))} placeholder="JASMINE SHOP PREMIUM PRODUCT" className="mt-2 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm" /></FormField><FormField label="Pay ID"><input value={qrisForm.payId} onChange={(event) => setQrisForm((form) => ({ ...form, payId: event.target.value }))} placeholder="JA-12345678901" className="mt-2 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm" /></FormField><AdminImageUpload value={qrisForm.qrImageUrl} onChange={(url) => setQrisForm((form) => ({ ...form, qrImageUrl: url }))} folder="payment" label="Gambar QR" /><FormField label="Instruksi untuk pelanggan"><textarea rows={4} value={qrisForm.instruction} onChange={(event) => setQrisForm((form) => ({ ...form, instruction: event.target.value }))} placeholder="Contoh: Scan QR lalu bayar sesuai total. Simpan bukti untuk verifikasi." className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm" /></FormField><label className="flex items-center gap-3 select-none"><input type="checkbox" checked={qrisForm.isActive} onChange={(event) => setQrisForm((form) => ({ ...form, isActive: event.target.checked }))} className="size-4 accent-stone-900" /><span className="text-sm font-semibold text-stone-800">Tampilkan QRIS sebagai opsi pembayaran</span></label></div><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setShowQrisEditor(false)} className="h-11 rounded-full border border-stone-300 px-5 text-sm font-semibold">Batal</button><button type="submit" className="h-11 rounded-full bg-[var(--brand-600)] px-6 text-sm font-semibold text-white hover:bg-[var(--brand-700)]">Simpan QRIS</button></div></form></div> : null}
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Landmark; label: string; value: string }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5"><span className="grid size-10 place-items-center rounded-xl bg-stone-100 text-stone-700"><Icon size={18} /></span><div><p className="text-xs text-stone-500">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></div></div>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm font-semibold text-stone-800">{label}{children}</label>;
}
