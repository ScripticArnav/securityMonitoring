import express from 'express';
import {getDetections, logDetection} from "../controllers/detectionController.js"

const router = express.Router();

router.post('/log', logDetection);
router.get('/', getDetections);

export default router;
