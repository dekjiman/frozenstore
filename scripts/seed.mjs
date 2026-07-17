import { randomBytes, scryptSync } from "node:crypto";
import Database from "better-sqlite3";

const db = new Database(process.env.DATABASE_URL ?? "./data/raf-store.db");
db.pragma("foreign_keys = ON");
const now = Date.now();
const products = [
  ["product-001", "RF-TS-001", "Everyday Canvas Tote", "Tas & Aksesori", "Tas kanvas ringan dengan ruang lega untuk kebutuhan harian.", 189000, 14, "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85"],
  ["product-002", "RF-HM-002", "Classic Ceramic Mug", "Perlengkapan Rumah", "Mug keramik berlapis glasir dengan bentuk klasik yang nyaman digenggam.", 89000, 28, "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85"],
  ["product-003", "RF-DC-003", "Minimal Desk Lamp", "Dekorasi", "Lampu meja minimalis untuk pencahayaan hangat di ruang kerja.", 329000, 7, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"],
  ["product-004", "RF-ST-004", "Linen Daily Notebook", "Alat Tulis", "Buku catatan bersampul linen untuk rencana dan ide setiap hari.", 69000, 32, "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85"],
  ["product-005", "RF-WL-005", "Wooden Aroma Diffuser", "Wellness", "Diffuser beraksen kayu untuk menyebarkan aroma dengan lembut.", 279000, 9, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85"],
  ["product-006", "RF-DR-006", "Insulated Travel Bottle", "Perlengkapan Minum", "Botol minum berinsulasi yang menjaga suhu minuman lebih lama.", 219000, 18, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85"],
  ["product-007", "RF-HM-007", "Soft Cotton Throw", "Perlengkapan Rumah", "Selimut katun lembut untuk menambah kenyamanan di ruang santai.", 249000, 11, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85"],
  ["product-008", "RF-WL-008", "Scented Soy Candle", "Wellness", "Lilin kedelai beraroma lembut untuk suasana rumah yang menenangkan.", 129000, 21, "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85"],
];

const insertProduct = db.prepare("INSERT OR IGNORE INTO products (id, sku, name, category, description, price, current_stock, image_url, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)");
const insertAccount = db.prepare("INSERT OR IGNORE INTO rekening_toko (id, bank_name, account_number, account_holder_name, instruction, is_active, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)");
const insertInstruction = db.prepare("INSERT OR IGNORE INTO instruksi_transfer (id, title, instruction, step_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)");

function passwordHash(password) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

db.transaction(() => {
  for (const product of products) insertProduct.run(...product, now, now);
  db.prepare("INSERT OR IGNORE INTO users (id, role, name, email, email_verified, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)")
    .run("admin-raf-store", "admin", "Admin Raf Store", "admin@rafstore.id", "081111111111", passwordHash("Admin#Raf2026"), now, now);
  db.prepare("INSERT OR IGNORE INTO users (id, role, name, email, email_verified, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)")
    .run("customer-rafi", "customer", "Rafi Ahmad", "rafi.ahmad@example.com", "081234567890", passwordHash("RafStore#2026"), now, now);
  insertAccount.run("bank-bca", "BCA", "1234567890", "RAF STORE INDONESIA", "Transfer sesuai total pembayaran.", 1, now, now);
  insertAccount.run("bank-mandiri", "Bank Mandiri", "9876543210012", "RAF STORE INDONESIA", "Cantumkan nomor pesanan pada berita transfer.", 2, now, now);
  const instructions = [
    ["instruction-1", "Transfer sesuai total", "Transfer tepat sesuai total pembayaran yang tertera.", 1],
    ["instruction-2", "Gunakan rekening resmi", "Pastikan rekening tujuan atas nama RAF STORE INDONESIA.", 2],
    ["instruction-3", "Simpan bukti", "Simpan bukti transfer lalu unggah pada langkah konfirmasi.", 3],
    ["instruction-4", "Tunggu verifikasi", "Pesanan diproses setelah pembayaran diverifikasi admin.", 4],
  ];
  for (const item of instructions) insertInstruction.run(...item, now, now);
})();

console.log(`Seed selesai: ${products.length} produk, 2 akun demo, 2 rekening, 4 instruksi.`);
db.close();
