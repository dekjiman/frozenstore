import asyncio
import re

from playwright import async_api
from playwright.async_api import expect


BASE_URL = "https://learning-catalogs-electrical-somehow.trycloudflare.com"
TEST_BANK = "TestSprite Bank"
TEST_ACCOUNT = "5555516161"
TEST_STEP = "TestSprite Payment Step"


async def remove_test_records(context):
    accounts_response = await context.request.get(
        f"{BASE_URL}/api/admin/payment-settings/accounts"
    )
    if accounts_response.ok:
        payload = await accounts_response.json()
        for account in payload.get("accounts", []):
            if (
                account.get("bankName") == TEST_BANK
                and account.get("accountNumber") == TEST_ACCOUNT
            ):
                await context.request.delete(
                    f"{BASE_URL}/api/admin/payment-settings/accounts/{account['id']}"
                )

    instructions_response = await context.request.get(
        f"{BASE_URL}/api/admin/payment-settings/instructions"
    )
    if instructions_response.ok:
        payload = await instructions_response.json()
        for instruction in payload.get("instructions", []):
            if instruction.get("title") == TEST_STEP:
                await context.request.delete(
                    f"{BASE_URL}/api/admin/payment-settings/instructions/{instruction['id']}"
                )


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
        await expect(page.get_by_text("Raf Store Admin", exact=True)).to_be_visible()

        await remove_test_records(context)
        await page.goto(
            f"{BASE_URL}/admin/pengaturan-pembayaran",
            wait_until="domcontentloaded",
        )
        await expect(
            page.get_by_role("heading", name="Pengaturan pembayaran")
        ).to_be_visible()
        await expect(page.get_by_text("Rekening aktif").locator("..").get_by_text("2", exact=True)).to_be_visible()
        await expect(page.get_by_text("Langkah panduan").locator("..").get_by_text("4", exact=True)).to_be_visible()

        await page.get_by_role("button", name="Tambah rekening").click()
        await page.get_by_label("Nama bank").fill(TEST_BANK)
        await page.get_by_label("Nomor rekening").fill(TEST_ACCOUNT)
        await page.get_by_label("Nama pemilik rekening").fill("TESTSPRITE RAF STORE")
        await page.get_by_label("Urutan tampil").fill("99")
        await expect(page.get_by_label("Aktif di checkout")).to_be_checked()
        await page.get_by_role("button", name="Simpan rekening").click()
        await expect(page.get_by_text(f"Rekening {TEST_BANK} berhasil ditambahkan.")).to_be_visible()
        await expect(page.get_by_text(TEST_BANK, exact=False)).to_be_visible()
        await expect(page.get_by_text("Rekening aktif").locator("..").get_by_text("3", exact=True)).to_be_visible()

        await page.get_by_role("button", name="Instruksi transfer").click()
        await page.get_by_role("button", name="Tambah langkah").click()
        await page.get_by_label("Judul langkah").fill(TEST_STEP)
        await page.get_by_label("Teks instruksi").fill(
            "Gunakan referensi TS-PAYMENT-20260716 saat melakukan transfer"
        )
        await page.get_by_label("Urutan langkah").fill("99")
        await expect(page.get_by_label("Tampilkan di checkout")).to_be_checked()
        await page.get_by_role("button", name="Simpan instruksi").click()
        await expect(page.get_by_text(TEST_STEP, exact=True)).to_be_visible()
        await expect(page.get_by_text("TS-PAYMENT-20260716", exact=False)).to_be_visible()
        await expect(page.get_by_text("Langkah panduan").locator("..").get_by_text("5", exact=True)).to_be_visible()

        public_response = await context.request.get(f"{BASE_URL}/api/payment-settings")
        assert public_response.ok, "Public payment settings endpoint must return 200"
        public_settings = await public_response.json()
        assert any(
            account.get("bankName") == TEST_BANK
            and account.get("accountNumber") == TEST_ACCOUNT
            for account in public_settings.get("accounts", [])
        ), "Active TestSprite bank account must be available to checkout"
        assert any(
            instruction.get("title") == TEST_STEP
            and "TS-PAYMENT-20260716" in instruction.get("instruction", "")
            for instruction in public_settings.get("instructions", [])
        ), "Active TestSprite instruction must be available to checkout"

        await page.get_by_role("button", name="Rekening bank").click()
        await page.get_by_role("button", name=f"Hapus rekening {TEST_BANK}").click()
        await page.get_by_role("button", name="Hapus rekening", exact=True).click()
        await expect(page.get_by_text(f"Rekening {TEST_BANK} berhasil dihapus.")).to_be_visible()

        await page.get_by_role("button", name="Instruksi transfer").click()
        await page.get_by_role("button", name=f"Hapus instruksi {TEST_STEP}").click()
        await expect(page.get_by_text(f"Instruksi “{TEST_STEP}” berhasil dihapus.")).to_be_visible()
        await expect(page.get_by_text(TEST_STEP, exact=True)).to_have_count(0)

    finally:
        if context:
            try:
                await remove_test_records(context)
            except Exception:
                pass
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
