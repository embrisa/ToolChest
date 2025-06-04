# tool-chest - Essential Computer Tools Collection

A modern, privacy-focused collection of essential computer tools built with Next.js 15+. All processing happens client-side to ensure your data never leaves your browser.

## 🚀 Features

- **Privacy-First**: All tools run entirely in your browser
- **Modern UI**: Built with Next.js 15+ and Tailwind CSS
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized for speed and efficiency
- **Mobile-Friendly**: Responsive design for all devices

## 🛠️ Available Tools

- **Base64 Encoder/Decoder**: Convert text to/from Base64 encoding
- **Hash Generator**: Generate MD5, SHA-1, SHA-256, and other hashes
- **Favicon Generator**: Create favicons from images or text
- **Markdown to PDF**: Convert Markdown documents to PDF with custom styling

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/your-username/tool-chest.git
cd tool-chest
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y
```

## 🚀 Deployment

### Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

If you use Railway's Node environment instead of Docker, be sure to run
database migrations with:

```bash
npm run db:deploy
```

before starting the server.

### Docker Deployment

```bash
# Build and run with Docker Compose (includes PostgreSQL)
npm run docker:dev

# Or build and run manually
npm run docker:build
npm run docker:run
```

### Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/toolchest"
ADMIN_SECRET_TOKEN="your-secure-admin-token"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Troubleshooting Database Migrations

If `npm run db:deploy` fails with a `P3018` error complaining that a table already exists, the database schema is ahead of your migration history. Mark the initial migration as applied:

```bash
npx prisma migrate resolve --applied 20250601140917_init
```

Then run `npm run db:deploy` again.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── services/           # Business logic and API services
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is released under a custom Source Code License. You may read the code and copy small snippets, but hosting or redistributing the entire website is not allowed. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Designed to be a comprehensive toolkit for everyday computer tasks
