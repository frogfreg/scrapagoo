import puppeteer from "puppeteer";

async function getMLResults(searchTerm) {
  const browser = await puppeteer.launch({ headless: false });
  //   const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto("https://mercadolibre.com.mx", { waitUntil: "networkidle0" });

  await page.type("#cb1-edit", searchTerm);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    await page.click(".nav-search-btn"),
  ]);

  await page.waitForFunction(() => {
    let paginationElement = document.querySelector("ul.andes-pagination");

    paginationElement.scrollIntoView({ behavior: "smooth" });

    return true;
  });

  await page.waitForNetworkIdle();

  let productList = await page.evaluate(() => {
    let products = Array.from(
      document.querySelectorAll(".ui-search-result__wrapper")
    );

    return products.map((p, index) => {
      let imageSource = p
        .querySelector("img.ui-search-result-image__element")
        .getAttribute("src");

      let title = p.querySelector(".ui-search-item__title").innerText;
      let priceString = p.querySelector(
        ".andes-money-amount__fraction"
      ).innerText;
      let priceInt = parseInt(priceString.replaceAll(",", ""));

      let actualLink = p
        .querySelector("a.ui-search-link__title-card.ui-search-link")
        .getAttribute("href");

      let topResult = index < 6 ? true : false;

      return { imageSource, title, price: priceInt, actualLink, topResult };
    });
  });

  await page.close();
  await browser.close();

  return productList;
}

export { getMLResults };
