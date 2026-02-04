import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeTimeout() {
  const events = [];

  try {
    const url =
      "https://www.timeout.com/sydney/things-to-do/whats-on-in-sydney-today";
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);

    $(".card").each((i, element) => {
      try {
        const title = $(element).find("h3").text().trim();
        const description = $(element).find(".cardDesc").text().trim();
        const link = $(element).find("a").attr("href");
        const image = $(element).find("img").attr("src");
        const category = $(element).find(".cardCategory").text().trim();

        if (title && link) {
          events.push({
            title,
            dateTime: new Date(), // TimeOut doesn't always have specific dates
            venueName: "Various Locations",
            venueAddress: "Sydney",
            city: "Sydney",
            description: description.substring(0, 300),
            category: category ? [category] : ["Events"],
            imageUrl: image || "",
            sourceWebsite: "TimeOut Sydney",
            originalUrl: link.startsWith("http")
              ? link
              : `https://www.timeout.com${link}`,
            lastScrapedAt: new Date(),
          });
        }
      } catch (err) {
        console.error("Error parsing event:", err.message);
      }
    });
  } catch (error) {
    console.error("TimeOut scraping error:", error.message);
  }

  return events;
}

export default scrapeTimeout;
