import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PROXY_HOSTS = ["scontent", "cdninstagram.com", "instagram"];
const API_BASE = import.meta.env.DEV
  ? "http://localhost:3001/api"
  : "/api";

export function proxyThumbnail(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    const needsProxy = PROXY_HOSTS.some((h) => parsed.hostname.includes(h));
    if (needsProxy) {
      return `${API_BASE}/proxy-image?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // invalid URL, return as-is
  }
  return url;
}
