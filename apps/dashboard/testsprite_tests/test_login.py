import asyncio
from playwright.async_api import async_playwright

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        await page.goto("http://localhost:3000/dashboard/login")
        await page.get_by_placeholder("your@email.com").fill("superadmin@funggawari.com")
        await page.get_by_placeholder("••••••••").fill("FungaW@ri2026!")
        await page.get_by_role("button", name="ACCESS ARCHIVE").click()
        await page.wait_for_url("**/dashboard/overview*", timeout=10000)
        
        print("Logged in successfully!")
        
        await browser.close()

asyncio.run(run_test())
