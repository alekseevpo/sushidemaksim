import { Router } from 'express';
import { validateResource } from '../middleware/validateResource.js';
import { contactSchema } from '../schemas/contact.schema.js';
import { contactHandler } from '../controllers/contact.controller.js';

const router = Router();

/**
 * POST /api/contact
 * Refactored to use Controller-Service pattern and Zod validation.
 */
router.post('/', validateResource(contactSchema), contactHandler);

export default router;
