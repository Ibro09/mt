const path = require("path");
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { chromium } = require("playwright");

 
// const cors = require("cors"); // Import the cors middleware

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "dist")));

app.use(express.json());


// Define a route to serve the index.html file
app.get("/", (req, res) => {
  console.log(express.static(path.join(__dirname, "dist")));
  res.send('../dist/index.html');
});





app.post("/", async (req, res) => {
  console.log(req.body.url);
  try {
    const websiteUrl = req.body.url;
    const response = await axios.get(websiteUrl);
    const html = response.data;

    // Parse HTML and extract meta tags using cheerio
    const $ = cheerio.load(html);
    const metaTags = $("meta");

    // Extract and format meta tag data as needed
    const metaTagData = [];
    metaTags.each((index, element) => {
      const name =
        $(element).attr("name") ||
        $(element).attr("property") ||
        $(element).attr("charset")&&'charset' ||
        $(element).attr("http-equiv") ||
        $(element).attr("scheme") ||
        $(element).attr("itemprop") ||
        "";
      const content = $(element).attr("content")||  $(element).attr("charset") || "";
      metaTagData.push({ name, content });
    });
     console.log(metaTagData);
    res.json(metaTagData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while analyzing the website." });
  }

  // res.json([{'name':''},{'name':'content'},''])
});


app.post("/analyze", async (req, res) => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(req.body.url);

    // Wait for network idle to ensure page has fully loaded (adjust the options if needed)
    await page.waitForLoadState("networkidle");

    const imageAltTexts = await page.$$eval("img", imgs =>
      imgs.map(img => img.getAttribute("alt")),
    );

    await browser.close();

    res.json({ imageAltTexts });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/analyze", async (req, res) => {
  console.log(req.body);
    try {
    const browser = await puppeteer.launch({
      headless: "new", // Use the new Headless mode
    });    const page = await browser.newPage();

    await page.goto(req.body.url, { waitUntil: "networkidle0" });

    const imageElements = await page.$$eval("img", imgs =>
      imgs.map(img => img.getAttribute("alt")),
    );

    await browser.close();
  console.log(imageElements);
    res.json({ imageAltTexts: imageElements });
    } catch (error) {
      console.error("Error:", error);
    }
 
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





















// (async () => {
//   try {
//   const browser = await puppeteer.launch({
//     headless: "new", // Use the new Headless mode
//   });    const page = await browser.newPage();

//     // Navigate to the URL of the page with JavaScript-based loading
//     await page.goto("https://ibroport.netlify.app");

//     // Wait for specific content to be loaded (adjust this as needed)
//     await page.waitForSelector("body"); // Wait for an element with a specific ID to be loaded

//     // Extract content
//     const content = await page.evaluate(() => {
//       // Customize this part to extract the content you need
//      const images = Array.from(document.querySelectorAll("img")); 
//      const imgs = images.map(img => {
//       return img.alt ? img.alt : "nil";
//       });
//      return imgs;
//     });

//     console.log("Extracted content:", content);

//     await browser.close();
//   } catch (error) {
//     console.error("Error:", error);
//   }
// })();
