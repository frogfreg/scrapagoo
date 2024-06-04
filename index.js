import { getAmazonResults } from "./amazon.js";
import { getMLResults } from "./mercadoLibre.js";

async function getCombinedResults(searchTerm) {
  let bothResults = await Promise.all([
    getMLResults(searchTerm),
    getAmazonResults(searchTerm),
  ]);

  let combinedResults = [].concat(bothResults[0], bothResults[1]);

  combinedResults.sort((a, b) => {
    if (a.topResult && b.topResult) {
      return a.Price - b.Price;
    }
    if (a.topResult) {
      return -1;
    }
    if (b.topResult) {
      return 1;
    }
    return a.Price - b.Price;
  });

  return combinedResults;
}

async function priceAlert(searchTerm, maxPrice) {
  let results = await getCombinedResults(searchTerm);

  results = results.filter((r) => {
    return r.topResult && r.price < maxPrice;
  });

  if (results.length === 0) {
    return;
  }

  let message = "";

  for (let r of results.slice(0, 1)) {
    message += `${r.title} - ${r.price} - ${r.actualLink}\n\n`;
  }

  try {
    let response = await fetch(
      "https://api.pushover.net/1/messages.json?" +
        new URLSearchParams({
          token: process.env.APP_TOKEN,
          user: process.env.USER_KEY,
          message,
        }),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `status other than 200: ${response.status} - ${response.statusText}`
      );
    }
  } catch (e) {
    console.error(e);
  }
}

priceAlert("pixel 7 pro", 9_900);
