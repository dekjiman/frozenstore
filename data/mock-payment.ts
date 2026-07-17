export const mockBankAccounts = [
  {
    id: "bca",
    bankName: "BCA",
    accountNumber: "1234567890",
    accountHolder: "RAF STORE INDONESIA",
  },
  {
    id: "mandiri",
    bankName: "Bank Mandiri",
    accountNumber: "9876543210012",
    accountHolder: "RAF STORE INDONESIA",
  },
] as const;

export const mockPaymentInstructions = [
  "Transfer tepat sesuai total pembayaran hingga tiga digit terakhir.",
  "Gunakan rekening atas nama RAF STORE INDONESIA yang tercantum di halaman ini.",
  "Simpan bukti transfer, lalu unggah pada langkah konfirmasi pembayaran.",
  "Pesanan diproses setelah pembayaran diverifikasi oleh admin Raf Store.",
];
