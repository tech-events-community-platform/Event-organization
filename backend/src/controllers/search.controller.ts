import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { sendSuccess } from '../utils/apiResponse';

export class SearchController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q || req.query.query || '') as string;
      const results = await SearchService.searchPublic(q);
      return sendSuccess(res, results, 'Public search results.');
    } catch (error) {
      next(error);
    }
  }
}
