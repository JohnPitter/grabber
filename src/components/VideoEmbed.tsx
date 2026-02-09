import { Card, CardContent } from "@/components/ui/card";

interface VideoEmbedProps {
  url: string;
  platform: string;
}

function extractYouTubeId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([\w-]+)/);
  if (watchMatch) return watchMatch[1] ?? null;

  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) return shortMatch[1] ?? null;

  const shortsMatch = url.match(/\/shorts\/([\w-]+)/);
  if (shortsMatch) return shortsMatch[1] ?? null;

  return null;
}

export function VideoEmbed({ url, platform }: VideoEmbedProps) {
  if (platform !== "youtube") return null;

  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title="Video preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full rounded-xl"
            loading="lazy"
          />
        </div>
      </CardContent>
    </Card>
  );
}
