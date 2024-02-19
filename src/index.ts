import express, { Request, Response } from "express";
import scraper from "./scraper";

const PORT = 5500;
const app = express();

app.get("/", (req: Request, res: Response) => {
  res.write("Hello from Scrapy server !");
  res.write("Go to /api/v1/scrap");
  res.send();
});

app.get("/api/v1/scrap", async (req: Request, res: Response) => {
  try {
    const keyword = String(req.query.keyword);

    if (!keyword) {
      res.json({
        success: false,
        message: 'Missing required "keyword" query parameter.',
      });
      return;
    }
    const { products } = await scraper(keyword);
    res.send({ success: true, products: products });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'internal server error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
