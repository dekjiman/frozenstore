export const mockCustomer = {
  id: "customer-001",
  name: "Rafi Ahmad",
  email: "rafi.ahmad@example.com",
  phone: "0812-3456-7890",
  memberSince: "12 Januari 2026",
  initials: "RA",
};

export const mockOrders = [
  {
    id: "RAF-20260716-0042",
    date: "16 Juli 2026",
    itemCount: 4,
    total: 606_000,
    paymentStatus: "Menunggu verifikasi",
    orderStatus: "Menunggu pembayaran",
    statusTone: "amber" as const,
    productNames: ["Everyday Canvas Tote", "Classic Ceramic Mug", "Insulated Travel Bottle"],
  },
  {
    id: "RAF-20260622-0031",
    date: "22 Juni 2026",
    itemCount: 2,
    total: 398_000,
    paymentStatus: "Lunas",
    orderStatus: "Sedang dikirim",
    statusTone: "blue" as const,
    productNames: ["Classic Ceramic Mug", "Minimal Desk Lamp"],
  },
  {
    id: "RAF-20260503-0018",
    date: "3 Mei 2026",
    itemCount: 1,
    total: 209_000,
    paymentStatus: "Lunas",
    orderStatus: "Selesai",
    statusTone: "emerald" as const,
    productNames: ["Everyday Canvas Tote"],
  },
];
