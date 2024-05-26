import { getAmazonResults } from "./amazon.js";
import { getMLResults } from "./mercadoLibre.js";

let bothResults = await Promise.all([
  getMLResults("pixel 8 pro"),
  getAmazonResults("pixel 8 pro"),
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

console.log(JSON.stringify(combinedResults));
