# Product Detail & Media Gallery Specification

## 1. Objective
Product detail page harus memiliki pengalaman katalog kaya media seperti marketplace modern, tetapi tetap mengikuti identitas visual Jasmine Frozen Food. Halaman tidak boleh menyalin UI Tokopedia/Shopee secara literal. Gunakan pola UX yang familiar: thumbnail gallery, multi-image, video produk, harga dan CTA yang selalu mudah dijangkau.

## 2. Route
`/produk/[slug]`

## 3. Desktop layout
```text
Breadcrumb
┌──────────────────────────────────────────────────────────────────────────────┐
│ Media Gallery 48%            │ Product Summary 32% │ Purchase Card 20%      │
│ - Main image/video           │ - Brand/category     │ - Price                 │
│ - Thumbnail rail             │ - Name                │ - Stock                 │
│ - Zoom / fullscreen          │ - Rating/sold         │ - Qty selector          │
│                              │ - Pack metadata       │ - Add to cart           │
│                              │ - badges              │ - Buy now               │
└──────────────────────────────────────────────────────────────────────────────┘
Description tabs/sections
Cooking & storage guide
Related products
```

For medium desktop widths, Product Summary and Purchase Card may merge into one right column.

## 4. Mobile layout
1. Sticky compact header.
2. Swipeable media carousel with pagination.
3. Product summary.
4. Promo/pack information.
5. Description, cooking, storage, shipping information.
6. Related products.
7. Sticky bottom action bar: `Keranjang` and `Beli Sekarang`.

Do not show a permanent desktop-style sidebar on mobile.

## 5. Supported media
Each product supports an ordered media collection:
- Image: JPEG, PNG, WebP, or AVIF.
- Video: MP4/H.264 as P0 format.
- Optional external video URL is P1 and must be allowlisted.

Media item fields:
- `id`
- `productId`
- `type`: `image | video`
- `url`
- `thumbnailUrl`
- `posterUrl` for video
- `altText`
- `title`
- `sortOrder`
- `isPrimary`
- `durationSeconds` nullable
- `width` nullable
- `height` nullable
- `mimeType`
- `fileSizeBytes`
- `createdAt`
- `updatedAt`

## 6. Gallery behavior
### Image
- Thumbnail click changes active media.
- Main image uses a consistent 1:1 frame with `object-fit: contain` by default.
- Hover zoom on desktop, tap fullscreen on mobile.
- Fullscreen modal supports previous/next and keyboard arrows.
- Preserve image aspect ratio; never stretch.

### Video
- Video thumbnail shows play icon and duration.
- Video does not autoplay with sound.
- Autoplay is allowed only muted after explicit user selection.
- Use native controls or a lightweight accessible wrapper.
- Show poster image before playback.
- Pause video when user switches to another media item or closes modal.
- Do not preload all video files; use `preload="metadata"`.

### Ordering
- Maximum recommended media per product: 12 total.
- P0 recommendation: 1 video maximum and 4–8 images.
- Exactly one primary media item.
- Primary media must be an image in P0 to ensure catalog cards and SEO thumbnails remain reliable.

## 7. Product information hierarchy
Show in this order:
1. Breadcrumb.
2. Category and badges.
3. Product name.
4. Rating, review count, sold count.
5. Current price and compare-at price.
6. Pack details: weight, pieces, serving suggestion.
7. Stock and availability.
8. Short description.
9. Quantity selector.
10. `Tambah ke Keranjang` and `Beli Sekarang`.
11. Shipping/trust summary.

## 8. Detailed content sections
Use stacked sections or tabs depending on viewport:
- Deskripsi Produk.
- Informasi Isi & Berat.
- Cara Memasak.
- Cara Penyimpanan.
- Komposisi/Allergen, when data exists.
- Informasi Pengiriman Frozen.

On mobile, prefer accordions over horizontal tabs.

## 9. Purchase interactions
- Quantity min: 1.
- Quantity max: current available stock or configured per-order limit.
- Add to cart uses existing cart contract through an adapter.
- Buy now adds selected quantity and navigates to cart/checkout according to current commerce flow.
- Disable actions for inactive/out-of-stock products.
- Show clear inline feedback and cart count update.
- Never trust price or stock from the client; server revalidates.

## 10. Admin media manager
Product create/edit form must include a Media Gallery manager:
- Multi-file image upload.
- Single or multi-file video upload according to configured limit.
- Drag-and-drop reorder.
- Set as primary.
- Edit alt text/title.
- Preview image/video.
- Replace media while retaining sort position when possible.
- Delete with confirmation.
- Show upload progress and validation errors per file.

The form must save product core data and media safely. Avoid orphaned uploads by using temporary upload state or cleanup jobs.

## 11. Upload validation
Default configurable limits:
- Image maximum: 5 MB each.
- Video maximum: 50 MB each.
- Image dimensions recommended: at least 1200×1200.
- Video recommended: 1080p or below, 6–30 seconds.
- Reject unsupported MIME types and filename-extension mismatch.
- Generate normalized filenames; never trust original path.
- Strip dangerous metadata where supported.

## 12. Storage strategy
Create a storage adapter interface:
```ts
interface MediaStorage {
  upload(input: UploadInput): Promise<StoredMedia>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
```

P0 may use the repository's existing local/public upload mechanism if present. Production should support object storage such as S3-compatible storage or Cloudinary without changing domain services.

Do not store image/video binary inside SQLite/PostgreSQL.

## 13. API DTO example
```json
{
  "data": {
    "id": "prd_123",
    "slug": "chicken-grill-marugame",
    "name": "Chicken Grill Marugame",
    "price": 89000,
    "compareAtPrice": 99000,
    "stock": 24,
    "media": [
      {
        "id": "med_1",
        "type": "image",
        "url": "/uploads/products/chicken-grill-01.webp",
        "thumbnailUrl": "/uploads/products/thumbs/chicken-grill-01.webp",
        "posterUrl": null,
        "altText": "Chicken Grill Marugame siap disajikan",
        "sortOrder": 0,
        "isPrimary": true
      },
      {
        "id": "med_2",
        "type": "video",
        "url": "/uploads/products/chicken-grill-demo.mp4",
        "thumbnailUrl": "/uploads/products/thumbs/chicken-grill-video.webp",
        "posterUrl": "/uploads/products/posters/chicken-grill-video.webp",
        "altText": "Video penyajian Chicken Grill Marugame",
        "durationSeconds": 18,
        "sortOrder": 1,
        "isPrimary": false
      }
    ]
  },
  "error": null,
  "meta": {}
}
```

## 14. Performance
- Product card/list only loads primary image.
- Product detail eagerly loads only primary media.
- Remaining images lazy-load.
- Video uses metadata preload only.
- Generate responsive image sizes and modern formats.
- Avoid rendering all full-size images hidden in DOM.
- Target product detail LCP under 2.5 seconds on production-like mobile connection.

## 15. SEO
- Primary image used for OpenGraph and Product JSON-LD.
- Product JSON-LD includes image URL array for published images.
- Video metadata may include VideoObject only when poster, duration, upload date, and stable URL are available.
- Every published image requires useful alt text.

## 16. Accessibility
- Gallery buttons have accessible labels.
- Active thumbnail exposes selected state.
- Modal traps focus and closes with Escape.
- Video controls keyboard accessible.
- Product information is readable without relying on color alone.

## 17. Acceptance criteria
- Admin can upload at least 5 images and 1 MP4 video to a product.
- Admin can reorder media and choose primary image.
- Storefront shows media in the saved order.
- Image zoom/fullscreen works on desktop and mobile.
- Video plays only after user action and pauses when media changes.
- Catalog cards never load product video.
- Invalid files are rejected before persistence.
- Deleting/replacing media does not break other product data.
- Out-of-stock rules and existing cart/checkout remain correct.
