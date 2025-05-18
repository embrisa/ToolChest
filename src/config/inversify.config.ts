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

// Bind controllers
appContainer.bind<Base64Controller>(TYPES.Base64Controller).to(Base64Controller).inSingletonScope();
appContainer.bind<HomeController>(TYPES.HomeController).to(HomeController).inSingletonScope();
appContainer.bind<FaviconController>(TYPES.FaviconController).to(FaviconController).inSingletonScope();
appContainer.bind<HashController>(TYPES.HashController).to(HashController).inSingletonScope();

// Remove default export if it existed, ensure only named export for appContainer
// export default container; // Assuming 'container' was the old name for default export 