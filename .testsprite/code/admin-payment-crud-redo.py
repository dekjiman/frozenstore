import asyncio
import re
import uuid

from playwright import async_api
from playwright.async_api import expect


BASE_URL = "https://bill-councils-appendix-physician.trycloudflare.com"
SUFFIX = uuid.uuid4().hex[:8].upper()
BANK_NAME = f"TestSprite Redo Bank {SUFFIX}"
BANK_NAME_UPDATED = f"TestSprite Redo Bank Updated {SUFFIX}"
ACCOUNT_NUMBER = str(uuid.uuid4().int)[:12]
INSTRUCTION_TITLE = f"TestSprite Redo Step {SUFFIX}"
INSTRUCTION_TITLE_UPDATED = f"TestSprite Redo Step Updated {SUFFIX}"
INSTRUCTION_TEXT = f"Gunakan referensi TS-REDO-{SUFFIX} saat melakukan transfer."


async def delete_created_records(context):
    accounts_response = await context.request.get(
        f"{BASE_URL}/api/admin/payment-settings/accounts"
    )
    if accounts_response.ok:
        accounts = (await accounts_response.json()).get("accounts", [])
        for account in accounts:
            if account.get("bankName") in {BANK_NAME, BANK_NAME_UPDATED}:
                await context.request.delete(
                    f"{BASE_URL}/api/admin/payment-settings/accounts/{account['id']}"
                )

    instructions_response = await context.request.get(
        f"{BASE_URL}/api/admin/payment-settings/instructions"
    )
    if instructions_response.ok:
        instructions = (await instructions_response.json()).get("instructions", [])
        for instruction in instructions:
            if instruction.get("title") in {
                INSTRUCTION_TITLE,
                INSTRUCTION_TITLE_UPDATED,
            }:
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
            args=["--window-size=1440,1000", "--disable-dev-shm-usage"],
        )
        context = await browser.new_context(viewport={"width": 1440, "height": 1000})
        context.set_default_timeout(20000)
        page = await context.new_page()

        # Authenticate as admin, then open the exact page supplied by the user.
        await page.goto(f"{BASE_URL}/masuk", wait_until="domcontentloaded")
        await page.get_by_label("Email").fill("admin@rafstore.id")
        await page.get_by_label("Password", exact=True).fill("Admin#Raf2026")
        await page.get_by_role("button", name="Masuk", exact=True).click()
        await expect(page).to_have_url(re.compile(r".*/admin/?$"))
        await page.goto(
            f"{BASE_URL}/admin/pengaturan-pembayaran",
            wait_until="domcontentloaded",
        )
        await expect(
            page.get_by_role("heading", name="Pengaturan pembayaran")
        ).to_be_visible()

        await delete_created_records(context)
        await page.reload(wait_until="domcontentloaded")

        # Account create and read.
        await page.get_by_role("button", name="Rekening bank").click()
        await page.get_by_role("button", name="Tambah rekening").click()
        await page.get_by_label("Nama bank").fill(BANK_NAME)
        await page.get_by_label("Nomor rekening").fill(ACCOUNT_NUMBER)
        await page.get_by_label("Nama pemilik rekening").fill("TESTSPRITE RAF STORE")
        await page.get_by_label("Urutan tampil").fill("999")
        await expect(page.get_by_label("Aktif di checkout")).to_be_checked()
        await page.get_by_role("button", name="Simpan rekening").click()
        await expect(
            page.get_by_text(f"Rekening {BANK_NAME} berhasil ditambahkan.")
        ).to_be_visible()
        await expect(page.get_by_text(BANK_NAME, exact=False)).to_be_visible()
        await expect(page.get_by_text(ACCOUNT_NUMBER, exact=True)).to_be_visible()

        # Account update.
        await page.get_by_role("button", name=f"Edit rekening {BANK_NAME}").click()
        await page.get_by_label("Nama bank").fill(BANK_NAME_UPDATED)
        await page.get_by_role("button", name="Simpan rekening").click()
        await expect(
            page.get_by_text(f"Rekening {BANK_NAME_UPDATED} berhasil diperbarui.")
        ).to_be_visible()
        await expect(page.get_by_text(BANK_NAME_UPDATED, exact=False)).to_be_visible()

        # The user explicitly requested pressing this tab before instruction CRUD.
        await page.get_by_role("button", name="Instruksi transfer").click()
        await expect(
            page.get_by_role("heading", name="Langkah transfer")
        ).to_be_visible()

        # Instruction create and read.
        await page.get_by_role("button", name="Tambah langkah").click()
        await page.get_by_label("Judul langkah").fill(INSTRUCTION_TITLE)
        await page.get_by_label("Teks instruksi").fill(INSTRUCTION_TEXT)
        await page.get_by_label("Urutan langkah").fill("999")
        await expect(page.get_by_label("Tampilkan di checkout")).to_be_checked()
        await page.get_by_role("button", name="Simpan instruksi").click()
        await expect(page.get_by_text(INSTRUCTION_TITLE, exact=True)).to_be_visible()
        await expect(page.get_by_text(f"TS-REDO-{SUFFIX}", exact=False)).to_be_visible()

        # Instruction update while staying on the Instruksi transfer tab.
        await page.get_by_role(
            "button", name=f"Edit instruksi {INSTRUCTION_TITLE}"
        ).click()
        await page.get_by_label("Judul langkah").fill(INSTRUCTION_TITLE_UPDATED)
        await page.get_by_role("button", name="Simpan instruksi").click()
        await expect(
            page.get_by_text(INSTRUCTION_TITLE_UPDATED, exact=True)
        ).to_be_visible()

        # Checkout's public API must expose both active, updated records.
        public_response = await context.request.get(f"{BASE_URL}/api/payment-settings")
        assert public_response.status == 200
        public_payload = await public_response.json()
        assert any(
            account.get("bankName") == BANK_NAME_UPDATED
            and account.get("accountNumber") == ACCOUNT_NUMBER
            for account in public_payload.get("accounts", [])
        )
        assert any(
            instruction.get("title") == INSTRUCTION_TITLE_UPDATED
            and f"TS-REDO-{SUFFIX}" in instruction.get("instruction", "")
            for instruction in public_payload.get("instructions", [])
        )

        # Delete instruction from the requested tab.
        await page.get_by_role(
            "button", name=f"Hapus instruksi {INSTRUCTION_TITLE_UPDATED}"
        ).click()
        await expect(page.get_by_text(INSTRUCTION_TITLE_UPDATED, exact=True)).to_have_count(0)

        # Delete account and confirm the dialog.
        await page.get_by_role("button", name="Rekening bank").click()
        await page.get_by_role(
            "button", name=f"Hapus rekening {BANK_NAME_UPDATED}"
        ).click()
        await page.get_by_role("button", name="Hapus rekening", exact=True).click()
        await expect(page.get_by_text(BANK_NAME_UPDATED, exact=False)).to_have_count(0)

        final_public_response = await context.request.get(
            f"{BASE_URL}/api/payment-settings"
        )
        assert final_public_response.status == 200
        final_payload = await final_public_response.json()
        assert not any(
            account.get("accountNumber") == ACCOUNT_NUMBER
            for account in final_payload.get("accounts", [])
        )
        assert not any(
            instruction.get("title") == INSTRUCTION_TITLE_UPDATED
            for instruction in final_payload.get("instructions", [])
        )

    finally:
        if context:
            try:
                await delete_created_records(context)
            except Exception:
                pass
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
