import { Request, Response, NextFunction } from 'express';
import { SpectralService } from '../services/spectralService';
import { ValidationRequest } from '../types/index';

const spectralServiceInstance = new SpectralService();

export const validateOAS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oasContent, oasFormat = 'json', rulesetUrl } = req.body as ValidationRequest;

    if (!oasContent) {
      return res.status(400).json({ error: 'OAS content is required' });
    }

    // Setup ruleset if custom one provided
    await spectralServiceInstance.setupRuleset(rulesetUrl);

    // Validate OAS
    const result = await spectralServiceInstance.validateOAS(oasContent, oasFormat);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const validateOASFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const oasContent = req.file.buffer.toString('utf-8');
    const oasFormat = req.file.originalname.endsWith('.json') ? 'json' : 'yaml';
    const { rulesetUrl } = req.body;

    // Setup ruleset if custom one provided
    await spectralServiceInstance.setupRuleset(rulesetUrl);

    // Validate OAS
    const result = await spectralServiceInstance.validateOAS(oasContent, oasFormat);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
