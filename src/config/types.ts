// Define symbols for injection
export const TYPES = {
    PrismaClient: Symbol.for('PrismaClient'),
    ToolService: Symbol.for('ToolService'),
    Base64Service: Symbol.for('Base64Service'),
    Base64Controller: Symbol.for('Base64Controller'),
    HomeController: Symbol.for('HomeController'),
    // HomeController: Symbol.for('HomeController'), // Will add when refactoring HomeController
    // New symbols for Favicon Generator
    FaviconService: Symbol.for('FaviconService'),
    FaviconController: Symbol.for('FaviconController'),
    // New symbols for Hash Generator
    HashService: Symbol.for('HashService'),
    HashController: Symbol.for('HashController'),
    // Admin symbols
    AdminAuthService: Symbol.for('AdminAuthService'),
    AdminAuditService: Symbol.for('AdminAuditService'),
    AdminToolService: Symbol.for('AdminToolService'),
    AdminTagService: Symbol.for('AdminTagService'),
    AdminAuthController: Symbol.for('AdminAuthController'),
    AdminDashboardController: Symbol.for('AdminDashboardController'),
    AdminToolController: Symbol.for('AdminToolController'),
    AdminTagController: Symbol.for('AdminTagController'),
    AdminRelationshipService: Symbol.for('AdminRelationshipService'),
    AdminRelationshipController: Symbol.for('AdminRelationshipController'),
    AdminAnalyticsService: Symbol.for('AdminAnalyticsService'),
    AdminAnalyticsController: Symbol.for('AdminAnalyticsController'),
}; 