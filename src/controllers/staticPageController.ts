import { Request, Response } from 'express';

class StaticPageController {
    public getPrivacyPolicy(req: Request, res: Response) {
        res.render('pages/coming-soon', {
            title: 'Privacy Policy',
            description: 'Our Privacy Policy page is coming soon.',
            pageTitle: 'Privacy Policy'
        });
    }

    public getTermsOfService(req: Request, res: Response) {
        res.render('pages/coming-soon', {
            title: 'Terms of Service',
            description: 'Our Terms of Service page is coming soon.',
            pageTitle: 'Terms of Service'
        });
    }

    public getContactPage(req: Request, res: Response) {
        res.render('pages/coming-soon', {
            title: 'Contact Us',
            description: 'Our Contact Us page is coming soon.',
            pageTitle: 'Contact Us'
        });
    }
}

export const staticPageController = new StaticPageController(); 