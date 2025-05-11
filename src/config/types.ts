// Define symbols for injection
export const TYPES = {
    PrismaClient: Symbol.for('PrismaClient'),
    ToolService: Symbol.for('ToolService'),
    Base64Service: Symbol.for('Base64Service'),
    Base64Controller: Symbol.for('Base64Controller'),
    HomeController: Symbol.for('HomeController'),
    // HomeController: Symbol.for('HomeController'), // Will add when refactoring HomeController
}; 