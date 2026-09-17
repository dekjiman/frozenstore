import type { MetadataRoute } from "next";
import { SEO_BASE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${SEO_BASE}/sitemap.xml`,
    host: SEO_BASE,
  };
}
