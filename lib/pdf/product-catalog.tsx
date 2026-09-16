import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CatalogExportProductDTO } from "@/lib/queries/catalog";

const FALLBACK_STORE_NAME = "Jasmine Shop Premium Products";
const THUMB_WIDTH = 520;
const THUMB_HEIGHT = 300;
const LOGO_WIDTH = 140;

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#1c1917",
  },
  header: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#7c2d12",
  },
  brand: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7c2d12",
  },
  title: {
    fontSize: 13,
    marginTop: 4,
    color: "#1c1917",
  },
  meta: {
    fontSize: 8,
    color: "#57534e",
    marginTop: 2,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  summaryTag: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#7c2d12",
    backgroundColor: "#ffedd5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 8.5,
    color: "#57534e",
  },
  categorySection: {
    marginTop: 6,
    marginBottom: 6,
  },
  categoryHead: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#a8a29e",
    marginBottom: 8,
    paddingBottom: 4,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1c1917",
    flex: 1,
  },
  categoryCount: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#78716c",
    backgroundColor: "#f5f5f4",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 10,
  },
  card: {
    width: 173,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e7e5e4",
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  cardImageBox: {
    width: 173,
    height: 100,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: "#f5f5f4",
  },
  cardImage: {
    width: 173,
    height: 100,
    objectFit: "cover",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  cardBody: {
    paddingHorizontal: 6,
    paddingTop: 5,
    paddingBottom: 7,
  },
  cardName: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#1c1917",
    lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: 6.8,
    color: "#78716c",
    marginTop: 2,
    lineHeight: 1.35,
  },
  cardPrice: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#7c2d12",
    marginTop: 4,
  },
  contactSection: {
    marginTop: 22,
    padding: 10,
    borderWidth: 1,
    borderColor: "#d6d3d1",
    borderRadius: 4,
    backgroundColor: "#fafaf9",
  },
  contactHead: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  contactLogo: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#e7e5e4",
  },
  contactBrandWrap: {
    marginLeft: 8,
    flex: 1,
  },
  contactBrand: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#7c2d12",
  },
  contactLine: {
    fontSize: 8.5,
    color: "#44403c",
    marginTop: 2,
  },
  contactNote: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#1c1917",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#d6d3d1",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 7,
    color: "#78716c",
    borderTopWidth: 0.5,
    borderTopColor: "#d6d3d1",
    paddingTop: 4,
  },
});

export type CatalogPdfSettings = {
  brandName: string;
  logoUri: string | null;
  address: string | null;
  operatingHours: string | null;
  whatsappNumber: string | null;
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function truncate(text: string, max = 95): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean || "—";
  return `${clean.slice(0, max).trimEnd()}…`;
}

function formatWhatsapp(value: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
  return local.replace(/(\d{4})(?=\d)/g, "$1-");
}

function resolveImageOnDisk(imageUrl: string): string | null {
  if (!imageUrl) return null;
  try {
    const filePath = path.join(process.cwd(), "public", imageUrl);
    const data = fs.readFileSync(filePath);
    if (data.length < 512) return null;
    return filePath;
  } catch {
    return null;
  }
}

export async function resolveCatalogImages(
  products: CatalogExportProductDTO[],
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  await Promise.all(
    products.map(async (product) => {
      const filePath = resolveImageOnDisk(product.imageUrl);
      if (!filePath) {
        result.set(product.id, null);
        return;
      }
      try {
        const thumb = await sharp(filePath)
          .rotate()
          .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "cover", position: "centre" })
          .jpeg({ quality: 80 })
          .toBuffer();
        result.set(product.id, `data:image/jpeg;base64,${thumb.toString("base64")}`);
      } catch {
        result.set(product.id, null);
      }
    }),
  );
  return result;
}

export async function resolveLogoImage(logoUrl: string | null): Promise<string | null> {
  const filePath = resolveImageOnDisk(logoUrl ?? "");
  if (!filePath) return null;
  try {
    const thumb = await sharp(filePath)
      .rotate()
      .resize({ width: LOGO_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return `data:image/jpeg;base64,${thumb.toString("base64")}`;
  } catch {
    return null;
  }
}

function ProductCard({
  product,
  imageUri,
}: {
  product: CatalogExportProductDTO;
  imageUri: string | null;
}) {
  return (
    <View wrap={false} style={styles.card}>
      {imageUri ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={imageUri} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImageBox} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{product.name}</Text>
        <Text style={styles.cardDesc}>{truncate(product.shortDescription)}</Text>
        <Text style={styles.cardPrice}>{formatPrice(product.price)}</Text>
      </View>
    </View>
  );
}

type CategoryGroup = { label: string; items: CatalogExportProductDTO[] };

function groupByCategory(products: CatalogExportProductDTO[]): CategoryGroup[] {
  const groups = new Map<string, CatalogExportProductDTO[]>();
  for (const product of products) {
    const label = (product.categoryName ?? product.category).trim() || "Lainnya";
    const items = groups.get(label) ?? [];
    items.push(product);
    groups.set(label, items);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "id"))
    .map(([label, items]) => ({
      label,
      items: [...items].sort((x, y) => x.name.localeCompare(y.name, "id")),
    }));
}

function ContactSection({ settings }: { settings: CatalogPdfSettings }) {
  const whatsapp = formatWhatsapp(settings.whatsappNumber);
  const brandName = settings.brandName || FALLBACK_STORE_NAME;
  return (
    <View style={styles.contactSection}>
      <View style={styles.contactHead}>
        {settings.logoUri ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={settings.logoUri} style={{ width: 34, height: 34, objectFit: "contain" }} />
        ) : (
          <View style={styles.contactLogo} />
        )}
        <View style={styles.contactBrandWrap}>
          <Text style={styles.contactBrand}>{brandName}</Text>
        </View>
      </View>
      {settings.address ? (
        <Text style={styles.contactLine}>Alamat: {settings.address}</Text>
      ) : null}
      {settings.operatingHours ? (
        <Text style={styles.contactLine}>Jam Operasional: {settings.operatingHours}</Text>
      ) : null}
      {whatsapp ? (
        <Text style={styles.contactNote}>Untuk pemesanan, hubungi: {whatsapp}</Text>
      ) : null}
    </View>
  );
}

export function ProductCatalogDocument({
  products,
  images,
  settings,
  generatedAt,
}: {
  products: CatalogExportProductDTO[];
  images: Map<string, string | null>;
  settings: CatalogPdfSettings;
  generatedAt: Date;
}) {
  const totalProducts = products.length;
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(generatedAt);
  const brandName = settings.brandName || FALLBACK_STORE_NAME;
  const categoryGroups = groupByCategory(products);

  return (
    <Document title={`Katalog Produk — ${brandName}`} author={brandName}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>{brandName}</Text>
          <Text style={styles.title}>Katalog Produk</Text>
          <Text style={styles.meta}>
            Diterbitkan: {dateLabel} • {totalProducts} produk tersedia
          </Text>
        </View>
        <View style={styles.summary}>
          <Text style={styles.summaryTag}>{totalProducts} Produk</Text>
          <Text style={styles.summaryText}>
            Diurutkan per kategori • {categoryGroups.length} kategori • Harga belum termasuk ongkir
          </Text>
        </View>
        {categoryGroups.map((group) => (
          <View key={group.label} style={styles.categorySection}>
            <View style={styles.categoryHead}>
              <Text style={styles.categoryTitle}>{group.label}</Text>
              <Text style={styles.categoryCount}>{group.items.length} produk</Text>
            </View>
            <View style={styles.grid}>
              {group.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imageUri={images.get(product.id) ?? null}
                />
              ))}
            </View>
          </View>
        ))}
        <ContactSection settings={settings} />
        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${brandName} — Katalog Produk • Halaman ${pageNumber} dari ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}