import { Router } from 'express';
import { lessonsController } from '@/controllers/lessons/controller';

const router = Router();

lessonsController(router);

export default router;
