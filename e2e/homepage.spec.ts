import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Homepage E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to homepage before each test
        await page.goto('/')
    })

    test.describe('Page Loading and Navigation', () => {
        test('should load homepage successfully', async ({ page }) => {
            // Wait for page to load
            await expect(page).toHaveTitle(/ToolChest/)

            // Check main heading is visible
            const heading = page.getByRole('heading', { level: 1 })
            await expect(heading).toBeVisible()
        })

        test('should display navigation header', async ({ page }) => {
            // Check header is present
            const header = page.getByRole('banner')
            await expect(header).toBeVisible()

            // Check logo/brand is clickable
            const brand = page.getByRole('link', { name: /toolchest/i })
            await expect(brand).toBeVisible()
        })

        test('should display footer with links', async ({ page }) => {
            // Check footer is present
            const footer = page.getByRole('contentinfo')
            await expect(footer).toBeVisible()

            // Check for footer links (adjust selectors based on actual implementation)
            const footerLinks = footer.getByRole('link')
            await expect(footerLinks.first()).toBeVisible()
        })
    })

    test.describe('Tool Discovery', () => {
        test('should display tool cards', async ({ page }) => {
            // Wait for tools to load
            await page.waitForSelector('[data-testid="tool-card"]', { timeout: 10000 })

            // Check that tool cards are visible
            const toolCards = page.getByTestId('tool-card')
            await expect(toolCards.first()).toBeVisible()

            // Should have multiple tools
            const cardCount = await toolCards.count()
            expect(cardCount).toBeGreaterThan(0)
        })

        test('should allow navigation to tool pages', async ({ page }) => {
            // Wait for tools to load
            await page.waitForSelector('[data-testid="tool-card"]', { timeout: 10000 })

            // Click on first tool card
            const firstTool = page.getByTestId('tool-card').first()
            const toolLink = firstTool.getByRole('link').first()

            await toolLink.click()

            // Should navigate to tool page
            await expect(page).toHaveURL(/\/tools\//)

            // Should have tool-specific content
            const toolHeading = page.getByRole('heading', { level: 1 })
            await expect(toolHeading).toBeVisible()
        })
    })

    test.describe('Search Functionality', () => {
        test('should have search input', async ({ page }) => {
            // Look for search input
            const searchInput = page.getByRole('searchbox')
            await expect(searchInput).toBeVisible()
            await expect(searchInput).toBeEditable()
        })

        test('should filter tools by search query', async ({ page }) => {
            // Wait for initial tools to load
            await page.waitForSelector('[data-testid="tool-card"]', { timeout: 10000 })

            // Get initial tool count
            const initialCount = await page.getByTestId('tool-card').count()

            // Search for specific tool
            const searchInput = page.getByRole('searchbox')
            await searchInput.fill('base64')

            // Wait for search results to update
            await page.waitForTimeout(500) // Allow for debouncing

            // Should show filtered results
            const filteredCount = await page.getByTestId('tool-card').count()
            expect(filteredCount).toBeLessThanOrEqual(initialCount)

            // Should show relevant results
            const toolCard = page.getByTestId('tool-card').first()
            const toolText = await toolCard.textContent()
            expect(toolText?.toLowerCase()).toContain('base64')
        })

        test('should handle empty search results', async ({ page }) => {
            const searchInput = page.getByRole('searchbox')
            await searchInput.fill('nonexistenttool12345')

            // Wait for search to complete
            await page.waitForTimeout(500)

            // Should show no results message or empty state
            const noResultsMessage = page.getByText(/no tools found/i)
            await expect(noResultsMessage).toBeVisible()
        })
    })

    test.describe('Tag Filtering', () => {
        test('should display tag filters', async ({ page }) => {
            // Look for tag filter section
            const tagFilters = page.getByTestId('tag-filters')
            await expect(tagFilters).toBeVisible()

            // Should have tag buttons
            const tagButtons = tagFilters.getByRole('button')
            await expect(tagButtons.first()).toBeVisible()
        })

        test('should filter tools by tag', async ({ page }) => {
            // Wait for tools to load
            await page.waitForSelector('[data-testid="tool-card"]', { timeout: 10000 })

            // Click on a tag filter
            const tagFilters = page.getByTestId('tag-filters')
            const firstTag = tagFilters.getByRole('button').first()
            await firstTag.click()

            // Should update URL with tag parameter
            await expect(page).toHaveURL(/[?&]tags=/)

            // Should filter tools
            const toolCards = page.getByTestId('tool-card')
            await expect(toolCards.first()).toBeVisible()
        })
    })

    test.describe('Responsive Design', () => {
        test('should work on mobile devices', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 })

            // Check that page is still functional
            const heading = page.getByRole('heading', { level: 1 })
            await expect(heading).toBeVisible()

            // Check that navigation is accessible (might be in mobile menu)
            const navigation = page.getByRole('navigation')
            await expect(navigation).toBeVisible()
        })

        test('should work on tablet devices', async ({ page }) => {
            // Set tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 })

            // Check responsive layout
            const toolCards = page.getByTestId('tool-card')
            await expect(toolCards.first()).toBeVisible()

            // Tools should be arranged appropriately for tablet
            const cardCount = await toolCards.count()
            expect(cardCount).toBeGreaterThan(0)
        })
    })

    test.describe('Performance', () => {
        test('should load within performance budget', async ({ page }) => {
            const startTime = Date.now()

            await page.goto('/')
            await page.waitForLoadState('networkidle')

            const loadTime = Date.now() - startTime

            // Should load within 5 seconds
            expect(loadTime).toBeLessThan(5000)
        })

        test('should have good Core Web Vitals', async ({ page }) => {
            await page.goto('/')

            // Measure Largest Contentful Paint (LCP)
            const lcp = await page.evaluate(() => {
                return new Promise((resolve) => {
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries()
                        const lastEntry = entries[entries.length - 1]
                        resolve(lastEntry.startTime)
                    }).observe({ entryTypes: ['largest-contentful-paint'] })

                    // Fallback timeout
                    setTimeout(() => resolve(0), 5000)
                })
            })

            // LCP should be under 2.5 seconds
            expect(lcp).toBeLessThan(2500)
        })
    })
})

// Accessibility-specific test suite
test.describe('Homepage Accessibility Tests', () => {
    test('should not have any accessibility violations', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const accessibilityScanResults = await new AxeBuilder({ page })
            .include('body')
            .exclude('[data-testid="loading"]') // Exclude loading states
            .analyze()

        expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should be navigable by keyboard', async ({ page }) => {
        await page.goto('/')

        // Test tab navigation
        await page.keyboard.press('Tab')

        // Should focus on first interactive element
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()

        // Continue tabbing through interactive elements
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')

        // Should maintain visible focus indicators
        const newFocusedElement = page.locator(':focus')
        await expect(newFocusedElement).toBeVisible()
    })

    test('should work with screen readers', async ({ page }) => {
        await page.goto('/')

        // Check for proper headings hierarchy
        const h1 = page.getByRole('heading', { level: 1 })
        await expect(h1).toBeVisible()

        // Check for landmark regions
        const main = page.getByRole('main')
        await expect(main).toBeVisible()

        const navigation = page.getByRole('navigation')
        await expect(navigation).toBeVisible()

        // Check for alternative text on images
        const images = page.getByRole('img')
        const imageCount = await images.count()

        for (let i = 0; i < imageCount; i++) {
            const image = images.nth(i)
            const altText = await image.getAttribute('alt')
            expect(altText).toBeTruthy()
        }
    })

    test('should respect reduced motion preferences', async ({ page }) => {
        // Simulate prefers-reduced-motion
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto('/')

        // Page should still be functional without animations
        const heading = page.getByRole('heading', { level: 1 })
        await expect(heading).toBeVisible()

        // Interactive elements should still work
        const searchInput = page.getByRole('searchbox')
        await expect(searchInput).toBeVisible()
        await searchInput.fill('test')
    })
}) 