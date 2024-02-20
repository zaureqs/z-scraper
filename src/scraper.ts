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
  date: string;
  text: string;
  rating: string;
}

export default async (keyword: string): Promise<{ products: Product[] }> => {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`);

    const products: Product[] = await page.evaluate(async () => {
      const results: Product[] = [];
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

        if (nameElement) {
          const name = nameElement.innerText.trim();
          const rating = ratingElement?.innerText.trim() || "N/A";
          const numReviews = numReviewsElement?.innerText.trim() || "N/A";
          const price = priceElement?.innerText.trim() || "N/A";
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
    await getMoreInfo(products);

    return { products };
  } catch (error) {
    console.log(error);
    return { products: [] };
  } finally {
    browser?.close();
  }
};

async function getMoreInfo(products: Product[]) {
  let browser;
  try {
    browser = await puppeteer.launch();

    for (const product of products) {
      const page = await browser.newPage();
      await page.goto(product.url);

      const description: string = await page.evaluate(() => {
        const descriptionElement = document.querySelector(
          "ul.a-unordered-list.a-vertical.a-spacing-mini"
        ) as HTMLElement;

        return descriptionElement ? descriptionElement.innerText.trim() : "N/A";
      });

      const reviewUrl: string = await page.evaluate(() => {
        const reviewUrlElement = document.querySelector(
          "a.a-link-emphasis.a-text-bold"
        ) as HTMLElement;

        return reviewUrlElement
          ? "https://www.amazon.in" + reviewUrlElement.getAttribute("href")
          : "";
      });

      if (reviewUrl.length) {
        const reviewPage = await browser.newPage();
        await reviewPage.goto(reviewUrl);

        const reviews: Review[] = await reviewPage.evaluate(() => {
          const results: Review[] = [];
          const items = document.querySelectorAll(
            "div.a-section.review.aok-relative"
          );

          items.forEach(async (item: Element) => {
            if (results.length >= 10) return;

            const authorElement = item.querySelector(
              "span.a-profile-name"
            ) as HTMLElement;
            const dateElement = item.querySelector(
              "span.a-size-base.a-color-secondary.review-date"
            ) as HTMLElement;
            const textElement = item.querySelector(
              "span.a-size-base.review-text.review-text-content"
            ) as HTMLElement;
            const ratingElement = item.querySelector(
              "span.a-icon-alt"
            ) as HTMLElement;

            if (authorElement) {
              const author = authorElement?.innerText.trim();
              const text = textElement?.innerText.trim() || "N/A";
              const date = dateElement?.innerText.trim() || "N/A";
              const rating = ratingElement?.innerText.trim() || "N/A";
              results.push({ author, date, text, rating });
            }
          });
          return results;
        });
        product.reviews = reviews;
      }
      product.description = description;
      await page.close();
    }

  } catch (error) {
    console.log(error);
  } finally {
    await browser?.close();
  }
}
