import DetectionLog from "../models/DetectionLog.js";

const logDetection = async (req, res) => {
  try {
    const newLog = new DetectionLog(req.body);
    await newLog.save();
    res.status(201).json({ message: 'Detection logged successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log detection' });
  }
};

const getDetections = async (req, res) => {
  try {
    const logs = await DetectionLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch detection logs' });
  }
};

export {logDetection, getDetections};