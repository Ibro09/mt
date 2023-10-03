const path = require("path");
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
// const puppeteer = require("puppeteer");
const { chromium } = require("playwright");
const { Builder, By, Key, until } = require("selenium-webdriver");
// const chrome = require("selenium-webdriver/chrome");



// const cors = require("cors"); // Import the cors middleware

const app = express();

// Serve static files from the "public" directory

app.use(express.json()); 
   
// Define a route to serve the index.html file
app.get("/", (req, res) => {
  res.send("done");
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
        ($(element).attr("charset") && "charset") ||
        $(element).attr("http-equiv") ||
        $(element).attr("scheme") ||
        $(element).attr("itemprop") ||
        "";
      const content =
        $(element).attr("content") || $(element).attr("charset") || "";
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
  let driver; // Declare the driver variable outside the try-catch block

  try {
    // Create a WebDriver instance for Chrome (replace 'chrome' with 'firefox' for Firefox)
    driver = new Builder().forBrowser("chrome").build();

    // Navigate to the external website
    await driver.get(req.body.url); // Replace with the URL of the external website you want to scrape

    // Wait for the page to load (you can adjust the condition as needed)
    await driver.wait(until.titleContains(""), 5000);

    // Find all image elements on the page
    const imageElements = await driver.findElements(By.tagName("img"));

    // Iterate over the image elements and get their 'alt' attributes
    const altAttributes = [];
    for (const imgElement of imageElements) {
      const alt = await imgElement.getAttribute("alt");
      altAttributes.push(alt);
    }

    // Print the 'alt' attributes
    console.log("Image Alt Attributes:", altAttributes);
    res.json({ imageAltTexts: altAttributes });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  } finally {
    // Ensure that the driver is properly closed even in case of an error
    if (driver) {
      await driver.quit();
    }
  }
});

app.get("/analyze", async (req, res) => {

 let driver; // Declare the driver variable outside the try-catch block

 try {
   // Create a WebDriver instance for Chrome (replace 'chrome' with 'firefox' for Firefox)
   driver = new Builder().forBrowser("chrome").build();

   // Navigate to the external website
   await driver.get("https://ibroport.netlify.app"); // Replace with the URL of the external website you want to scrape

   // Wait for the page to load (you can adjust the condition as needed)
   await driver.wait(until.titleContains(""), 5000);

   // Find all image elements on the page
   const imageElements = await driver.findElements(By.tagName("img"));

   // Iterate over the image elements and get their 'alt' attributes
   const altAttributes = [];
   for (const imgElement of imageElements) {
     const alt = await imgElement.getAttribute("alt");
     altAttributes.push(alt);
   }

   // Print the 'alt' attributes
   console.log("Image Alt Attributes:", altAttributes);
       res.json({ imageAltTexts:altAttributes });

 } catch (error) {
   console.error("Error:", error);
       res.status(500).json({ error: "An error occurred" });

 } finally {
   // Ensure that the driver is properly closed even in case of an error
   if (driver) {
     await driver.quit();
   }
 }
});

const port = process.env.PORT || 5000;
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
