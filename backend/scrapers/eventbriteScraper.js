import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeEventbriteEvents() {
  try {
    const { data: html } = await axios.get(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const $ = cheerio.load(html);
    const events = [];

    // Find all event card links
    $('a[href*="/e/"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr("href");

      // Skip if not an event link
      if (!href || !href.includes("/e/") || href.includes("/organizer/")) {
        return;
      }

      // Get the parent container
      const $eventCard = $link.closest("div").parent();

      // Extract title
      const $heading = $link.find("h3, h2, h1");
      const title = $heading.text().trim();

      if (!title) return;

      // Extract URL
      let eventUrl = href;
      if (!eventUrl.startsWith("http")) {
        eventUrl = `https://www.eventbrite.com.au${eventUrl}`;
      }

      // Get all text from card
      const cardText = $eventCard.text();

      // Extract date/time
      const dateTimeRegex =
        /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Today|Tomorrow|Mon|Tue|Wed|Thu|Fri|Sat|Sun).*?(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i;
      const fullDateRegex =
        /(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),\s*\d{1,2}:\d{2}\s*(?:am|pm)/i;

      let dateTime = "";
      const dateMatch =
        cardText.match(fullDateRegex) || cardText.match(dateTimeRegex);
      if (dateMatch) {
        dateTime = dateMatch[0].trim();
      }

      // Parse all lines
      const lines = cardText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      let venue = "";
      let price = "";
      let organizer = "";
      let followers = "";
      let status = "";

      lines.forEach((line, idx) => {
        // Price patterns
        if (line.match(/^From\s+\$[\d,.]+$/i)) {
          price = line;
        } else if (line.match(/^Free$/i)) {
          price = "Free";
        } else if (line.match(/^Check ticket price for event$/i)) {
          price = "Check ticket price for event";
        }

        // Followers
        if (line.match(/^[\d,.]+k?\s+followers?$/i)) {
          followers = line;
        }

        // Status
        if (
          line.match(/^(Almost full|Sales end soon|Selling quickly|Promoted)$/i)
        ) {
          status = line;
        }

        // Venue (after date, before price)
        if (
          !venue &&
          idx > 0 &&
          !line.match(
            /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Today|Tomorrow|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i,
          ) &&
          !line.match(/^From\s+\$/i) &&
          !line.match(/^Free$/i) &&
          !line.match(/followers?$/i) &&
          !line.match(
            /^(Almost full|Sales end soon|Selling quickly|Promoted|Save this event)$/i,
          ) &&
          !line.match(/Check ticket price/i) &&
          line !== title &&
          line.length > 2 &&
          line.length < 100
        ) {
          if (
            lines[idx - 1] &&
            lines[idx - 1].match(
              /(AM|PM|am|pm|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/,
            )
          ) {
            venue = line;
          }
        }

        // Organizer (after price, before followers)
        if (
          !organizer &&
          price &&
          !followers &&
          !line.match(
            /^(Almost full|Sales end soon|Selling quickly|Promoted|Save this event|From|Free|Check ticket)/i,
          ) &&
          !line.match(/followers?$/i) &&
          line !== title &&
          line !== venue &&
          line !== price &&
          line !== dateTime &&
          line.length > 2 &&
          line.length < 100
        ) {
          organizer = line;
        }
      });

      // Add event if valid
      if (title && (dateTime || venue)) {
        const eventData = {
          title,
          url: eventUrl,
          dateTime,
          venue,
          price,
          organizer,
          followers,
          status,
        };

        // Check for duplicates
        const isDuplicate = events.some(
          (e) => e.title === eventData.title && e.url === eventData.url,
        );

        if (!isDuplicate) {
          events.push(eventData);
        }
      }
    });

    return events;
  } catch (error) {
    console.error("Scraping failed:", error.message);
    throw error;
  }
}

export default scrapeEventbriteEvents;
