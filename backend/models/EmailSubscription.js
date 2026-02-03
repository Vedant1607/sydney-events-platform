import { mongoose } from "../utils/database";

const emailSubscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  consent: { type: Boolean, required: true, default: false },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  eventTitle: String,
  eventUrl: String,
  subscribedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

emailSubscriptionSchema.index({ email: 1, eventId: 1 });

export const EmailSubscription = mongoose.model("EmailSubscription", emailSubscriptionSchema);