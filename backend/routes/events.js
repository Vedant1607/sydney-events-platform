import express from "express";
import { Event } from "../models/Event";

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

router.get('/', async (req, res) => {
  try {
    const {
      city = 'Sydney',
      search,
      startDate,
      endDate,
      status,
      category,
      page = 1,
      limit = 20
    } = req.query;
    
    const query = { city, isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (startDate || endDate) {
      query.dateTime = {};
      if (startDate) query.dateTime.$gte = new Date(startDate);
      if (endDate) query.dateTime.$lte = new Date(endDate);
    }
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    const events = await Event.find(query)
      .sort({ dateTime: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import event (dashboard - requires auth)
router.post('/:id/import', requireAuth, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          imported: true,
          importedAt: new Date(),
          importedBy: req.user._id,
          importNotes: notes || '',
          status: 'imported'
        }
      },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats (requires auth)
router.get('/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Event.countDocuments({ isActive: true });
    
    res.json({
      total,
      byStatus: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;