import { Router } from 'express';
import { validateOAS, validateOASFile } from '../controllers/validationController';
import upload from '../middleware/uploadMiddleware';

export const validationRouter = Router();

/**
 * POST /api/validate/content
 * Validate OAS from raw content
 * Body: { oasContent: string, oasFormat: 'json'|'yaml', rulesetUrl?: string }
 */
validationRouter.post('/content', validateOAS);

/**
 * POST /api/validate/file
 * Validate OAS from uploaded file
 * FormData: file (JSON/YAML), rulesetUrl (optional)
 */
validationRouter.post('/file', upload.single('file'), validateOASFile);
