import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getCatalogExportProducts } from "@/lib/queries/catalog";
import { getSiteSettings } from "@/lib/queries/site-settings";
import {
  ProductCatalogDocument,
  resolveCatalogImages,
  resolveLogoImage,
} from "@/lib/pdf/product-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [products, site] = await Promise.all([
    getCatalogExportProducts(),
    getSiteSettings(),
  ]);
  const [images, logoUri] = await Promise.all([
    resolveCatalogImages(products),
    resolveLogoImage(site?.logoUrl ?? null),
  ]);
  const buffer = await renderToBuffer(
    <ProductCatalogDocument
      products={products}
      images={images}
      settings={{
        brandName: site?.brandName ?? "Jasmine Shop Premium Products",
        logoUri,
        address: site?.address ?? null,
        operatingHours: site?.operatingHours ?? null,
        whatsappNumber: site?.whatsappNumber ?? null,
      }}
      generatedAt={new Date()}
    />,
  );
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="katalog-produk-jasmine.pdf"`,
    },
  });
}