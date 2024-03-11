import puppeteer from "puppeteer";
import logger from "../logger.js";
import { hebrewTopSongsUrl } from "../constants/urls.js";
import { getCoverArtForSong } from "../spotifyapi.js";

const scrapeTopHebrewSongs = async () => {
  logger.info("start scrap top Hebrew songs");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(hebrewTopSongsUrl, {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector("chart-page");

  const data = await page.evaluate(() => {
    const chartPage = document.querySelector("chart-page");

    const infoElements = Array.from(chartPage.querySelectorAll(".info"));
    const nameElements = Array.from(chartPage.querySelectorAll(".name"));

    const infoTexts = infoElements.map((element) => element.innerText);
    const nameTexts = nameElements.map((element) => element.innerText);

    return { info: infoTexts, name: nameTexts };
  });

  const formattedData = data.name.map((artist, index) => ({
    artist: artist,
    song: data.info[index],
  }));

  await browser.close();
  logger.info("top Hebrew songs scrapped successfully");

  return formattedData;
};

export default scrapeTopHebrewSongs;
