import { History, Clock, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { proxyThumbnail } from "@/lib/utils";
import type { HistoryEntry } from "@/hooks/useHistory";

interface DownloadHistoryProps {
  entries: HistoryEntry[];
  onSelect: (url: string) => void;
  onRemove: (url: string) => void;
  onClear: () => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function DownloadHistory({
  entries,
  onSelect,
  onRemove,
  onClear,
}: DownloadHistoryProps) {
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Recent
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-muted-foreground"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <div
              key={entry.url}
              className="group flex items-center gap-3 rounded-lg border p-2 hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => onSelect(entry.url)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSelect(entry.url);
              }}
            >
              {entry.thumbnail ? (
                <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded">
                  <img
                    src={proxyThumbnail(entry.thumbnail)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 right-0 rounded-tl bg-black/80 px-1 text-[10px] text-white">
                    {formatDuration(entry.duration)}
                  </div>
                </div>
              ) : (
                <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                  No thumb
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{entry.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="px-1 py-0 text-[10px] capitalize">
                    {entry.platform}
                  </Badge>
                  <span className="truncate">{entry.uploader}</span>
                  <span className="flex items-center gap-0.5 shrink-0">
                    <Clock className="h-2.5 w-2.5" />
                    {timeAgo(entry.downloadedAt)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(entry.url);
                }}
                aria-label="Remove from history"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
