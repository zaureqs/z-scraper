# Z-Scraper

Z-Scraper is a simple Node.js API built using Puppeteer to scrape product information from Amazon.in based on a given keyword.

## Features

- Retrieves product name, description, rating, number of reviews, price, URL, and reviews for the top 4 search results.
- Utilizes asynchronous operations to enhance performance.
- Fetches additional product descriptions by navigating to each product's URL.

## Installation

1. Clone the repository:
    ```base
    git clone https://github.com/zaureqs/z-scraper.git
    ```

2. Change directory to the project root:
    ```
    cd z-scraper
    ```

3. Install dependencies:

    ```
    yarn install
    ```

4. Run this app development environment:
    ```
    yarn dev
    ```

5. To build:
    ```
    yarn build
    ```
6. Start server:
    ```
    yarn start
    ```

7. Open your browser and go to the following link, replacing `term` with your desired search term:
    ```
    http://localhost:5500/api/v1/scrap?keyword=term
    ```


## Results

![alt text](./result.png)

## Note
- The API is currently tailored to scrape product data from Amazon.in only.
- It fetches information for the top 4 search results due to Amazon's page structure.
