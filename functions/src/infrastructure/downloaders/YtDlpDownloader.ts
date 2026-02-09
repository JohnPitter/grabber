import youtubeDlExec from "youtube-dl-exec";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import {
  IVideoDownloader,
  DownloadResult,
} from "../../domain/interfaces/IVideoDownloader";
import { VideoInfo } from "../../domain/entities/VideoInfo";
import { VideoFormat } from "../../domain/value-objects/VideoFormat";
import { detectPlatform } from "../../domain/value-objects/Platform";
import {
  VideoNotFoundError,
  DownloadError,
} from "../../domain/entities/errors";
import { ILogger } from "../../domain/interfaces/ILogger";

interface YtDlpFormat {
  format_id: string;
  ext: string;
  format_note?: string;
  resolution?: string;
  filesize?: number;
  filesize_approx?: number;
  acodec?: string;
  vcodec?: string;
  width?: number;
  height?: number;
}

interface YtDlpInfo {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  uploader?: string;
  webpage_url: string;
  formats?: YtDlpFormat[];
}

export class YtDlpDownloader implements IVideoDownloader {
  constructor(private readonly logger: ILogger) {}

  async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const result = (await youtubeDlExec(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
      })) as unknown as YtDlpInfo;

      const platform = detectPlatform(url);
      if (!platform) throw new VideoNotFoundError();

      const formats: VideoFormat[] = (result.formats || [])
        .filter((f) => f.vcodec !== "none" || f.acodec !== "none")
        .map((f) => ({
          formatId: f.format_id,
          extension: f.ext,
          quality: f.format_note || "unknown",
          resolution:
            f.width && f.height ? `${f.width}x${f.height}` : f.resolution || null,
          fileSize: f.filesize || f.filesize_approx || null,
          hasAudio: f.acodec !== "none" && f.acodec !== undefined,
          hasVideo: f.vcodec !== "none" && f.vcodec !== undefined,
        }));

      return {
        id: result.id,
        title: result.title,
        description: result.description || "",
        thumbnail: result.thumbnail || "",
        duration: result.duration || 0,
        platform,
        uploader: result.uploader || "Unknown",
        formats,
        originalUrl: url,
        fetchedAt: Date.now(),
      };
    } catch (error) {
      if (error instanceof VideoNotFoundError) throw error;

      this.logger.error("yt-dlp getVideoInfo failed", error as Error, { url });
      throw new VideoNotFoundError(
        `Could not fetch video info: ${(error as Error).message}`,
      );
    }
  }

  async downloadVideo(url: string, formatId: string): Promise<DownloadResult> {
    const tempDir = path.join(os.tmpdir(), `grabber-${uuidv4()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const outputTemplate = path.join(tempDir, "%(title)s.%(ext)s");

    try {
      this.logger.info("Starting yt-dlp download", { url, formatId });

      await youtubeDlExec(url, {
        format: formatId,
        output: outputTemplate,
        noCheckCertificates: true,
        noWarnings: true,
        noPlaylist: true,
      });

      const files = fs.readdirSync(tempDir);
      if (files.length === 0) {
        throw new DownloadError("No file was downloaded");
      }

      const fileName = files[0]!;
      const filePath = path.join(tempDir, fileName);
      const stats = fs.statSync(filePath);
      const ext = path.extname(fileName).toLowerCase();

      const mimeType = this.getMimeType(ext);

      return {
        filePath,
        fileName,
        mimeType,
        size: stats.size,
      };
    } catch (error) {
      // Clean up temp directory on failure
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }

      if (error instanceof DownloadError) throw error;

      this.logger.error("yt-dlp download failed", error as Error, {
        url,
        formatId,
      });
      throw new DownloadError(
        `Download failed: ${(error as Error).message}`,
      );
    }
  }

  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mkv": "video/x-matroska",
      ".m4a": "audio/mp4",
      ".mp3": "audio/mpeg",
      ".ogg": "audio/ogg",
      ".wav": "audio/wav",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }
}
