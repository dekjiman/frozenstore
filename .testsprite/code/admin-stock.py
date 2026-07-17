import asyncio
import re
import uuid

from playwright import async_api
from playwright.async_api import expect


BASE_URL = "https://learning-catalogs-electrical-somehow.trycloudflare.com"
REFERENCE = f"TS-STOCK-20260716-{uuid.uuid4().hex[:8]}"


async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=["--window-size=1280,900", "--disable-dev-shm-usage"],
        )
        context = await browser.new_context(
            viewport={"width": 1280, "height": 900}, accept_downloads=True
        )
        context.set_default_timeout(20000)
        page = await context.new_page()

        await page.goto(f"{BASE_URL}/masuk", wait_until="domcontentloaded")
        await page.get_by_label("Email").fill("admin@rafstore.id")
        await page.get_by_label("Password", exact=True).fill("Admin#Raf2026")
        await page.get_by_role("button", name="Masuk", exact=True).click()
        await expect(page).to_have_url(re.compile(r".*/admin/?$"))

        stock_response = await context.request.get(f"{BASE_URL}/api/admin/stock")
        assert stock_response.ok, "Admin stock API must return 200"
        stock_payload = await stock_response.json()
        target = next(
            (product for product in stock_payload.get("stock", []) if product["id"] == "product-003"),
            stock_payload["stock"][0],
        )
        before = target["stock"]

        await page.goto(f"{BASE_URL}/admin/stok/masuk", wait_until="domcontentloaded")
        await expect(page.get_by_role("heading", name="Tambah stok masuk")).to_be_visible()
        await page.locator("#stock-product").select_option(target["id"])
        await page.locator("#stock-quantity").fill("3")
        await page.locator("#stock-reference").fill(REFERENCE)
        await page.locator("#stock-reason").fill("Penerimaan TestSprite")
        await page.get_by_role("button", name="Catat stok masuk", exact=True).click()
        await expect(page.get_by_text("Stok masuk berhasil dicatat")).to_be_visible()
        await expect(
            page.get_by_text(f"{target['name']}: {before} → {before + 3} unit.")
        ).to_be_visible()

        updated_response = await context.request.get(f"{BASE_URL}/api/admin/stock")
        assert updated_response.ok
        updated_payload = await updated_response.json()
        updated = next(
            product for product in updated_payload["stock"] if product["id"] == target["id"]
        )
        assert updated["stock"] == before + 3, "Stock API must persist the +3 movement"

        movement_response = await context.request.get(
            f"{BASE_URL}/api/admin/stock/movements?q={REFERENCE}"
        )
        assert movement_response.ok
        movement_payload = await movement_response.json()
        assert movement_payload["total"] == 1
        movement = movement_payload["movements"][0]
        assert movement["type"] == "in"
        assert movement["quantity"] == 3
        assert movement["stockBefore"] == before
        assert movement["stockAfter"] == before + 3
        assert movement["reference"] == REFERENCE

        await page.goto(f"{BASE_URL}/admin/stok/riwayat", wait_until="domcontentloaded")
        await expect(page.get_by_role("heading", name="Riwayat perubahan stok")).to_be_visible()
        await page.get_by_label("Cari riwayat").fill(REFERENCE)
        row = page.get_by_role("row").filter(has_text=REFERENCE)
        await expect(row).to_be_visible()
        await expect(row).to_contain_text(target["sku"])
        await expect(row).to_contain_text("+3")
        await expect(row).to_contain_text(f"{before} → {before + 3}")

        async with page.expect_download() as download_info:
            await page.get_by_role("button", name="Ekspor").click()
        download = await download_info.value
        assert download.suggested_filename.endswith(".csv")

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
