# Setup Guide

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 10+ |
| Firebase CLI | Latest |
| yt-dlp | Latest (auto-installed via npm) |

---

## Installation

```bash
# Clone the repository
git clone https://github.com/JohnPitter/grabber.git
cd grabber

# Install frontend dependencies
npm install

# Install functions dependencies
cd functions && npm install && cd ..
```

---

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Firebase Storage
4. Update `.firebaserc` with your project ID

```bash
# Login to Firebase
firebase login

# Initialize project (select existing project)
firebase use --add
```

---

## Development

```bash
# Start frontend dev server
npm run dev

# Start Firebase emulators (in another terminal)
cd functions && npm run serve

# Run tests
cd functions && npm test
```

---

## Deployment

```bash
# Build frontend
npm run build

# Build functions
cd functions && npm run build

# Deploy everything
firebase deploy
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Pino log level | `info` |
