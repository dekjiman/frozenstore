import asyncio

from playwright import async_api


BASE_URL = "https://learning-catalogs-electrical-somehow.trycloudflare.com"


async def run_test():
    pw = await async_api.async_playwright().start()
    browser = await pw.chromium.launch(headless=True)
    context = await browser.new_context()
    try:
        response = await context.request.get(f"{BASE_URL}/api/payment-settings")
        assert response.status == 200
        payload = await response.json()
        assert payload["totals"]["accounts"] == 2
        assert payload["totals"]["instructions"] == 4
        assert len(payload["accounts"]) == 2
        assert len(payload["instructions"]) == 4
    finally:
        await context.close()
        await browser.close()
        await pw.stop()


asyncio.run(run_test())
