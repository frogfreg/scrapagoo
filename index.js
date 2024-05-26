import puppeteer from "puppeteer";

async function scrap() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewport({ width: 1080, height: 1024 });

  await page.goto("https://www.amazon.com.mx/s?k=pixel+8+pro", {
    waitUntil: ["networkidle0"],
  });

  let productTitle = await page.evaluate(() => {
    let products = document.querySelectorAll(
      `div[data-component-type="s-search-result"]`
    );

    let productTitle = products[0].querySelector("a > span");

    return productTitle.innerText;
  });

  console.log(productTitle);

  await await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  await page.close();
  await browser.close();
}

scrap();
