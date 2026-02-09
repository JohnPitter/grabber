import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { VideoSearch } from "@/components/VideoSearch";
import { VideoPreview } from "@/components/VideoPreview";
import { VideoEmbed } from "@/components/VideoEmbed";
import { DownloadOptions } from "@/components/DownloadOptions";
import { DownloadProgress } from "@/components/DownloadProgress";
import { DownloadHistory } from "@/components/DownloadHistory";
import { useVideoInfo } from "@/hooks/useVideoInfo";
import { useDownload } from "@/hooks/useDownload";
import { useHistory } from "@/hooks/useHistory";
import { Card, CardContent } from "@/components/ui/card";

export function App() {
  const { videoInfo, loading: infoLoading, error: infoError, fetchVideoInfo } = useVideoInfo();
  const { downloadResult, loading: downloadLoading, error: downloadError, startDownload } = useDownload();
  const { history, addEntry, removeEntry, clearHistory } = useHistory();
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");

  function handleSearch(url: string) {
    setCurrentUrl(url);
    fetchVideoInfo(url);
  }

  function handleDownload(formatId: string) {
    if (!currentUrl || !videoInfo) return;
    setSelectedFormatId(formatId);
    startDownload(currentUrl, formatId);

    addEntry({
      url: currentUrl,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      platform: videoInfo.platform,
      duration: videoInfo.duration,
      uploader: videoInfo.uploader,
    });
  }

  const error = infoError || downloadError;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <img src="/icon.svg" alt="Grabber" className="mx-auto h-24 w-24" />
          <h1 className="text-3xl font-bold tracking-tight">Grabber</h1>
          <p className="text-muted-foreground">
            The little frog that catches your videos
          </p>
        </div>

        <VideoSearch onSearch={handleSearch} loading={infoLoading} />

        {!videoInfo && !infoLoading && !error && (
          <DownloadHistory
            entries={history}
            onSelect={handleSearch}
            onRemove={removeEntry}
            onClear={clearHistory}
          />
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {videoInfo && (
          <>
            <VideoEmbed url={currentUrl} platform={videoInfo.platform} />
            <VideoPreview video={videoInfo} />
            <DownloadOptions
              formats={videoInfo.formats}
              onDownload={handleDownload}
              loading={downloadLoading}
              selectedFormatId={selectedFormatId}
            />
          </>
        )}

        {downloadResult && <DownloadProgress result={downloadResult} />}
      </div>
    </Layout>
  );
}
