import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

let browserPromise: Promise<import("puppeteer-core").Browser> | null = null;

async function getBrowser() {
  if (browserPromise) return browserPromise;

  const isLocal =
    process.env.NODE_ENV === "development" || !process.env.VERCEL;

  if (isLocal) {
    const localPath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    browserPromise = puppeteer.launch({
      executablePath: localPath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } else {
    browserPromise = puppeteer.launch({
      args: [...chromium.args, "--hide-scrollbars"],
      defaultViewport: { width: 540, height: 960, deviceScaleFactor: 2 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  return browserPromise;
}

export async function screenshotAd(url: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({
      width: 540,
      height: 960,
      deviceScaleFactor: 2,
    });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() =>
      document.fonts ? document.fonts.ready : Promise.resolve()
    );
    await new Promise((r) => setTimeout(r, 250));
    const buffer = await page.screenshot({
      type: "png",
      omitBackground: false,
      clip: { x: 0, y: 0, width: 540, height: 960 },
    });
    return Buffer.from(buffer);
  } finally {
    await page.close();
  }
}

export async function closeBrowser() {
  if (!browserPromise) return;
  const browser = await browserPromise;
  await browser.close();
  browserPromise = null;
}
