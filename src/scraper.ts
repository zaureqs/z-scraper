import puppeteer from "puppeteer";


interface Product {
  name: string;
  description: string;
  rating: string;
  numReviews: string;
  price: string;
  url: string;
  reviews: Review[];
}

interface Review {
  author: string;
  text: string;
  rating: string;
}

export default async (keyword: string): Promise<{ products: Product[] }> => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`);

    const products: Product[] = await page.evaluate(async () => {
      let results: Product[] = [];
      const items = document.querySelectorAll(".s-result-item");
      items.forEach(async (item: Element) => {
        if (results.length >= 4) return;

        const adElement = item.querySelector(
          ".aok-inline-block.puis-sponsored-label-info-icon"
        ) as HTMLElement;
        if (adElement) return;

        const nameElement = item.querySelector("h2 a span") as HTMLElement;
        const ratingElement = item.querySelector(
          ".a-icon-star-small"
        ) as HTMLElement;
        const numReviewsElement = item.querySelector(
          ".a-size-small .a-link-normal"
        ) as HTMLElement;
        const priceElement = item.querySelector(".a-price span") as HTMLElement;

        const urlElement = item.querySelector(
          "a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal"
        ) as HTMLElement;

        if (
          nameElement
        ) {
          const name = nameElement.innerText.trim();
          const rating = ratingElement?.innerText.trim() || 'N/A';
          const numReviews = numReviewsElement?.innerText.trim() || 'N/A';
          const price = priceElement?.innerText.trim() || 'N/A';
          const url =
            "https://www.amazon.in" + urlElement?.getAttribute("href");

          results.push({
            name,
            description: "",
            rating,
            numReviews,
            price,
            url,
            reviews: [],
          });
        }
      });
      return results;
    });

    await browser.close();

    await getMoreInfo(products);

    return { products };
  } catch (error) {
    console.log(error);
    return { products: [] };
  }
};

async function getMoreInfo(products: Product[]) {
  try {
    const browser = await puppeteer.launch();
    await Promise.all(
      products.map(async (product: Product) => {
        
        const page = await browser.newPage();
        await page.goto(product.url);

        const description: string = await page.evaluate(() => {
          const descriptionElement = document.querySelector(
            "ul.a-unordered-list.a-vertical.a-spacing-mini"
          ) as HTMLElement;

          return descriptionElement.innerText.trim();
        });
        product.description = description;
        
      })
    );
    await browser.close();
  } catch (error) {
    console.log(error);
  }
}
