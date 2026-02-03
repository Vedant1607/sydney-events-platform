import { mongoose } from "../utils/database";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dateTime: { type: Date, required: true },
  endDateTime: { type: Date },
  venueName: String,
  venueAddress: String,
  city: { type: String, default: 'Sydney' },
  description: String,
  category: [String],
  tags: [String],
  imageUrl: String,
  sourceWebsite: { type: String, required: true },
  originalUrl: { type: String, required: true },
  lastScrapedAt: { type: Date, default: Date.now },
  
  status: {
    type: String,
    enum: ['new', 'updated', 'inactive', 'imported'],
    default: 'new'
  },
  
  imported: { type: Boolean, default: false },
  importedAt: Date,
  importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  importNotes: String,
  
  previousData: mongoose.Schema.Types.Mixed,
  isActive: { type: Boolean, default: true },
  
  // additional metadata
  price: String,
  priceRange: String,
  ticketUrl: String
}, {
  timestamps: true
});

eventSchema.index({ dateTime: 1, city: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ originalUrl: 1 }, { unique: true });
eventSchema.index({ title: 'text', description: 'text', venueName: 'text' });

export const Event = mongoose.model("Event", eventSchema);