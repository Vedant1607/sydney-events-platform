import express from "express";
import { Event } from "../models/Event";
import { EmailSubscription } from "../models/EmailSubscription";

const router = express.Router();

// Create email subscription
router.post("/", async (req, res) => {
  try {
    const { email, consent, eventId } = req.body;

    if (!email || !consent) {
      return res.status(400).json({ error: "Email and consent required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const subscription = await EmailSubscription.create({
      email,
      consent,
      eventId,
      eventTitle: event.title,
      eventUrl: event.originalUrl,
    });

    res.status(201).json({
      message: "Subscription created",
      subscription,
      redirectUrl: event.originalUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscriptions (for analytics - requires auth)
router.get("/", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const subscriptions = await EmailSubscription.find()
      .populate("eventId")
      .sort({ subscribedAt: -1 })
      .limit(100);

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
