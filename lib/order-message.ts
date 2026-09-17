const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type OrderMessageItem = {
  productName: string;
  quantity: number;
};

type BuildOrderWhatsAppMessageInput = {
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string | null | undefined;
  notes: string | null | undefined;
  methodLabel: string;
  items: OrderMessageItem[];
  subtotal: number;
  shippingAmount: number | null;
  totalAmount: number;
  adminOrderUrl?: string;
};

export function buildOrderWhatsAppMessage(
  input: BuildOrderWhatsAppMessageInput,
  variant: "order_created" | "payment_received" = "order_created",
) {
  const address = `${input.address}, ${input.city}, ${input.province}${input.postalCode ? ` ${input.postalCode}` : ""}`;
  const isPaymentReceived = variant === "payment_received";
  const lines: string[] = [
    isPaymentReceived
      ? `*Bukti Pembayaran ${input.orderNumber}*`
      : `*Pesanan Baru ${input.orderNumber}*`,
    "",
    isPaymentReceived
      ? "Halo, pelanggan sudah mengunggah bukti pembayaran untuk pesanan berikut. Mohon segera diverifikasi."
      : "Halo, ada pesanan baru di Jasmine Shop Premium Product.",
    "",
    "*Data Penerima*",
    `Nama: ${input.recipientName}`,
    `No. WA: ${input.recipientPhone}`,
    `Alamat: ${address}`,
  ];
  if (input.notes) lines.push(`Catatan: ${input.notes}`);
  lines.push(
    "",
    `*Metode pengiriman:* ${input.methodLabel}`,
    "*Pesanan:*",
  );
  input.items.forEach((item) => lines.push(`- ${item.productName} x${item.quantity}`));
  lines.push(
    "",
    `Subtotal: ${rupiahFormatter.format(input.subtotal)}`,
    input.shippingAmount === null
      ? "Pengiriman: Dikonfirmasi admin"
      : `Pengiriman: ${rupiahFormatter.format(input.shippingAmount)}`,
    `*Total: ${rupiahFormatter.format(input.totalAmount)}*`,
  );
  if (isPaymentReceived) lines.push("", "Status: Menunggu Verifikasi.");
  if (input.adminOrderUrl) lines.push("", `Kelola pesanan: ${input.adminOrderUrl}`);
  return lines.join("\n");
}