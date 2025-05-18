import { Request, Response } from 'express';

class StaticPageController {
    public getPrivacyPolicy(req: Request, res: Response) {
        res.render('pages/privacy-policy', {
            title: 'Privacy Policy',
        });
    }

    public getTermsOfService(req: Request, res: Response) {
        res.render('pages/static/terms.njk', {
            title: 'Terms of Service',
        });
    }

    public getContactPage(req: Request, res: Response) {
        res.render('pages/static/contact.njk', {
            title: 'Contact Us',
        });
    }
}

export const staticPageController = new StaticPageController(); 