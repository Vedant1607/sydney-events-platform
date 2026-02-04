import axios from "axios";

async function scrapeMeetup() {
  const events = [];
  
  try {
    const sampleEvents = [
      {
        title: 'Sydney Tech Meetup',
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        venueName: 'Innovation Hub Sydney',
        venueAddress: '123 Tech Street, Sydney',
        city: 'Sydney',
        description: 'Join us for an evening of tech talks and networking',
        category: ['Technology', 'Networking'],
        imageUrl: 'https://via.placeholder.com/400x300',
        sourceWebsite: 'Meetup',
        originalUrl: 'https://www.meetup.com/sydney-tech',
        lastScrapedAt: new Date()
      }
    ];
    
    events.push(...sampleEvents);
    
  } catch (error) {
    console.error('Meetup scraping error:', error.message);
  }
  
  return events;
}

export default scrapeMeetup;