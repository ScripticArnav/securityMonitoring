import express from 'express';
import { createNotification, getNotifications } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/create', createNotification);
router.get('/', getNotifications);

export default router;
