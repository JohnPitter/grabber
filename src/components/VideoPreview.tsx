import { Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { proxyThumbnail } from "@/lib/utils";
import type { VideoInfo } from "@/services/api";

interface VideoPreviewProps {
  video: VideoInfo;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoPreview({ video }: VideoPreviewProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {video.thumbnail && (
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:w-48">
              <img
                src={proxyThumbnail(video.thumbnail)}
                alt={video.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                {formatDuration(video.duration)}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold leading-tight">{video.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {video.uploader}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(video.duration)}
              </span>
            </div>
            <Badge variant="secondary" className="w-fit capitalize">
              {video.platform}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
