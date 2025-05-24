import { Container } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { ToolService, ToolServiceImpl } from '../services/toolService';
import { Base64Service, Base64ServiceImpl } from '../services/base64Service';
import { Base64Controller } from '../controllers/base64Controller';
import { HomeController } from '../controllers/homeController';
import { FaviconService, FaviconServiceImpl } from '../services/faviconService';
import { FaviconController } from '../controllers/faviconController';
import { HashService, HashServiceImpl } from '../services/hashService';
import { HashController } from '../controllers/hashController';
import { AdminAuthService, AdminAuthServiceImpl } from '../services/adminAuthService';
import { AdminAuditService, AdminAuditServiceImpl } from '../services/adminAuditService';
import { AdminUserService, AdminUserServiceImpl } from '../services/adminUserService';
import { AdminAuthController } from '../controllers/adminAuthController';
import { AdminDashboardController } from '../controllers/adminDashboardController';
import { AdminToolController } from '../controllers/adminToolController';
import { AdminTagController } from '../controllers/adminTagController';
import { AdminUserController } from '../controllers/adminUserController';
import { AdminToolService, AdminToolServiceImpl } from '../services/adminToolService';
import { AdminTagService, AdminTagServiceImpl } from '../services/adminTagService';
import { IAdminRelationshipService, AdminRelationshipServiceImpl } from '../services/adminRelationshipService';
import { IAdminRelationshipController, AdminRelationshipControllerImpl } from '../controllers/adminRelationshipController';
import { AdminAnalyticsService, AdminAnalyticsServiceImpl } from '../services/adminAnalyticsService';
import { IAdminAnalyticsController, AdminAnalyticsControllerImpl } from '../controllers/adminAnalyticsController';
import { TYPES } from './types'; // Import TYPES from the new file

// Create a new Inversify container and use named export
export const appContainer = new Container();

// Bind PrismaClient to a singleton scope
appContainer.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(new PrismaClient());

// Bind services
appContainer.bind<ToolService>(TYPES.ToolService).to(ToolServiceImpl).inSingletonScope();
appContainer.bind<Base64Service>(TYPES.Base64Service).to(Base64ServiceImpl).inSingletonScope();
appContainer.bind<FaviconService>(TYPES.FaviconService).to(FaviconServiceImpl).inSingletonScope();
appContainer.bind<HashService>(TYPES.HashService).to(HashServiceImpl).inSingletonScope();
appContainer.bind<AdminAuthService>(TYPES.AdminAuthService).to(AdminAuthServiceImpl).inSingletonScope();
appContainer.bind<AdminAuditService>(TYPES.AdminAuditService).to(AdminAuditServiceImpl).inSingletonScope();
appContainer.bind<AdminToolService>(TYPES.AdminToolService).to(AdminToolServiceImpl).inSingletonScope();
appContainer.bind<AdminTagService>(TYPES.AdminTagService).to(AdminTagServiceImpl).inSingletonScope();
appContainer.bind<AdminUserService>(TYPES.AdminUserService).to(AdminUserServiceImpl).inSingletonScope();
appContainer.bind<IAdminRelationshipService>(TYPES.AdminRelationshipService).to(AdminRelationshipServiceImpl).inSingletonScope();
appContainer.bind<AdminAnalyticsService>(TYPES.AdminAnalyticsService).to(AdminAnalyticsServiceImpl).inSingletonScope();

// Bind controllers
appContainer.bind<Base64Controller>(TYPES.Base64Controller).to(Base64Controller).inSingletonScope();
appContainer.bind<HomeController>(TYPES.HomeController).to(HomeController).inSingletonScope();
appContainer.bind<FaviconController>(TYPES.FaviconController).to(FaviconController).inSingletonScope();
appContainer.bind<HashController>(TYPES.HashController).to(HashController).inSingletonScope();
appContainer.bind<AdminAuthController>(TYPES.AdminAuthController).to(AdminAuthController).inSingletonScope();
appContainer.bind<AdminDashboardController>(TYPES.AdminDashboardController).to(AdminDashboardController).inSingletonScope();
appContainer.bind<AdminToolController>(TYPES.AdminToolController).to(AdminToolController).inSingletonScope();
appContainer.bind<AdminTagController>(TYPES.AdminTagController).to(AdminTagController).inSingletonScope();
appContainer.bind<AdminUserController>(TYPES.AdminUserController).to(AdminUserController).inSingletonScope();
appContainer.bind<IAdminRelationshipController>(TYPES.AdminRelationshipController).to(AdminRelationshipControllerImpl).inSingletonScope();
appContainer.bind<IAdminAnalyticsController>(TYPES.AdminAnalyticsController).to(AdminAnalyticsControllerImpl).inSingletonScope();

// Remove default export if it existed, ensure only named export for appContainer
// export default container; // Assuming 'container' was the old name for default export 