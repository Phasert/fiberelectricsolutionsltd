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
    const expectClosed = () => page.waitForFunction(() => (
      document.querySelector('button[aria-controls="mobile-nav"]')?.getAttribute("aria-expanded") === "false" &&
      document.getElementById("mobile-nav")?.getAttribute("aria-hidden") === "true" &&
      document.body.style.overflow === ""
    ));
    const expectToggleFocused = () => page.waitForFunction(() => document.activeElement?.matches('button[aria-controls="mobile-nav"]'));
    const navigate = async (label, path) => {
      await page.goto(base); await open(); await nav.getByRole("link", { name: label, exact: true }).click(); await page.waitForURL(url => url.pathname === path); await expectClosed();
    };

    await page.goto(base);
    await open();
    if (await toggle.getAttribute("aria-expanded") !== "true" || await nav.getAttribute("aria-hidden") !== "false") throw new Error(`${width}px: menu did not open accessibly`);
    if (!(await toggle.locator("svg").getAttribute("class"))?.includes("lucide-x")) throw new Error(`${width}px: close icon was not shown`);
    await page.waitForFunction(() => document.getElementById("mobile-nav")?.querySelector("a[href]") === document.activeElement);
    await page.keyboard.press("Escape"); await expectClosed();
    await expectToggleFocused();

    await open(); await page.locator("main").dispatchEvent("pointerdown"); await expectClosed();
    await expectToggleFocused();

    await navigate("Electrical", "/electrical");
    await navigate("Fibre Optic", "/fiber-optic");
    await navigate("Projects", "/projects");
    await navigate("Request a quote", "/request-a-quote");

    await page.goto(`${base}/electrical`); await page.getByRole("link", { name: "Explore services" }).click(); await page.waitForURL(/#services$/);
    await page.waitForFunction(() => {
      const target = document.getElementById("services");
      const header = document.querySelector("header");
      if (!target || !header) return false;
      const top = target.getBoundingClientRect().top;
      return top >= header.getBoundingClientRect().bottom && top < innerHeight;
    });

    await page.goto(base); await page.goto(`${base}/projects`); await open(); await page.goBack(); await page.waitForURL(url => url.pathname === "/"); await expectClosed();
    await page.goForward(); await page.waitForURL(url => url.pathname === "/projects"); await expectClosed();
    await page.close();
  }
  console.log(JSON.stringify({ ok: true, widths, links: ["Request a quote", "Electrical", "Fibre Optic", "Projects"], behaviors: ["route close", "outside tap", "Escape", "scroll lock", "focus restore", "history navigation", "sticky anchor offset"] }));
} finally {
  await browser.close();
}
