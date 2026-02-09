const API_BASE = import.meta.env.DEV
  ? "http://localhost:3001/api"
  : "/api";

interface ApiResponse<T> {
  data: T;
  requestId: string;
}

interface ApiError {
  error: {
    code: string;
    message: string;
  };
  requestId: string;
}

export interface VideoFormat {
  formatId: string;
  extension: string;
  quality: string;
  resolution: string | null;
  fileSize: number | null;
  hasAudio: boolean;
  hasVideo: boolean;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  platform: string;
  uploader: string;
  formats: VideoFormat[];
}

export interface DownloadResult {
  downloadUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
  expiresAt: number;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    body: unknown,
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = (await response.json()) as ApiResponse<T> | ApiError;

    if (!response.ok) {
      const err = json as ApiError;
      throw new Error(err.error?.message || "Request failed");
    }

    return json as ApiResponse<T>;
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    const response = await this.request<VideoInfo>("video/info", { url });
    return response.data;
  }

  async downloadVideo(
    url: string,
    formatId: string,
  ): Promise<DownloadResult> {
    const response = await this.request<DownloadResult>("video/download", {
      url,
      formatId,
    });
    return response.data;
  }
}

export const api = new ApiClient();
