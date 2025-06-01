import NotificationLog from "../models/NotificationLog.js";

const createNotification = async (req, res) => {
  try {
    const newNotification = new NotificationLog(req.body);
    await newNotification.save();
    res.status(201).json({ message: 'Notification created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationLog.find().sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export {createNotification, getNotifications};
