"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Send,
  PhoneCall,
  Award,
  Zap,
  X,
  User,
  Store,
  MapPin,
  MessageCircle,
} from "lucide-react";

interface ResellerPartnershipGuideProps {
  initialWhatsapp?: string;
}

type ResellerPackage = {
  id: string;
  slug: string;
  title: string;
  planLabel: string;
  description: string;
  minOrder: number;
  discountMinPercent: number;
  discountMaxPercent: number;
  marginMin: number;
  marginMax: number;
  freeVariantMix: boolean;
  isRecommended: boolean;
  simulateDailyPcs: number | null;
  simulateProfitPerPcs: number | null;
  sortOrder: number;
  isActive: boolean;
};

const FALLBACK_PACKAGES: ResellerPackage[] = [
  {
    id: "fallback-starter",
    slug: "starter",
    title: "Starter (Pemula)",
    planLabel: "Paket Modal Pemula",
    description: "Langkah awal mencoba bisnis frozen food.",
    minOrder: 10,
    discountMinPercent: 10,
    discountMaxPercent: 15,
    marginMin: 5000,
    marginMax: 7000,
    freeVariantMix: true,
    isRecommended: false,
    simulateDailyPcs: null,
    simulateProfitPerPcs: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "fallback-silver",
    slug: "silver",
    title: "Silver (Reseller)",
    planLabel: "Reseller Reguler",
    description: "Keseimbangan ideal modal & margin tinggi.",
    minOrder: 30,
    discountMinPercent: 20,
    discountMaxPercent: 25,
    marginMin: 8000,
    marginMax: 10000,
    freeVariantMix: true,
    isRecommended: true,
    simulateDailyPcs: 10,
    simulateProfitPerPcs: 9000,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "fallback-gold",
    slug: "gold",
    title: "Gold (Agen Utama)",
    planLabel: "Agen / Distributor Area",
    description: "Margin maksimal & proteksi wilayah khusus.",
    minOrder: 100,
    discountMinPercent: 30,
    discountMaxPercent: 35,
    marginMin: 12000,
    marginMax: 15000,
    freeVariantMix: true,
    isRecommended: false,
    simulateDailyPcs: 25,
    simulateProfitPerPcs: 14000,
    sortOrder: 3,
    isActive: true,
  },
];

function shortName(title: string): string {
  return title.replace(/\s*\(.*\)$/, "").trim();
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function ResellerPartnershipGuide({ initialWhatsapp }: ResellerPartnershipGuideProps) {
  const [waNumber, setWaNumber] = useState(initialWhatsapp || "");
  const [packages, setPackages] = useState<ResellerPackage[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    namaLengkap: "",
    namaToko: "",
    kota: "",
    paket: "",
    noWa: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!initialWhatsapp) {
      fetch("/api/site-settings")
        .then((res) => res.json())
        .then((payload) => {
          if (payload?.data?.whatsappNumber) {
            setWaNumber(payload.data.whatsappNumber);
          }
        })
        .catch(() => {});
    }
  }, [initialWhatsapp]);

  useEffect(() => {
    fetch("/api/reseller/packages")
      .then((res) => res.json())
      .then((payload) => {
        if (Array.isArray(payload?.data)) {
          setPackages(payload.data);
        }
      })
      .catch(() => {});
  }, []);

  const displayPackages = packages && packages.length > 0 ? packages : FALLBACK_PACKAGES;
  const waPackagesText = displayPackages.map((p) => shortName(p.title)).join(" / ");

  const getWaFormatted = () => {
    const raw = waNumber || "081234567890";
    const digits = raw.replace(/\D/g, "");
    return digits.startsWith("0") ? `62${digits.slice(1)}` : digits || "6281234567890";
  };

const handleRegisterWA = (paketName?: string) => {
    setForm((prev) => ({
      ...prev,
      paket: paketName ? shortName(paketName) : "",
    }));
    setFormError("");
    setShowForm(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const paketChoice = form.paket || waPackagesText;
    if (!form.namaLengkap.trim() || !form.namaToko.trim() || !form.kota.trim()) {
      setFormError("Lengkapi dulu Nama Lengkap, Nama Toko, dan Kota/Kecamatan ya.");
      return;
    }
    const waDigits = form.noWa.replace(/\D/g, "");
    if (waDigits.length < 9) {
      setFormError("Nomor WhatsApp belum valid. Contoh: 081234567890.");
      return;
    }
    const waInternational = waDigits.startsWith("0") ? `62${waDigits.slice(1)}` : waDigits;
    const message = `Halo Admin, saya ingin mendaftar Program Kemitraan Reseller/Agen:

Form Pendaftaran Mitra
----------------------
Nama Lengkap : ${form.namaLengkap.trim()}
Nama Toko    : ${form.namaToko.trim()}
Kota / Kec   : ${form.kota.trim()}
Pilihan Paket: [${paketChoice}]
No. WhatsApp : ${form.noWa.trim()}`;

    const encodedText = encodeURIComponent(message);
    const targetDigits = getWaFormatted();
    window.open(`https://wa.me/${targetDigits}?text=${encodedText}`, "_blank");
    setShowForm(false);
    setForm({ namaLengkap: "", namaToko: "", kota: "", paket: "", noWa: "" });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const simulationPackages = displayPackages.filter(
    (p) => p.simulateDailyPcs !== null && p.simulateProfitPerPcs !== null,
  );

  return (
    <div className="mb-10 rounded-3xl border border-stone-200/80 bg-white p-5 sm:p-8 shadow-sm">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-900,#1c1917)] via-[var(--brand-800,#292524)] to-[var(--brand-950,#0c0a09)] p-6 text-white sm:p-10 shadow-md">
        <div className="absolute -right-10 -bottom-10 size-60 rounded-full bg-[var(--brand-600,#d97706)] opacity-20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md mb-4 border border-amber-400/30">
            <Sparkles className="size-3.5 text-amber-400" />
            Program Kemitraan Resmi
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            🤝 Panduan & Penawaran Kemitraan <br className="hidden sm:inline" />
            <span className="text-amber-400">Reseller & Agen Frozen Food</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-300 leading-relaxed">
            Selamat datang di Program Kemitraan Resmi! Kami mengundang Anda untuk bergabung menjadi mitra bisnis (*Reseller* & *Agen*) produk kuliner dan *frozen food* berkualitas premium.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleRegisterWA()}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950 shadow-md hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <PhoneCall className="size-4" />
              Daftar Mitra via WhatsApp
            </button>
            <button
              onClick={() => scrollToSection("tingkatan-kemitraan")}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 backdrop-blur-sm transition-colors border border-white/10 cursor-pointer"
            >
              <PackageCheck className="size-4" />
              Lihat Paket Modal
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="mt-6 border-b border-stone-200 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2.5">
          📋 Daftar Isi Navigasi
        </span>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-stone-700">
          <button onClick={() => scrollToSection("keunggulan-produk")} className="rounded-lg bg-stone-100 px-3 py-1.5 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer">
            1. Keunggulan Produk
          </button>
          <button onClick={() => scrollToSection("tingkatan-kemitraan")} className="rounded-lg bg-stone-100 px-3 py-1.5 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer">
            2. Tingkatan & Margin
          </button>
          <button onClick={() => scrollToSection("simulasi-penghasilan")} className="rounded-lg bg-stone-100 px-3 py-1.5 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer">
            3. Simulasi Profit
          </button>
          <button onClick={() => scrollToSection("fasilitas-dukungan")} className="rounded-lg bg-stone-100 px-3 py-1.5 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer">
            4. Fasilitas Penjualan
          </button>
          <button onClick={() => scrollToSection("syarat-ketentuan-het")} className="rounded-lg bg-stone-100 px-3 py-1.5 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer">
            5. S&K Ketat (HET)
          </button>
          <button onClick={() => scrollToSection("cara-mendaftar")} className="rounded-lg bg-amber-100 text-amber-900 px-3 py-1.5 hover:bg-amber-200 transition-colors cursor-pointer">
            6. Cara Mendaftar
          </button>
        </div>
      </div>

      {/* 🌟 1. Keunggulan Produk Kami */}
      <section id="keunggulan-produk" className="mt-8 scroll-mt-24">
        <div className="flex items-center gap-2 mb-4">
          <Award className="size-5 text-amber-600" />
          <h3 className="font-serif text-xl font-bold text-stone-900">🌟 Keunggulan Produk Kami</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 transition-all hover:bg-white hover:shadow-sm">
            <div className="mb-2 text-2xl">🥩</div>
            <h4 className="font-semibold text-stone-900 text-sm">Bahan Berkualitas & Higienis</h4>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              Menggunakan bahan baku pilihan dengan proses olahan higienis (*vacuum pack*, pengemasan rapi, tanpa pengawet berbahaya).
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 transition-all hover:bg-white hover:shadow-sm">
            <div className="mb-2 text-2xl">👨‍👩‍👧</div>
            <h4 className="font-semibold text-stone-900 text-sm">Rasa Otentik & Praktis</h4>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              Siap saji / siap goreng, sangat disukai oleh keluarga modern, pekerja sibuk, dan anak-anak.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 transition-all hover:bg-white hover:shadow-sm">
            <div className="mb-2 text-2xl">❄️</div>
            <h4 className="font-semibold text-stone-900 text-sm">Daya Tahan Tinggi</h4>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              Awet disimpan dalam *freezer* / suhu dingin sehingga meminimalkan risiko kerugian barang rusak.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 transition-all hover:bg-white hover:shadow-sm">
            <div className="mb-2 text-2xl">⚡</div>
            <h4 className="font-semibold text-stone-900 text-sm">Fast-Moving (Repeat Order)</h4>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              Produk kebutuhan harian (lauk pauk & camilan) yang memicu pembelian berulang (*repeat order*) rutin.
            </p>
          </div>
        </div>
      </section>

      {/* 💎 2. Tingkatan Kemitraan & Margin Keuntungan */}
      <section id="tingkatan-kemitraan" className="mt-12 scroll-mt-24">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="size-5 text-amber-600" />
          <h3 className="font-serif text-xl font-bold text-stone-900">💎 Tingkatan Kemitraan & Margin Keuntungan</h3>
        </div>
        <p className="text-xs text-stone-500 mb-6">
          Kami menyediakan tingkatan paket modal yang dapat disesuaikan dengan kemampuan bisnis Anda:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayPackages.map((pkg, idx) => {
            const recommended = pkg.isRecommended;
            const first = !recommended && idx === 0;
            const cardClass = recommended
              ? "rounded-2xl border-2 border-amber-500 bg-white p-6 shadow-md relative flex flex-col justify-between"
              : first
                ? "rounded-2xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-colors"
                : "rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-50/40 via-white to-white p-6 shadow-sm flex flex-col justify-between";
            const badgeClass = recommended
              ? "inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold"
              : first
                ? "inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold"
                : "inline-block px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 text-xs font-semibold";
            const buttonClass = recommended
              ? "w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              : first
                ? "w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                : "w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer";
            const dividerColor = recommended ? "border-stone-100" : first ? "border-stone-100" : "border-amber-100";

            return (
              <div key={pkg.id} className={cardClass}>
                {recommended ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Paling Laris (Rekomendasi)
                  </div>
                ) : null}
                <div>
                  <div className={badgeClass}>{pkg.planLabel || "Paket"}</div>
                  <h4 className="text-xl font-bold text-stone-900 mt-2">{pkg.title}</h4>
                  <p className="text-xs text-stone-500 mt-1">{pkg.description}</p>

                  <div className={`my-5 space-y-2.5 border-t border-b ${dividerColor} py-4 text-xs`}>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Min. Order:</span>
                      <span className="font-semibold text-stone-900">{pkg.minOrder} pcs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Diskon dari HET:</span>
                      <span className="font-bold text-emerald-600 text-sm">{pkg.discountMinPercent}% – {pkg.discountMaxPercent}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Potensi Margin / Pcs:</span>
                      <span className="font-semibold text-stone-900">{formatRupiah(pkg.marginMin)} – {formatRupiah(pkg.marginMax)}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-700 font-medium">
                      <span>Bebas Campur Varian:</span>
                      <span>{pkg.freeVariantMix ? "✅ Ya" : "❌ Tidak"}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRegisterWA(shortName(pkg.title))}
                  className={buttonClass}
                >
                  <Send className="size-3.5" /> Pilih Paket {shortName(pkg.title)}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl bg-stone-100/70 p-3 text-[11px] text-stone-600">
          💡 <strong>Catatan:</strong> HET = <em>Harga Eceran Tertinggi</em> (Harga jual resmi yang berlaku ke konsumen akhir).
        </div>
      </section>

      {/* 📊 3. Simulasi Potensi Penghasilan */}
      {simulationPackages.length > 0 ? (
        <section id="simulasi-penghasilan" className="mt-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-5 text-emerald-600" />
            <h3 className="font-serif text-xl font-bold text-stone-900">📊 Simulasi Potensi Penghasilan</h3>
          </div>
          <p className="text-xs text-stone-500 mb-6">
            Berikut perkiraan keuntungan bersih bulanan berdasarkan tingkat kemitraan Anda:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {simulationPackages.map((pkg, idx) => {
              const daily = pkg.simulateDailyPcs ?? 0;
              const profit = pkg.simulateProfitPerPcs ?? 0;
              const monthly = daily * 30;
              const total = monthly * profit;
              const recommended = pkg.isRecommended;
              const cardClass = recommended
                ? "rounded-2xl border border-amber-200 bg-amber-50/30 p-6 shadow-sm"
                : `rounded-2xl border border-stone-200 bg-white p-6 shadow-sm ${idx % 2 === 1 ? "border-amber-200 bg-amber-50/30" : ""}`;

              return (
                <div key={pkg.id} className={cardClass}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-base">{idx + 1}. Paket {shortName(pkg.title)}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${recommended ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-800"}`}>
                      {daily} pcs / hari
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-stone-600">
                    <li>• Rata-rata Penjualan: {daily} pcs / hari ({monthly} pcs / bulan)</li>
                    <li>• Keuntungan Bersih per Pcs: {formatRupiah(profit)}</li>
                  </ul>
                  <div className={`mt-4 pt-3 border-t flex justify-between items-baseline ${recommended ? "border-amber-100" : "border-stone-100"}`}>
                    <span className="text-xs text-stone-500 font-medium">Total Keuntungan Bulanan:</span>
                    <span className={`text-xl font-extrabold ${recommended ? "text-amber-700" : "text-emerald-600"}`}>
                      {formatRupiah(total)} <span className="text-xs font-normal text-stone-500">/bulan</span>
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-stone-400 bg-stone-50 p-2 rounded-lg font-mono">
                    Formula: {monthly} pcs x {formatRupiah(profit)} = {formatRupiah(total)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* 🎁 4. Fasilitas & Dukungan Penjualan */}
      <section id="fasilitas-dukungan" className="mt-12 scroll-mt-24">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="size-5 text-purple-600" />
          <h3 className="font-serif text-xl font-bold text-stone-900">🎁 Fasilitas & Dukungan Penjualan</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm flex items-start gap-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-700 font-bold text-sm">
              1
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 text-sm">Marketing Kit Siap Pakai</h4>
              <ul className="mt-1.5 space-y-1 text-xs text-stone-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  Akses Google Drive berisi foto produk *high-resolution* tanpa watermark.
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  Video promosi durasi 9:16 siap posting (TikTok, IG Reels, WA Story).
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  Draf teks jualan / *caption* promosi yang sudah teruji.
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm flex items-start gap-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm">
              2
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 text-sm">Layanan Dropship</h4>
              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                <strong>(Khusus Paket Starter & Silver):</strong> Anda fokus jualan, kami yang bantu kirimkan pesanan langsung ke lokasi pembeli atas nama Toko Anda.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm flex items-start gap-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
              3
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 text-sm">Garansi Kualitas & Pengiriman</h4>
              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                Garansi ganti baru 100% jika produk ditemukan bocor, rusak, atau basi akibat kesalahan teknis saat pengiriman tiba di lokasi.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm flex items-start gap-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 font-bold text-sm">
              4
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 text-sm">Proteksi Wilayah</h4>
              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                <strong>(Khusus Paket Gold):</strong> Agen Gold mendapatkan prioritas kuota alokasi stok serta pembatasan jumlah Agen resmi di tingkat kecamatan/kota setempat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📌 5. Syarat & Ketentuan Ketat (HET) */}
      <section id="syarat-ketentuan-het" className="mt-12 scroll-mt-24">
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-serif text-lg font-bold text-amber-950">📌 Syarat & Ketentuan Harga (HET)</h3>
          </div>
          <p className="text-xs text-amber-900/80 mb-4">
            Demi menjaga iklim usaha yang sehat, adil, dan berkelanjutan bagi seluruh mitra:
          </p>

          <ol className="space-y-2 text-xs text-amber-900 list-decimal pl-4">
            <li>
              <strong>Kepatuhan HET (Harga Eceran Tertinggi):</strong> Reseller/Agen <strong>dilarang keras</strong> merusak harga pasar dengan menjual produk di bawah HET yang telah ditetapkan oleh pusat.
            </li>
            <li>
              <strong>Sanksi Pelanggaran Harga:</strong> Kebijakan *banting harga* akan berakibat pada pencabutan status kemitraan seketika dan penghentian pasokan barang (*blacklisting*).
            </li>
            <li>
              <strong>Standar Penyimpanan:</strong> Produk tipe *frozen food* wajib disimpan di dalam *freezer* dengan suhu optimal (minimal -18°C) untuk menjaga kualitas dan kesegaran produk.
            </li>
          </ol>
        </div>
      </section>

      {/* 🚀 6. Cara Mendaftar */}
      <section id="cara-mendaftar" className="mt-12 scroll-mt-24">
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 p-6 sm:p-10 text-stone-950 shadow-md">
          <div className="max-w-2xl">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              🚀 Cara Mendaftar & Mulai Berpenghasilan
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-stone-900 font-medium">
              Ingin langsung mulai berpenghasilan dari rumah? Langkah pendaftarannya sangat mudah:
            </p>

            <div className="mt-5 space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 bg-white/30 p-3 rounded-xl backdrop-blur-xs">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-stone-950 text-white font-bold text-xs">1</span>
                <div>
                  <strong>Pilih Paket:</strong> Tentukan tingkat kemitraan yang Anda inginkan ({waPackagesText}).
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/30 p-3 rounded-xl backdrop-blur-xs">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-stone-950 text-white font-bold text-xs">2</span>
                <div>
                  <strong>Hubungi Tim Admin:</strong> Kirimkan pesan pendaftaran langsung via WhatsApp dengan format resmi yang disediakan.
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleRegisterWA()}
                className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <PhoneCall className="size-4 text-amber-400" />
                Hubungi Admin via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Form Pendaftaran Mitra (modal) */}
      {showForm ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/55 p-5 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setFormError("");
            }
          }}
        >
          <form
            onSubmit={handleSubmitForm}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mitra-form-title"
            className="my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Program Kemitraan Resmi</p>
                <h2 id="mitra-form-title" className="mt-1 font-serif text-2xl font-bold text-stone-900">
                  Form Pendaftaran Mitra
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Isi data di bawah ini, lalu pesan akan terkirim otomatis ke WhatsApp admin kami.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
                aria-label="Tutup form pendaftaran"
                className="grid size-9 shrink-0 place-items-center rounded-full text-stone-500 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            {formError ? (
              <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </p>
            ) : null}

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="mitra-nama" className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                  <User className="size-3.5 text-amber-600" />
                  Nama Lengkap
                </label>
                <input
                  id="mitra-nama"
                  value={form.namaLengkap}
                  onChange={(e) => setForm((f) => ({ ...f, namaLengkap: e.target.value }))}
                  placeholder="Contoh: Budi Santoso"
                  className="mt-1.5 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label htmlFor="mitra-toko" className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                  <Store className="size-3.5 text-amber-600" />
                  Nama Toko
                </label>
                <input
                  id="mitra-toko"
                  value={form.namaToko}
                  onChange={(e) => setForm((f) => ({ ...f, namaToko: e.target.value }))}
                  placeholder="Contoh: Toko Segar Makmur"
                  className="mt-1.5 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label htmlFor="mitra-kota" className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                  <MapPin className="size-3.5 text-amber-600" />
                  Kota / Kecamatan
                </label>
                <input
                  id="mitra-kota"
                  value={form.kota}
                  onChange={(e) => setForm((f) => ({ ...f, kota: e.target.value }))}
                  placeholder="Contoh: Bekasi / Medan Satria"
                  className="mt-1.5 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label htmlFor="mitra-paket" className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                  <PackageCheck className="size-3.5 text-amber-600" />
                  Pilihan Paket
                </label>
                <select
                  id="mitra-paket"
                  value={form.paket}
                  onChange={(e) => setForm((f) => ({ ...f, paket: e.target.value }))}
                  className="mt-1.5 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="">Pilih paket…</option>
                  {displayPackages.map((p) => (
                    <option key={p.id} value={shortName(p.title)}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mitra-wa" className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                  <MessageCircle className="size-3.5 text-amber-600" />
                  No. WhatsApp
                </label>
                <input
                  id="mitra-wa"
                  inputMode="tel"
                  value={form.noWa}
                  onChange={(e) => setForm((f) => ({ ...f, noWa: e.target.value.replace(/[^\d+\s-]/g, "") }))}
                  placeholder="Contoh: 081234567890"
                  className="mt-1.5 h-11 w-full rounded-xl border border-stone-300 px-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              <Send className="size-4" />
              Kirim Pendaftaran via WhatsApp
            </button>
            <p className="mt-3 text-center text-[11px] text-stone-400">
              Dengan mengirim, data Anda akan dibuka di WhatsApp untuk mengirim pesan pendaftaran.
            </p>
          </form>
        </div>
      ) : null}
    </div>
  );
}