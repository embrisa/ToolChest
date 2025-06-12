import { z } from "zod";

/**
 * Canonical schema for `pages.error` translation namespace.
 */
export const PagesErrorSchema = z
    .object({
        notFound: z.object({
            errorCode: z.string(),
            title: z.string(),
            description: z.string(),
            suggestions: z.object({
                title: z.string(),
                checkUrl: z.string(),
                useNavigation: z.string(),
                returnHome: z.string(),
                searchTools: z.string(),
            }),
            actions: z.object({
                goToHome: z.string(),
                goBack: z.string(),
            }),
            popularTools: z.object({
                title: z.string(),
                base64: z.object({
                    title: z.string(),
                    description: z.string(),
                }),
                hashGenerator: z.object({
                    title: z.string(),
                    description: z.string(),
                }),
                faviconGenerator: z.object({
                    title: z.string(),
                    description: z.string(),
                }),
                markdownToPdf: z.object({
                    title: z.string(),
                    description: z.string(),
                }),
            }),
            contact: z.object({
                prompt: z.string(),
                link: z.string(),
            }),
            screenReader: z.object({
                announcement: z.string(),
            }),
        }),
        serverError: z.object({
            title: z.string(),
            message: z.string(),
            description: z.string(),
            suggestions: z.object({
                0: z.string(),
                1: z.string(),
                2: z.string(),
                3: z.string(),
            }),
            actions: z.object({
                refreshPage: z.string(),
                goBack: z.string(),
                goToHome: z.string(),
                contactSupport: z.string(),
            }),
            technical: z.object({
                title: z.string(),
                errorInfo: z.string(),
                copyDetails: z.string(),
                copiedToClipboard: z.string(),
            }),
        }),
        boundary: z.object({
            title: z.string(),
            description: z.string(),
            details: z.string(),
            reload: z.string(),
            reportIssue: z.string(),
        }),
    })
    .strict();

export type PagesErrorMessages = z.infer<typeof PagesErrorSchema>; 