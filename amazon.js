import puppeteer from "puppeteer";

async function getAmazonResults(searchTerm) {
  const browser = await puppeteer.launch({ headless: false });
  //   const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto(
    `https://www.amazon.com.mx/s?k=${searchTerm
      .toLowerCase()
      .replaceAll(" ", "+")}`,
    {
      waitUntil: ["networkidle0"],
    }
  );

  let productList = await page.evaluate(() => {
    let products = Array.from(
      document.querySelectorAll(`div[data-component-type="s-search-result"]`)
    );

    return products
      .filter((p) => {
        return p
          .querySelector(`[data-cy="price-recipe"]`)
          .querySelector(".a-price-whole");
      })
      .map((p, index) => {
        let imageSource = p.querySelector("img").getAttribute("src");
        let title = p
          .querySelector(`[data-cy="title-recipe"]`)
          ?.querySelector("span").innerText;
        let linkSuffix = p
          .querySelector(`[data-cy="title-recipe"]`)
          ?.querySelector("a")
          ?.getAttribute("href");

        if (!p.querySelector(`[data-cy="price-recipe"]`)) {
          return p.querySelector(`[data-cy="price-recipe"]`)?.innerHTML;
        }

        let priceString = p
          ?.querySelector(`[data-cy="price-recipe"]`)
          ?.querySelector(".a-price-whole").innerText;

        let priceNum = 0;
        if (priceString) {
          priceNum = parseInt(
            priceString.replaceAll(",", "").replaceAll("\n", "")
          );
        }

        let actualLink = `https://www.amazon.com.mx` + linkSuffix;
        let topResult = index < 8 ? true : false;

        return {
          imageSource,
          title,
          actualLink,
          price: priceNum,
          topResult,
        };
      });
  });

  await page.close();
  await browser.close();

  return productList;
}

export { getAmazonResults };
