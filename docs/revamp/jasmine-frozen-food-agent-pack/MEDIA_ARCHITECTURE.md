# Media Architecture — Image & Video Management

> Standards for handling images and videos across the Jasmine Frozen Food storefront.
> Covers upload, storage, processing, delivery, and display.

---

## 1. Storage Adapter

### 1.1 Interface

```ts
interface MediaStorage {
  upload(input: UploadInput): Promise<StoredMedia>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

interface UploadInput {
  buffer: Buffer;
  filename: string;        // Normalized, never trust original path
  mimeType: string;        // Validated against allowed types
  folder: string;          // e.g., "products", "heroes", "testimonials"
}

interface StoredMedia {
  key: string;             // Storage path
  url: string;             // Public URL
  width?: number;          // Image width in pixels
  height?: number;         // Image height in pixels
  fileSizeBytes: number;
  mimeType: string;
}
```

### 1.2 P0 Implementation
- Local filesystem: `public/uploads/` directory.
- Files served directly by Next.js static file serving.
- Folder structure:
  ```
  public/uploads/
  ├── products/           # Product images + videos
  │   ├── thumbs/         # Auto-generated thumbnails
  │   └── posters/        # Video poster frames
  ├── heroes/             # Hero campaign images
  ├── promos/             # Promo banner images
  ├── categories/         # Category images
  ├── testimonials/       # Testimonial avatars
  ├── trust/              # Trust item icons
  ├── cooking/            # Cooking step images
  ├── marketplace/        # Marketplace logos
  ├── site/               # Site settings (logo)
  └── payment-proofs/     # Payment proof uploads (existing)
  ```

### 1.3 Production Target
- S3-compatible storage (AWS S3, Cloudflare R2, MinIO) or Cloudinary.
- CDN in front for global delivery.
- Same `MediaStorage` interface — swap adapter without changing domain services.
- Environment variable `MEDIA_STORAGE_ADAPTER` controls which adapter is used.

---

## 2. Image Standards

### 2.1 Allowed Formats
| Format | MIME Type | Notes |
|--------|-----------|-------|
| JPEG | `image/jpeg` | Recommended for photos |
| PNG | `image/png` | Recommended for graphics with transparency |
| WebP | `image/webp` | Preferred for delivery (smaller size) |
| AVIF | `image/avif` | Best compression, progressive support |

### 2.2 Size Limits
| Limit | Value | Enforcement |
|-------|-------|-------------|
| Max file size | 5 MB | Checked at upload, before persistence |
| Min recommended dimensions | 1200 × 1200 px | Warning, not rejection |
| Max recommended dimensions | 4000 × 4000 px | Warning, not rejection |

### 2.3 Naming Convention
- Normalized on upload: `{product-slug}-{sequence}.{ext}`
- Example: `chicken-katsu-01.webp`
- Never trust original filename — always generate server-side.
- Strip dangerous characters, lowercase, replace spaces with hyphens.

### 2.4 Metadata Handling
- Strip EXIF metadata where supported (privacy + security).
- Preserve ICC color profile for accurate rendering.
- Generate normalized filenames; never expose original path.

---

## 3. Video Standards

### 3.1 Allowed Formats
| Format | MIME Type | Notes |
|--------|-----------|-------|
| MP4/H.264 | `video/mp4` | P0 only format |

### 3.2 Size Limits
| Limit | Value | Enforcement |
|-------|-------|-------------|
| Max file size | 50 MB | Checked at upload |
| Recommended resolution | 1080p or below | Guideline |
| Recommended duration | 6–30 seconds | Guideline |
| Max per product | 1 video | P0 recommendation |

### 3.3 Encoding
- H.264 codec for broad browser compatibility.
- AAC audio (muted by default, user-initiated unmute).
- Fast-start (moov atom at beginning) for progressive playback.

---

## 4. Thumbnail Generation

### 4.1 Strategy
- Auto-generate on upload (server-side processing).
- Store alongside original in `thumbs/` subdirectory.
- Thumbnail is a separate file, not a client-side resize.

### 4.2 Sizes
| Context | Dimensions | Aspect Ratio |
|---------|------------|--------------|
| Product card | 400 × 300 px | 4:3 |
| Product detail thumb | 200 × 200 px | 1:1 |
| Category card | 300 × 300 px | 1:1 |
| Hero banner | 1200 × 600 px | 2:1 |
| Promo banner | 600 × 300 px | 2:1 |
| Testimonial avatar | 100 × 100 px | 1:1 |
| Marketplace logo | 200 × 60 px | ~3:1 |

### 4.3 Format
- Thumbnails are served as WebP for optimal size/quality ratio.
- Fallback to original format if WebP generation fails.

---

## 5. Responsive Images

### 5.1 next/image Usage
- All images use `next/image` component.
- `sizes` attribute configured per context:
  ```tsx
  // Product card
  <Image sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" />

  // Hero banner
  <Image sizes="(max-width: 768px) 100vw, 1440px" />

  // Product detail main
  <Image sizes="(max-width: 768px) 100vw, 48vw" />
  ```

### 5.2 Breakpoints
| Breakpoint | Width | Cards per row |
|------------|-------|---------------|
| Mobile | < 768px | 2 |
| Tablet | 768–1199px | 3 |
| Desktop | ≥ 1200px | 5–6 |

### 5.3 Priority Loading
- **Eager:** First visible hero image, above-the-fold product detail primary image.
- **Lazy:** All other images (product cards, secondary gallery images, thumbnails).

---

## 6. Lazy Loading

### 6.1 Images
- Primary product image: **eager** (above the fold).
- All other images: **lazy** (`loading="lazy"` via next/image default).
- Intersection Observer for gallery thumbnails (load when near viewport).

### 6.2 Videos
- `preload="metadata"` only (browser loads duration/dimensions, not video data).
- No `preload="auto"` or `preload="full"`.
- Video data loads only when user clicks play.

### 6.3 Avoid Layout Shift
- Always provide `width` and `height` attributes on `next/image`.
- Product card images use fixed aspect ratio containers (4:3 or 1:1).
- Skeleton placeholders match final image dimensions.

---

## 7. CDN Strategy

### 7.1 P0 (Local)
- Files served by Next.js static file serving from `public/uploads/`.
- Cache headers: `Cache-Control: public, max-age=31536000, immutable` for uploaded media.
- Thumbnails follow same cache policy.

### 7.2 Production (CDN)
- CDN in front of storage (Cloudflare, AWS CloudFront, etc.).
- Cache invalidation on media delete (via storage adapter).
- Image optimization at CDN edge (format negotiation, resizing).
- Consider Cloudinary or imgix for on-the-fly transformations.

---

## 8. Media Ordering

### 8.1 Database Model
- `product_media.sort_order`: Integer, controls display order.
- Index on `(product_id, sort_order)` for efficient queries.

### 8.2 Reorder Operations
- Admin sends ordered array of media IDs: `{ "orderedIds": ["med_1", "med_3", "med_2"] }`.
- Server updates `sort_order` values sequentially (0, 1, 2, ...).
- Reorder runs in a **transaction** to prevent partial updates.

### 8.3 Query Ordering
- All media queries include `ORDER BY sort_order ASC`.
- Primary image is identified by `is_primary = true`, not by sort position.

---

## 9. Alt Text

### 9.1 Requirements
- Every published image **must** have meaningful alt text.
- Alt text is admin-editable per media item.
- Fallback: product name + context (e.g., "Chicken Katsu - tampilan produk").

### 9.2 SEO Impact
- Alt text is used in:
  - HTML `alt` attribute (accessibility)
  - OpenGraph `og:image:alt` meta tag
  - Product JSON-LD `image` array (schema.org)

### 9.3 Guidelines
- Be descriptive but concise (max 125 chars recommended).
- Include product name and key visual element.
- Avoid "image of" or "photo of" prefix (redundant for screen readers).

---

## 10. Maximum Media Limits

| Content Type | Max Images | Max Videos | Total Max |
|--------------|------------|------------|-----------|
| Product | 8 | 1 | 12 |
| Hero campaign | 1 | 0 | 1 |
| Promo banner | 1 | 0 | 1 |
| Category | 1 | 0 | 1 |
| Testimonial | 1 (avatar) | 0 | 1 |
| Cooking step | 1 | 0 | 1 |
| Marketplace | 1 (logo) | 0 | 1 |
| Site settings | 1 (logo) | 0 | 1 |

---

## 11. Upload Validation Pipeline

```
1. Receive file
2. Check MIME type (magic bytes, not just extension)
3. Check file size (5MB image / 50MB video)
4. Check product ownership (admin must own the product)
5. Check media count limit (max 12 per product)
6. Generate normalized filename
7. Strip dangerous metadata
8. Upload to storage adapter
9. Generate thumbnail (images only)
10. Create DB record with metadata
11. If creating as primary, unset previous primary (transactional)
12. Return created media metadata
```

### Error Responses
| Error | HTTP Status | Code |
|-------|-------------|------|
| Invalid MIME type | 400 | `INVALID_MEDIA_TYPE` |
| File too large | 400 | `MEDIA_TOO_LARGE` |
| Product not found | 404 | `PRODUCT_NOT_FOUND` |
| Not product owner | 403 | `NOT_PRODUCT_OWNER` |
| Media limit exceeded | 409 | `MEDIA_LIMIT_EXCEEDED` |
| Storage failure | 500 | `MEDIA_UPLOAD_FAILED` |

---

## 12. Delete Strategy

### 12.1 Process
1. Verify media exists and belongs to the product.
2. If media is primary, reject delete (must set new primary first).
3. Delete DB row.
4. Schedule physical file cleanup (async with retry).
5. If primary was deleted, auto-promote next media by sort order.

### 12.2 File Cleanup
- Delete original file, thumbnail, and poster (if video).
- Retry up to 3 times on storage failure.
- Log failure for manual cleanup if all retries fail.
- Never block the API response on file cleanup failure.

---

## 13. Security Considerations

| Risk | Mitigation |
|------|------------|
| Malicious file upload | MIME validation via magic bytes, not extension |
| Path traversal | Normalized filenames, never trust original path |
| Large file DoS | File size limits enforced before persistence |
| Metadata leakage | Strip EXIF/metadata on upload |
| Original filename exposure | Use generated filenames in URLs |
| Storage bucket listing | Private bucket, public URLs only for uploaded media |

---

## 14. Performance Targets

| Metric | Target | Context |
|--------|--------|---------|
| Image load (card) | < 100ms | From CDN/local, cached |
| Image load (detail) | < 200ms | Eager load primary |
| Thumbnail generation | < 2s | On upload |
| Video first frame | < 500ms | Metadata preload |
| Product detail LCP | < 2.5s | Primary image |
| CLS from images | 0 | Fixed dimensions |

---

*This architecture ensures consistent, performant, and secure media handling across the storefront.*
