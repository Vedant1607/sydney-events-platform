import { useState, useEffect } from "react";
import axios from "axios";
import EventCard from "./EventCard";
import EmailModal from "./EmailModal";
import { Loader2 } from "lucide-react";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/events`,
      );
      setEvents(response.data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTickets = (event) => {
    setSelectedEvent(event);
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (email, consent) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/subscriptions`,
        {
          email,
          consent,
          eventId: selectedEvent._id,
        },
      );

      // Redirect to event page
      window.open(response.data.redirectUrl, "_blank");
      setShowEmailModal(false);
    } catch (error) {
      console.error("Error submitting email:", error);
      alert("Failed to submit. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Events in Sydney
        </h1>
        <p className="text-gray-600">
          Discover amazing events happening around you
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onGetTickets={handleGetTickets}
            />
          ))}
        </div>
      )}

      {showEmailModal && (
        <EmailModal
          event={selectedEvent}
          onClose={() => setShowEmailModal(false)}
          onSubmit={handleEmailSubmit}
        />
      )}
    </div>
  );
}
