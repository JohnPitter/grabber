<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Download public videos from YouTube and Instagram**

*Clean Architecture, Firebase Cloud Functions v2, React 18, yt-dlp*

[Architecture](docs/ARCHITECTURE.md) • [Setup](docs/SETUP.md) • [API](docs/API.md) • [Changelog](CHANGELOG.md)

</div>

---

## About

Media Grabber is a full-stack application for downloading public videos from YouTube and Instagram. Built with Clean Architecture principles, Firebase serverless infrastructure, and a modern React frontend.

---

## Features

| Feature | Description |
|---------|-------------|
| YouTube Support | Watch pages, shorts, and youtu.be links |
| Instagram Support | Posts and reels |
| Format Selection | Choose video quality, resolution, and format |
| Cache Layer | Firestore-based caching with TTL for metadata and download URLs |
| Rate Limiting | IP-based rate limiting (10 req/min) |
| Structured Logging | Pino with automatic sensitive data redaction |
| Dark/Light Mode | Theme toggle with system preference detection |
| Responsive Design | Mobile-first layout with Tailwind CSS |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| Backend | Firebase Cloud Functions v2, Node.js 20 |
| Database | Cloud Firestore (caching, rate limiting) |
| Storage | Firebase Storage (temporary video files) |
| Download Engine | yt-dlp via youtube-dl-exec |
| Validation | Zod |
| Logging | Pino |
| Testing | Vitest, Testing Library |
| CI/CD | GitHub Actions |

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 10+ |
| Firebase CLI | Latest |

---

## Quick Start

```bash
git clone https://github.com/JohnPitter/grabber.git
cd grabber

npm install
cd functions && npm install && cd ..

npm run dev
```

See [Setup Guide](docs/SETUP.md) for full installation and deployment instructions.

---

## Architecture

```
functions/src/
  domain/          Entities, value objects, interfaces
  application/     Use cases, DTOs
  infrastructure/  yt-dlp, Firestore cache, Firebase Storage, Pino logger
  presentation/    Cloud Functions, middlewares, validators
  shared/          Error types, constants
```

See [Architecture](docs/ARCHITECTURE.md) for detailed documentation.

---

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/getVideoInfo` | POST | Fetch video metadata |
| `/downloadVideo` | POST | Download video, return signed URL |
| `/healthCheck` | GET | Service health status |

See [API Documentation](docs/API.md) for request/response details.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `npm test` | Run frontend tests |
| `cd functions && npm run serve` | Start Firebase emulators |
| `cd functions && npm run build` | Build Cloud Functions |
| `cd functions && npm test` | Run backend tests |
| `firebase deploy` | Deploy to Firebase |

---

## License

MIT
