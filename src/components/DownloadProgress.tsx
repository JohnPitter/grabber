import { CheckCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { DownloadResult } from "@/services/api";

interface DownloadProgressProps {
  result: DownloadResult;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function DownloadProgress({ result }: DownloadProgressProps) {
  const expiresIn = Math.max(
    0,
    Math.round((result.expiresAt - Date.now()) / 60000),
  );

  return (
    <Card className="border-green-500/50 bg-green-500/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
          <div className="flex-1 space-y-2">
            <div>
              <p className="font-medium">Download Ready</p>
              <p className="text-sm text-muted-foreground">
                {result.fileName} ({formatFileSize(result.size)})
              </p>
              <p className="text-xs text-muted-foreground">
                Link expires in {expiresIn} minutes
              </p>
            </div>
            <a
              href={result.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={result.fileName}
              className={buttonVariants({ size: "sm" })}
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              Download Again
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
