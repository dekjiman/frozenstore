# Locked Design System — Jasmine Red

## Visual direction
Premium, appetizing, warm, trustworthy, dense enough for commerce but not visually noisy. Reference: `reference/homepage-locked.png`.

## Color tokens
```css
--brand-900: #7F0808;
--brand-800: #9E0B0B;
--brand-700: #B51217;
--brand-600: #C81D25;
--brand-500: #D62828;
--brand-50:  #FFF1F0;
--accent-500: #F59E0B;
--cream-50: #FFFDF8;
--cream-100: #FFF7EB;
--ink-950: #171311;
--ink-700: #4C443F;
--border: #E9DDD3;
--success: #2E7D32;
```

## Typography
- UI/body: Geist/Inter/system sans existing.
- Display hero may use a strong sans; avoid decorative serif unless logo asset requires it.
- H1 desktop 48–56px, mobile 34–40px, tight line-height.
- Body 14–16px; never use tiny text below 12px for essential content.

## Layout
- Max content width: 1440px; common inner width 1280–1360px.
- 8px spacing grid.
- Desktop product grid: 5–6 cards depending viewport.
- Tablet: 3 cards. Mobile: 2 cards; critical banners single column.

## Radius
- Buttons 8–10px.
- Cards 12px.
- Hero/promo containers 16–20px.
- Pills fully rounded.

## Product card contract
- 4:3 or 1:1 image region with consistent crop.
- Badge top-left, wishlist top-right optional.
- Name max 2 lines.
- Rating + sold count.
- Pack metadata.
- Current price strongly visible; compare price struck through.
- Add-to-cart always discoverable.

## Motion
- 150–220ms ease-out.
- Hover image scale max 1.03.
- No excessive parallax/glow.
- Respect `prefers-reduced-motion`.

## Accessibility
- Contrast WCAG AA.
- Keyboard navigation for menus/carousel.
- Focus ring visible.
- Alt text meaningful.
- Icon-only controls have `aria-label`.
