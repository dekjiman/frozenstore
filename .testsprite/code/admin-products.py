import asyncio
import re
import uuid

from playwright import async_api
from playwright.async_api import expect


BASE_URL = "https://learning-catalogs-electrical-somehow.trycloudflare.com"
SUFFIX = uuid.uuid4().hex[:8].upper()
SKU = f"TS-AUTO-{SUFFIX}"
NAME = f"TestSprite Product {SUFFIX}"


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
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        context.set_default_timeout(20000)
        page = await context.new_page()

        await page.goto(f"{BASE_URL}/masuk", wait_until="domcontentloaded")
        await page.get_by_label("Email").fill("admin@rafstore.id")
        await page.get_by_label("Password", exact=True).fill("Admin#Raf2026")
        await page.get_by_role("button", name="Masuk", exact=True).click()
        await expect(page).to_have_url(re.compile(r".*/admin/?$"))

        product_input = {
            "sku": SKU,
            "name": NAME,
            "category": "TestSprite",
            "description": "Produk otomatis untuk verifikasi CRUD terintegrasi.",
            "price": 123456,
            "currentStock": 7,
            "imageUrl": "https://google.com",
            "isActive": True,
        }
        create_response = await context.request.post(
            f"{BASE_URL}/api/admin/products", data=product_input
        )
        assert create_response.status == 201, await create_response.text()
        product = (await create_response.json())["product"]
        product_id = product["id"]

        duplicate_response = await context.request.post(
            f"{BASE_URL}/api/admin/products", data=product_input
        )
        assert duplicate_response.status == 409
        duplicate_payload = await duplicate_response.json()
        assert duplicate_payload["error"]["code"] == "PRODUCT_SKU_EXISTS"

        await page.goto(f"{BASE_URL}/admin/produk", wait_until="domcontentloaded")
        await expect(page.get_by_role("heading", name="Manajemen produk")).to_be_visible()
        await page.get_by_placeholder("Cari nama atau SKU...").fill(SKU)
        row = page.get_by_role("row").filter(has_text=SKU)
        await expect(row).to_be_visible()
        await expect(row).to_contain_text(NAME)
        await expect(row).to_contain_text("TestSprite")
        await expect(
            row.get_by_label(f"Gambar {NAME} tidak tersedia")
        ).to_be_visible()
        await expect(page.get_by_role("link", name=f"Edit {NAME}")).to_be_visible()

        update_response = await context.request.patch(
            f"{BASE_URL}/api/admin/products/{product_id}",
            data={
                "name": f"{NAME} Updated",
                "description": "Produk telah diperbarui melalui API admin.",
                "price": 234567,
                "isActive": False,
            },
        )
        assert update_response.ok, await update_response.text()
        updated = (await update_response.json())["product"]
        assert updated["name"] == f"{NAME} Updated"
        assert updated["price"] == 234567
        assert updated["isActive"] is False

        hidden_response = await context.request.get(
            f"{BASE_URL}/api/products/{product_id}"
        )
        assert hidden_response.status == 404, "Inactive product must not be public"

        reactivate_response = await context.request.patch(
            f"{BASE_URL}/api/admin/products/{product_id}", data={"isActive": True}
        )
        assert reactivate_response.ok
        public_response = await context.request.get(f"{BASE_URL}/api/products/{product_id}")
        assert public_response.ok, "Reactivated product must be public"

        await page.goto(f"{BASE_URL}/produk/{product_id}", wait_until="domcontentloaded")
        await expect(page.get_by_role("heading", name=f"{NAME} Updated")).to_be_visible()
        await expect(
            page.get_by_label(f"Gambar {NAME} Updated tidak tersedia")
        ).to_be_visible()

        delete_response = await context.request.delete(
            f"{BASE_URL}/api/admin/products/{product_id}"
        )
        assert delete_response.ok
        deleted_payload = await delete_response.json()
        assert deleted_payload["deleted"] is True
        public_after_delete = await context.request.get(
            f"{BASE_URL}/api/products/{product_id}"
        )
        assert public_after_delete.status == 404
        admin_after_delete = await context.request.get(
            f"{BASE_URL}/api/admin/products?q={SKU}"
        )
        assert admin_after_delete.ok
        assert (await admin_after_delete.json())["total"] == 0

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
