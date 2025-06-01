import express from 'express';
import dotenv from 'dotenv';
import { detectionRoutes, userRoutes, notificationRoutes } from './routes/index.js';
import cors from 'cors'

dotenv.config();
const app = express();
app.use(cors())
app.use(express.json());

// Routes
app.use('/api/detections', detectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);


export default app;

