import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { ToolService } from '../services/toolService';

@injectable()
class HomeController {
    constructor(
        @inject(TYPES.ToolService) private toolService: ToolService
    ) { }

    public getHomePage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const popularTools = await this.toolService.getPopularTools(5);
            res.render('pages/home', {
                title: 'Home',
                description: 'A collection of useful online developer tools.',
                popularTools,
            });
        } catch (error) {
            console.error('Error fetching home page data:', error);
            // Pass error to the centralized error handler
            next(error);
        }
    }
}

export { HomeController }; 