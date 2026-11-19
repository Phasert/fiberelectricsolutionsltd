import { chromium } from "playwright-core";

const baseURL = "http://localhost:3000";
const customerEmail = process.env.FES_QA_CUSTOMER_EMAIL;
if (!customerEmail) throw new Error("FES_QA_CUSTOMER_EMAIL is required.");

const browser = await chromium.launch({
  executablePath: String.raw`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`,
  headless: true,
  args: ["--disable-extensions", "--no-first-run"],
});
const result = { customerEmail, viewports: [], submission: null, consoleErrors: [], failedRequests: [] };

async function checkViewport(viewport) {
  const context = await browser.newContext({ baseURL, viewport, colorScheme: "light" });
  const page = await context.newPage();
  page.on("console", message => { if (message.type() === "error") result.consoleErrors.push(message.text()); });
  page.on("pageerror", error => result.consoleErrors.push(error.message));
  page.on("requestfailed", request => result.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ""}`));
  try {
    const response = await page.goto("/request-a-quote", { waitUntil: "domcontentloaded" });
    if (!response?.ok()) throw new Error(`Quote page returned ${response?.status() ?? "no response"}.`);
    await page.getByRole("heading", { name: /Let's discuss your project/ }).waitFor();
    const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, h1: document.querySelectorAll("h1").length }));
    if (metrics.scrollWidth > metrics.width || metrics.h1 !== 1) throw new Error(`Responsive metrics failed at ${viewport.width}px.`);
    result.viewports.push({ ...viewport, ...metrics });
    if (viewport.width !== 1440) return;

    await page.getByRole("radio", { name: /^Electrical/ }).check({ force: true });
    await page.getByLabel(/General project location/).fill("Port of Spain emulator acceptance");
    await page.getByLabel(/Property type/).selectOption("Residential");
    await page.getByLabel(/Describe the work or problem/).fill("Approved local emulator test of the production quote activation workflow.");
    await page.getByLabel(/Preferred timeframe/).selectOption("Flexible");
    await page.getByRole("button", { name: "Continue" }).click();
    try { await page.getByRole("heading", { name: "Contact details" }).waitFor({ timeout: 10_000 }); }
    catch { throw new Error(`Stage 1 did not advance. Alerts: ${(await page.locator('[role="alert"]').allTextContents()).join(" | ")}. Console: ${result.consoleErrors.join(" | ")}`); }
    await page.getByLabel(/Full name/).fill("Kylen FES local test");
    await page.getByLabel(/Email address/).fill(customerEmail);
    await page.getByLabel("Email", { exact: true }).check({ force: true });
    await page.getByLabel(/Additional notes/).fill("Emulator-only activation acceptance test.");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText(customerEmail, { exact: true }).waitFor();
    await page.getByLabel(/I have read the Privacy Notice/).check();
    await page.getByRole("button", { name: "Submit quote request" }).click();
    await page.getByRole("heading", { name: "Request received." }).waitFor({ timeout: 20_000 });
    result.submission = await page.getByText(/^Reference:/).innerText();
  } finally {
    await context.close();
  }
}

try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 1024, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 360, height: 740 }]) await checkViewport(viewport);
  if (result.consoleErrors.length || result.failedRequests.length) throw new Error(JSON.stringify(result));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
