import { getSiteSettings } from "@/lib/queries/site-settings";
import { normalizeWaNumber } from "@/lib/wa";

export { normalizeWaNumber } from "@/lib/wa";

export async function sendWhatsApp(input: { number: string; text: string }): Promise<boolean> {
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME?.trim();
  const baseUrl = process.env.EVOLUTION_BASE_URL?.trim();

  if (!apiKey || apiKey === "default" || !instanceName || !baseUrl) {
    console.warn("[whatsapp-notify] EVOLUTION_* belum dikonfigurasi, WhatsApp tidak terkirim.");
    return false;
  }

  const number = normalizeWaNumber(input.number);
  if (!number) {
    console.warn("[whatsapp-notify] Nomor WhatsApp tidak valid, pesan tidak terkirim.");
    return false;
  }

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/message/sendText/${encodeURIComponent(instanceName)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify({ number, text: input.text }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error(`[whatsapp-notify] Gagal kirim WhatsApp (${response.status}): ${detail.slice(0, 500)}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[whatsapp-notify] Gagal kirim WhatsApp:", error);
    return false;
  }
}

export async function sendWhatsAppToAdmin(input: { text: string }): Promise<void> {
  const number = (await getSiteSettings())?.whatsappNumber;
  if (!number) {
    console.warn("[whatsapp-notify] whatsappNumber belum diatur, notifikasi WhatsApp dilewati.");
    return;
  }
  await sendWhatsApp({ number, text: input.text });
}