import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";

// Common
import enCommon from "../../messages/common/en.json";

// Components
import enComponentsForms from "../../messages/components/forms/en.json";
import enComponentsLayout from "../../messages/components/layout/en.json";
import enComponentsUi from "../../messages/components/ui/en.json";

// Database
import enDatabase from "../../messages/database/en.json";

// Pages
import enPagesAdmin from "../../messages/pages/admin/en.json";
import enPagesError from "../../messages/pages/error/en.json";
import enPagesHome from "../../messages/pages/home/en.json";
import enPagesLoading from "../../messages/pages/loading/en.json";
import enPagesTools from "../../messages/pages/tools/en.json";

// Tools
import enToolsBase64 from "../../messages/tools/base64/en.json";
import enToolsCommon from "../../messages/tools/common/en.json";
import enToolsFaviconGenerator from "../../messages/tools/favicon-generator/en.json";
import enToolsHashGenerator from "../../messages/tools/hash-generator/en.json";
import enToolsMarkdownToPdf from "../../messages/tools/markdown-to-pdf/en.json";

const messages: AbstractIntlMessages = {
    common: enCommon,
    components: {
        forms: enComponentsForms,
        layout: enComponentsLayout,
        ui: enComponentsUi,
    },
    database: enDatabase,
    pages: {
        admin: enPagesAdmin,
        error: enPagesError,
        home: enPagesHome,
        loading: enPagesLoading,
        tools: enPagesTools,
    },
    tools: {
        base64: enToolsBase64,
        common: enToolsCommon,
        "favicon-generator": enToolsFaviconGenerator,
        "hash-generator": enToolsHashGenerator,
        "markdown-to-pdf": enToolsMarkdownToPdf,
    },
} as any;

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render }; 