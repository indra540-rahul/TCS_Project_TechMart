import Notification from "../models/Notification.js";

export const createPublicContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Name, email, subject, and message are required" });
    }

    const notification = await Notification.create({
      title: `Contact: ${subject.trim()}`,
      message: `From ${name.trim()} (${email.trim()}): ${message.trim()}`,
      type: "contact"
    });

    res.status(201).json({
      message: "Message submitted successfully",
      notification
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit message", error: error.message });
  }
};

export const getNotifications = async (_req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification", error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notification", error: error.message });
  }
};
