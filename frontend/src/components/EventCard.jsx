import { Calendar, MapPin, ExternalLink, Tag } from "lucide-react";

export default function EventCard({ event, onGetTickets }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {event.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=Event+Image";
            }}
          />
        </div>
      )}

      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{formatDate(event.dateTime)}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{event.venueName || "Venue TBA"}</span>
          </div>
        </div>

        {event.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {event.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">{event.sourceWebsite}</span>
          </div>

          <button
            onClick={() => onGetTickets(event)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            GET TICKETS
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
