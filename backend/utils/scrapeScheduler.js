const cron = require('node-cron');
const Event = require('../models/Event');
const scrapeEventbrite = require('../scrapers/eventbriteScraper');
const scrapeTimeout = require('../scrapers/timeoutScraper');
const scrapeMeetup = require('../scrapers/meetupScraper');

async function runAllScrapers() {
  console.log('🕷️  Starting scheduled scraping...');
  
  try {
    const [eventbriteEvents, timeoutEvents, meetupEvents] = await Promise.all([
      scrapeEventbrite(),
      scrapeTimeout(),
      scrapeMeetup()
    ]);
    
    const allEvents = [...eventbriteEvents, ...timeoutEvents, ...meetupEvents];
    console.log(`Scraped ${allEvents.length} events total`);
    
    for (const eventData of allEvents) {
      await processScrapedEvent(eventData);
    }
    
    await markInactiveEvents();
    
    console.log('Scraping completed');
  } catch (error) {
    console.error('Scraping error:', error.message);
  }
}

async function processScrapedEvent(eventData) {
  try {
    const existingEvent = await Event.findOne({ originalUrl: eventData.originalUrl });
    
    if (!existingEvent) {
      // New event
      await Event.create({
        ...eventData,
        status: 'new',
        isActive: true
      });
      console.log(`New event: ${eventData.title}`);
    } else {
      const hasChanges = 
        existingEvent.title !== eventData.title ||
        existingEvent.dateTime.getTime() !== eventData.dateTime.getTime() ||
        existingEvent.venueName !== eventData.venueName;
      
      if (hasChanges) {
        existingEvent.previousData = {
          title: existingEvent.title,
          dateTime: existingEvent.dateTime,
          venueName: existingEvent.venueName
        };
        
        Object.assign(existingEvent, eventData);
        existingEvent.status = 'updated';
        existingEvent.lastScrapedAt = new Date();
        
        await existingEvent.save();
        console.log(`🔄 Updated event: ${eventData.title}`);
      } else {
        existingEvent.lastScrapedAt = new Date();
        await existingEvent.save();
      }
    }
  } catch (error) {
    console.error(`Error processing event: ${error.message}`);
  }
}

// Mark events not scraped in last 48 hours as inactive
async function markInactiveEvents() {
  const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000);
  
  const result = await Event.updateMany(
    {
      lastScrapedAt: { $lt: cutoffTime },
      isActive: true
    },
    {
      $set: { status: 'inactive', isActive: false }
    }
  );
  
  console.log(`Marked ${result.modifiedCount} events as inactive`);
}

// Schedule scraping every 6 hours
function startScheduler() {
  runAllScrapers();
  
  cron.schedule('0 */6 * * *', () => {
    console.log('Scheduled scrape triggered');
    runAllScrapers();
  });
  
  console.log('Scraper scheduler started (runs every 6 hours)');
}

export { startScheduler, runAllScrapers };