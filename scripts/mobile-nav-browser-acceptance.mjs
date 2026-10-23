import { chromium } from "playwright-core";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const widths = [360, 390, 430];
const browser = await chromium.launch({ executablePath: String.raw`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, headless: true, args: ["--disable-extensions", "--no-first-run"] });

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    const toggle = page.locator('button[aria-controls="mobile-nav"]');
    const nav = page.locator('#mobile-nav');
    const open = async () => { await toggle.click(); await page.waitForFunction(() => document.body.style.overflow === "hidden"); };
    const expectClosed = async () => {
      if (await toggle.getAttribute("aria-expanded") !== "false") throw new Error(`${width}px: menu remained expanded`);
      if (await nav.getAttribute("aria-hidden") !== "true") throw new Error(`${width}px: menu remained exposed to assistive technology`);
      if (await page.evaluate(() => document.body.style.overflow) !== "") throw new Error(`${width}px: body scrolling was not restored`);
    };
    const navigate = async (label, path) => {
      await page.goto(base); await open(); await nav.getByRole("link", { name: label, exact: true }).click(); await page.waitForURL(url => url.pathname === path); await expectClosed();
    };

    await page.goto(base);
    await open();
    if (await toggle.getAttribute("aria-expanded") !== "true" || await nav.getAttribute("aria-hidden") !== "false") throw new Error(`${width}px: menu did not open accessibly`);
    if (!(await toggle.locator("svg").getAttribute("class"))?.includes("lucide-x")) throw new Error(`${width}px: close icon was not shown`);
    if (!(await nav.getByRole("link", { name: "Home", exact: true }).evaluate(element => element === document.activeElement))) throw new Error(`${width}px: first menu link did not receive focus`);
    await page.keyboard.press("Escape"); await expectClosed();
    if (!(await toggle.evaluate(element => element === document.activeElement))) throw new Error(`${width}px: Escape did not restore toggle focus`);

    await open(); await page.locator("main").dispatchEvent("pointerdown"); await expectClosed();
    if (!(await toggle.evaluate(element => element === document.activeElement))) throw new Error(`${width}px: outside tap did not restore toggle focus`);

    await navigate("Electrical", "/electrical");
    await navigate("Fiber Optic", "/fiber-optic");
    await navigate("Projects", "/projects");
    await navigate("Contact", "/contact");
    await navigate("Request a quote", "/request-a-quote");

    await page.goto(`${base}/about`); await page.getByRole("link", { name: "Explore our services" }).click(); await page.waitForURL(/#capabilities$/);
    const offset = await page.locator("#capabilities").evaluate(element => element.getBoundingClientRect().top);
    const headerHeight = await page.locator("header").evaluate(element => element.getBoundingClientRect().height);
    if (offset < headerHeight) throw new Error(`${width}px: sticky header obscured anchor target`);

    await page.goto(base); await page.goto(`${base}/projects`); await open(); await page.goBack(); await page.waitForURL(url => url.pathname === "/"); await expectClosed();
    await page.goForward(); await page.waitForURL(url => url.pathname === "/projects"); await expectClosed();
    await page.close();
  }
  console.log(JSON.stringify({ ok: true, widths, links: ["Request a quote", "Electrical", "Fiber Optic", "Projects", "Contact"], behaviors: ["route close", "outside tap", "Escape", "scroll lock", "focus restore", "history navigation", "sticky anchor offset"] }));
} finally {
  await browser.close();
}
