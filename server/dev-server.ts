import express from "express";
import cors from "cors";
import youtubeDlExec from "youtube-dl-exec";
import { randomUUID } from "crypto";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Serve downloaded files
const DOWNLOADS_DIR = path.join(os.tmpdir(), "grabber-downloads");
fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
app.use("/downloads", express.static(DOWNLOADS_DIR));

// In-memory cache
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// Rate limiting (in-memory)
const rateLimits = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 30; // More generous for local dev
const RATE_WINDOW = 60_000;

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW) {
    rateLimits.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// URL validation
const SUPPORTED_URL =
  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|instagram\.com)\//;

// ── GET /api/health ──────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), mode: "local" });
});

// ── POST /api/video/info ─────────────────────────────────────────────
app.post("/api/video/info", async (req, res) => {
  const requestId = randomUUID();
  const ip = req.ip || "local";

  if (!checkRate(ip)) {
    res.status(429).json({ error: { code: "RATE_LIMIT", message: "Too many requests" }, requestId });
    return;
  }

  const { url } = req.body as { url?: string };
  if (!url || !SUPPORTED_URL.test(url)) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid or unsupported URL" }, requestId });
    return;
  }

  const cacheKey = `info:${url}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log(`[${requestId}] Cache hit for ${url}`);
    res.json({ data: cached, requestId });
    return;
  }

  try {
    console.log(`[${requestId}] Fetching info for ${url}`);

    const result = await youtubeDlExec(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    }) as Record<string, unknown>;

    const formats = ((result.formats as Array<Record<string, unknown>>) || [])
      .filter((f) => f.vcodec !== "none" || f.acodec !== "none")
      .map((f) => ({
        formatId: f.format_id as string,
        extension: f.ext as string,
        quality: (f.format_note as string) || "unknown",
        resolution:
          f.width && f.height ? `${f.width}x${f.height}` : (f.resolution as string) || null,
        fileSize: (f.filesize as number) || (f.filesize_approx as number) || null,
        hasAudio: f.acodec !== "none" && f.acodec !== undefined,
        hasVideo: f.vcodec !== "none" && f.vcodec !== undefined,
      }));

    const platform = url.includes("instagram.com") ? "instagram" : "youtube";

    const data = {
      id: result.id as string,
      title: result.title as string,
      description: (result.description as string) || "",
      thumbnail: (result.thumbnail as string) || "",
      duration: (result.duration as number) || 0,
      platform,
      uploader: (result.uploader as string) || "Unknown",
      formats,
    };

    setCache(cacheKey, data, 3600_000);
    console.log(`[${requestId}] Found: "${data.title}" (${formats.length} formats)`);
    res.json({ data, requestId });
  } catch (err) {
    console.error(`[${requestId}] Error:`, (err as Error).message);
    res.status(404).json({
      error: { code: "VIDEO_NOT_FOUND", message: "Video not found or unavailable" },
      requestId,
    });
  }
});

// ── POST /api/video/download ─────────────────────────────────────────
app.post("/api/video/download", async (req, res) => {
  const requestId = randomUUID();
  const ip = req.ip || "local";

  if (!checkRate(ip)) {
    res.status(429).json({ error: { code: "RATE_LIMIT", message: "Too many requests" }, requestId });
    return;
  }

  const { url, formatId } = req.body as { url?: string; formatId?: string };
  if (!url || !SUPPORTED_URL.test(url) || !formatId) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request" }, requestId });
    return;
  }

  const cacheKey = `dl:${url}:${formatId}`;
  const cached = getCache<{ downloadUrl: string; fileName: string; mimeType: string; size: number; expiresAt: number }>(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    res.json({ data: cached, requestId });
    return;
  }

  try {
    const subDir = randomUUID();
    const outDir = path.join(DOWNLOADS_DIR, subDir);
    fs.mkdirSync(outDir, { recursive: true });

    console.log(`[${requestId}] Downloading ${url} format=${formatId}`);

    await youtubeDlExec(url, {
      format: formatId,
      output: path.join(outDir, "%(title)s.%(ext)s"),
      noCheckCertificates: true,
      noWarnings: true,
      noPlaylist: true,
    });

    const files = fs.readdirSync(outDir);
    if (files.length === 0) {
      res.status(500).json({ error: { code: "DOWNLOAD_ERROR", message: "No file downloaded" }, requestId });
      return;
    }

    const fileName = files[0]!;
    const filePath = path.join(outDir, fileName);
    const stats = fs.statSync(filePath);
    const ext = path.extname(fileName).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mkv": "video/x-matroska",
      ".m4a": "audio/mp4",
      ".mp3": "audio/mpeg",
    };

    const expiresAt = Date.now() + 30 * 60_000;
    const data = {
      downloadUrl: `http://localhost:${PORT}/downloads/${subDir}/${encodeURIComponent(fileName)}`,
      fileName,
      mimeType: mimeTypes[ext] || "application/octet-stream",
      size: stats.size,
      expiresAt,
    };

    setCache(cacheKey, data, 30 * 60_000);
    console.log(`[${requestId}] Ready: ${fileName} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
    res.json({ data, requestId });

    // Schedule cleanup
    setTimeout(() => {
      try { fs.rmSync(outDir, { recursive: true, force: true }); } catch { /* ignore */ }
    }, 30 * 60_000);
  } catch (err) {
    console.error(`[${requestId}] Download error:`, (err as Error).message);
    res.status(500).json({
      error: { code: "DOWNLOAD_ERROR", message: "Failed to download video" },
      requestId,
    });
  }
});

// ── GET /api/proxy-image ──────────────────────────────────────────────
const ALLOWED_HOSTS = ["scontent", "cdninstagram.com", "instagram", "ytimg.com", "ggpht.com"];

app.get("/api/proxy-image", async (req, res) => {
  const imageUrl = req.query.url as string | undefined;
  if (!imageUrl) {
    res.status(400).json({ error: "Missing url param" });
    return;
  }

  try {
    const parsed = new URL(imageUrl);
    const hostAllowed = ALLOWED_HOSTS.some((h) => parsed.hostname.includes(h));
    if (!hostAllowed) {
      res.status(403).json({ error: "Host not allowed" });
      return;
    }

    const response = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      res.status(response.status).end();
      return;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch {
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Grabber Dev Server running at http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health\n`);
});
