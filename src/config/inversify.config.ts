import { Container } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { ToolService, ToolServiceImpl } from '../services/toolService';
import { Base64Service, Base64ServiceImpl } from '../services/base64Service';
import { Base64Controller } from '../controllers/base64Controller';
import { HomeController } from '../controllers/homeController';
import { TYPES } from './types'; // Import TYPES from the new file

// Create a new Inversify container and use named export
export const appContainer = new Container();

// Bind PrismaClient to a singleton scope
appContainer.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(new PrismaClient());

// Bind services
appContainer.bind<ToolService>(TYPES.ToolService).to(ToolServiceImpl).inSingletonScope();
appContainer.bind<Base64Service>(TYPES.Base64Service).to(Base64ServiceImpl).inSingletonScope();

// Bind controllers
appContainer.bind<Base64Controller>(TYPES.Base64Controller).to(Base64Controller).inSingletonScope();
appContainer.bind<HomeController>(TYPES.HomeController).to(HomeController).inSingletonScope();

// Remove default export if it existed, ensure only named export for appContainer
// export default container; // Assuming 'container' was the old name for default export 