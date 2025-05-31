# ToolChest - Web Tools Collection

A modern web application built with **Next.js 15** providing useful tools for developers and content creators. Features client-side processing for privacy and performance.

## ✨ Features

### 🔧 Available Tools
- **Base64 Encoder/Decoder** - Convert text and files to/from Base64 with URL-safe options
- **Hash Generator** - Generate MD5, SHA-1, SHA-256, SHA-512 hashes for text and files
- **Favicon Generator** - Create favicons in all standard sizes from any image
- **Markdown to PDF** - Convert Markdown to professional PDFs with syntax highlighting

### 🎯 Key Features
- **Privacy-First**: All processing happens client-side when possible
- **Accessibility**: WCAG 2.1 AA compliant throughout
- **Performance**: Optimized for Core Web Vitals
- **Mobile-Friendly**: Responsive design for all devices
- **Admin Dashboard**: Simple token-based admin access for analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or SQLite for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd ToolChest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio

# Quality & Testing
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run test         # Run Jest tests
npm run test:e2e     # Run Playwright E2E tests
npm run validate     # Run all quality checks

# Performance
npm run analyze      # Analyze bundle size
npm run validate:performance  # Run Lighthouse tests
```

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── tools/          # Tool pages
│   └── admin/          # Admin interface
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── tools/         # Tool-specific components
│   └── admin/         # Admin components
├── services/          # Business logic services
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🔐 Admin Access

The application includes a simple admin dashboard for analytics and management:

1. Set `ADMIN_SECRET_TOKEN` in your environment variables
2. Visit `/admin/dashboard` 
3. Enter your secret token
4. Access tools, tags, and analytics management

## 🌐 Deployment

### Railway (Recommended)

1. **Connect your repository to Railway**
2. **Set environment variables:**
   ```bash
   DATABASE_URL=postgresql://...
   ADMIN_SECRET_TOKEN=your-secret-token
   ```
3. **Deploy automatically on git push**

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 📊 Architecture

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: SWR for server state, React state for UI
- **Testing**: Jest + React Testing Library + Playwright
- **Performance**: Core Web Vitals optimized

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run validate`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Migration Complete**: Successfully migrated from Express.js + HTMX to Next.js + React while maintaining all functionality and improving performance and accessibility.
